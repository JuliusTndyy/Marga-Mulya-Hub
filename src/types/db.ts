// Row interfaces for every table in database/migrations/0001_schema.sql (design D8).
// Postgres `numeric` arrives from PostgREST as a string: convert with Number() before use.
// `date` columns arrive as "YYYY-MM-DD", `time` as "HH:MM:SS", `timestamptz` as ISO strings.

import type { SOCIAL_PLATFORMS } from "@/lib/config";

export type PublishStatus = "draft" | "published";
export type PostType = "news" | "announcement" | "event" | "service";
export type ChartType = "bar" | "line" | "pie" | "donut" | "none";
export type MessageStatus = "unread" | "read" | "archived";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface SocialLink {
  platform: (typeof SOCIAL_PLATFORMS)[number];
  url: string;
}

interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface AdminUser extends Timestamps {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin";
}

export interface SiteSettings extends Timestamps {
  id: 1;
  village_name: string;
  tagline: string | null;
  short_description: string | null;
  hero_title: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  service_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  social_links: SocialLink[];
}

export interface VillageProfile extends Timestamps {
  id: string;
  village_name: string;
  description: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  geography: string | null;
  facilities: string | null;
  hero_image_url: string | null;
  status: PublishStatus;
}

export interface Official extends Timestamps {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
  status: PublishStatus;
}

export interface VillageStatistic extends Timestamps {
  id: string;
  category: string;
  indicator: string;
  value: number | string; // numeric(14,2)
  unit: string | null;
  year: number;
  chart_type: ChartType;
  display_order: number;
  is_published: boolean;
  source: string | null;
  is_sample: boolean;
  is_highlight: boolean;
}

export interface InformationPost extends Timestamps {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  type: PostType;
  cover_image_url: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  organizer: string | null;
  priority: 0 | 1 | 2;
  start_date: string | null;
  end_date: string | null;
  effective_start: string | null; // generated; infinite dates may parse as null
  effective_end: string | null; // generated
  status: PublishStatus;
  published_at: string | null;
  sort_date: string | null;
}

export interface Potential extends Timestamps {
  id: string;
  name: string;
  slug: string;
  category: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  owner_or_manager: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact: string | null;
  whatsapp: string | null;
  operating_hours: string | null;
  social_links: SocialLink[];
  is_featured: boolean;
  status: PublishStatus;
}

export interface GalleryItem extends Timestamps {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string;
  category: string;
  event_date: string | null;
  location: string | null;
  status: PublishStatus;
}

export interface ContactMessage extends Timestamps {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  status: MessageStatus;
}

export interface CitizenSubmission extends Timestamps {
  id: string;
  submitter_name: string;
  contact: string | null;
  category: string;
  title: string;
  description: string;
  image_url: string | null; // object path in the private "submissions" bucket
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  converted_type: "potential" | "news" | null;
  converted_id: string | null;
}
