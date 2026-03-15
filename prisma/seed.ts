import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
// key → id 解決用ヘルパー
// ----------------------------------------
async function resolveId(
  table: "province" | "clan" | "person" | "territory" | "appointment",
  key: string,
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (prisma[table] as any).findUnique({
    where: { key },
    select: { id: true },
  });
  if (!record) throw new Error(`${table} with key "${key}" not found`);
  return record.id;
}

async function main() {
  console.log("Seeding database...");

  // ========================================
  // 旧国マスタ
  // ========================================
  const provincesData = loadJson<ProvinceData[]>("provinces.json");
  for (const { key, ...data } of provincesData) {
    await prisma.province.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }
  console.log(`  ${provincesData.length} provinces upserted.`);

  // ========================================
  // 家
  // ========================================
  const clansData = loadJson<ClanData[]>("clans.json");
  for (const { key, ...data } of clansData) {
    await prisma.clan.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }
  console.log(`  ${clansData.length} clans upserted.`);

  // ========================================
  // 領地
  // ========================================
  const territoriesData = loadJson<TerritoryData[]>("territories.json");
  for (const { key, provinceKey, ...rest } of territoriesData) {
    const provinceId = await resolveId("province", provinceKey);
    await prisma.territory.upsert({
      where: { key },
      create: { key, ...rest, provinceId },
      update: { ...rest, provinceId },
    });
  }
  console.log(`  ${territoriesData.length} territories upserted.`);

  // ========================================
  // 人物（fatherKey依存があるため順次処理）
  // ========================================
  const personsData = loadJson<PersonData[]>("persons.json");
  for (const { key, clanKey, fatherKey, adoptedFromClanKey, ...rest } of personsData) {
    const clanId = await resolveId("clan", clanKey);
    const fatherId = fatherKey ? await resolveId("person", fatherKey) : undefined;
    const adoptedFromClanId = adoptedFromClanKey
      ? await resolveId("clan", adoptedFromClanKey)
      : undefined;
    await prisma.person.upsert({
      where: { key },
      create: { key, ...rest, clanId, fatherId, adoptedFromClanId },
      update: { ...rest, clanId, fatherId, adoptedFromClanId },
    });
  }
  console.log(`  ${personsData.length} persons upserted.`);

  // ========================================
  // 役職履歴
  // ========================================
  const appointmentsData = loadJson<AppointmentData[]>("appointments.json");
  for (const { key, personKey, territoryKey, ...rest } of appointmentsData) {
    const personId = await resolveId("person", personKey);
    const territoryId = territoryKey
      ? await resolveId("territory", territoryKey)
      : undefined;
    await prisma.appointment.upsert({
      where: { key },
      create: { key, ...rest, personId, territoryId },
      update: { ...rest, personId, territoryId },
    });
  }
  console.log(`  ${appointmentsData.length} appointments upserted.`);

  // ========================================
  // 石高履歴
  // ========================================
  const kokudakaData = loadJson<KokudakaData[]>("kokudaka.json");
  for (const { key, territoryKey, ...rest } of kokudakaData) {
    const territoryId = await resolveId("territory", territoryKey);
    await prisma.kokudaka.upsert({
      where: { key },
      create: { key, ...rest, territoryId },
      update: { ...rest, territoryId },
    });
  }
  console.log(`  ${kokudakaData.length} kokudaka records upserted.`);

  // ========================================
  // 出典
  // ========================================
  const sourcesData = loadJson<SourceData[]>("sources.json");
  for (const { key, ...data } of sourcesData) {
    await prisma.source.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }
  console.log(`  ${sourcesData.length} sources upserted.`);

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
