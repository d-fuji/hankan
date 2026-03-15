import type { TerritorySummary, TerritoryDetail } from "@/types/territory";
import type { Prisma } from "@/generated/prisma/client";
type Decimal = Prisma.Decimal;

/** Prisma queryの戻り値型（一覧用） */
export type TerritoryWithRelations = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  territoryType: string;
  modernPrefecture: string;
  province: { name: string };
  kokudakaHistory: { amount: Decimal | number; year?: number }[];
};

/** Prisma queryの戻り値型（詳細用） */
export type TerritoryDetailRow = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  territoryType: string;
  modernPrefecture: string;
  modernCity: string | null;
  location: string | null;
  establishedYear: number;
  abolishedYear: number | null;
  province: { name: string; region: string };
  appointments: {
    person: { id: number; name: string; clan: { name: string } };
    generation: number | null;
    startYear: number;
    endYear: number | null;
  }[];
  kokudakaHistory: {
    year: number;
    amount: Decimal | number;
    changeType: string | null;
    changeDetail: string | null;
  }[];
};

export function toTerritorySummary(row: TerritoryWithRelations): TerritorySummary {
  const latestKokudaka =
    row.kokudakaHistory.length > 0
      ? row.kokudakaHistory.reduce((latest, k) => ((k.year ?? 0) > (latest.year ?? 0) ? k : latest))
      : undefined;

  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    territoryType: row.territoryType,
    provinceName: row.province.name,
    modernPrefecture: row.modernPrefecture,
    kokudaka: latestKokudaka ? Number(latestKokudaka.amount) : undefined,
  };
}

export function toTerritoryDetail(row: TerritoryDetailRow): TerritoryDetail {
  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    nameRomaji: row.nameRomaji,
    territoryType: row.territoryType,
    provinceName: row.province.name,
    region: row.province.region,
    modernPrefecture: row.modernPrefecture,
    modernCity: row.modernCity ?? undefined,
    location: row.location ?? undefined,
    establishedYear: row.establishedYear,
    abolishedYear: row.abolishedYear ?? undefined,
    lords: row.appointments.map((a) => ({
      id: a.person.id,
      name: a.person.name,
      generation: a.generation ?? undefined,
      startYear: a.startYear,
      endYear: a.endYear ?? undefined,
      clanName: a.person.clan.name,
    })),
    kokudakaHistory: row.kokudakaHistory.map((k) => ({
      year: k.year,
      amount: Number(k.amount),
      changeType: k.changeType ?? undefined,
      changeDetail: k.changeDetail ?? undefined,
    })),
  };
}
