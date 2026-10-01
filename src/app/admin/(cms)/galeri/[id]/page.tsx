import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { GalleryForm } from "@/components/admin/forms/gallery-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { idSchema } from "@/lib/validation/common";
import type { GalleryItem } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Foto Galeri" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryItemPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<GalleryItem>("gallery_items", id);
  if (res.ok && !res.data) notFound();
  return (
    <>
      <AdminPageHeader title="Edit Foto Galeri" backHref="/admin/galeri">
        {res.ok && res.data ? <StatusBadge status={res.data.status} /> : null}
      </AdminPageHeader>
      {res.ok && res.data ? <GalleryForm key={res.data.updated_at} initial={res.data} /> : !res.ok ? <AdminNotice reason={res.reason} /> : null}
    </>
  );
}
