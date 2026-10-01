"use server";

import { revalidatePath } from "next/cache";
import { deleteRowById, NOT_FOUND, plain, saveRecord, updateRowById } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/result";
import { statusSchema } from "@/lib/validation/common";
import { profileSchema } from "@/lib/validation/profile";

function revalidate() {
  revalidatePath("/profil");
  revalidatePath("/admin/profil");
}

export async function saveProfile(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const res = await saveRecord({
    fn: "saveProfile", table: "village_profiles", schema: profileSchema, input, id, imageColumn: "hero_image_url",
  });
  if (!res.ok) return res;
  revalidate();
  return { ...res, message: "Profil desa berhasil disimpan." };
}

export async function setProfileStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const s = statusSchema.safeParse(status);
  if (!s.success) return NOT_FOUND;
  const res = await updateRowById("setProfileStatus", "village_profiles", id, { status: s.data });
  if (res.ok) revalidate();
  return plain(res, s.data === "published" ? "Profil diterbitkan." : "Profil dijadikan draf.");
}

export async function deleteProfile(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteProfile", "village_profiles", id, { imageColumn: "hero_image_url" });
  if (res.ok) revalidate();
  return plain(res, "Profil berhasil dihapus.");
}
