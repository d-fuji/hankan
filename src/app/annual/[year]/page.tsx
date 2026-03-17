import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnualSnapshotView } from "@/components/annual-snapshot";
import { YearSelector } from "@/components/year-selector";

type AnnualPageProps = {
  params: Promise<{ year: string }>;
};

export default async function AnnualPage({ params }: AnnualPageProps) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);

  if (Number.isNaN(year) || year < 1603 || year > 1868) {
    redirect("/annual/1700");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentPath="/annual" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <section className="mb-6">
          <h2 className="mb-2 font-(family-name:--font-noto-serif) text-2xl font-bold text-navy">
            年代ビュー
          </h2>
          <p className="text-sm text-ink/60">
            指定した年の将軍・領地・石高のスナップショット
          </p>
        </section>

        <div className="mb-6">
          <YearSelector currentYear={year} />
        </div>

        <AnnualSnapshotView year={year} />
      </main>

      <SiteFooter />
    </div>
  );
}
