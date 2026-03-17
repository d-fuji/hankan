import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.set("connect_timeout", "120");
url.searchParams.set("statement_timeout", "120000");
url.searchParams.set("idle_in_transaction_session_timeout", "300000");
const adapter = new PrismaPg({ connectionString: url.toString() });
const prisma = new PrismaClient({ adapter });

const IS_REMOTE = url.hostname.includes("neon.tech") || url.hostname.includes("pooler");
const BATCH_SIZE = IS_REMOTE ? 20 : 100;

// ----------------------------------------
// ユーティリティ
// ----------------------------------------

function progress(label: string, current: number, total: number) {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pct = Math.round((current / total) * 100);
  process.stdout.write(`\r  ${label} [${bar}] ${current}/${total} (${pct}%)`);
  if (current === total) process.stdout.write("\n");
}

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(__dirname, "seed-data", filename), "utf-8"));
}

// ----------------------------------------
// JSON型定義
// ----------------------------------------
type ProvinceData = { key: string; name: string; nameKana: string; nameRomaji: string; modernPrefecture: string; region: string };
type ClanData = { key: string; name: string; nameKana: string; nameRomaji: string; crestName?: string };
type TerritoryData = { key: string; name: string; nameKana: string; nameRomaji: string; territoryType: string; provinceKey: string; modernPrefecture: string; modernCity?: string; location?: string; establishedYear: number; abolishedYear?: number };
type PersonData = { key: string; name: string; nameKana: string; nameRomaji: string; imina?: string; commonName?: string; clanKey: string; fatherKey?: string; birthOrder?: number; birthOrderType?: string; isAdopted?: boolean; adoptedFromClanKey?: string };
type AppointmentData = { key: string; personKey: string; roleType: string; territoryKey?: string; generation?: number; startYear: number; endYear?: number };
type KokudakaData = { key: string; territoryKey: string; year: number; amount: number; changeType?: string; changeDetail?: string };
type SourceData = { key: string; title: string; author?: string; pubYear?: number; url?: string; note?: string };

// ----------------------------------------
// IDキャッシュ（起動時に全テーブルをプリロード）
// ----------------------------------------
const idCache = new Map<string, number>();

async function preloadIds() {
  const tables = ["province", "clan", "territory", "person", "appointment"] as const;
  for (const table of tables) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records = await (prisma[table] as any).findMany({ select: { id: true, key: true } });
    for (const r of records) {
      idCache.set(`${table}:${r.key}`, r.id);
    }
  }
}

function resolveIdSync(table: string, key: string): number {
  const id = idCache.get(`${table}:${key}`);
  if (id === undefined) throw new Error(`${table} with key "${key}" not found in cache`);
  return id;
}

function tryResolveIdSync(table: string, key: string): number | undefined {
  return idCache.get(`${table}:${key}`);
}

// ----------------------------------------
// バッチupsert
// ----------------------------------------
async function batchUpsert<T>(
  label: string,
  data: T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertFn: (item: T) => any
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batch: any[] = [];
  let processed = 0;

  for (const item of data) {
    batch.push(upsertFn(item));
    if (batch.length >= BATCH_SIZE) {
      await prisma.$transaction(batch);
      processed += batch.length;
      progress(label, processed, data.length);
      batch.length = 0;
    }
  }
  if (batch.length > 0) {
    await prisma.$transaction(batch);
    processed += batch.length;
  }
  progress(label, data.length, data.length);
}

