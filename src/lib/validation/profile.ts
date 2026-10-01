import { z } from "zod";
import { optionalText, requiredText, statusSchema } from "@/lib/validation/common";
import { optionalMediaUrl } from "@/lib/validation/media";

// village_profiles: plain-text long fields mirror the DB CHECKs (20 000).
export const profileSchema = z.object({
  village_name: requiredText(2, 120, "Nama desa wajib diisi (2–120 karakter)."),
  description: optionalText(20000),
  history: optionalText(20000),
  vision: optionalText(20000),
  mission: optionalText(20000),
  geography: optionalText(20000),
  facilities: optionalText(20000),
  hero_image_url: optionalMediaUrl,
  status: statusSchema,
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileValues = z.output<typeof profileSchema>;
