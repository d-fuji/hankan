import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ClanKokudakaSummary, ClanKokudakaDetail } from "@/types/clan";

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
    .filter((tid): tid is number => tid !== null);

  if (territoryIds.length === 0) {
    return NextResponse.json({ clanId: clan.id, clanName: clan.name, summary: [], detail: [] });
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

  // detail: 領地別の個別データ
  const detail: ClanKokudakaDetail[] = kokudakaRows.map((row) => ({
    year: row.year,
    amount: row.amount.toNumber(),
    territoryName: row.territory.name,
  }));

  // summary: 年ごとに石高を合算
  const yearMap = new Map<number, number>();
  for (const row of kokudakaRows) {
    const amount = row.amount.toNumber();
    yearMap.set(row.year, (yearMap.get(row.year) ?? 0) + amount);
  }
  const summary: ClanKokudakaSummary[] = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, totalAmount]) => ({ year, totalAmount: Math.round(totalAmount * 100) / 100 }));

  return NextResponse.json({ clanId: clan.id, clanName: clan.name, summary, detail });
}
