"use client";

import Link from "next/link";
import useSWR from "swr";
import type { ClanSummary } from "@/types/clan";

type ClanListResponse = {
  data: ClanSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ClanList() {
  const { data, error, isLoading } = useSWR<ClanListResponse>("/api/clans?limit=100", fetcher);

  if (isLoading) {
    return <p className="py-8 text-center text-ink/50">読み込み中...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">データの取得に失敗しました</p>;
  }

  if (!data || data.data.length === 0) {
    return <p className="py-8 text-center text-ink/50">データがありません</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((clan) => (
        <Link
          key={clan.id}
          href={`/clans/${clan.id}`}
          className="rounded-lg border border-gold/20 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="font-(family-name:--font-noto-serif) text-lg font-bold text-navy">
              {clan.name}
            </span>
            {clan.crestName && (
              <span className="text-xs text-ink/50">{clan.crestName}</span>
            )}
          </div>
          <div className="mt-2 text-sm text-ink/60">
            <span>{clan.memberCount}人</span>
            {clan.territoryNames.length > 0 && (
              <span className="ml-3">{clan.territoryNames.join("・")}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
