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

async function main() {
  console.log("Seeding database...");

  // ========================================
  // 旧国マスタ
  // ========================================
  const provincesData = loadJson<ProvinceData[]>("provinces.json");
  for (let i = 0; i < provincesData.length; i++) {
    const { key, ...data } = provincesData[i];
    await prisma.province.upsert({ where: { key }, create: { key, ...data }, update: data });
    progress("旧国", i + 1, provincesData.length);
  }

  // ========================================
  // 家
  // ========================================
  const clansData = loadJson<ClanData[]>("clans.json");
  for (let i = 0; i < clansData.length; i++) {
    const { key, ...data } = clansData[i];
    await prisma.clan.upsert({ where: { key }, create: { key, ...data }, update: data });
    progress("家  ", i + 1, clansData.length);
  }

  // ========================================
  // 領地
  // ========================================
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  for (let i = 0; i < territoriesData.length; i++) {
    const { key, provinceKey, ...rest } = territoriesData[i];
    const provinceId = await resolveId("province", provinceKey);
    await prisma.territory.upsert({ where: { key }, create: { key, ...rest, provinceId }, update: { ...rest, provinceId } });
    progress("領地", i + 1, territoriesData.length);
  }

  // ========================================
  // 人物（fatherKey依存があるため順次処理）
  // ========================================
  const personsData = loadJson<PersonData[]>("persons.json");
  for (let i = 0; i < personsData.length; i++) {
    const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } = personsData[i];
    const clanId = await resolveId("clan", clanKey);
    const fatherId = fatherKey ? await resolveId("person", fatherKey) : undefined;
    const adoptedFromClanId = adoptedFromClanKey ? await resolveId("clan", adoptedFromClanKey) : undefined;
    await prisma.person.upsert({ where: { key }, create: { key, ...rest, clanId, fatherId, adoptedFromClanId }, update: { ...rest, clanId, fatherId, adoptedFromClanId } });
    progress("人物", i + 1, personsData.length);
  }

  // ========================================
  // 役職履歴
  // ========================================
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  for (let i = 0; i < appointmentsData.length; i++) {
    const { key, personKey, territoryKey, ...rest } = appointmentsData[i];
    const personId = await resolveId("person", personKey);
    const territoryId = territoryKey ? await resolveId("territory", territoryKey) : undefined;
    await prisma.appointment.upsert({ where: { key }, create: { key, ...rest, personId, territoryId }, update: { ...rest, personId, territoryId } });
    progress("役職", i + 1, appointmentsData.length);
  }

  // ========================================
  // 石高履歴
  // ========================================
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  for (let i = 0; i < kokudakaData.length; i++) {
    const { key, territoryKey, ...rest } = kokudakaData[i];
    const territoryId = await resolveId("territory", territoryKey);
    await prisma.kokudaka.upsert({ where: { key }, create: { key, ...rest, territoryId }, update: { ...rest, territoryId } });
    progress("石高", i + 1, kokudakaData.length);
  }

  // ========================================
  // 出典
  // ========================================
  const sourcesData = loadJson<SourceData[]>("sources.json");
  for (let i = 0; i < sourcesData.length; i++) {
    const { key, ...data } = sourcesData[i];
    await prisma.source.upsert({ where: { key }, create: { key, ...data }, update: data });
    progress("出典", i + 1, sourcesData.length);
  }

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
