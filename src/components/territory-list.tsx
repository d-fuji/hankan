"use client";

import Link from "next/link";
import useSWR from "swr";
import type { TerritorySummary, PaginatedResponse } from "@/types/territory";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TerritoryListProps = {
  query?: string;
  region?: string;
};

export function TerritoryList({ query, region }: TerritoryListProps = {}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (region) params.set("region", region);
  const url = `/api/territories${params.toString() ? `?${params}` : ""}`;

  const { data, error, isLoading } = useSWR<PaginatedResponse<TerritorySummary>>(url, fetcher);

  if (isLoading) {
    return <p className="py-8 text-center text-ink/50">読み込み中...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">データの取得に失敗しました</p>;
  }

  if (!data || data.data.length === 0) {
    return <p className="py-8 text-center text-ink/50">該当する領地がありません</p>;
  }

  return (
    <div className="grid gap-4">
      {data.data.map((territory) => (
        <Link
          key={territory.id}
          href={`/territories/${territory.id}`}
          className="flex items-center justify-between rounded-lg border border-gold/20 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div>
            <h3 className="font-(family-name:--font-noto-serif) text-lg font-bold text-navy">
              {territory.name}
            </h3>
            <div className="mt-1 flex gap-3 text-sm text-ink/60">
              <span>{territory.provinceName}</span>
              <span>{territory.modernPrefecture}</span>
              <span>{territory.territoryType}</span>
            </div>
          </div>
          {territory.kokudaka !== undefined && (
            <span className="font-(family-name:--font-noto-serif) text-lg font-bold text-navy">
              {territory.kokudaka}万石
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
