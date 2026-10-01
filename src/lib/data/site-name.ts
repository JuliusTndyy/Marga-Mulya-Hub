import { getSiteSettings } from "./settings";

/** The only village-identifying literal allowed in source: the product name (design D5). */
export const FALLBACK_SITE_NAME = "Marga Mulya Hub";

/** Village name from settings, or the product name when settings are unavailable. */
export async function getSiteName(): Promise<string> {
  const res = await getSiteSettings();
  return res.ok && res.data?.village_name ? res.data.village_name : FALLBACK_SITE_NAME;
}
