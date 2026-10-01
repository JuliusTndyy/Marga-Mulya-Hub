"use server";

import { revalidatePath } from "next/cache";
import { deleteRowById, NOT_FOUND, plain, saveRecord, updateRowById } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/result";
import { statusSchema } from "@/lib/validation/common";
import { officialSchema } from "@/lib/validation/official";

function revalidate() {
  revalidatePath("/profil");
  revalidatePath("/admin/perangkat");
}

export async function saveOfficial(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const res = await saveRecord({
    fn: "saveOfficial", table: "officials", schema: officialSchema, input, id, imageColumn: "photo_url",
  });
  if (!res.ok) return res;
  revalidate();
  return { ...res, message: "Perangkat desa berhasil disimpan." };
}

export async function setOfficialStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const s = statusSchema.safeParse(status);
  if (!s.success) return NOT_FOUND;
  const res = await updateRowById("setOfficialStatus", "officials", id, { status: s.data });
  if (res.ok) revalidate();
  return plain(res, s.data === "published" ? "Data diterbitkan." : "Data dijadikan draf.");
}

export async function deleteOfficial(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteOfficial", "officials", id, { imageColumn: "photo_url" });
  if (res.ok) revalidate();
  return plain(res, "Perangkat desa berhasil dihapus.");
}
