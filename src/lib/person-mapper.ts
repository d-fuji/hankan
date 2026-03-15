import type { PersonSummary, PersonDetail } from "@/types/person";

/** Prisma queryの戻り値型（一覧用） */
export type PersonWithRelations = {
  id: number;
  name: string;
  nameKana: string;
  clan: { name: string };
  appointments: { roleType: string }[];
};

/** Prisma queryの戻り値型（詳細用） */
export type PersonDetailRow = {
  id: number;
  name: string;
  nameKana: string;
  nameRomaji: string;
  imina: string | null;
  commonName: string | null;
  clan: { id: number; name: string; crestName: string | null };
  father: { id: number; name: string } | null;
  motherName: string | null;
  birthOrder: number | null;
  birthOrderType: string | null;
  isAdopted: boolean;
  adoptedFromClan: { id: number; name: string } | null;
  appointments: {
    roleType: string;
    territory: { id: number; name: string } | null;
    generation: number | null;
    startYear: number;
    endYear: number | null;
  }[];
  children: {
    id: number;
    name: string;
    birthOrder: number | null;
    birthOrderType: string | null;
  }[];
};

export function toPersonSummary(row: PersonWithRelations): PersonSummary {
  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    clanName: row.clan.name,
    roles: [...new Set(row.appointments.map((a) => a.roleType))],
  };
}

export function toPersonDetail(row: PersonDetailRow): PersonDetail {
  return {
    id: row.id,
    name: row.name,
    nameKana: row.nameKana,
    nameRomaji: row.nameRomaji,
    imina: row.imina ?? undefined,
    commonName: row.commonName ?? undefined,
    clanId: row.clan.id,
    clanName: row.clan.name,
    crestName: row.clan.crestName ?? undefined,
    fatherName: row.father?.name ?? undefined,
    fatherId: row.father?.id ?? undefined,
    motherName: row.motherName ?? undefined,
    birthOrder: row.birthOrder ?? undefined,
    birthOrderType: row.birthOrderType ?? undefined,
    isAdopted: row.isAdopted,
    adoptedFromClanId: row.adoptedFromClan?.id ?? undefined,
    adoptedFromClanName: row.adoptedFromClan?.name ?? undefined,
    appointments: row.appointments.map((a) => ({
      roleType: a.roleType,
      territoryName: a.territory?.name ?? undefined,
      territoryId: a.territory?.id ?? undefined,
      generation: a.generation ?? undefined,
      startYear: a.startYear,
      endYear: a.endYear ?? undefined,
    })),
    children: row.children.map((c) => ({
      id: c.id,
      name: c.name,
      birthOrder: c.birthOrder ?? undefined,
      birthOrderType: c.birthOrderType ?? undefined,
    })),
  };
}
