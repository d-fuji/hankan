import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "crypto";
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

function progress(label: string, current: number, total: number, extra?: string) {
  const width = 25;
  const filled = Math.round((current / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pct = Math.round((current / total) * 100);
  process.stdout.write(`\r  ${label} [${bar}] ${current}/${total} (${pct}%) ${extra ?? ""}`);
  if (current === total) process.stdout.write("\n");
}

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(__dirname, "seed-data", filename), "utf-8"));
}

/** データのハッシュを生成（比較用・キー順序不依存） */
function hashData(data: Record<string, unknown>): string {
  const sorted = Object.keys(data).sort().reduce((acc, k) => { acc[k] = data[k]; return acc; }, {} as Record<string, unknown>);
  return createHash("md5").update(JSON.stringify(sorted)).digest("hex");
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
// IDキャッシュ + 既存データハッシュ
// ----------------------------------------
const idCache = new Map<string, number>();
const existingHashes = new Map<string, string>(); // "table:key" -> hash

/** 全テーブルのID+データをプリロード */
async function preloadAll() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function load(table: string, model: any) {
    const records = await model.findMany();
    for (const r of records) {
      idCache.set(`${table}:${r.key}`, r.id);
      // null/undefined/falseフィールドとidを除外してハッシュ化
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(r)) {
        if (k === "id" || v === null || v === undefined || v === false) continue;
        // Decimal型を数値に変換
        clean[k] = typeof v === "object" && v !== null && "toNumber" in v ? v.toNumber() : v;
      }
      existingHashes.set(`${table}:${r.key}`, hashData(clean));
    }
  }
  await Promise.all([
    load("province", prisma.province),
    load("clan", prisma.clan),
    load("territory", prisma.territory),
    load("person", prisma.person),
    load("appointment", prisma.appointment),
    load("kokudaka", prisma.kokudaka),
    load("source", prisma.source),
  ]);
}

function resolveId(table: string, key: string): number {
  const id = idCache.get(`${table}:${key}`);
  if (id === undefined) throw new Error(`${table} with key "${key}" not found in cache`);
  return id;
}

function tryResolveId(table: string, key: string): number | undefined {
  return idCache.get(`${table}:${key}`);
}

/** データが既存と同じか判定 */
function isUnchanged(table: string, key: string, data: Record<string, unknown>): boolean {
  const existing = existingHashes.get(`${table}:${key}`);
  if (!existing) return false; // 新規
  // null/undefined/falseのフィールドを除外して比較（DB側と合わせる）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clean: Record<string, any> = { key };
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined || v === false) continue;
    clean[k] = v;
  }
  return existing === hashData(clean);
}

