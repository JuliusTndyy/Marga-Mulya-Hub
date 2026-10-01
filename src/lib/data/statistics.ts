import type { VillageStatistic } from "@/types/db";
import { publicRead } from "./query";

export type PublicStatistic = Pick<
  VillageStatistic,
  | "id"
  | "category"
  | "indicator"
  | "value"
  | "unit"
  | "year"
  | "chart_type"
  | "display_order"
  | "source"
  | "is_sample"
  | "is_highlight"
>;

const STAT_COLUMNS = "id,category,indicator,value,unit,year,chart_type,display_order,source,is_sample,is_highlight";

/** All published statistics, ordered display_order, category, indicator, year (design D14). */
export function getPublishedStatistics() {
  return publicRead(
    "getPublishedStatistics",
    (sb) =>
      sb
        .from("village_statistics")
        .select(STAT_COLUMNS)
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("category", { ascending: true })
        .order("indicator", { ascending: true })
        .order("year", { ascending: true })
        .overrideTypes<PublicStatistic[], { merge: false }>(),
    (data) => data ?? [],
  );
}

/** For each (category, indicator) keep the row with the latest year, in input order, max `limit`. */
export function latestPerIndicator<T extends Pick<PublicStatistic, "category" | "indicator" | "year">>(
  rows: T[],
  limit: number,
): T[] {
  const best = new Map<string, T>();
  for (const r of rows) {
    const key = `${r.category}\u0000${r.indicator}`;
    const cur = best.get(key);
    if (!cur || r.year > cur.year) best.set(key, r);
  }
  return [...best.values()].slice(0, limit);
}

/** Published highlight statistics: latest year per (category, indicator), max 4 (homepage, design D14). */
export function getHighlightStatistics() {
  return publicRead(
    "getHighlightStatistics",
    (sb) =>
      sb
        .from("village_statistics")
        .select(STAT_COLUMNS)
        .eq("is_published", true)
        .eq("is_highlight", true)
        .order("display_order", { ascending: true })
        .order("year", { ascending: false })
        .limit(200)
        .overrideTypes<PublicStatistic[], { merge: false }>(),
    (data) => latestPerIndicator(data ?? [], 4),
  );
}
