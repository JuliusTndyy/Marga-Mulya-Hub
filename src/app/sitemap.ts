import type { MetadataRoute } from "next";
import { getPostSlugs, getPotentialSlugs } from "@/lib/data/sitemap";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = ["/", "/profil", "/data-desa", "/potensi", "/informasi", "/galeri", "/kontak"] as const;

// Design D21: the static public routes plus published potential and post slugs (public client).
// Unconfigured or on error → static routes only. `/potensi/[slug]` and `/informasi/[slug]` appear
// through their published slugs.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const [potentials, posts] = await Promise.all([getPotentialSlugs(), getPostSlugs()]);
  if (potentials.ok) {
    for (const p of potentials.data) {
      entries.push({ url: `${base}/potensi/${encodeURIComponent(p.slug)}`, lastModified: p.updated_at });
    }
  }
  if (posts.ok) {
    for (const p of posts.data) {
      entries.push({ url: `${base}/informasi/${encodeURIComponent(p.slug)}`, lastModified: p.updated_at });
    }
  }
  return entries;
}
