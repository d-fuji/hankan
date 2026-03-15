import { ShogunList } from "@/components/shogun-list";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Shoguns() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentPath="/shoguns" />

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

      <SiteFooter />
    </div>
  );
}
