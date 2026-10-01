import { z } from "zod";
import { POTENTIAL_CATEGORIES } from "@/lib/config";
import {
  optionalNumber, optionalRichText, optionalSlug, optionalText, optionalWhatsapp, requiredText,
  statusSchema, withCoordinatePair,
} from "@/lib/validation/common";
import { optionalMediaUrl, socialLinksSchema } from "@/lib/validation/media";

// potentials, design D8/D18. The action slugifies and sanitizes; this schema caps the input.
export const potentialSchema = withCoordinatePair(
  z.object({
    name: requiredText(2, 150, "Nama wajib diisi (2–150 karakter)."),
    slug: optionalSlug,
    category: z.enum(POTENTIAL_CATEGORIES, { error: "Pilih kategori." }),
    summary: optionalText(300),
    description: optionalRichText,
    image_url: optionalMediaUrl,
    owner_or_manager: optionalText(150),
    address: optionalText(300),
    latitude: optionalNumber(-90, 90),
    longitude: optionalNumber(-180, 180),
    contact: optionalText(100),
    whatsapp: optionalWhatsapp,
    operating_hours: optionalText(200),
    social_links: socialLinksSchema,
    is_featured: z.boolean(),
    status: statusSchema,
  }),
);

export type PotentialInput = z.input<typeof potentialSchema>;
export type PotentialValues = z.output<typeof potentialSchema>;
