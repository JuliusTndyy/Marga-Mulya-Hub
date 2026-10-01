import type { Metadata } from "next";
import { PotentialForm } from "@/components/admin/forms/potential-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Potensi" };

export default async function NewPotentialPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Tambah Potensi" backHref="/admin/potensi" />
      <PotentialForm />
    </>
  );
}
