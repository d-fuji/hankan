"use client";

import { useState } from "react";
import { TerritorySearch } from "@/components/territory-search";
import { TerritoryList } from "@/components/territory-list";
import { RegionFilter } from "@/components/region-filter";
import { StatsBar } from "@/components/stats-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | undefined>(undefined);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentPath="/" />

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

      <SiteFooter />
    </div>
  );
}
