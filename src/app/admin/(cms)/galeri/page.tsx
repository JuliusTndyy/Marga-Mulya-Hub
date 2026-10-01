import type { Metadata } from "next";
import { deleteGalleryItem, setGalleryItemStatus } from "@/actions/gallery";
import { AdminList } from "@/components/admin/admin-list";
import { selectClassName } from "@/components/admin/form-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/auth";
import { GALLERY_CATEGORIES } from "@/lib/config";
import { firstParam, listRows, parseListParams } from "@/lib/data/admin/lists";
import { formatTanggal } from "@/lib/dates";
import type { GalleryItem } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galeri" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const { q, status, page } = parseListParams(sp, ["draft", "published"]);
  const rawKategori = firstParam(sp.kategori) ?? "";
  const kategori = (GALLERY_CATEGORIES as readonly string[]).includes(rawKategori) ? rawKategori : "";
  const filters: { column: string; value: string }[] = [];
  if (status !== "semua") filters.push({ column: "status", value: status });
  if (kategori) filters.push({ column: "category", value: kategori });

  const result = await listRows<GalleryItem>("gallery_items", {
    q, searchColumns: ["title", "description"], page, filters,
  });
  return (
    <AdminList<GalleryItem>
      title="Galeri"
      basePath="/admin/galeri"
      createHref="/admin/galeri/baru"
      createLabel="Tambah Foto"
      result={result}
      q={q}
      status={status}
      page={page}
      extraParams={{ kategori: kategori || undefined }}
      extraFilters={
        <div className="grid gap-1.5">
          <Label htmlFor="filter-kategori">Kategori</Label>
          <select id="filter-kategori" name="kategori" defaultValue={kategori} className={selectClassName}>
            <option value="">Semua kategori</option>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      }
      columns={[
        {
          header: "Foto",
          cell: (r) => (
            // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
            <img src={r.image_url} alt={r.alt_text} loading="lazy" className="h-14 w-20 rounded-md border object-cover" />
          ),
        },
        { header: "Judul", cell: (r) => r.title },
        { header: "Kategori", cell: (r) => r.category },
        { header: "Tanggal", cell: (r) => (r.event_date ? formatTanggal(r.event_date) : "—") },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      getTitle={(r) => r.title}
      toggle={(r) => ({
        action: setGalleryItemStatus.bind(null, r.id, r.status === "published" ? "draft" : "published"),
        label: r.status === "published" ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deleteGalleryItem.bind(null, r.id)}
    />
  );
}
