import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toAnnualSnapshot } from "@/lib/annual-mapper";
import type { AnnualTerritoryRow } from "@/lib/annual-mapper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearStr = searchParams.get("year");
  const type = searchParams.get("type") ?? undefined;

  if (!yearStr) {
    return NextResponse.json({ error: "year parameter is required" }, { status: 400 });
  }

  const year = Number(yearStr);
  if (Number.isNaN(year) || year < 1603 || year > 1868) {
    return NextResponse.json(
      { error: "year must be between 1603 and 1868" },
      { status: 400 }
    );
  }

  // 指定年の将軍を取得
  const shogunAppointment = await prisma.appointment.findFirst({
    where: {
      roleType: "征夷大将軍",
      startYear: { lte: year },
      OR: [{ endYear: { gte: year } }, { endYear: null }],
    },
    include: {
      person: { select: { id: true, name: true } },
    },
  });

  // 指定年に存在する領地と、その時点の藩主/代官・石高を取得
  const territoryWhere: Record<string, unknown> = {
    establishedYear: { lte: year },
    OR: [{ abolishedYear: { gte: year } }, { abolishedYear: null }],
  };
  if (type) {
    territoryWhere.territoryType = type;
  }

  const territories = await prisma.territory.findMany({
    where: territoryWhere,
    include: {
      province: { select: { name: true } },
      appointments: {
        where: {
          roleType: { in: ["藩主", "代官", "奉行"] },
          startYear: { lte: year },
          OR: [{ endYear: { gte: year } }, { endYear: null }],
        },
        include: {
          person: {
            select: { id: true, name: true, clan: { select: { name: true } } },
          },
        },
        orderBy: { startYear: "desc" },
        take: 1,
      },
      kokudakaHistory: {
        where: { year: { lte: year } },
        orderBy: { year: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const territoryRows: AnnualTerritoryRow[] = territories.map((t) => ({
    id: t.id,
    name: t.name,
    territoryType: t.territoryType,
    province: t.province,
    modernPrefecture: t.modernPrefecture,
    appointment: t.appointments[0]
      ? {
          person: t.appointments[0].person,
          roleType: t.appointments[0].roleType,
          generation: t.appointments[0].generation,
        }
      : null,
    kokudaka: t.kokudakaHistory[0]
      ? { amount: t.kokudakaHistory[0].amount as unknown as number }
      : null,
  }));

  const snapshot = toAnnualSnapshot({
    year,
    shogun: shogunAppointment
      ? {
          person: shogunAppointment.person,
          generation: shogunAppointment.generation,
          startYear: shogunAppointment.startYear,
          endYear: shogunAppointment.endYear,
        }
      : null,
    territories: territoryRows,
  });

  return NextResponse.json(snapshot);
}
