import { z } from "zod";
import { SUBMISSION_CATEGORIES } from "@/lib/config";
import { optionalNumber, requiredText, stripControlChars, withCoordinatePair } from "./common";

// Public form schemas (design D17 table). Shared by React Hook Form (zodResolver) and the server action.

/** Required text with control characters stripped before the length checks. */
const cleanRequired = (min: number, max: number, msg: string) =>
  z.preprocess((v) => (typeof v === "string" ? stripControlChars(v) : v), requiredText(min, max, msg));
/** optionalText(max) with a custom max message ("" / missing → null). */
const cleanOptional = (max: number, msg: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? stripControlChars(v) : v),
    z.string().trim().max(max, msg).nullable().optional().transform((v) => (v ? v : null)),
  );

export const contactSchema = z.object({
  name: cleanRequired(2, 100, "Nama wajib diisi (2–100 karakter)."),
  contact: cleanRequired(5, 100, "Kontak wajib diisi (email atau nomor telepon)."),
  subject: cleanRequired(3, 150, "Subjek wajib diisi (3–150 karakter)."),
  message: cleanRequired(10, 2000, "Pesan wajib diisi (10–2000 karakter)."),
});
export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;

// Contribution text fields (defined now, used by the chunk 4 contribution form). No photo (S4).
export const contributionTextSchema = withCoordinatePair(
  z.object({
    submitter_name: cleanRequired(2, 100, "Nama wajib diisi (2–100 karakter)."),
    contact: cleanOptional(100, "Kontak maksimal 100 karakter."),
    category: z.enum(SUBMISSION_CATEGORIES, { error: "Pilih kategori." }),
    title: cleanRequired(5, 150, "Judul wajib diisi (5–150 karakter)."),
    description: cleanRequired(20, 3000, "Deskripsi wajib diisi (20–3000 karakter)."),
    location: cleanOptional(200, "Lokasi maksimal 200 karakter."),
    latitude: optionalNumber(-90, 90),
    longitude: optionalNumber(-180, 180),
  }),
);
export type ContributionTextInput = z.input<typeof contributionTextSchema>;
export type ContributionTextValues = z.output<typeof contributionTextSchema>;
