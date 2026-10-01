import type { Metadata } from "next";
import { deleteSubmission } from "@/actions/submissions";
import { AdminList } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { listRows, parseListParams } from "@/lib/data/admin/lists";
import type { CitizenSubmission } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kontribusi Warga" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "semua", label: "Semua status" },
];

export default async function SubmissionsPage({ searchParams }: PageProps) {
  await requireAdmin();
  // Default filter: pending (design D17).
  const { q, status, page } = parseListParams(await searchParams, ["pending", "approved", "rejected"], "pending");
  const result = await listRows<CitizenSubmission>("citizen_submissions", {
    q, searchColumns: ["title", "submitter_name"], page,
    filters: status !== "semua" ? [{ column: "status", value: status }] : [],
    order: [{ column: "created_at", ascending: false }],
    columns: "id, title, submitter_name, category, status, created_at, updated_at",
  });
  return (
    <AdminList<CitizenSubmission>
      title="Kontribusi Warga"
      basePath="/admin/kontribusi"
      description="Kiriman warga tidak pernah terbit otomatis. Tinjau setiap kiriman sebelum dipakai sebagai konten."
      result={result}
      q={q}
      status={status}
      page={page}
      statusOptions={STATUS_OPTIONS}
      editLabel="Lihat"
      emptyText="Belum ada kontribusi."
      columns={[
        { header: "Judul", cell: (r) => r.title },
        { header: "Pengirim", cell: (r) => r.submitter_name },
        { header: "Kategori", cell: (r) => r.category },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      getTitle={(r) => r.title}
      deleteAction={(r) => deleteSubmission.bind(null, r.id)}
    />
  );
}
