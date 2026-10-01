import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/forms/profile-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Profil Desa" };

export default async function NewProfilePage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Tambah Profil Desa" backHref="/admin/profil" />
      <ProfileForm />
    </>
  );
}
