import type { Official, VillageProfile } from "@/types/db";
import { publicRead } from "./query";

/** The published village profile with the latest `updated_at` (design D14). */
export function getPublishedProfile() {
  return publicRead(
    "getPublishedProfile",
    (sb) =>
      sb
        .from("village_profiles")
        .select("*")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(1)
        .overrideTypes<VillageProfile[], { merge: false }>(),
    (data) => data?.[0] ?? null,
  );
}

export type PublicOfficial = Pick<Official, "id" | "name" | "position" | "photo_url">;

/** Published officials ordered by display_order, name. */
export function getPublishedOfficials() {
  return publicRead(
    "getPublishedOfficials",
    (sb) =>
      sb
        .from("officials")
        .select("id,name,position,photo_url")
        .eq("status", "published")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })
        .overrideTypes<PublicOfficial[], { merge: false }>(),
    (data) => data ?? [],
  );
}
