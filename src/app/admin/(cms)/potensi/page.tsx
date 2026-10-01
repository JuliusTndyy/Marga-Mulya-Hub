import type { Metadata } from "next";
import { deletePotential, setPotentialStatus } from "@/actions/potentials";
import { AdminList } from "@/components/admin/admin-list";
import { selectClassName } from "@/components/admin/form-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/auth";
import { POTENTIAL_CATEGORIES } from "@/lib/config";
import { firstParam, listRows, parseListParams } from "@/lib/data/admin/lists";
import type { Potential } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Potensi" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PotentialsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const { q, status, page } = parseListParams(sp, ["draft", "published"]);
  const rawKategori = firstParam(sp.kategori) ?? "";
  const kategori = (POTENTIAL_CATEGORIES as readonly string[]).includes(rawKategori) ? rawKategori : "";
  const filters: { column: string; value: string }[] = [];
  if (status !== "semua") filters.push({ column: "status", value: status });
  if (kategori) filters.push({ column: "category", value: kategori });

  const result = await listRows<Potential>("potentials", {
    q, searchColumns: ["name", "summary"], page, filters,
    columns: "id, name, slug, category, is_featured, status, created_at, updated_at",
  });
  return (
    <AdminList<Potential>
      title="Potensi"
      basePath="/admin/potensi"
      createHref="/admin/potensi/baru"
      createLabel="Tambah Potensi"
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
            {POTENTIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      }
      columns={[
        { header: "Nama", cell: (r) => r.name },
        { header: "Kategori", cell: (r) => r.category },
        {
          header: "Status",
          cell: (r) => (
            <div className="flex flex-wrap gap-1">
              <StatusBadge status={r.status} />
              {r.is_featured ? <StatusBadge status="featured" /> : null}
            </div>
          ),
        },
      ]}
      getTitle={(r) => r.name}
      toggle={(r) => ({
        action: setPotentialStatus.bind(null, r.id, r.status === "published" ? "draft" : "published"),
        label: r.status === "published" ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deletePotential.bind(null, r.id)}
    />
  );
}
