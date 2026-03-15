import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LineageNode } from "@/types/person";

/** フォーカス人物から何世代上まで遡るか */
const ANCESTOR_LIMIT = 2;

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

/** 先祖を辿ってルート人物を見つける（最大 ANCESTOR_LIMIT 世代上） */
async function findLocalRoot(person: PersonRow): Promise<{ root: PersonRow; depth: number }> {
  let current = person;
  let depth = 0;
  for (let i = 0; i < ANCESTOR_LIMIT; i++) {
    if (!current.fatherId) break;
    const father = await prisma.person.findUnique({
      where: { id: current.fatherId },
      select: personSelect,
    });
    if (!father) break;
    current = father;
    depth++;
  }
  return { root: current, depth };
}

/** 子孫を再帰的に取得してツリーを構築 */
async function buildTree(
  person: PersonRow,
  focusId: number,
  depth: number,
  maxDepth: number
): Promise<LineageNode> {
  const children: LineageNode[] = [];

  if (depth < maxDepth) {
    const childRows = await prisma.person.findMany({
      where: { fatherId: person.id },
      select: personSelect,
      orderBy: { id: "asc" },
    });
    for (const child of childRows) {
      children.push(await buildTree(child, focusId, depth + 1, maxDepth));
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

  const { root, depth: ancestorDepth } = await findLocalRoot(person);
  // ルートからの最大深さ = 遡った分 + フォーカス人物から2世代下（子・孫）
  const maxDepth = ancestorDepth + 2;
  const tree = await buildTree(root, id, 0, maxDepth);

  return NextResponse.json({ tree, focusPersonId: id });
}
