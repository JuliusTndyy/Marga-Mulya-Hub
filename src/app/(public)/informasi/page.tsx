import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { FilterChips } from "@/components/public/filters";
import { Pagination, parsePage } from "@/components/public/pagination";
import { param, type SearchParams } from "@/components/public/params";
import { PostCard } from "@/components/public/post-card";
import { SearchForm } from "@/components/public/search-form";
import { Container, PageHeader } from "@/components/public/section";
import { SectionSkeleton } from "@/components/public/section-skeleton";
import { ServiceNotice } from "@/components/public/service-notice";
import { JENIS_TO_TYPE, listPublishedPosts, type Jenis } from "@/lib/data/posts";
import { todayInSiteTz } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Informasi Desa",
  description: "Berita, pengumuman, agenda, dan layanan desa.",
};

const TABS: { value: Exclude<Jenis, "semua">; label: string }[] = [
  { value: "berita", label: "Berita" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "agenda", label: "Agenda" },
  { value: "layanan", label: "Layanan" },
];

function parseJenis(v: string): Jenis {
  return Object.hasOwn(JENIS_TO_TYPE, v) ? (v as Jenis) : "semua";
}

async function Results({ jenis, q, page }: { jenis: Jenis; q: string; page: number }) {
  const res = await listPublishedPosts({ jenis, q, page });
  if (!res.ok) return res.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />;
  const { rows, total, pageSize } = res.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const today = todayInSiteTz();
  return (
    <>
      <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
        {total} informasi ditemukan
      </p>
      {rows.length === 0 ? (
        <EmptyState message={q ? "Tidak ada informasi yang cocok dengan pencarian." : "Belum ada informasi yang diterbitkan."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <PostCard key={p.id} post={p} today={today} headingLevel={2} />
          ))}
        </div>
      )}
      <Pagination
        basePath="/informasi"
        params={{ jenis: jenis === "semua" ? null : jenis, q: q || null }}
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
      />
    </>
  );
}

// /informasi (design D14, simplified by S9: type tabs + search + pagination; GET only, works without JS).
export default async function InformasiPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const jenis = parseJenis(param(sp.jenis));
  const q = param(sp.q).slice(0, 100);
  const page = parsePage(sp.halaman);

  return (
    <>
      <PageHeader title="Informasi Desa" description="Berita, pengumuman, agenda kegiatan, dan informasi layanan desa." />
      <Container className="grid gap-6 py-10 md:py-12">
        <FilterChips
          basePath="/informasi"
          param="jenis"
          label="Jenis informasi"
          active={jenis === "semua" ? null : jenis}
          options={TABS}
          keep={{ q: q || null }}
        />
        <SearchForm
          action="/informasi"
          label="Cari informasi"
          defaultValue={q}
          hidden={{ jenis: jenis === "semua" ? null : jenis }}
        />
        <div>
          <Suspense key={`${jenis}|${q}|${page}`} fallback={<SectionSkeleton />}>
            <Results jenis={jenis} q={q} page={page} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
