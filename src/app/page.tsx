import { TerritoryList } from "@/components/territory-list";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="border-b border-[var(--color-gold)]/30 bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-[family-name:var(--font-noto-serif)] text-2xl font-bold tracking-wider">
            藩鑑
          </h1>
          <nav className="flex gap-6 text-sm">
            <span className="text-[var(--color-gold)]">領地検索</span>
            <span className="text-white/60">年代ビュー</span>
            <span className="text-white/60">将軍一覧</span>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="mb-8">
          <h2 className="mb-2 font-[family-name:var(--font-noto-serif)] text-2xl font-bold text-[var(--color-navy)]">
            領地一覧
          </h2>
          <p className="text-sm text-[var(--color-ink)]/60">
            江戸時代の藩・天領・旗本領を検索・閲覧
          </p>
        </section>

        <TerritoryList />
      </main>

      {/* フッター */}
      <footer className="border-t border-[var(--color-ink)]/10 py-6 text-center text-sm text-[var(--color-ink)]/40">
        藩鑑 — 江戸時代藩制度データベース
      </footer>
    </div>
  );
}
