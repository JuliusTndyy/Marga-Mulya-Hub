import { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/lib/config";
import { mediaPublicPrefix } from "@/lib/storage";

// Image URL rule (design D10): the URL must start with the media bucket's public prefix.
// When Supabase is unconfigured the prefix is null and any non-null URL is rejected.
const MEDIA_MSG = "Gambar harus diunggah melalui formulir ini.";
const isMediaUrl = (v: string) => {
  const prefix = mediaPublicPrefix();
  return prefix !== null && v.startsWith(prefix);
};

export const optionalMediaUrl = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isMediaUrl(v), MEDIA_MSG);

export const requiredMediaUrl = (msg: string) =>
  z
    .string({ error: msg })
    .trim()
    .min(1, msg)
    .refine(isMediaUrl, MEDIA_MSG);

// social_links element shape (design D8/D18): platform + https URL, at most 8 entries.
export const socialLinksSchema = z
  .array(
    z.object({
      platform: z.enum(SOCIAL_PLATFORMS, { error: "Pilih platform." }),
      url: z
        .string({ error: "URL wajib diisi." })
        .trim()
        .max(300, "URL maksimal 300 karakter.")
        .pipe(z.url({ error: "URL tidak valid." }))
        .refine((v) => v.startsWith("https://"), "URL harus diawali https://"),
    }),
  )
  .max(8, "Maksimal 8 tautan.")
  .optional()
  .transform((v) => v ?? []);
