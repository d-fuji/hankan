"use client";

import { use } from "react";
import Link from "next/link";
import { ClanDetail } from "@/components/clan-detail";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ClanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentPath="/clans" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link
          href="/clans"
          className="mb-6 inline-block text-sm text-[var(--color-navy)] hover:underline"
        >
          ← 家一覧に戻る
        </Link>

        <ClanDetail id={Number(id)} />
      </main>

      <SiteFooter />
    </div>
  );
}
