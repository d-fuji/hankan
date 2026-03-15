"use client";

import { use } from "react";
import Link from "next/link";
import { TerritoryDetail } from "@/components/territory-detail";

export default function TerritoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-gold)]/30 bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold tracking-wider"
          >
            藩鑑
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-[var(--color-gold)]">
              領地検索
            </Link>
            <span className="text-white/60">年代ビュー</span>
            <span className="text-white/60">将軍一覧</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-[var(--color-navy)] hover:underline"
        >
          ← 領地一覧に戻る
        </Link>

        <TerritoryDetail id={Number(id)} />
      </main>

      <footer className="border-t border-[var(--color-ink)]/10 py-6 text-center text-sm text-[var(--color-ink)]/40">
        藩鑑 — 江戸時代藩制度データベース
      </footer>
    </div>
  );
}
