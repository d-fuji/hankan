import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toTerritorySummary } from "@/lib/territory-mapper";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const province = searchParams.get("province") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: Prisma.TerritoryWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameKana: { contains: q } },
      { nameRomaji: { contains: q, mode: "insensitive" } },
    ];
  }

  if (region || province) {
    where.province = {};
    if (region) where.province.region = region;
    if (province) where.province.name = province;
  }

  const [total, rows] = await Promise.all([
    prisma.territory.count({ where }),
    prisma.territory.findMany({
      where,
      include: {
        province: { select: { name: true } },
        kokudakaHistory: {
          select: { amount: true, year: true },
          orderBy: { year: "desc" },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: rows.map(toTerritorySummary),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
