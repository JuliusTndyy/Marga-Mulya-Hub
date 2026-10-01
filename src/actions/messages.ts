"use server";

import { revalidatePath } from "next/cache";
import { deleteRowById, plain } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/result";

// Scope simplification S11: Pesan Kontak is list + read-only detail + delete. The DB `status`
// column is left as is and isn't used by the UI.
export async function deleteMessage(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteMessage", "contact_messages", id);
  if (res.ok) {
    revalidatePath("/admin/pesan");
    revalidatePath("/admin");
  }
  return plain(res, "Pesan berhasil dihapus.");
}
