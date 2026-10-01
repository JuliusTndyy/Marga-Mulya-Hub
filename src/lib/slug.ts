import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_SLUG = 80;

/**
 * NFKD-normalize, strip combining marks, lowercase, collapse non-[a-z0-9] runs to "-",
 * trim dashes, cut to 80 chars at a dash boundary. Empty → "konten". Idempotent on valid slugs.
 */
export function slugify(text: string): string {
  let s = text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > MAX_SLUG) {
    let cut = s.slice(0, MAX_SLUG);
    if (s[MAX_SLUG] !== "-" && cut.includes("-")) cut = cut.slice(0, cut.lastIndexOf("-"));
    s = cut.replace(/^-+|-+$/g, "");
  }
  return s === "" ? "konten" : s;
}

export type SluggedTable = "potentials" | "information_posts";

/**
 * Returns `base`, or `base-2`, `base-3`, … when taken (ignoring the row `excludeId`).
 * The DB unique index stays the authority: actions retry once on 23505 (design D15/D18).
 */
export async function ensureUniqueSlug(
  sb: SupabaseClient,
  table: SluggedTable,
  base: string,
  excludeId?: string,
): Promise<string> {
  const { data, error } = await sb.from(table).select("id, slug").like("slug", `${base}%`);
  if (error || !data) {
    if (error) console.warn("[slug] lookup failed", error.code);
    return base;
  }
  const taken = new Set(
    (data as { id: string; slug: string }[]).filter((r) => r.id !== excludeId).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
