"use server";

import { revalidatePath } from "next/cache";
import { deleteRowById, NOT_FOUND, plain, saveRecord, updateRowById } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/result";
import { statusSchema } from "@/lib/validation/common";
import { gallerySchema } from "@/lib/validation/gallery";

function revalidate() {
  revalidatePath("/galeri");
  revalidatePath("/profil");
  revalidatePath("/admin/galeri");
}

export async function saveGalleryItem(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const res = await saveRecord({
    fn: "saveGalleryItem", table: "gallery_items", schema: gallerySchema, input, id, imageColumn: "image_url",
  });
  if (!res.ok) return res;
  revalidate();
  return { ...res, message: "Foto galeri berhasil disimpan." };
}

export async function setGalleryItemStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const s = statusSchema.safeParse(status);
  if (!s.success) return NOT_FOUND;
  const res = await updateRowById("setGalleryItemStatus", "gallery_items", id, { status: s.data });
  if (res.ok) revalidate();
  return plain(res, s.data === "published" ? "Foto diterbitkan." : "Foto dijadikan draf.");
}

export async function deleteGalleryItem(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteGalleryItem", "gallery_items", id, { imageColumn: "image_url" });
  if (res.ok) revalidate();
  return plain(res, "Foto galeri berhasil dihapus.");
}
