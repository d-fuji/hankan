import { ClanList } from "@/components/clan-list";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Clans() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentPath="/clans" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="mb-6">
          <h2 className="mb-2 font-(family-name:--font-noto-serif) text-2xl font-bold text-navy">
            家一覧
          </h2>
          <p className="text-sm text-ink/60">江戸時代の主要な武家一覧</p>
        </section>

        <ClanList />
      </main>

      <SiteFooter />
    </div>
  );
}
