import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteMessage } from "@/actions/messages";
import { AdminNotice } from "@/components/admin/admin-notice";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { formatTanggalWaktu } from "@/lib/dates";
import { idSchema } from "@/lib/validation/common";
import type { ContactMessage } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Detail Pesan" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const LIST = "/admin/pesan";

// Read-only detail + delete (scope simplification S11).
export default async function MessageDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<ContactMessage>("contact_messages", id);
  if (res.ok && !res.data) notFound();
  if (!res.ok) {
    return (
      <>
        <AdminPageHeader title="Detail Pesan" backHref={LIST} />
        <AdminNotice reason={res.reason} />
      </>
    );
  }
  const m = res.data!;
  return (
    <>
      <AdminPageHeader title={m.subject} backHref={LIST} />
      <article className="grid max-w-3xl gap-5 rounded-xl border bg-card p-5">
        <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <dt className="font-medium">Nama</dt>
          <dd className="break-words">{m.name}</dd>
          <dt className="font-medium">Kontak</dt>
          <dd className="break-words">{m.contact}</dd>
          <dt className="font-medium">Diterima</dt>
          <dd>{formatTanggalWaktu(m.created_at)} WIB</dd>
        </dl>
        <div>
          <h2 className="mb-2 font-heading text-lg font-semibold">Pesan</h2>
          <p className="break-words whitespace-pre-line">{m.message}</p>
        </div>
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <DeleteDialog title={m.subject} action={deleteMessage.bind(null, m.id)} redirectTo={LIST} />
        </div>
      </article>
    </>
  );
}
