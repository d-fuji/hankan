"use client";

import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ClanKokudakaResponse } from "@/types/clan";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

type ClanKokudakaChartProps = {
  clanId: number;
};

export function ClanKokudakaChart({ clanId }: ClanKokudakaChartProps) {
  const { data, error, isLoading } = useSWR<ClanKokudakaResponse>(
    `/api/clans/${clanId}/kokudaka`,
    fetcher
  );

  if (isLoading) return null;
  if (error || !data || data.data.length === 0) return null;

  return (
    <section>
      <h3 className="mb-4 font-[family-name:var(--font-noto-serif)] text-xl font-bold text-[var(--color-navy)]">
        石高推移
      </h3>

      {/* グラフ */}
      <div className="mb-4 rounded-lg border border-[var(--color-gold)]/20 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}万石`} />
            <Tooltip
              formatter={(value: number) => [`${value}万石`, "石高"]}
              labelFormatter={(label) => `${label}年`}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#C9A96E"
              strokeWidth={2}
              dot={{ fill: "#1B2A4A", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* データテーブル */}
      <div className="space-y-2">
        {data.data.map((point) => (
          <div
            key={`${point.year}-${point.territoryName}`}
            className="flex items-center justify-between rounded-lg border border-[var(--color-gold)]/20 bg-white p-3"
          >
            <div>
              <span className="font-medium">{point.year}年</span>
              <span className="ml-2 text-sm text-[var(--color-ink)]/50">{point.territoryName}</span>
            </div>
            <span className="font-[family-name:var(--font-noto-serif)] text-lg font-bold text-[var(--color-navy)]">
              {point.amount}万石
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
