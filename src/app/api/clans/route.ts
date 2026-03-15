import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClanSummary } from "@/lib/clan-mapper";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: Prisma.ClanWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameKana: { contains: q } },
      { nameRomaji: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.clan.count({ where }),
    prisma.clan.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            appointments: {
              select: {
                roleType: true,
                territory: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: rows.map(toClanSummary),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
