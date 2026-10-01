import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProfileForm } from "@/components/admin/forms/profile-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { idSchema } from "@/lib/validation/common";
import type { VillageProfile } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Profil Desa" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<VillageProfile>("village_profiles", id);
  if (res.ok && !res.data) notFound();
  return (
    <>
      <AdminPageHeader title="Edit Profil Desa" backHref="/admin/profil">
        {res.ok && res.data ? <StatusBadge status={res.data.status} /> : null}
      </AdminPageHeader>
      {res.ok && res.data ? <ProfileForm key={res.data.updated_at} initial={res.data} /> : !res.ok ? <AdminNotice reason={res.reason} /> : null}
    </>
  );
}
