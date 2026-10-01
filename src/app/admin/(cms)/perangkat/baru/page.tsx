import type { Metadata } from "next";
import { OfficialForm } from "@/components/admin/forms/official-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Perangkat Desa" };

export default async function NewOfficialPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Tambah Perangkat Desa" backHref="/admin/perangkat" />
      <OfficialForm />
    </>
  );
}
