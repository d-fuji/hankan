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
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-16">
        {/* タイトルセクション */}
        <section className="mb-12 text-center">
          <h2 className="mb-4 font-[family-name:var(--font-noto-serif)] text-5xl font-bold text-[var(--color-navy)]">
            藩鑑
          </h2>
          <p className="text-lg text-[var(--color-ink)]/70">
            江戸時代の藩・藩主・石高を横断的に検索・閲覧
          </p>
        </section>

        {/* 検索バー */}
        <section className="mb-16 w-full max-w-2xl">
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-navy)]/20 bg-white shadow-sm">
            <input
              type="text"
              placeholder="領地名・藩主名で検索（例: 加賀、徳川）"
              className="flex-1 px-5 py-3.5 text-base outline-none placeholder:text-[var(--color-ink)]/40"
            />
            <button className="bg-[var(--color-navy)] px-6 text-sm font-medium text-white transition-colors hover:bg-[var(--color-navy)]/90">
              検索
            </button>
          </div>
        </section>

        {/* 概要カード */}
        <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-6 shadow-sm">
            <p className="mb-1 font-[family-name:var(--font-noto-serif)] text-3xl font-bold text-[var(--color-navy)]">
              —
            </p>
            <p className="text-sm text-[var(--color-ink)]/60">登録領地数</p>
          </div>
          <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-6 shadow-sm">
            <p className="mb-1 font-[family-name:var(--font-noto-serif)] text-3xl font-bold text-[var(--color-navy)]">
              —
            </p>
            <p className="text-sm text-[var(--color-ink)]/60">登録人物数</p>
          </div>
          <div className="rounded-lg border border-[var(--color-gold)]/20 bg-white p-6 shadow-sm">
            <p className="mb-1 font-[family-name:var(--font-noto-serif)] text-3xl font-bold text-[var(--color-navy)]">
              1603–1868
            </p>
            <p className="text-sm text-[var(--color-ink)]/60">対象時代</p>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-[var(--color-ink)]/10 py-6 text-center text-sm text-[var(--color-ink)]/40">
        藩鑑 — 江戸時代藩制度データベース
      </footer>
    </div>
  );
}
