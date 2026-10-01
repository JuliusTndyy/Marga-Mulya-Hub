import type { ChartType, VillageStatistic } from "@/types/db";

// Village Data Hub grouping (design D14, simplified by scope decision S2):
// one group per category showing that category's latest year; every chart_type other than
// "none" renders as a bar chart, "none" renders as a table only. Pure and unit tested.

export type StatRow = Pick<
  VillageStatistic,
  "id" | "category" | "indicator" | "value" | "unit" | "year" | "chart_type" | "display_order" | "source" | "is_sample"
>;

export interface ChartDatum {
  name: string;
  value: number;
  unit: string | null;
}

export interface ChartGroup {
  category: string;
  /** Configured chart type of the row with the lowest display_order. */
  chartType: ChartType;
  /** After the S2 simplification: "bar" for every chart type except "none". */
  renderType: "bar" | "none";
  /** The latest year with data in this category. */
  year: number;
  /** Rows of `year`, ordered by display_order, then indicator. */
  rows: StatRow[];
  data: ChartDatum[];
  /** Distinct non-null sources of the shown rows. */
  sources: string[];
  hasSample: boolean;
}

const numberFormat = new Intl.NumberFormat("id-ID");

export function buildChartGroups(rows: StatRow[]): ChartGroup[] {
  const byCategory = new Map<string, StatRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category);
    if (list) list.push(r);
    else byCategory.set(r.category, [r]);
  }

  const minOrder = (list: StatRow[]) => Math.min(...list.map((r) => r.display_order));
  const categories = [...byCategory.entries()].sort(
    ([a, la], [b, lb]) => minOrder(la) - minOrder(lb) || a.localeCompare(b, "id"),
  );

  return categories.map(([category, list]) => {
    const year = Math.max(...list.map((r) => r.year));
    const first = list.reduce((best, r) => (r.display_order < best.display_order ? r : best));
    const shown = list
      .filter((r) => r.year === year)
      .sort((a, b) => a.display_order - b.display_order || a.indicator.localeCompare(b.indicator, "id"));
    return {
      category,
      chartType: first.chart_type,
      renderType: first.chart_type === "none" ? "none" : "bar",
      year,
      rows: shown,
      data: shown.map((r) => ({ name: r.indicator, value: Number(r.value), unit: r.unit })),
      sources: [...new Set(shown.map((r) => r.source).filter((s): s is string => !!s))],
      hasSample: shown.some((r) => r.is_sample),
    } satisfies ChartGroup;
  });
}

/** Text alternative for the chart (design D13), e.g. "Grafik batang X tahun 2024: A 40 jiwa, B 30 jiwa." */
export function chartSummary(group: ChartGroup): string {
  const prefix = group.hasSample ? "Data contoh, bukan data resmi. " : "";
  const items = group.data
    .map((d) => `${d.name} ${numberFormat.format(d.value)}${d.unit ? ` ${d.unit}` : ""}`)
    .join(", ");
  return `${prefix}Grafik batang ${group.category} tahun ${group.year}: ${items}.`;
}

/** Table caption (design D13): "{category} tahun {year}" plus " (data contoh)" for sample groups. */
export function chartCaption(group: ChartGroup): string {
  return `${group.category} tahun ${group.year}${group.hasSample ? " (data contoh)" : ""}`;
}
