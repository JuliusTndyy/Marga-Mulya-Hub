import type { Metadata } from "next";
import { deleteOfficial, setOfficialStatus } from "@/actions/officials";
import { AdminList } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { listRows, parseListParams } from "@/lib/data/admin/lists";
import type { Official } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Perangkat Desa" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OfficialsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q, status, page } = parseListParams(await searchParams, ["draft", "published"]);
  const result = await listRows<Official>("officials", {
    q, searchColumns: ["name", "position"], page,
    filters: status !== "semua" ? [{ column: "status", value: status }] : [],
    order: [{ column: "display_order", ascending: true }, { column: "name", ascending: true }],
  });
  return (
    <AdminList<Official>
      title="Perangkat Desa"
      basePath="/admin/perangkat"
      createHref="/admin/perangkat/baru"
      createLabel="Tambah Perangkat"
      result={result}
      q={q}
      status={status}
      page={page}
      columns={[
        { header: "Nama", cell: (r) => r.name },
        { header: "Jabatan", cell: (r) => r.position },
        { header: "Urutan", cell: (r) => r.display_order },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      getTitle={(r) => r.name}
      toggle={(r) => ({
        action: setOfficialStatus.bind(null, r.id, r.status === "published" ? "draft" : "published"),
        label: r.status === "published" ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deleteOfficial.bind(null, r.id)}
    />
  );
}
