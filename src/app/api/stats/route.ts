import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [territoryCount, personCount] = await Promise.all([
    prisma.territory.count(),
    prisma.person.count(),
  ]);

  return NextResponse.json({ territoryCount, personCount });
}
