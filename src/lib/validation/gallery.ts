import { z } from "zod";
import { GALLERY_CATEGORIES } from "@/lib/config";
import { optionalDate, optionalText, requiredText, statusSchema } from "@/lib/validation/common";
import { requiredMediaUrl } from "@/lib/validation/media";

export const gallerySchema = z.object({
  title: requiredText(2, 150, "Judul wajib diisi (2–150 karakter)."),
  description: optionalText(1000),
  image_url: requiredMediaUrl("Gambar wajib diunggah."),
  alt_text: requiredText(5, 200, "Teks alternatif wajib diisi (5–200 karakter)."),
  category: z.enum(GALLERY_CATEGORIES, { error: "Pilih kategori." }),
  event_date: optionalDate,
  location: optionalText(200),
  status: statusSchema,
});

export type GalleryInput = z.input<typeof gallerySchema>;
export type GalleryValues = z.output<typeof gallerySchema>;
