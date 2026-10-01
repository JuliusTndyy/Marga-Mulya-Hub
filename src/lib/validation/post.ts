import { z } from "zod";
import {
  optionalDate, optionalRichText, optionalSlug, optionalText, optionalTime, requiredDate, requiredText,
  statusSchema,
} from "@/lib/validation/common";
import { optionalMediaUrl } from "@/lib/validation/media";

export const POST_TYPE_VALUES = ["news", "announcement", "event", "service"] as const;
const EVENT_DATE_MSG = "Tanggal agenda wajib diisi.";
const eventDate = requiredDate(EVENT_DATE_MSG);

// information_posts, one schema for all four types (design D18). published_at, sort_date and
// effective_* are owned by the DB and are not part of the schema (unknown keys are stripped).
export const postSchema = z
  .object({
    type: z.enum(POST_TYPE_VALUES, { error: "Jenis informasi tidak valid." }),
    title: requiredText(3, 200, "Judul wajib diisi (3–200 karakter)."),
    slug: optionalSlug,
    excerpt: optionalText(400),
    content: optionalRichText,
    cover_image_url: optionalMediaUrl,
    event_date: optionalDate,
    event_time: optionalTime,
    location: optionalText(200),
    organizer: optionalText(150),
    priority: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? 0 : typeof v === "string" ? Number(v) : v),
      z.number({ error: "Prioritas tidak valid." }).int().min(0, "Prioritas tidak valid.").max(2, "Prioritas tidak valid."),
    ),
    start_date: optionalDate,
    end_date: optionalDate,
    status: statusSchema,
  })
  .superRefine((v, ctx) => {
    if (v.type === "announcement" && v.start_date && v.end_date && v.end_date < v.start_date) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "Tanggal selesai harus setelah tanggal mulai." });
    }
    if (v.type === "event" && !eventDate.safeParse(v.event_date).success) {
      ctx.addIssue({ code: "custom", path: ["event_date"], message: EVENT_DATE_MSG });
    }
  })
  .transform((v) => {
    const isAnnouncement = v.type === "announcement";
    const isEvent = v.type === "event";
    return {
      ...v,
      // Fields that don't apply to the type are sent as null (priority has a NOT NULL default of 0).
      priority: isAnnouncement ? v.priority : 0,
      start_date: isAnnouncement ? v.start_date : null,
      end_date: isAnnouncement ? v.end_date : null,
      event_date: isEvent ? v.event_date : null,
      event_time: isEvent ? v.event_time : null,
      location: isEvent ? v.location : null,
      organizer: isEvent ? v.organizer : null,
    };
  });

export type PostInput = z.input<typeof postSchema>;
export type PostValues = z.output<typeof postSchema>;
