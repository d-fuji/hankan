import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPersonSummary } from "@/lib/person-mapper";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const clan = searchParams.get("clan") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: Prisma.PersonWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameKana: { contains: q } },
      { nameRomaji: { contains: q, mode: "insensitive" } },
    ];
  }

  if (clan) {
    where.clan = { name: clan };
  }

  if (role) {
    where.appointments = { some: { roleType: role } };
  }

  const [total, rows] = await Promise.all([
    prisma.person.count({ where }),
    prisma.person.findMany({
      where,
      include: {
        clan: { select: { name: true } },
        appointments: {
          select: { roleType: true, generation: true, startYear: true, endYear: true },
          ...(role ? { where: { roleType: role }, orderBy: { startYear: "asc" as const } } : {}),
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // roleフィルタ時はappointment詳細付きで返す
  if (role) {
    const data = rows.map((row) => {
      const appt = row.appointments[0];
      return {
        ...toPersonSummary(row),
        generation: appt?.generation ?? undefined,
        startYear: appt?.startYear,
        endYear: appt?.endYear ?? undefined,
      };
    });
    // generation順にソート
    data.sort((a, b) => (a.generation ?? 999) - (b.generation ?? 999));
    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  }

  return NextResponse.json({
    data: rows.map(toPersonSummary),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
