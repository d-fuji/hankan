import type { AnnualSnapshot } from "@/types/annual";

/** Prisma queryの戻り値を組み立てた中間型 */
export type AnnualSnapshotRow = {
  year: number;
  shogun: {
    person: { id: number; name: string };
    generation: number | null;
    startYear: number;
    endYear: number | null;
  } | null;
  territories: AnnualTerritoryRow[];
};

export type AnnualTerritoryRow = {
  id: number;
  name: string;
  territoryType: string;
  province: { name: string };
  modernPrefecture: string;
  appointment: {
    person: { id: number; name: string; clan: { name: string } };
    roleType: string;
    generation: number | null;
  } | null;
  kokudaka: { amount: number } | null;
};

export function toAnnualSnapshot(row: AnnualSnapshotRow): AnnualSnapshot {
  return {
    year: row.year,
    shogun: row.shogun
      ? {
          id: row.shogun.person.id,
          name: row.shogun.person.name,
          generation: row.shogun.generation ?? undefined,
          startYear: row.shogun.startYear,
          endYear: row.shogun.endYear ?? undefined,
        }
      : undefined,
    territories: row.territories.map((t) => ({
      id: t.id,
      name: t.name,
      territoryType: t.territoryType,
      provinceName: t.province.name,
      modernPrefecture: t.modernPrefecture,
      lord: t.appointment
        ? {
            id: t.appointment.person.id,
            name: t.appointment.person.name,
            clanName: t.appointment.person.clan.name,
            roleType: t.appointment.roleType,
            generation: t.appointment.generation ?? undefined,
          }
        : undefined,
      kokudaka: t.kokudaka ? Number(t.kokudaka.amount) : undefined,
    })),
  };
}
