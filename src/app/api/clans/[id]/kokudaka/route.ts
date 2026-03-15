import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ClanKokudakaPoint } from "@/types/clan";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const clan = await prisma.clan.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!clan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 家の人物が藩主として治めた領地IDを取得
  const territories = await prisma.appointment.findMany({
    where: {
      person: { clanId: id },
      roleType: "藩主",
      territoryId: { not: null },
    },
    select: { territoryId: true },
    distinct: ["territoryId"],
  });

  const territoryIds = territories
    .map((t) => t.territoryId)
    .filter((id): id is number => id !== null);

  if (territoryIds.length === 0) {
    return NextResponse.json({ clanId: clan.id, clanName: clan.name, data: [] });
  }

  // それらの領地の石高履歴を取得
  const kokudakaRows = await prisma.kokudaka.findMany({
    where: { territoryId: { in: territoryIds } },
    select: {
      year: true,
      amount: true,
      territory: { select: { name: true } },
    },
    orderBy: { year: "asc" },
  });

  const data: ClanKokudakaPoint[] = kokudakaRows.map((row) => ({
    year: row.year,
    amount: row.amount.toNumber(),
    territoryName: row.territory.name,
  }));

  return NextResponse.json({ clanId: clan.id, clanName: clan.name, data });
}
