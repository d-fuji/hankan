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

const BATCH_SIZE = 50;

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
  const path = join(__dirname, "seed-data", filename);
  return JSON.parse(readFileSync(path, "utf-8"));
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
// key → id 解決用ヘルパー（キャッシュ付き）
// ----------------------------------------
const idCache = new Map<string, number>();

async function resolveId(
  table: "province" | "clan" | "person" | "territory" | "appointment",
  key: string
): Promise<number> {
  const cacheKey = `${table}:${key}`;
  const cached = idCache.get(cacheKey);
  if (cached !== undefined) return cached;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (prisma[table] as any).findUnique({ where: { key }, select: { id: true } });
  if (!record) throw new Error(`${table} with key "${key}" not found`);
  idCache.set(cacheKey, record.id);
  return record.id;
}

// ----------------------------------------
// 汎用バッチupsert
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

/** バッチをフラッシュして結果からperson idをキャッシュ */
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

  // 領地（provinceKey → id を事前解決）
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  const territoryOps = await Promise.all(
    territoriesData.map(async ({ key, provinceKey, ...rest }) => ({
      key,
      provinceId: await resolveId("province", provinceKey),
      rest,
    }))
  );
  await batchUpsert("領地", territoryOps, ({ key, provinceId, rest }) =>
    prisma.territory.upsert({
      where: { key },
      create: { key, ...rest, provinceId },
      update: { ...rest, provinceId },
    })
  );

  // 人物（fatherKey依存あり — 未解決のfatherが同バッチにいる場合のみフラッシュ）
  const personsData = loadJson<PersonData[]>("persons.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let personBatch: any[] = [];
  const pendingKeys = new Set<string>(); // このバッチ内でupsert予定のkey
  let personProcessed = 0;

  for (const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } of personsData) {
    // fatherKeyがバッチ内にある場合は先にフラッシュ（順序保証）
    if (fatherKey && pendingKeys.has(fatherKey)) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed, personsData.length);
      personBatch = [];
      pendingKeys.clear();
    }

    const clanId = await resolveId("clan", clanKey);
    const fatherId = fatherKey ? await resolveId("person", fatherKey) : undefined;
    const adoptedFromClanId = adoptedFromClanKey
      ? await resolveId("clan", adoptedFromClanKey)
      : undefined;

    personBatch.push(
      prisma.person.upsert({
        where: { key },
        create: { key, ...rest, clanId, fatherId, adoptedFromClanId },
        update: { ...rest, clanId, fatherId, adoptedFromClanId },
      })
    );
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

  // 役職履歴（personKey/territoryKey事前解決）
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  const apptOps = await Promise.all(
    appointmentsData.map(async ({ key, personKey, territoryKey, ...rest }) => ({
      key,
      personId: await resolveId("person", personKey),
      territoryId: territoryKey ? await resolveId("territory", territoryKey) : undefined,
      rest,
    }))
  );
  await batchUpsert("役職", apptOps, ({ key, personId, territoryId, rest }) =>
    prisma.appointment.upsert({
      where: { key },
      create: { key, ...rest, personId, territoryId },
      update: { ...rest, personId, territoryId },
    })
  );

  // 石高履歴
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  const kokudakaOps = await Promise.all(
    kokudakaData.map(async ({ key, territoryKey, ...rest }) => ({
      key,
      territoryId: await resolveId("territory", territoryKey),
      rest,
    }))
  );
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
