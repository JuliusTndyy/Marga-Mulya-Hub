import { cache } from "react";
import { PAGE_SIZE } from "@/lib/config";
import { todayInSiteTz } from "@/lib/dates";
import { normalizeSearchTerm } from "@/lib/search-term";
import type { InformationPost, PostType } from "@/types/db";
import { emptyPastLastPage, publicRead } from "./query";

export type PostCardRow = Pick<
  InformationPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "type"
  | "cover_image_url"
  | "event_date"
  | "event_time"
  | "location"
  | "organizer"
  | "priority"
  | "start_date"
  | "end_date"
  | "published_at"
  | "sort_date"
>;

const CARD_COLUMNS =
  "id,title,slug,excerpt,type,cover_image_url,event_date,event_time,location,organizer,priority,start_date,end_date,published_at,sort_date";

/** Public /informasi tab values (`jenis`) → post type. */
export const JENIS_TO_TYPE = {
  berita: "news",
  pengumuman: "announcement",
  agenda: "event",
  layanan: "service",
} as const satisfies Record<string, PostType>;
export type Jenis = "semua" | keyof typeof JENIS_TO_TYPE;

/** Homepage: announcements active today, priority desc, start_date desc nulls last, limit 3. */
export function getActiveAnnouncements(today: string = todayInSiteTz()) {
  return publicRead(
    "getActiveAnnouncements",
    (sb) =>
      sb
        .from("information_posts")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .eq("type", "announcement")
        .lte("effective_start", today)
        .gte("effective_end", today)
        .order("priority", { ascending: false })
        .order("start_date", { ascending: false, nullsFirst: false })
        .limit(3)
        .overrideTypes<PostCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Homepage: events from today on, event_date asc, event_time asc nulls last, limit 3. */
export function getUpcomingEvents(today: string = todayInSiteTz()) {
  return publicRead(
    "getUpcomingEvents",
    (sb) =>
      sb
        .from("information_posts")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .eq("type", "event")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true, nullsFirst: false })
        .limit(3)
        .overrideTypes<PostCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Homepage: newest 3 published news by published_at. */
export function getLatestNews() {
  return publicRead(
    "getLatestNews",
    (sb) =>
      sb
        .from("information_posts")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .eq("type", "news")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3)
        .overrideTypes<PostCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

export interface ListPostsParams {
  jenis: Jenis;
  q: string;
  page: number;
}

/**
 * /informasi list (design D14, simplified by S9: type tab + search + pagination only).
 * 12 per page via range() with count:'exact'.
 */
export function listPublishedPosts({ jenis, q, page }: ListPostsParams) {
  const pageSize = PAGE_SIZE.public;
  const from = (Math.max(1, page) - 1) * pageSize;
  return publicRead(
    "listPublishedPosts",
    (sb) => {
      let query = sb.from("information_posts").select(CARD_COLUMNS, { count: "exact" }).eq("status", "published");
      if (jenis !== "semua") query = query.eq("type", JENIS_TO_TYPE[jenis]);
      const t = normalizeSearchTerm(q);
      if (t) query = query.or(`title.ilike.*${t}*,excerpt.ilike.*${t}*`);
      if (jenis === "pengumuman") {
        query = query.order("priority", { ascending: false }).order("sort_date", { ascending: false, nullsFirst: false });
      } else {
        query = query
          .order("sort_date", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
      }
      return emptyPastLastPage(query.range(from, from + pageSize - 1).overrideTypes<PostCardRow[], { merge: false }>());
    },
    (data, count) => ({ rows: data ?? [], total: count ?? 0, pageSize }),
  );
}

/** One published post by slug; `data: null` when missing or draft. Cached per request. */
export const getPublishedPostBySlug = cache((slug: string) =>
  publicRead(
    "getPublishedPostBySlug",
    (sb) =>
      sb
        .from("information_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle<InformationPost>(),
    (data) => data ?? null,
  ),
);

/** Same type, published, excluding the current post, newest 3. */
export function getRelatedPosts(type: PostType, excludeId: string) {
  return publicRead(
    "getRelatedPosts",
    (sb) =>
      sb
        .from("information_posts")
        .select(CARD_COLUMNS)
        .eq("status", "published")
        .eq("type", type)
        .neq("id", excludeId)
        .order("sort_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(3)
        .overrideTypes<PostCardRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}
