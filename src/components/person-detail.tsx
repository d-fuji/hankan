"use client";

import Link from "next/link";
import useSWR from "swr";
import type { PersonDetail as PersonDetailType } from "@/types/person";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

type PersonDetailProps = {
  id: number;
};

export function PersonDetail({ id }: PersonDetailProps) {
  const { data, error, isLoading } = useSWR<PersonDetailType>(
    `/api/persons/${id}`,
    fetcher
  );

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error || !data) {
    return (
      <p className="py-8 text-center text-red-600">人物が見つかりませんでした</p>
    );
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
            <dt className="text-[var(--color-ink)]/50">家</dt>
            <dd className="font-medium">{data.clanName}</dd>
          </div>
          {data.imina && (
            <div>
              <dt className="text-[var(--color-ink)]/50">諱</dt>
              <dd className="font-medium">{data.imina}</dd>
            </div>
          )}
          {data.commonName && (
            <div>
              <dt className="text-[var(--color-ink)]/50">通称</dt>
              <dd className="font-medium">{data.commonName}</dd>
            </div>
          )}
          {data.crestName && (
            <div>
              <dt className="text-[var(--color-ink)]/50">家紋</dt>
              <dd className="font-medium">{data.crestName}</dd>
            </div>
          )}
          {data.fatherName && (
            <div>
              <dt className="text-[var(--color-ink)]/50">父</dt>
              <dd className="font-medium">
                <Link
                  href={`/persons/${data.fatherId}`}
                  className="text-[var(--color-navy)] hover:underline"
                >
                  {data.fatherName}
                </Link>
              </dd>
            </div>
          )}
          {data.isAdopted && data.adoptedFromClanName && (
            <div>
              <dt className="text-[var(--color-ink)]/50">養子元</dt>
              <dd className="font-medium">{data.adoptedFromClanName}家</dd>
            </div>
          )}
        </dl>
      </section>

      {/* 役職履歴 */}
      {data.appointments.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            役職履歴
          </h3>
          <div className="space-y-2">
            {data.appointments.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3"
              >
                <div>
                  <span className="font-medium">{a.roleType}</span>
                  {a.territoryName && (
                    <Link
                      href={`/territories/${a.territoryId}`}
                      className="ml-2 text-sm text-[var(--color-navy)] hover:underline"
                    >
                      {a.territoryName}
                    </Link>
                  )}
                </div>
                <div className="text-sm text-[var(--color-ink)]/60">
                  {a.generation !== undefined && (
                    <span className="mr-3">
                      {a.generation === 1 ? "初代" : `${a.generation}代`}
                    </span>
                  )}
                  <span>
                    {a.startYear}–{a.endYear ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 子供一覧 */}
      {data.children.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            子女
          </h3>
          <div className="space-y-2">
            {data.children.map((child) => (
              <Link
                key={child.id}
                href={`/persons/${child.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3 hover:shadow-sm"
              >
                <span className="font-medium">{child.name}</span>
                {child.birthOrder && child.birthOrderType && (
                  <span className="text-sm text-[var(--color-ink)]/60">
                    {child.birthOrderType}{child.birthOrder === 1 ? "一" : child.birthOrder === 2 ? "二" : child.birthOrder === 3 ? "三" : child.birthOrder}子
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