// ----------------------------------------
// 差分バッチupsert
// ----------------------------------------
async function diffBatchUpsert<T>(
  label: string,
  table: string,
  data: T[],
  getKey: (item: T) => string,
  getCompareData: (item: T) => Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertFn: (item: T) => any
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batch: any[] = [];
  let processed = 0;
  let skipped = 0;

  for (const item of data) {
    if (isUnchanged(table, getKey(item), getCompareData(item))) {
      skipped++;
    } else {
      batch.push(upsertFn(item));
    }
    processed++;

    if (batch.length >= BATCH_SIZE) {
      await prisma.$transaction(batch);
      progress(label, processed, data.length, `new/upd:${processed - skipped} skip:${skipped}`);
      batch.length = 0;
    }
  }
  if (batch.length > 0) {
    await prisma.$transaction(batch);
  }
  progress(label, data.length, data.length, `new/upd:${data.length - skipped} skip:${skipped}`);
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

  await preloadAll();
  console.log(`  Cache: ${idCache.size} IDs, ${existingHashes.size} hashes (${Date.now() - startTime}ms)`);

  // 旧国マスタ
  const provincesData = loadJson<ProvinceData[]>("provinces.json");
  await diffBatchUpsert("旧国", "province", provincesData,
    (d) => d.key,
    ({ key, ...rest }) => ({ key, ...rest }),
    ({ key, ...data }) => prisma.province.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // 家
  const clansData = loadJson<ClanData[]>("clans.json");
  await diffBatchUpsert("家  ", "clan", clansData,
    (d) => d.key,
    ({ key, ...rest }) => ({ key, ...rest }),
    ({ key, ...data }) => prisma.clan.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // IDキャッシュ更新（新規追加分）
  await preloadAll();

  // 領地
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  const territoryOps = territoriesData.map(({ key, provinceKey, ...rest }) => ({
    key, provinceKey, provinceId: resolveId("province", provinceKey), rest,
  }));
  await diffBatchUpsert("領地", "territory", territoryOps,
    (d) => d.key,
    (d) => ({ key: d.key, ...d.rest, provinceId: d.provinceId }),
    ({ key, provinceId, rest }) => prisma.territory.upsert({
      where: { key }, create: { key, ...rest, provinceId }, update: { ...rest, provinceId },
    })
  );

  await preloadAll();

  // 人物（fatherKey依存あり — 差分検出付き）
  const personsData = loadJson<PersonData[]>("persons.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let personBatch: any[] = [];
  const pendingKeys = new Set<string>();
  let personProcessed = 0;
  let personSkipped = 0;

  for (const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } of personsData) {
    // 依存フラッシュ
    if (fatherKey && pendingKeys.has(fatherKey)) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed + personSkipped, personsData.length,
        `new/upd:${personProcessed} skip:${personSkipped}`);
      personBatch = [];
      pendingKeys.clear();
    }

    const clanId = resolveId("clan", clanKey);
    const fatherId = fatherKey ? tryResolveId("person", fatherKey) : undefined;
    const adoptedFromClanId = adoptedFromClanKey ? tryResolveId("clan", adoptedFromClanKey) : undefined;

    // fatherKeyがキャッシュにない場合はフラッシュ+再取得
    if (fatherKey && fatherId === undefined) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      personBatch = [];
      pendingKeys.clear();
      await preloadAll();
      const resolvedFatherId = tryResolveId("person", fatherKey);
      if (resolvedFatherId === undefined) {
        throw new Error(`person with key "${fatherKey}" not found after flush`);
      }
      const compareData = { key, ...rest, clanId, fatherId: resolvedFatherId, adoptedFromClanId };
      if (isUnchanged("person", key, compareData)) {
        personSkipped++;
      } else {
        personBatch.push(prisma.person.upsert({
          where: { key },
          create: { key, ...rest, clanId, fatherId: resolvedFatherId, adoptedFromClanId },
          update: { ...rest, clanId, fatherId: resolvedFatherId, adoptedFromClanId },
        }));
      }
    } else {
      const compareData = { key, ...rest, clanId, fatherId, adoptedFromClanId };
      if (isUnchanged("person", key, compareData)) {
        personSkipped++;
      } else {
        personBatch.push(prisma.person.upsert({
          where: { key },
          create: { key, ...rest, clanId, fatherId, adoptedFromClanId },
          update: { ...rest, clanId, fatherId, adoptedFromClanId },
        }));
      }
    }
    pendingKeys.add(key);

    if (personBatch.length >= BATCH_SIZE) {
      await flushPersonBatch(personBatch);
      personProcessed += personBatch.length;
      progress("人物", personProcessed + personSkipped, personsData.length,
        `new/upd:${personProcessed} skip:${personSkipped}`);
      personBatch = [];
      pendingKeys.clear();
    }
  }
  if (personBatch.length > 0) {
    await flushPersonBatch(personBatch);
    personProcessed += personBatch.length;
  }
  progress("人物", personsData.length, personsData.length,
    `new/upd:${personProcessed} skip:${personSkipped}`);

  await preloadAll();

  // 役職履歴
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  const apptOps = appointmentsData.map(({ key, personKey, territoryKey, ...rest }) => ({
    key, personId: resolveId("person", personKey),
    territoryId: territoryKey ? resolveId("territory", territoryKey) : undefined, rest,
  }));
  await diffBatchUpsert("役職", "appointment", apptOps,
    (d) => d.key,
    (d) => ({ key: d.key, ...d.rest, personId: d.personId, territoryId: d.territoryId }),
    ({ key, personId, territoryId, rest }) => prisma.appointment.upsert({
      where: { key }, create: { key, ...rest, personId, territoryId }, update: { ...rest, personId, territoryId },
    })
  );

  // 石高履歴
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  const kokudakaOps = kokudakaData.map(({ key, territoryKey, ...rest }) => ({
    key, territoryId: resolveId("territory", territoryKey), rest,
  }));
  await diffBatchUpsert("石高", "kokudaka", kokudakaOps,
    (d) => d.key,
    (d) => ({ key: d.key, ...d.rest, territoryId: d.territoryId }),
    ({ key, territoryId, rest }) => prisma.kokudaka.upsert({
      where: { key }, create: { key, ...rest, territoryId }, update: { ...rest, territoryId },
    })
  );

  // 出典
  const sourcesData = loadJson<SourceData[]>("sources.json");
  await diffBatchUpsert("出典", "source", sourcesData,
    (d) => d.key,
    ({ key, ...rest }) => ({ key, ...rest }),
    ({ key, ...data }) => prisma.source.upsert({ where: { key }, create: { key, ...data }, update: data })
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
