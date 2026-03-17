"use client";

import Link from "next/link";
import useSWR from "swr";
import type { LineageNode, LineageResponse } from "@/types/person";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

type FamilyTreeProps = {
  personId: number;
};

const BIRTH_ORDER_LABELS: Record<number, string> = {
  1: "長",
  2: "次",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九",
  10: "十",
};

function formatBirthOrder(order?: number, type?: string): string | null {
  if (!order || !type) return null;
  const label = BIRTH_ORDER_LABELS[order] ?? String(order);
  return `${label}${type}`;
}

function TreeNode({ node }: { node: LineageNode }) {
  const birthOrderLabel = formatBirthOrder(node.birthOrder, node.birthOrderType);

  const appt = node.primaryAppointment;
  const roleLabel = appt
    ? `${appt.generation !== undefined ? (appt.generation === 1 ? "初代" : `${appt.generation}代`) + " " : ""}${appt.territoryName ? appt.territoryName + " " : ""}${appt.roleType}`
    : null;

  const nameContent = (
    <>
      <span className="font-medium">{node.name}</span>
      <span className="ml-1 text-xs text-ink/50">{node.clanName}</span>
      {roleLabel && (
        <div className="text-xs text-ink/40">{roleLabel}</div>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center">
      {/* ノードカード */}
      <div
        data-focus={node.isFocusPerson}
        className={`rounded-lg border px-4 py-2 text-center text-sm ${
          node.isFocusPerson
            ? "border-gold bg-gold/10 ring-2 ring-gold"
            : "border-navy/20 bg-white"
        }`}
      >
        {node.isFocusPerson ? (
          <div>{nameContent}</div>
        ) : (
          <Link href={`/persons/${node.id}`} className="text-navy hover:underline">
            {nameContent}
          </Link>
        )}
        {(node.isAdopted || birthOrderLabel) && (
          <div className="mt-1 text-xs text-ink/60">
            {birthOrderLabel && (
              <span className="rounded bg-navy/10 px-1.5 py-0.5">
                {birthOrderLabel}
              </span>
            )}
            {node.isAdopted && (
              <>
                <span
                  className={`rounded bg-amber-100 px-1.5 py-0.5 ${birthOrderLabel ? "ml-1" : ""}`}
                >
                  養子
                </span>
                {node.adoptedFromClanName && (
                  <span className="ml-1">（{node.adoptedFromClanName}家より）</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 子ノード */}
      {node.children.length > 0 && (
        <>
          {/* 縦線 */}
          <div className="h-6 w-px bg-navy/20" />

          <div className="flex gap-6">
            {node.children.map((child, i) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* 横線（兄弟ノード接続） */}
                {node.children.length > 1 && (
                  <div
                    className={`absolute top-0 h-px bg-navy/20 ${
                      i === 0
                        ? "left-1/2 right-0"
                        : i === node.children.length - 1
                          ? "left-0 right-1/2"
                          : "left-0 right-0"
                    }`}
                  />
                )}
                {/* 縦線（子への接続） */}
                <div
                  className={`h-6 w-px ${
                    child.isAdopted
                      ? "border-l border-dashed border-navy/30"
                      : "bg-navy/20"
                  }`}
                />
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function FamilyTree({ personId }: FamilyTreeProps) {
  const { data, error, isLoading } = useSWR<LineageResponse>(
    `/api/persons/${personId}/lineage`,
    fetcher
  );

  if (isLoading) return null;
  if (error || !data) return null;

  return (
    <section>
      <h3 className="mb-4 font-(family-name:--font-noto-serif) text-xl font-bold text-navy">
        血統
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gold/20 bg-cream p-6">
        <TreeNode node={data.tree} />
      </div>
    </section>
  );
}
