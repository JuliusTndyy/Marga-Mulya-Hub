import { z } from "zod";
import {
  optionalEmail, optionalNumber, optionalText, optionalWhatsapp, requiredText, withCoordinatePair,
} from "@/lib/validation/common";
import { optionalMediaUrl, socialLinksSchema } from "@/lib/validation/media";

// site_settings (singleton id=1), design D8/D18.
export const settingsSchema = withCoordinatePair(
  z.object({
    village_name: requiredText(2, 120, "Nama desa wajib diisi (2–120 karakter)."),
    tagline: optionalText(200),
    short_description: optionalText(600),
    hero_title: optionalText(120),
    hero_description: optionalText(400),
    hero_image_url: optionalMediaUrl,
    address: optionalText(300),
    phone: optionalText(30),
    whatsapp: optionalWhatsapp,
    email: optionalEmail,
    service_hours: optionalText(300),
    latitude: optionalNumber(-90, 90),
    longitude: optionalNumber(-180, 180),
    social_links: socialLinksSchema,
  }),
);

export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsValues = z.output<typeof settingsSchema>;
