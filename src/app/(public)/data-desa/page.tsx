import type { Metadata } from "next";
import { ChartCard } from "@/components/charts/chart-card";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { SampleNotice } from "@/components/public/sample-notice";
import { Container, PageHeader, Section } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { StatCard } from "@/components/public/stat-card";
import { getPublishedStatistics, latestPerIndicator, type PublicStatistic } from "@/lib/data/statistics";
import { buildChartGroups } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Data Desa",
  description: "Statistik desa dalam grafik batang, kartu ringkas, dan tabel data.",
};

/** Highlight cards: the is_highlight rows (latest year each), otherwise the first 4 rows of the latest year. */
function pickHighlights(rows: PublicStatistic[]): PublicStatistic[] {
  const flagged = rows.filter((r) => r.is_highlight);
  if (flagged.length > 0) return latestPerIndicator(flagged, 4);
  const latestYear = Math.max(...rows.map((r) => r.year));
  return rows.filter((r) => r.year === latestYear).slice(0, 4);
}

// /data-desa (design D14, simplified by S2): bar chart per category for its latest year, with a
// role="img" summary and a <details> data table; chart_type "none" → table only. No filter form.
export default async function DataDesaPage() {
  const res = await getPublishedStatistics();
  const header = (
    <PageHeader
      title="Data Desa"
      description="Ringkasan statistik desa yang dikelola melalui CMS, lengkap dengan sumber dan tahun data."
    />
  );

  if (!res.ok) {
    return (
      <>
        {header}
        <Container className="py-12">{res.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />}</Container>
      </>
    );
  }

  if (res.data.length === 0) {
    return (
      <>
        {header}
        <Container className="py-12">
          <EmptyState message="Data desa belum tersedia." />
        </Container>
      </>
    );
  }

  const groups = buildChartGroups(res.data);
  const highlights = pickHighlights(res.data);
  const anySample = res.data.some((r) => r.is_sample);

  return (
    <>
      {header}
      {anySample ? (
        <Container className="pt-8">
          <SampleNotice />
        </Container>
      ) : null}

      {highlights.length > 0 ? (
        <Section id="sorotan" title="Sorotan Data">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((s) => (
              <StatCard key={s.id} stat={s} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="grafik" title="Data per Kategori" className={highlights.length > 0 ? "pt-0 md:pt-0" : undefined}>
        <div className="grid gap-8 lg:grid-cols-2">
          {groups.map((g) => (
            <ChartCard key={g.category} group={g} />
          ))}
        </div>
      </Section>
    </>
  );
}
