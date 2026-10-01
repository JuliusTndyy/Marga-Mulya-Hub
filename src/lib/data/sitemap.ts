import { publicRead } from "./query";

export interface SlugEntry {
  slug: string;
  updated_at: string;
}

const SITEMAP_LIMIT = 5000;

/** Published potential slugs for the sitemap (design D21). */
export function getPotentialSlugs() {
  return publicRead(
    "getPotentialSlugs",
    (sb) =>
      sb
        .from("potentials")
        .select("slug,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(SITEMAP_LIMIT)
        .overrideTypes<SlugEntry[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Published post slugs for the sitemap (design D21). */
export function getPostSlugs() {
  return publicRead(
    "getPostSlugs",
    (sb) =>
      sb
        .from("information_posts")
        .select("slug,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(SITEMAP_LIMIT)
        .overrideTypes<SlugEntry[], { merge: false }>(),
    (data) => data ?? [],
  );
}
