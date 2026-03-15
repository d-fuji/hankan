import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPersonDetail } from "@/lib/person-mapper";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      clan: { select: { id: true, name: true, crestName: true } },
      father: { select: { id: true, name: true } },
      adoptedFromClan: { select: { id: true, name: true } },
      appointments: {
        include: {
          territory: { select: { id: true, name: true } },
        },
        orderBy: { startYear: "asc" },
      },
      children: {
        select: { id: true, name: true, birthOrder: true, birthOrderType: true },
        orderBy: { birthOrder: "asc" },
      },
    },
  });

  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toPersonDetail(person));
}
