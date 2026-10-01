import type { Metadata } from "next";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { FilterChips } from "@/components/public/filters";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { Pagination, parsePage } from "@/components/public/pagination";
import { param, type SearchParams } from "@/components/public/params";
import { Container, PageHeader } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { getGalleryCategories, listPublishedGallery } from "@/lib/data/gallery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Galeri",
  description: "Dokumentasi foto kegiatan dan suasana desa.",
};

// /galeri (design D14 with S8): category chips + grid + pagination (60/page).
export default async function GaleriPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const kategoriRaw = param(sp.kategori);
  const page = parsePage(sp.halaman);
  const header = <PageHeader title="Galeri" description="Dokumentasi kegiatan, lingkungan, dan kehidupan masyarakat desa." />;

  const catRes = await getGalleryCategories();
  if (!catRes.ok) {
    return (
      <>
        {header}
        <Container className="py-12">{catRes.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />}</Container>
      </>
    );
  }
  const kategori = catRes.data.includes(kategoriRaw) ? kategoriRaw : null;
  const res = await listPublishedGallery({ kategori, page });

  return (
    <>
      {header}
      <Container className="grid gap-6 py-10 md:py-12">
        {catRes.data.length > 1 ? (
          <FilterChips
            basePath="/galeri"
            param="kategori"
            active={kategori}
            options={catRes.data.map((c) => ({ value: c, label: c }))}
          />
        ) : null}
        {!res.ok ? (
          res.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />
        ) : res.data.rows.length === 0 ? (
          <EmptyState message="Belum ada foto di galeri." />
        ) : (
          <div>
            <h2 className="sr-only">Daftar foto</h2>
            <GalleryGrid items={res.data.rows} />
            <Pagination
              basePath="/galeri"
              params={{ kategori }}
              page={page}
              totalPages={Math.max(1, Math.ceil(res.data.total / res.data.pageSize))}
            />
          </div>
        )}
      </Container>
    </>
  );
}
