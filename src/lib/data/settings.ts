import { cache } from "react";
import type { SiteSettings } from "@/types/db";
import { publicRead } from "./query";

/** The site_settings singleton (id = 1). `data: null` when the seed hasn't run yet. Cached per request. */
export const getSiteSettings = cache(() =>
  publicRead(
    "getSiteSettings",
    (sb) => sb.from("site_settings").select("*").eq("id", 1).maybeSingle<SiteSettings>(),
    (data) => data ?? null,
  ),
);
