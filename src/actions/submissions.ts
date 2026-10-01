"use server";

import { revalidatePath } from "next/cache";
import { adminClient, deleteRowById, NOT_FOUND, parseId, plain, SESSION_EXPIRED } from "@/lib/admin-action";
import { mapDbError, type ActionResult } from "@/lib/result";
import { optionalText } from "@/lib/validation/common";
import type { SubmissionStatus } from "@/types/db";

// Contribution moderation (design D17, simplified by S3): approve / reject with notes, and delete.
// No conversion to drafts. Nothing is ever published from here.

const notesSchema = optionalText(1000);

async function decideSubmission(
  fn: string,
  idRaw: unknown,
  notesRaw: unknown,
  status: Exclude<SubmissionStatus, "pending">,
): Promise<ActionResult> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  const id = parseId(idRaw);
  if (!id) return NOT_FOUND;
  const notes = notesSchema.safeParse(notesRaw ?? null);
  if (!notes.success) {
    const msg = "Catatan maksimal 1000 karakter.";
    return { ok: false, message: msg, fieldErrors: { admin_notes: [msg] } };
  }

  // Allowed from pending, or as a re-decision from the other decided state while not converted.
  const other: SubmissionStatus = status === "approved" ? "rejected" : "approved";
  const { data, error } = await sb
    .from("citizen_submissions")
    .update({ status, admin_notes: notes.data, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", other])
    .is("converted_id", null)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return mapDbError(fn, error);
  if (!data) {
    // Either the row is gone or it is already in the requested state.
    const { data: row, error: readError } = await sb
      .from("citizen_submissions")
      .select("id")
      .eq("id", id)
      .maybeSingle<{ id: string }>();
    if (readError) return mapDbError(fn, readError);
    if (!row) return NOT_FOUND;
    return { ok: false, message: status === "approved" ? "Kontribusi ini sudah disetujui." : "Kontribusi ini sudah ditolak." };
  }

  revalidatePath("/admin/kontribusi");
  revalidatePath(`/admin/kontribusi/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: status === "approved" ? "Kontribusi disetujui." : "Kontribusi ditolak." };
}

export async function approveSubmission(id: unknown, notes: unknown): Promise<ActionResult> {
  return decideSubmission("approveSubmission", id, notes, "approved");
}

export async function rejectSubmission(id: unknown, notes: unknown): Promise<ActionResult> {
  return decideSubmission("rejectSubmission", id, notes, "rejected");
}
export async function deleteSubmission(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteSubmission", "citizen_submissions", id, { select: "id, image_url" });
  if (res.ok) {
    // A stored photo path lives in the private `submissions` bucket; remove it best effort.
    const path = res.data?.image_url;
    if (typeof path === "string" && path) {
      try {
        const sb = await adminClient();
        const { error } = sb ? await sb.storage.from("submissions").remove([path]) : { error: null };
        if (error) console.warn("[storage] orphan object", path);
      } catch {
        console.warn("[storage] orphan object", path);
      }
    }
    revalidatePath("/admin/kontribusi");
    revalidatePath("/admin");
  }
  return plain(res, "Kontribusi berhasil dihapus.");
}
