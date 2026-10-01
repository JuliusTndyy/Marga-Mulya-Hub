import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

/** Public URL prefix of the `media` bucket, or null when Supabase is unconfigured (design D10). */
export function mediaPublicPrefix(): string | null {
  const env = getPublicSupabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/media/` : null;
}

/** Object path inside `media` for a public URL, or null if the URL isn't a media URL. */
export function mediaPathFromUrl(url: string): string | null {
  const prefix = mediaPublicPrefix();
  if (!prefix || !url.startsWith(prefix)) return null;
  const path = url.slice(prefix.length).split(/[?#]/)[0] ?? "";
  return path === "" ? null : decodeURIComponent(path);
}

/** Best-effort removal of a media object. Failures are logged as warn and never thrown. */
export async function removeMediaObject(sb: SupabaseClient, url: string): Promise<void> {
  const path = mediaPathFromUrl(url);
  if (!path) return;
  try {
    const { error } = await sb.storage.from("media").remove([path]);
    if (error) console.warn("[storage] orphan object", path);
  } catch {
    console.warn("[storage] orphan object", path);
  }
}

/** Magic-byte sniffing for the allowed image types. */
export function sniffImageType(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  const at = (i: number) => bytes[i];
  if (bytes.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "jpg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => at(i) === b)) return "png";
  if (
    bytes.length >= 12 &&
    at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 &&
    at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50
  ) return "webp";
  return null;
}
