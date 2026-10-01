import type { Metadata } from "next";
import { MapFallbackList } from "@/components/map/map-fallback-list";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { FilterChips } from "@/components/public/filters";
import { fold, param, type SearchParams } from "@/components/public/params";
import { PotentialCard } from "@/components/public/potential-card";
import { SearchForm } from "@/components/public/search-form";
import { Container, PageHeader, Section } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { POTENTIAL_CATEGORIES } from "@/lib/config";
import { getPublishedPotentials, type PotentialCardRow } from "@/lib/data/potentials";
import { normalizeSearchTerm } from "@/lib/search-term";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Jelajah Potensi Desa",
  description: "Katalog potensi lokal dan UMKM desa: cari, saring per kategori, dan temukan lokasinya.",
};

/** Distinct published categories, in vocabulary order, unknown ones last by name. */
function categoriesOf(rows: PotentialCardRow[]): string[] {
  const order = POTENTIAL_CATEGORIES as readonly string[];
  const rank = (c: string) => (order.includes(c) ? order.indexOf(c) : order.length);
  return [...new Set(rows.map((r) => r.category))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "id"));
}

function matches(p: PotentialCardRow, term: string): boolean {
  const hay = fold([p.name, p.summary, p.category, p.address].filter(Boolean).join(" "));
  return hay.includes(fold(term));
}

// /potensi (design D14): one query, filtering in server code; map section = location list (S1).
export default async function PotensiPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = param(sp.q).slice(0, 100);
  const kategoriRaw = param(sp.kategori);
  const header = (
    <PageHeader
      title="Jelajah Potensi Desa"
      description="Temukan potensi lokal, UMKM, dan layanan yang dikelola warga desa."
    />
  );

  const res = await getPublishedPotentials();
  if (!res.ok) {
    return (
      <>
        {header}
        <Container className="py-12">{res.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />}</Container>
      </>
    );
  }

  const categories = categoriesOf(res.data);
  const kategori = categories.includes(kategoriRaw) ? kategoriRaw : null;
  const term = normalizeSearchTerm(q);
  const filtered = res.data.filter((p) => (!kategori || p.category === kategori) && (!term || matches(p, term)));
  const located = filtered.filter((p) => p.latitude !== null && p.longitude !== null);

  return (
    <>
      {header}
      <Section id="katalog" title="Katalog Potensi">
        {res.data.length === 0 ? (
          <EmptyState message="Belum ada potensi yang diterbitkan." />
        ) : (
          <div className="grid gap-6">
            <SearchForm action="/potensi" label="Cari potensi" defaultValue={q} hidden={{ kategori }} />
            {categories.length > 0 ? (
              <FilterChips
                basePath="/potensi"
                param="kategori"
                active={kategori}
                options={categories.map((c) => ({ value: c, label: c }))}
                keep={{ q: q || null }}
              />
            ) : null}
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {filtered.length} potensi ditemukan
            </p>
            {filtered.length === 0 ? (
              <EmptyState message="Tidak ada potensi yang cocok dengan pencarian atau filter." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <PotentialCard key={p.id} potential={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      <Section id="peta" title="Lokasi Potensi" className="bg-secondary/40">
        {located.length === 0 ? (
          <p className="text-muted-foreground">Belum ada lokasi potensi yang ditandai di peta.</p>
        ) : (
          <MapFallbackList
            label="Daftar lokasi potensi desa"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            items={located.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              latitude: p.latitude!,
              longitude: p.longitude!,
              href: `/potensi/${p.slug}`,
            }))}
          />
        )}
      </Section>
    </>
  );
}
