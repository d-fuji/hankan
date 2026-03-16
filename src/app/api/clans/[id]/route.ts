import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClanDetail } from "@/lib/clan-mapper";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const clan = await prisma.clan.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          appointments: {
            select: {
              roleType: true,
              generation: true,
              territory: { select: { id: true, name: true, territoryType: true } },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!clan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toClanDetail(clan));
}
