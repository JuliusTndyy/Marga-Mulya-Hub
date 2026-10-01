import type { Metadata } from "next";
import { GalleryForm } from "@/components/admin/forms/gallery-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Foto Galeri" };

export default async function NewGalleryItemPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Tambah Foto Galeri" backHref="/admin/galeri" />
      <GalleryForm />
    </>
  );
}
