"use client";

import { useState } from "react";
import Link from "next/link";
import { TerritorySearch } from "@/components/territory-search";
import { TerritoryList } from "@/components/territory-list";
import { RegionFilter } from "@/components/region-filter";
import { StatsBar } from "@/components/stats-bar";

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | undefined>(undefined);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-gold)]/30 bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold tracking-wider">
            藩鑑
          </h1>
          <nav className="flex gap-6 text-sm">
            <span className="text-[var(--color-gold)]">領地検索</span>
            <Link href="/shoguns" className="text-white/60 hover:text-white">将軍一覧</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="mb-6">
          <StatsBar />
        </section>

        <section className="mb-4">
          <TerritorySearch onSearch={setQuery} />
        </section>

        <section className="mb-6">
          <RegionFilter selected={region} onSelect={setRegion} />
        </section>

        <TerritoryList query={query} region={region} />
      </main>

      <footer className="border-t border-[var(--color-ink)]/10 py-6 text-center text-sm text-[var(--color-ink)]/40">
        藩鑑 — 江戸時代藩制度データベース
      </footer>
    </div>
  );
}
