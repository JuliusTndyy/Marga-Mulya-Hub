import type { Metadata } from "next";
import { deleteStatistic, setStatisticPublished } from "@/actions/statistics";
import { AdminList } from "@/components/admin/admin-list";
import { selectClassName } from "@/components/admin/form-field";
import { PublishedBadge, StatusBadge } from "@/components/admin/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/auth";
import { firstParam, listRows, parseListParams } from "@/lib/data/admin/lists";
import { getDistinctValues } from "@/lib/data/admin/records";
import { CHART_TYPE_OPTIONS } from "@/lib/validation/statistic";
import type { VillageStatistic } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Data Desa" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CHART_LABEL = Object.fromEntries(CHART_TYPE_OPTIONS.map((o) => [o.value, o.label]));

export default async function StatisticsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const { q, status, page } = parseListParams(sp, ["draft", "published"]);
  const kategori = (firstParam(sp.kategori) ?? "").slice(0, 80);
  const tahunRaw = Number(firstParam(sp.tahun));
  const tahun = Number.isInteger(tahunRaw) && tahunRaw >= 1900 && tahunRaw <= 2100 ? tahunRaw : null;

  const filters: { column: string; value: string | number | boolean }[] = [];
  if (status !== "semua") filters.push({ column: "is_published", value: status === "published" });
  if (kategori) filters.push({ column: "category", value: kategori });
  if (tahun) filters.push({ column: "year", value: tahun });

  const [result, categories] = await Promise.all([
    listRows<VillageStatistic>("village_statistics", {
      q, searchColumns: ["indicator", "category"], page, filters,
      order: [{ column: "category", ascending: true }, { column: "display_order", ascending: true }, { column: "year", ascending: false }],
    }),
    getDistinctValues("village_statistics", "category"),
  ]);

  return (
    <AdminList<VillageStatistic>
      title="Data Desa"
      basePath="/admin/data-desa"
      createHref="/admin/data-desa/baru"
      createLabel="Tambah Data"
      description="Setiap baris adalah satu indikator untuk satu tahun. Data yang terbit tampil di halaman Data Desa."
      result={result}
      q={q}
      status={status}
      page={page}
      extraParams={{ kategori: kategori || undefined, tahun: tahun ? String(tahun) : undefined }}
      extraFilters={
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-kategori">Kategori</Label>
            <select id="filter-kategori" name="kategori" defaultValue={kategori} className={selectClassName}>
              <option value="">Semua kategori</option>
              {(categories.ok ? categories.data : []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid w-32 gap-1.5">
            <Label htmlFor="filter-tahun">Tahun</Label>
            <Input id="filter-tahun" name="tahun" type="number" min={1900} max={2100} defaultValue={tahun ?? ""} className="h-11" />
          </div>
        </>
      }
      columns={[
        { header: "Kategori", cell: (r) => r.category },
        { header: "Indikator", cell: (r) => r.indicator },
        {
          header: "Nilai",
          cell: (r) => `${new Intl.NumberFormat("id-ID").format(Number(r.value))}${r.unit ? ` ${r.unit}` : ""}`,
        },
        { header: "Tahun", cell: (r) => r.year },
        { header: "Grafik", cell: (r) => CHART_LABEL[r.chart_type] ?? r.chart_type },
        {
          header: "Status",
          cell: (r) => (
            <div className="flex flex-wrap gap-1">
              <PublishedBadge published={r.is_published} />
              {r.is_sample ? <StatusBadge status="sample" /> : null}
            </div>
          ),
        },
      ]}
      getTitle={(r) => `${r.category} – ${r.indicator} (${r.year})`}
      toggle={(r) => ({
        action: setStatisticPublished.bind(null, r.id, !r.is_published),
        label: r.is_published ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deleteStatistic.bind(null, r.id)}
    />
  );
}
