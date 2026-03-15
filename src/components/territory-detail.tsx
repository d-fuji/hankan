"use client";

import useSWR from "swr";
import type { TerritoryDetail as TerritoryDetailType } from "@/types/territory";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

type TerritoryDetailProps = {
  id: number;
};

export function TerritoryDetail({ id }: TerritoryDetailProps) {
  const { data, error, isLoading } = useSWR<TerritoryDetailType>(`/api/territories/${id}`, fetcher);

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error || !data) {
    return <p className="py-8 text-center text-red-600">領地が見つかりませんでした</p>;
  }

  return (
    <div className="space-y-8">
      {/* 基本情報 */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-noto-serif)] text-3xl font-bold text-[var(--color-navy)]">
          {data.name}
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--color-ink)]/50">旧国</dt>
            <dd className="font-medium">{data.provinceName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink)]/50">地域</dt>
            <dd className="font-medium">{data.region}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink)]/50">都道府県</dt>
            <dd className="font-medium">{data.modernPrefecture}</dd>
          </div>
          {data.modernCity && (
            <div>
              <dt className="text-[var(--color-ink)]/50">市区町村</dt>
              <dd className="font-medium">{data.modernCity}</dd>
            </div>
          )}
          {data.location && (
            <div>
              <dt className="text-[var(--color-ink)]/50">城下町</dt>
              <dd className="font-medium">{data.location}</dd>
            </div>
          )}
          <div>
            <dt className="text-[var(--color-ink)]/50">成立</dt>
            <dd className="font-medium">{data.establishedYear}年</dd>
          </div>
          {data.abolishedYear && (
            <div>
              <dt className="text-[var(--color-ink)]/50">廃止</dt>
              <dd className="font-medium">{data.abolishedYear}年</dd>
            </div>
          )}
        </dl>
      </section>

      {/* 藩主一覧 */}
      {data.lords.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            歴代藩主
          </h3>
          <div className="space-y-2">
            {data.lords.map((lord) => (
              <div
                key={`${lord.id}-${lord.startYear}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3"
              >
                <div>
                  <span className="font-medium">{lord.name}</span>
                  <span className="ml-2 text-sm text-[var(--color-ink)]/50">{lord.clanName}家</span>
                </div>
                <div className="text-sm text-[var(--color-ink)]/60">
                  {lord.generation !== undefined && (
                    <span className="mr-3">
                      {lord.generation === 1 ? "初代" : `${lord.generation}代`}
                    </span>
                  )}
                  <span>
                    {lord.startYear}–{lord.endYear ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 石高履歴 */}
      {data.kokudakaHistory.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            石高推移
          </h3>
          <div className="space-y-2">
            {data.kokudakaHistory.map((record) => (
              <div
                key={`${record.year}-${record.amount}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3"
              >
                <div>
                  <span className="font-medium">{record.year}年</span>
                  {record.changeType && (
                    <span className="ml-2 rounded bg-[var(--color-navy)]/10 px-2 py-0.5 text-xs text-[var(--color-navy)]">
                      {record.changeType}
                    </span>
                  )}
                  {record.changeDetail && (
                    <span className="ml-2 text-sm text-[var(--color-ink)]/50">
                      {record.changeDetail}
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
                  {record.amount}万石
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
