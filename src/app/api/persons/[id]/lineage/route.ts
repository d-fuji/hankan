import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LineageNode } from "@/types/person";

const ANCESTOR_DEPTH_LIMIT = 5;
const DESCENDANT_DEPTH_LIMIT = 3;

const personSelect = {
  id: true,
  name: true,
  clan: { select: { name: true } },
  fatherId: true,
  isAdopted: true,
  adoptedFromClan: { select: { name: true } },
};

type PersonRow = {
  id: number;
  name: string;
  clan: { name: string };
  fatherId: number | null;
  isAdopted: boolean;
  adoptedFromClan: { name: string } | null;
};

/** 先祖を辿ってルート人物を見つける */
async function findRootAncestor(person: PersonRow): Promise<PersonRow> {
  let current = person;
  for (let i = 0; i < ANCESTOR_DEPTH_LIMIT; i++) {
    if (!current.fatherId) break;
    const father = await prisma.person.findUnique({
      where: { id: current.fatherId },
      select: personSelect,
    });
    if (!father) break;
    current = father;
  }
  return current;
}

/** 子孫を再帰的に取得してツリーを構築 */
async function buildTree(person: PersonRow, focusId: number, depth: number): Promise<LineageNode> {
  const children: LineageNode[] = [];

  if (depth < DESCENDANT_DEPTH_LIMIT) {
    const childRows = await prisma.person.findMany({
      where: { fatherId: person.id },
      select: personSelect,
      orderBy: { id: "asc" },
    });
    for (const child of childRows) {
      children.push(await buildTree(child, focusId, depth + 1));
    }
  }

  return {
    id: person.id,
    name: person.name,
    clanName: person.clan.name,
    isAdopted: person.isAdopted,
    adoptedFromClanName: person.adoptedFromClan?.name,
    isFocusPerson: person.id === focusId,
    children,
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const person = await prisma.person.findUnique({
    where: { id },
    select: personSelect,
  });

  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const root = await findRootAncestor(person);
  const tree = await buildTree(root, id, 0);

  return NextResponse.json({ tree, focusPersonId: id });
}
