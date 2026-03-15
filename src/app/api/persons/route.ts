import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPersonSummary } from "@/lib/person-mapper";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const clan = searchParams.get("clan") ?? undefined;
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

  const [total, rows] = await Promise.all([
    prisma.person.count({ where }),
    prisma.person.findMany({
      where,
      include: {
        clan: { select: { name: true } },
        appointments: { select: { roleType: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: rows.map(toPersonSummary),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
