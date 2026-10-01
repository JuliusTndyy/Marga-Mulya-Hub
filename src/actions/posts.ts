"use server";

import { revalidatePath } from "next/cache";
import {
  adminClient, deleteRowById, invalidForm, NOT_FOUND, parseId, plain, SESSION_EXPIRED, updateRowById,
} from "@/lib/admin-action";
import { POST_TYPES, RICH_TEXT_LIMITS } from "@/lib/config";
import { mapDbError, type ActionResult } from "@/lib/result";
import { sanitizeRichText } from "@/lib/sanitize";
import { ensureUniqueSlug, slugify } from "@/lib/slug";
import { removeMediaObject } from "@/lib/storage";
import { statusSchema } from "@/lib/validation/common";
import { postSchema } from "@/lib/validation/post";
import type { PostType } from "@/types/db";

const ADMIN_PATH: Record<PostType, string> = {
  news: "/admin/berita", announcement: "/admin/pengumuman", event: "/admin/agenda", service: "/admin/layanan",
};

function revalidatePublic(slug?: string | null, type?: PostType | null) {
  revalidatePath("/");
  revalidatePath("/informasi");
  if (slug) revalidatePath(`/informasi/${slug}`);
  if (type) revalidatePath(ADMIN_PATH[type]);
}

// One action for Berita / Pengumuman / Agenda / Layanan (design D18). published_at, sort_date and
// effective_* are DB-owned: the schema doesn't contain them and they are never written here.
export async function savePost(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  let rowId: string | undefined;
  if (id !== undefined && id !== null) {
    const p = parseId(id);
    if (!p) return NOT_FOUND;
    rowId = p;
  }
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return invalidForm(parsed.error);

  const prev = rowId
    ? (await sb.from("information_posts").select("cover_image_url, slug, type").eq("id", rowId)
        .maybeSingle<{ cover_image_url: string | null; slug: string; type: PostType }>()).data
    : null;
  if (rowId && !prev) return NOT_FOUND;
  // A row stays in its module: the type can't change on edit.
  if (prev && prev.type !== parsed.data.type) return NOT_FOUND;

  const content = parsed.data.content ? sanitizeRichText(parsed.data.content) || null : null;
  if (content && content.length > RICH_TEXT_LIMITS.storedChars) {
    return {
      ok: false,
      message: "Periksa kembali isian formulir.",
      fieldErrors: { content: ["Konten terlalu panjang setelah diformat. Persingkat teks."] },
    };
  }

  const base = slugify(parsed.data.slug ?? parsed.data.title);
  const write = async (slug: string) => {
    const values = { ...parsed.data, content, slug };
    return rowId
      ? sb.from("information_posts").update(values).eq("id", rowId).select("id").single<{ id: string }>()
      : sb.from("information_posts").insert(values).select("id").single<{ id: string }>();
  };

  let slug = await ensureUniqueSlug(sb, "information_posts", base, rowId);
  let { data, error } = await write(slug);
  if (error?.code === "23505") {
    slug = await ensureUniqueSlug(sb, "information_posts", base, rowId);
    ({ data, error } = await write(slug));
  }
  if (error || !data) return mapDbError("savePost", error ?? { code: "PGRST116" });

  if (prev?.cover_image_url && prev.cover_image_url !== parsed.data.cover_image_url) {
    await removeMediaObject(sb, prev.cover_image_url);
  }
  revalidatePublic(slug, parsed.data.type);
  if (prev?.slug && prev.slug !== slug) revalidatePath(`/informasi/${prev.slug}`);
  return { ok: true, message: `${POST_TYPES[parsed.data.type]} berhasil disimpan.`, data: { id: data.id } };
}

export async function setPostStatus(id: unknown, status: unknown): Promise<ActionResult> {
  const s = statusSchema.safeParse(status);
  if (!s.success) return NOT_FOUND;
  const res = await updateRowById("setPostStatus", "information_posts", id, { status: s.data }, "id, slug, type");
  if (res.ok) revalidatePublic(res.data?.slug as string | undefined, res.data?.type as PostType | undefined);
  return plain(res, s.data === "published" ? "Konten diterbitkan." : "Konten dijadikan draf.");
}

export async function deletePost(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deletePost", "information_posts", id, {
    imageColumn: "cover_image_url", select: "id, slug, type",
  });
  if (res.ok) revalidatePublic(res.data?.slug as string | undefined, res.data?.type as PostType | undefined);
  return plain(res, "Konten berhasil dihapus.");
}
