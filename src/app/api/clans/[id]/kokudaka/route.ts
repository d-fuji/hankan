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

  // 家の人物が藩主として治めた領地と在任期間を取得
  const appointments = await prisma.appointment.findMany({
    where: {
      person: { clanId: id },
      roleType: "藩主",
      territoryId: { not: null },
    },
    select: { territoryId: true, startYear: true, endYear: true },
  });

  if (appointments.length === 0) {
    return NextResponse.json({ clanId: clan.id, clanName: clan.name, summary: [], detail: [] });
  }

  // 領地ごとに家が治めた期間を算出（最初の就任〜最後の退任）
  const territoryPeriods = new Map<number, { minStart: number; maxEnd: number }>();
  for (const a of appointments) {
    if (!a.territoryId) continue;
    const existing = territoryPeriods.get(a.territoryId);
    const start = a.startYear;
    const end = a.endYear ?? 9999;
    if (!existing) {
      territoryPeriods.set(a.territoryId, { minStart: start, maxEnd: end });
    } else {
      existing.minStart = Math.min(existing.minStart, start);
      existing.maxEnd = Math.max(existing.maxEnd, end);
    }
  }

  const territoryIds = [...territoryPeriods.keys()];

  // 領地の石高履歴を取得
  const kokudakaRows = await prisma.kokudaka.findMany({
    where: { territoryId: { in: territoryIds } },
    select: {
      year: true,
      amount: true,
      changeType: true,
      changeDetail: true,
      territoryId: true,
      territory: { select: { name: true } },
    },
    orderBy: { year: "asc" },
  });

  // 家が治めていた期間内の石高のみフィルタ
  // endYearは退任年（=次の藩主の就任年）なので、endYear未満でフィルタ
  const filtered = kokudakaRows.filter((row) => {
    const period = territoryPeriods.get(row.territoryId);
    if (!period) return false;
    return row.year >= period.minStart && row.year < period.maxEnd;
  });

  // detail: 領地別の個別データ
  const detail: ClanKokudakaDetail[] = filtered.map((row) => ({
    year: row.year,
    amount: row.amount.toNumber(),
    territoryName: row.territory.name,
    changeType: row.changeType ?? undefined,
    changeDetail: row.changeDetail ?? undefined,
  }));

  // summary: 年ごとに石高を合算
  const yearMap = new Map<number, number>();
  for (const row of filtered) {
    const amount = row.amount.toNumber();
    yearMap.set(row.year, (yearMap.get(row.year) ?? 0) + amount);
  }
  const summary: ClanKokudakaSummary[] = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, totalAmount]) => ({ year, totalAmount: Math.round(totalAmount * 100) / 100 }));

  return NextResponse.json({ clanId: clan.id, clanName: clan.name, summary, detail });
}
