import type { ClanSummary, ClanDetail, ClanTerritory } from "@/types/clan";

/** Prisma queryの戻り値型（一覧用） */
export type ClanWithMembers = {
  id: number;
  name: string;
  nameKana: string;
  crestName: string | null;
  members: {
    id: number;
    appointments: {
      roleType: string;
      territory: { name: string } | null;
    }[];
  }[];
};

/** Prisma queryの戻り値型（詳細用） */
export type ClanDetailRow = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  crestName: string | null;
  members: {
    id: number;
    name: string;
    appointments: {
      roleType: string;
      territory: { id: number; name: string; territoryType: string } | null;
    }[];
  }[];
};

export function toClanSummary(row: ClanWithMembers): ClanSummary {
  const territoryNames = [
    ...new Set(
      row.members
        .flatMap((m) => m.appointments)
        .map((a) => a.territory?.name)
        .filter((n): n is string => n != null)
    ),
  ];

  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    crestName: row.crestName ?? undefined,
    memberCount: row.members.length,
    territoryNames,
  };
}

export function toClanDetail(row: ClanDetailRow): ClanDetail {
  const territoriesMap = new Map<number, ClanTerritory>();
  for (const member of row.members) {
    for (const a of member.appointments) {
      if (a.territory && !territoriesMap.has(a.territory.id)) {
        territoriesMap.set(a.territory.id, {
          id: a.territory.id,
          name: a.territory.name,
          territoryType: a.territory.territoryType,
        });
      }
    }
  }

  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    nameRomaji: row.nameRomaji,
    crestName: row.crestName ?? undefined,
    members: row.members.map((m) => ({
      id: m.id,
      name: m.name,
      roles: [...new Set(m.appointments.map((a) => a.roleType))],
    })),
    territories: [...territoriesMap.values()],
  };
}
