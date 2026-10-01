import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { OfficialForm } from "@/components/admin/forms/official-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { idSchema } from "@/lib/validation/common";
import type { Official } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Perangkat Desa" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfficialPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<Official>("officials", id);
  if (res.ok && !res.data) notFound();
  return (
    <>
      <AdminPageHeader title="Edit Perangkat Desa" backHref="/admin/perangkat">
        {res.ok && res.data ? <StatusBadge status={res.data.status} /> : null}
      </AdminPageHeader>
      {res.ok && res.data ? <OfficialForm key={res.data.updated_at} initial={res.data} /> : !res.ok ? <AdminNotice reason={res.reason} /> : null}
    </>
  );
}
