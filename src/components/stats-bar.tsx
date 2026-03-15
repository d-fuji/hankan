"use client";

import useSWR from "swr";

type Stats = {
  territoryCount: number;
  personCount: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function StatsBar() {
  const { data } = useSWR<Stats>("/api/stats", fetcher);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm">
        <p className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold text-[var(--color-navy)]">
          {data?.territoryCount ?? "—"}
        </p>
        <p className="text-sm text-[var(--color-ink)]/60">登録領地数</p>
      </div>
      <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm">
        <p className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold text-[var(--color-navy)]">
          {data?.personCount ?? "—"}
        </p>
        <p className="text-sm text-[var(--color-ink)]/60">登録人物数</p>
      </div>
      <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-4 shadow-sm">
        <p className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold text-[var(--color-navy)]">
          1603–1868
        </p>
        <p className="text-sm text-[var(--color-ink)]/60">対象時代</p>
      </div>
    </div>
  );
}
