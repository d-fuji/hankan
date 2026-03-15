import Link from "next/link";
import { ShogunList } from "@/components/shogun-list";

export default function Shoguns() {
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
            <Link href="/" className="text-white/60">
              領地検索
            </Link>
            <span className="text-white/60">年代ビュー</span>
            <span className="text-[var(--color-gold)]">将軍一覧</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="mb-6">
          <h2 className="mb-2 font-[family-name:var(--font-noto-serif)] text-2xl font-bold text-[var(--color-navy)]">
            徳川将軍一覧
          </h2>
          <p className="text-sm text-[var(--color-ink)]/60">
            江戸幕府 征夷大将軍 15代
          </p>
        </section>

        <ShogunList />
      </main>

      <footer className="border-t border-[var(--color-ink)]/10 py-6 text-center text-sm text-[var(--color-ink)]/40">
        藩鑑 — 江戸時代藩制度データベース
      </footer>
    </div>
  );
}
