"use client";

import useSWR from "swr";
import type { TerritorySummary, PaginatedResponse } from "@/types/territory";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TerritoryList() {
  const { data, error, isLoading } = useSWR<PaginatedResponse<TerritorySummary>>(
    "/api/territories",
    fetcher
  );

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error) {
    return (
      <p className="py-8 text-center text-red-600">データの取得に失敗しました</p>
    );
  }

  if (!data || data.data.length === 0) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">該当する領地がありません</p>;
  }

  return (
    <div className="grid gap-4">
      {data.data.map((territory) => (
        <div
          key={territory.id}
          className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div>
            <h3 className="font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
              {territory.name}
            </h3>
            <div className="mt-1 flex gap-3 text-sm text-[var(--color-ink)]/60">
              <span>{territory.provinceName}</span>
              <span>{territory.modernPrefecture}</span>
              <span>{territory.territoryType}</span>
            </div>
          </div>
          {territory.kokudaka !== undefined && (
            <span className="font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
              {territory.kokudaka}万石
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
