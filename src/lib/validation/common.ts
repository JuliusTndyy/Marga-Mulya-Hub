import { z } from "zod";
import { RICH_TEXT_LIMITS } from "@/lib/config";

// Indonesian default messages for checks that don't pass their own message (e.g. optionalText max).
z.config(z.locales.id());

// Shared Zod helpers (design D17). Every optional column receives `null`, never "".

// `error: msg` also covers a missing key (undefined), since public FormData omits empty fields (D17 contract)
export const requiredText = (min: number, max: number, msg: string) =>
  z.string({ error: msg }).trim().min(min, msg).max(max, msg);
export const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v)).nullable().optional()
   .transform((v) => v ?? null);
export const optionalNumber = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined || (typeof v === "number" && Number.isNaN(v)) ? null : Number(v)),
    z.number().min(min).max(max).nullable());
export const optionalWhatsapp = z.string().trim()
  .transform((v) => v.replace(/[^\d+]/g, "").replace(/^\+?62/, "62").replace(/^0/, "62"))
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^62\d{8,13}$/.test(v), "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx).")
  .nullable().optional().transform((v) => v ?? null);
// z.iso.date() checks the calendar (rejects 2025-02-31); verified with zod 4.6.5
export const optionalDate = z.union([z.literal(""), z.iso.date({ error: "Tanggal tidak valid." })])
  .nullable().optional().transform((v) => (v ? v : null));
export const requiredDate = (msg: string) => z.iso.date({ error: msg });
// minute precision only: accepts 08:00, rejects 25:99 and 08:00:00 (edit forms slice DB "HH:MM:SS" to 5 chars)
export const optionalTime = z.union([z.literal(""), z.iso.time({ precision: -1, error: "Jam tidak valid (contoh: 08:00)." })])
  .nullable().optional().transform((v) => (v ? v : null));
// optional slug: admin may type one; actions always pass it through slugify() (D18)
export const optionalSlug = optionalText(100);
// rich text input cap, checked before sanitizing; the action re-checks the sanitized length (D18)
export const optionalRichText = z.string()
  .max(RICH_TEXT_LIMITS.inputChars, "Konten maksimal 50.000 karakter.")
  .nullable().optional().transform((v) => (v && v.trim() !== "" ? v : null));
export const idSchema = z.string().uuid();
type Coords = { latitude: number | null; longitude: number | null };
// verified to compile under TS 5.9.3 strict + zod 4.6.5
export const withCoordinatePair = <T extends z.ZodType<Coords>>(s: T) =>
  s.refine((v) => (v.latitude === null) === (v.longitude === null),
    { message: "Isi lintang dan bujur bersamaan.", path: ["latitude"] });
export const stripControlChars = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

// --- admin schema helpers (chunk 2) ---
export const statusSchema = z.enum(["draft", "published"], { error: "Status tidak valid." });
/** Required integer from a form input (string) or number; "" / missing → msg. */
export const requiredInt = (min: number, max: number, msg: string) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : typeof v === "string" ? Number(v) : v),
    z.number({ error: msg }).int(msg).min(min, msg).max(max, msg));
export const optionalEmail = optionalText(254).refine(
  (v) => v === null || z.email().safeParse(v).success, "Format email tidak valid.");
