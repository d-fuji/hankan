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

function progress(label: string, current: number, total: number, skipped?: number) {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pct = Math.round((current / total) * 100);
  const skipInfo = skipped ? ` skip:${skipped}` : "";
  process.stdout.write(`\r  ${label} [${bar}] ${current}/${total} (${pct}%)${skipInfo}`);
  if (current === total) process.stdout.write("\n");
}

function loadJson<T>(filename: string): T {
  const path = join(__dirname, "seed-data", filename);
  return JSON.parse(readFileSync(path, "utf-8"));
}

// ----------------------------------------
// JSON型定義
// ----------------------------------------
type ProvinceData = {
  key: string;
  name: string;
  nameKana: string;
  nameRomaji: string;
  modernPrefecture: string;
  region: string;
};

type ClanData = {
  key: string;
  name: string;
  nameKana: string;
  nameRomaji: string;
  crestName?: string;
};

type TerritoryData = {
  key: string;
  name: string;
  nameKana: string;
  nameRomaji: string;
  territoryType: string;
  provinceKey: string;
  modernPrefecture: string;
  modernCity?: string;
  location?: string;
  establishedYear: number;
  abolishedYear?: number;
};

type PersonData = {
  key: string;
  name: string;
  nameKana: string;
  nameRomaji: string;
  imina?: string;
  commonName?: string;
  clanKey: string;
  fatherKey?: string;
  birthOrder?: number;
  birthOrderType?: string;
  isAdopted?: boolean;
  adoptedFromClanKey?: string;
};

type AppointmentData = {
  key: string;
  personKey: string;
  roleType: string;
  territoryKey?: string;
  generation?: number;
  startYear: number;
  endYear?: number;
};

type KokudakaData = {
  key: string;
  territoryKey: string;
  year: number;
  amount: number;
  changeType?: string;
  changeDetail?: string;
};

type SourceData = {
  key: string;
  title: string;
  author?: string;
  pubYear?: number;
  url?: string;
  note?: string;
};

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
  const record = await (prisma[table] as any).findUnique({
    where: { key },
    select: { id: true },
  });
  if (!record) throw new Error(`${table} with key "${key}" not found`);
  idCache.set(cacheKey, record.id);
  return record.id;
}

// ----------------------------------------
// 汎用バッチupsert（シンプルなテーブル用）
// ----------------------------------------
async function batchUpsertSimple<T extends { key: string }>(
  label: string,
  data: T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertFn: (item: T) => any
) {
  const batch: ReturnType<typeof upsertFn>[] = [];
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

// ----------------------------------------
// メイン処理
// ----------------------------------------
async function main() {
  console.log("Seeding database...");

  // 旧国マスタ
  const provincesData = loadJson<ProvinceData[]>("provinces.json");
  await batchUpsertSimple("旧国", provincesData, ({ key, ...data }) =>
    prisma.province.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // 家
  const clansData = loadJson<ClanData[]>("clans.json");
  await batchUpsertSimple("家  ", clansData, ({ key, ...data }) =>
    prisma.clan.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  // 領地（provinceKey → id 解決が必要）
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  // 先に全provinceKeyを解決
  const territoryOps: { key: string; provinceId: number; rest: Omit<TerritoryData, "key" | "provinceKey"> }[] = [];
  for (const { key, provinceKey, ...rest } of territoriesData) {
    const provinceId = await resolveId("province", provinceKey);
    territoryOps.push({ key, provinceId, rest });
  }
  await batchUpsertSimple("領地", territoryOps, ({ key, provinceId, rest }) =>
    prisma.territory.upsert({
      where: { key },
      create: { key, ...rest, provinceId },
      update: { ...rest, provinceId },
    })
  );

  // 人物（fatherKey依存で順次。ただしresolveId後のupsertをバッチ化）
  const personsData = loadJson<PersonData[]>("persons.json");
  let personBatch: ReturnType<typeof prisma.person.upsert>[] = [];
  let personProcessed = 0;

  for (const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } of personsData) {
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

    // fatherKeyが次のレコードで参照される可能性があるので、
    // 親→子の順序を保証するためバッチをフラッシュ
    if (personBatch.length >= BATCH_SIZE || fatherKey) {
      const results = await prisma.$transaction(personBatch);
      for (const result of results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = result as any;
        if (r?.key) idCache.set(`person:${r.key}`, r.id);
      }
      personProcessed += personBatch.length;
      progress("人物", personProcessed, personsData.length);
      personBatch = [];
    }
  }
  if (personBatch.length > 0) {
    await prisma.$transaction(personBatch);
    personProcessed += personBatch.length;
  }
  progress("人物", personsData.length, personsData.length);

  // 役職履歴（personKey/territoryKey解決後にバッチ）
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  const apptOps: { key: string; personId: number; territoryId?: number; rest: Omit<AppointmentData, "key" | "personKey" | "territoryKey"> }[] = [];
  for (const { key, personKey, territoryKey, ...rest } of appointmentsData) {
    const personId = await resolveId("person", personKey);
    const territoryId = territoryKey ? await resolveId("territory", territoryKey) : undefined;
    apptOps.push({ key, personId, territoryId, rest });
  }
  await batchUpsertSimple("役職", apptOps, ({ key, personId, territoryId, rest }) =>
    prisma.appointment.upsert({
      where: { key },
      create: { key, ...rest, personId, territoryId },
      update: { ...rest, personId, territoryId },
    })
  );

  // 石高履歴
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  const kokudakaOps: { key: string; territoryId: number; rest: Omit<KokudakaData, "key" | "territoryKey"> }[] = [];
  for (const { key, territoryKey, ...rest } of kokudakaData) {
    const territoryId = await resolveId("territory", territoryKey);
    kokudakaOps.push({ key, territoryId, rest });
  }
  await batchUpsertSimple("石高", kokudakaOps, ({ key, territoryId, rest }) =>
    prisma.kokudaka.upsert({
      where: { key },
      create: { key, ...rest, territoryId },
      update: { ...rest, territoryId },
    })
  );

  // 出典
  const sourcesData = loadJson<SourceData[]>("sources.json");
  await batchUpsertSimple("出典", sourcesData, ({ key, ...data }) =>
    prisma.source.upsert({ where: { key }, create: { key, ...data }, update: data })
  );

  console.log("Seed completed.");
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
