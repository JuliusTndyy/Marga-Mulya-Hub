import { cache } from "react";
import type { Potential } from "@/types/db";
import type { DataResult } from "@/lib/result";
import { publicRead } from "./query";

export type PotentialCardRow = Pick<
  Potential,
  "id" | "name" | "slug" | "category" | "summary" | "image_url" | "address" | "latitude" | "longitude" | "is_featured"
>;
export type PotentialMarkerRow = Pick<Potential, "id" | "name" | "slug" | "category" | "latitude" | "longitude">;

const CARD_COLUMNS = "id,name,slug,category,summary,image_url,address,latitude,longitude,is_featured";

/** All published potentials (limit 500), ordered is_featured desc, name (design D14 /potensi). */
export function getPublishedPotentials() {
  return publicRead(
    "getPublishedPotentials",
    (sb) =>
      sb
        .from("potentials")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true })
        .limit(500)
        .overrideTypes<PotentialCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Homepage: up to 3 featured potentials; if none are featured, the 3 newest published. */
export async function getFeaturedPotentials(): Promise<DataResult<PotentialCardRow[]>> {
  const featured = await publicRead(
    "getFeaturedPotentials",
    (sb) =>
      sb
        .from("potentials")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(3)
        .overrideTypes<PotentialCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
  if (!featured.ok || featured.data.length > 0) return featured;
  return publicRead(
    "getFeaturedPotentials:newest",
    (sb) =>
      sb
        .from("potentials")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3)
        .overrideTypes<PotentialCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Published potentials with coordinates (max 50) for map previews / location lists. */
export function getPotentialMarkers() {
  return publicRead(
    "getPotentialMarkers",
    (sb) =>
      sb
        .from("potentials")
        .select("id,name,slug,category,latitude,longitude")
        .eq("status", "published")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("name", { ascending: true })
        .limit(50)
        .overrideTypes<PotentialMarkerRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** One published potential by slug; `data: null` when missing or draft. Cached per request. */
export const getPublishedPotentialBySlug = cache((slug: string) =>
  publicRead(
    "getPublishedPotentialBySlug",
    (sb) =>
      sb
        .from("potentials")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle<Potential>(),
    (data) => data ?? null,
  ),
);
