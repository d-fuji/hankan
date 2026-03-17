"use client";

import { use } from "react";
import Link from "next/link";
import { PersonDetail } from "@/components/person-detail";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-navy hover:underline"
        >
          ← 戻る
        </Link>

        <PersonDetail id={Number(id)} />
      </main>

      <SiteFooter />
    </div>
  );
}
