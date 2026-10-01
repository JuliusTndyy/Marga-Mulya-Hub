import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteSubmission } from "@/actions/submissions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { formatTanggalWaktu } from "@/lib/dates";
import { idSchema } from "@/lib/validation/common";
import type { CitizenSubmission } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Detail Kontribusi" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const LIST = "/admin/kontribusi";

// Detail with every field, including the private contact (admin only), plus approve/reject (S3).
// No photo section (scope simplification S4: contributions are text only).
export default async function SubmissionDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<CitizenSubmission>("citizen_submissions", id);
  if (res.ok && !res.data) notFound();
  if (!res.ok) {
    return (
      <>
        <AdminPageHeader title="Detail Kontribusi" backHref={LIST} />
        <AdminNotice reason={res.reason} />
      </>
    );
  }
  const s = res.data!;
  const rows: [string, string][] = [
    ["Pengirim", s.submitter_name],
    ["Kontak (privat)", s.contact ?? "—"],
    ["Kategori", s.category],
    ["Lokasi", s.location ?? "—"],
    ["Koordinat", s.latitude !== null && s.longitude !== null ? `${s.latitude}, ${s.longitude}` : "—"],
    ["Dikirim", `${formatTanggalWaktu(s.created_at)} WIB`],
    ["Ditinjau", s.reviewed_at ? `${formatTanggalWaktu(s.reviewed_at)} WIB` : "—"],
    ["Catatan admin", s.admin_notes ?? "—"],
  ];
  return (
    <>
      <AdminPageHeader title={s.title} backHref={LIST}>
        <StatusBadge status={s.status} />
      </AdminPageHeader>
      <article className="grid max-w-3xl gap-5 rounded-xl border bg-card p-5">
        <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-medium">{label}</dt>
              <dd className="break-words whitespace-pre-line">{value}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h2 className="mb-2 font-heading text-lg font-semibold">Deskripsi</h2>
          <p className="break-words whitespace-pre-line">{s.description}</p>
        </div>
        {s.converted_id === null ? <SubmissionActions id={s.id} status={s.status} notes={s.admin_notes} /> : null}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <DeleteDialog title={s.title} action={deleteSubmission.bind(null, s.id)} redirectTo={LIST} />
        </div>
      </article>
    </>
  );
}