/** 人物バッチフラッシュ（結果からIDをキャッシュ） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function flushPersonBatch(batch: any[]): Promise<void> {
  if (batch.length === 0) return;
  const results = await prisma.$transaction(batch);
  for (const result of results) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;
    if (r?.key) idCache.set(`person:${r.key}`, r.id);
  }
}

// ----------------------------------------
// メイン処理
// ----------------------------------------
async function main() {
  const startTime = Date.now();
  console.log("Seeding database...");

  // 全テーブルのIDをプリロード（2回目以降はresolveIdでDBアクセスゼロ）
  await preloadIds();
  console.log(`  Cache: ${idCache.size} IDs preloaded (${Date.now() - startTime}ms)`);

  // 旧国マスタ
  const provincesData = loadJson<ProvinceData[]>("provinces.json");
  await batchUpsert("旧国", provincesData, ({ key, ...data }) =>
    prisma.province.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // 家
  const clansData = loadJson<ClanData[]>("clans.json");
  await batchUpsert("家  ", clansData, ({ key, ...data }) =>
    prisma.clan.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // IDキャッシュ更新（新規追加分を拾うため）
  await preloadIds();

  // 領地
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  const territoryOps = territoriesData.map(({ key, provinceKey, ...rest }) => ({
    key,
    provinceId: resolveIdSync("province", provinceKey),
    rest,
  }));
  await batchUpsert("領地", territoryOps, ({ key, provinceId, rest }) =>
    prisma.territory.upsert({
      where: { key },
      create: { key, ...rest, provinceId },
      update: { ...rest, provinceId },
    })
  );

  // IDキャッシュ更新
  await preloadIds();

  // 人物（fatherKey依存あり — 同バッチ内の依存がある場合のみフラッシュ）
  const personsData = loadJson<PersonData[]>("persons.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let personBatch: any[] = [];
  const pendingKeys = new Set<string>();
  let personProcessed = 0;

  for (const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } of personsData) {
    // fatherKeyが同バッチ内にあり、まだDBに反映されていない場合はフラッシュ
    if (fatherKey && pendingKeys.has(fatherKey)) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed, personsData.length);
      personBatch = [];
      pendingKeys.clear();
    }

    const clanId = resolveIdSync("clan", clanKey);
    // fatherIdはキャッシュにあればそこから、なければ同バッチで新規作成される前提
    const fatherId = fatherKey ? tryResolveIdSync("person", fatherKey) : undefined;
    const adoptedFromClanId = adoptedFromClanKey
      ? tryResolveIdSync("clan", adoptedFromClanKey)
      : undefined;

    // fatherKeyがあるがキャッシュにない場合は先にフラッシュ
    if (fatherKey && fatherId === undefined) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed, personsData.length);
      personBatch = [];
      pendingKeys.clear();
      // フラッシュ後にIDキャッシュ更新
      await preloadIds();
      // リトライ
      const resolvedFatherId = tryResolveIdSync("person", fatherKey);
      if (resolvedFatherId === undefined) {
        throw new Error(`person with key "${fatherKey}" not found after flush`);
      }
      personBatch.push(
        prisma.person.upsert({
          where: { key },
          create: { key, ...rest, clanId, fatherId: resolvedFatherId, adoptedFromClanId },
          update: { ...rest, clanId, fatherId: resolvedFatherId, adoptedFromClanId },
        })
      );
    } else {
      personBatch.push(
        prisma.person.upsert({
          where: { key },
          create: { key, ...rest, clanId, fatherId, adoptedFromClanId },
          update: { ...rest, clanId, fatherId, adoptedFromClanId },
        })
      );
    }
    pendingKeys.add(key);

    if (personBatch.length >= BATCH_SIZE) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed, personsData.length);
      personBatch = [];
      pendingKeys.clear();
    }
  }
  if (personBatch.length > 0) {
    await flushPersonBatch(personBatch);
    personProcessed += personBatch.length;
  }
  progress("人物", personsData.length, personsData.length);

  // IDキャッシュ更新（新規person分）
  await preloadIds();

  // 役職履歴
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  const apptOps = appointmentsData.map(({ key, personKey, territoryKey, ...rest }) => ({
    key,
    personId: resolveIdSync("person", personKey),
    territoryId: territoryKey ? resolveIdSync("territory", territoryKey) : undefined,
    rest,
  }));
  await batchUpsert("役職", apptOps, ({ key, personId, territoryId, rest }) =>
    prisma.appointment.upsert({
      where: { key },
      create: { key, ...rest, personId, territoryId },
      update: { ...rest, personId, territoryId },
    })
  );

  // 石高履歴
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  const kokudakaOps = kokudakaData.map(({ key, territoryKey, ...rest }) => ({
    key,
    territoryId: resolveIdSync("territory", territoryKey),
    rest,
  }));
  await batchUpsert("石高", kokudakaOps, ({ key, territoryId, rest }) =>
    prisma.kokudaka.upsert({
      where: { key },
      create: { key, ...rest, territoryId },
      update: { ...rest, territoryId },
    })
  );

  // 出典
  const sourcesData = loadJson<SourceData[]>("sources.json");
  await batchUpsert("出典", sourcesData, ({ key, ...data }) =>
    prisma.source.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Seed completed in ${elapsed}s.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
