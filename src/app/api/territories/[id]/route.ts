import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toTerritoryDetail } from "@/lib/territory-mapper";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const territory = await prisma.territory.findUnique({
    where: { id },
    include: {
      province: { select: { name: true, region: true } },
      appointments: {
        include: {
          person: {
            select: { id: true, name: true, clan: { select: { name: true } } },
          },
        },
        orderBy: { startYear: "asc" },
      },
      kokudakaHistory: {
        orderBy: { year: "asc" },
      },
    },
  });

  if (!territory) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toTerritoryDetail(territory));
}
