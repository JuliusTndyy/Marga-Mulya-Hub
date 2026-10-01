"use server";

import { revalidatePath } from "next/cache";
import {
  adminClient, deleteRowById, invalidForm, NOT_FOUND, parseId, plain, SESSION_EXPIRED, updateRowById,
} from "@/lib/admin-action";
import { RICH_TEXT_LIMITS } from "@/lib/config";
import { mapDbError, type ActionResult } from "@/lib/result";
import { sanitizeRichText } from "@/lib/sanitize";
import { ensureUniqueSlug, slugify } from "@/lib/slug";
import { removeMediaObject } from "@/lib/storage";
import { statusSchema } from "@/lib/validation/common";
import { potentialSchema } from "@/lib/validation/potential";

function revalidatePublic(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/potensi");
  if (slug) revalidatePath(`/potensi/${slug}`);
  revalidatePath("/admin/potensi");
}

// D18 server action template.
export async function savePotential(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  let rowId: string | undefined;
  if (id !== undefined && id !== null) {
    const p = parseId(id);
    if (!p) return NOT_FOUND;
    rowId = p;
  }
  const parsed = potentialSchema.safeParse(input);
  if (!parsed.success) return invalidForm(parsed.error);

  const prev = rowId
    ? (await sb.from("potentials").select("image_url, slug").eq("id", rowId).maybeSingle<{ image_url: string | null; slug: string }>()).data
    : null;
  if (rowId && !prev) return NOT_FOUND;

  const description = parsed.data.description ? sanitizeRichText(parsed.data.description) || null : null;
  if (description && description.length > RICH_TEXT_LIMITS.storedChars) {
    return {
      ok: false,
      message: "Periksa kembali isian formulir.",
      fieldErrors: { description: ["Konten terlalu panjang setelah diformat. Persingkat teks."] },
    };
  }

  // A typed slug is always normalized ("Kopi Gunung" → "kopi-gunung"); blank → derived from the name.
  const base = slugify(parsed.data.slug ?? parsed.data.name);
  const write = async (slug: string) => {
    const values = { ...parsed.data, description, slug };
    return rowId
      ? sb.from("potentials").update(values).eq("id", rowId).select("id").single<{ id: string }>()
      : sb.from("potentials").insert(values).select("id").single<{ id: string }>();
  };

  let slug = await ensureUniqueSlug(sb, "potentials", base, rowId);
  let { data, error } = await write(slug);
  if (error?.code === "23505") {
    // Lost a race for the slug: retry once with a fresh suffix, then report the field error.
    slug = await ensureUniqueSlug(sb, "potentials", base, rowId);
    ({ data, error } = await write(slug));
  }
  if (error || !data) return mapDbError("savePotential", error ?? { code: "PGRST116" });

  if (prev?.image_url && prev.image_url !== parsed.data.image_url) await removeMediaObject(sb, prev.image_url);
  revalidatePublic(slug);
  if (prev?.slug && prev.slug !== slug) revalidatePath(`/potensi/${prev.slug}`);
  return { ok: true, message: "Potensi berhasil disimpan.", data: { id: data.id } };
}

export async function setPotentialStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const s = statusSchema.safeParse(status);
  if (!s.success) return NOT_FOUND;
  const res = await updateRowById("setPotentialStatus", "potentials", id, { status: s.data }, "id, slug");
  if (res.ok) revalidatePublic(typeof res.data?.slug === "string" ? res.data.slug : null);
  return plain(res, s.data === "published" ? "Potensi diterbitkan." : "Potensi dijadikan draf.");
}

export async function deletePotential(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deletePotential", "potentials", id, { imageColumn: "image_url", select: "id, slug" });
  if (res.ok) revalidatePublic(typeof res.data?.slug === "string" ? res.data.slug : null);
  return plain(res, "Potensi berhasil dihapus.");
}
