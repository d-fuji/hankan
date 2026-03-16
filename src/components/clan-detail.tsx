"use client";

import Link from "next/link";
import useSWR from "swr";
import type { ClanDetail as ClanDetailType } from "@/types/clan";
import { ClanKokudakaChart } from "@/components/clan-kokudaka-chart";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

type ClanDetailProps = {
  id: number;
};

export function ClanDetail({ id }: ClanDetailProps) {
  const { data, error, isLoading } = useSWR<ClanDetailType>(`/api/clans/${id}`, fetcher);

  if (isLoading) {
    return <p className="py-8 text-center text-[var(--color-ink)]/50">読み込み中...</p>;
  }

  if (error || !data) {
    return <p className="py-8 text-center text-red-600">家が見つかりませんでした</p>;
  }

  return (
    <div className="space-y-8">
      {/* 基本情報 */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-noto-serif)] text-3xl font-bold text-[var(--color-navy)]">
          {data.name}家
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--color-ink)]/50">読み</dt>
            <dd className="font-medium">{data.nameKana}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink)]/50">ローマ字</dt>
            <dd className="font-medium">{data.nameRomaji}</dd>
          </div>
          {data.crestName && (
            <div>
              <dt className="text-[var(--color-ink)]/50">家紋</dt>
              <dd className="font-medium">{data.crestName}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* 関連領地 */}
      {data.territories.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            関連領地
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.territories.map((t) => (
              <Link
                key={t.id}
                href={`/territories/${t.id}`}
                className="rounded-lg border border-[var(--color-gold)]/20 bg-white px-4 py-2 text-sm hover:shadow-sm"
              >
                <span className="font-medium">{t.name}</span>
                <span className="ml-2 text-xs text-[var(--color-ink)]/50">{t.territoryType}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 石高推移グラフ */}
      <ClanKokudakaChart clanId={data.id} />

      {/* 所属人物一覧 */}
      {data.members.length > 0 && (
        <section>
          <h3 className="mb-3 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
            所属人物
          </h3>
          <div className="space-y-2">
            {data.members.map((member) => (
              <Link
                key={member.id}
                href={`/persons/${member.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3 hover:shadow-sm"
              >
                <span className="font-medium">{member.name}</span>
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/60">
                  {member.primaryAppointment && (
                    <span>
                      {member.primaryAppointment.generation !== undefined &&
                        `${member.primaryAppointment.generation === 1 ? "初代" : `${member.primaryAppointment.generation}代`} `}
                      {member.primaryAppointment.territoryName
                        ? `${member.primaryAppointment.territoryName} ${member.primaryAppointment.roleType}`
                        : member.primaryAppointment.roleType}
                    </span>
                  )}
                  {member.totalAppointments > 1 && (
                    <span className="rounded bg-[var(--color-navy)]/10 px-1.5 py-0.5 text-xs">
                      +{member.totalAppointments - 1}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
