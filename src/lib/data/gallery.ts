import { PAGE_SIZE } from "@/lib/config";
import type { GalleryItem } from "@/types/db";
import { emptyPastLastPage, publicRead } from "./query";

export type GalleryRow = Pick<
  GalleryItem,
  "id" | "title" | "description" | "image_url" | "alt_text" | "category" | "event_date" | "location"
>;

const COLUMNS = "id,title,description,image_url,alt_text,category,event_date,location";

/** /galeri: published items, event_date desc nulls last, created_at desc, 60 per page (design D14). */
export function listPublishedGallery({ kategori, page }: { kategori: string | null; page: number }) {
  const pageSize = PAGE_SIZE.gallery;
  const from = (Math.max(1, page) - 1) * pageSize;
  return publicRead(
    "listPublishedGallery",
    (sb) => {
      let query = sb.from("gallery_items").select(COLUMNS, { count: "exact" }).eq("status", "published");
      if (kategori) query = query.eq("category", kategori);
      return emptyPastLastPage(
        query
          .order("event_date", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1)
          .overrideTypes<GalleryRow[], { merge: false }>(),
      );
    },
    (data, count) => ({ rows: data ?? [], total: count ?? 0, pageSize }),
  );
}

/** Newest published gallery items (profil "Dokumentasi"). */
export function getRecentGallery(limit = 6) {
  return publicRead(
    "getRecentGallery",
    (sb) =>
      sb
        .from("gallery_items")
        .select(COLUMNS)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit)
        .overrideTypes<GalleryRow[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** Distinct categories present in published gallery items (so an empty category never shows). */
export function getGalleryCategories() {
  return publicRead(
    "getGalleryCategories",
    (sb) =>
      sb
        .from("gallery_items")
        .select("category")
        .eq("status", "published")
        .order("category", { ascending: true })
        .limit(1000)
        .overrideTypes<Pick<GalleryItem, "category">[], { merge: false }>(),
    (data) => [...new Set((data ?? []).map((r) => r.category))],
  );
}
