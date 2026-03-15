"use client";

import Link from "next/link";
import useSWR from "swr";

type ShogunEntry = {
  id: number;
  name: string;
  clanName: string;
  generation?: number;
  startYear: number;
  endYear?: number;
};

type ShogunResponse = {
  data: ShogunEntry[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ShogunList() {
  const { data, error, isLoading } = useSWR<ShogunResponse>(
    "/api/persons?role=征夷大将軍&limit=100",
    fetcher
  );

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">データの取得に失敗しました</p>;
  }

  if (!data || data.data.length === 0) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">データがありません</p>;
  }

  return (
    <div className="space-y-3">
      {data.data.map((shogun) => (
        <Link
          key={shogun.id}
          href={`/persons/${shogun.id}`}
          className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-navy)] font-[family-name:var(--font-noto-serif)] text-sm font-bold text-white">
              {shogun.generation !== undefined
                ? shogun.generation === 1
                  ? "初"
                  : shogun.generation
                : "—"}
            </span>
            <div>
              <span className="font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
                {shogun.name}
              </span>
              <span className="ml-2 text-sm text-[var(--color-ink)]/50">
                {shogun.clanName}家
              </span>
            </div>
          </div>
          <div className="text-right text-sm">
            <span className="text-[var(--color-ink)]/60">
              {shogun.generation !== undefined && (
                <span className="mr-3 font-medium">
                  {shogun.generation === 1 ? "初代" : `${shogun.generation}代`}
                </span>
              )}
              {shogun.startYear}–{shogun.endYear ?? ""}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
