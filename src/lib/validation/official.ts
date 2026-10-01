import { z } from "zod";
import { requiredInt, requiredText, statusSchema } from "@/lib/validation/common";
import { optionalMediaUrl } from "@/lib/validation/media";

export const officialSchema = z.object({
  name: requiredText(2, 120, "Nama wajib diisi (2–120 karakter)."),
  position: requiredText(2, 120, "Jabatan wajib diisi (2–120 karakter)."),
  photo_url: optionalMediaUrl,
  display_order: requiredInt(-100000, 100000, "Urutan harus berupa bilangan bulat."),
  status: statusSchema,
});

export type OfficialInput = z.input<typeof officialSchema>;
export type OfficialValues = z.output<typeof officialSchema>;
