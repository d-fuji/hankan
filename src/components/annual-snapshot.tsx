"use client";

import Link from "next/link";
import useSWR from "swr";
import type { AnnualSnapshot } from "@/types/annual";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AnnualSnapshotViewProps = {
  year: number;
};

export function AnnualSnapshotView({ year }: AnnualSnapshotViewProps) {
  const { data, error, isLoading } = useSWR<AnnualSnapshot>(
    `/api/annual?year=${year}`,
    fetcher
  );

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">データの取得に失敗しました</p>;
  }

  if (!data) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">データがありません</p>;
  }

  return (
    <div className="space-y-6">
      {/* 将軍情報 */}
      {data.shogun && (
        <div className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-navy)] p-5 text-white">
          <p className="mb-1 text-sm text-white/60">征夷大将軍</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/persons/${data.shogun.id}`}
                className="font-[family-name:var(--font-noto-serif)] text-xl font-bold hover:text-[var(--color-gold)]"
              >
                {data.shogun.name}
              </Link>
              {data.shogun.generation !== undefined && (
                <span className="rounded bg-white/10 px-2 py-0.5 text-sm">
                  {data.shogun.generation === 1 ? "初代" : `${data.shogun.generation}代`}
                </span>
              )}
            </div>
            <span className="text-sm text-white/60">
              {data.shogun.startYear}–{data.shogun.endYear ?? ""}
            </span>
          </div>
        </div>
      )}

      {/* 領地一覧 */}
      <div>
        <h2 className="mb-3 font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
          領地一覧（{data.territories.length}件）
        </h2>
        {data.territories.length === 0 ? (
          <p className="py-4 text-center text-[var(--color-ink)]/50">
            該当する領地がありません
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-gold)]/20 text-left">
                  <th className="px-3 py-2 font-medium text-[var(--color-ink)]/60">領地名</th>
                  <th className="px-3 py-2 font-medium text-[var(--color-ink)]/60">種別</th>
                  <th className="px-3 py-2 font-medium text-[var(--color-ink)]/60">旧国</th>
                  <th className="px-3 py-2 font-medium text-[var(--color-ink)]/60">藩主/代官</th>
                  <th className="px-3 py-2 font-medium text-[var(--color-ink)]/60">家</th>
                  <th className="px-3 py-2 text-right font-medium text-[var(--color-ink)]/60">
                    石高（万石）
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.territories.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--color-gold)]/10 hover:bg-[var(--color-cream)]"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/territories/${t.id}`}
                        className="font-medium text-[var(--color-navy)] hover:text-[var(--color-gold)]"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-ink)]/60">{t.territoryType}</td>
                    <td className="px-3 py-2 text-[var(--color-ink)]/60">{t.provinceName}</td>
                    <td className="px-3 py-2">
                      {t.lord ? (
                        <Link
                          href={`/persons/${t.lord.id}`}
                          className="text-[var(--color-navy)] hover:text-[var(--color-gold)]"
                        >
                          {t.lord.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-ink)]/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-ink)]/60">
                      {t.lord?.clanName ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {t.kokudaka !== undefined ? t.kokudaka.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
