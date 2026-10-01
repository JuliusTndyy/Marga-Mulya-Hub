import { describe, expect, it } from "vitest";
import type { ChartType } from "@/types/db";
import { buildChartGroups, chartCaption, chartSummary, type StatRow } from "./stats";

const SRC = "Data contoh — bukan data resmi.";
let seq = 0;
function row(
  category: string,
  indicator: string,
  value: number | string,
  year: number,
  chart_type: ChartType,
  display_order: number,
  extra: Partial<StatRow> = {},
): StatRow {
  seq += 1;
  return { id: `r${seq}`, category, indicator, value, unit: "jiwa", year, chart_type, display_order, source: SRC, is_sample: true, ...extra };
}

// Mirrors database/seed/0001_seed_placeholder.sql (numeric values arrive as strings from PostgREST).
const seed: StatRow[] = [
  row("Jumlah Penduduk", "Total", "190.00", 2022, "line", 10),
  row("Jumlah Penduduk", "Total", "200.00", 2023, "line", 10),
  row("Jumlah Penduduk", "Total", "220.00", 2024, "line", 10),
  row("Kependudukan", "Laki-laki", "100.00", 2023, "pie", 20),
  row("Kependudukan", "Perempuan", "100.00", 2023, "pie", 21),
  row("Kependudukan", "Laki-laki", "110.00", 2024, "pie", 20),
  row("Kependudukan", "Perempuan", "110.00", 2024, "pie", 21),
  row("Mata Pencaharian", "Sektor Contoh A", "40.00", 2024, "bar", 30),
  row("Mata Pencaharian", "Sektor Contoh B", "30.00", 2024, "bar", 31),
  row("Mata Pencaharian", "Sektor Contoh C", "20.00", 2024, "bar", 32),
  row("Mata Pencaharian", "Sektor Contoh D", "10.00", 2024, "bar", 33),
];

describe("buildChartGroups (S2: bar only, latest year per category)", () => {
  it("returns no groups for no rows", () => {
    expect(buildChartGroups([])).toEqual([]);
  });

  it("orders categories by minimum display_order, then name", () => {
    const groups = buildChartGroups([...seed].reverse());
    expect(groups.map((g) => g.category)).toEqual(["Jumlah Penduduk", "Kependudukan", "Mata Pencaharian"]);
    const tie = buildChartGroups([row("Zeta", "a", 1, 2024, "bar", 5), row("Alfa", "b", 1, 2024, "bar", 5)]);
    expect(tie.map((g) => g.category)).toEqual(["Alfa", "Zeta"]);
  });

  it("keeps only the latest year of each category", () => {
    const [jp, kp] = buildChartGroups(seed);
    expect(jp!.year).toBe(2024);
    expect(jp!.data).toEqual([{ name: "Total", value: 220, unit: "jiwa" }]);
    expect(kp!.year).toBe(2024);
    expect(kp!.rows.map((r) => r.value)).toEqual(["110.00", "110.00"]);
  });

  it("uses each category's own latest year", () => {
    const groups = buildChartGroups([row("A", "x", 1, 2021, "bar", 1), row("B", "y", 2, 2024, "bar", 2), row("A", "x", 3, 2023, "bar", 1)]);
    expect(groups.map((g) => [g.category, g.year])).toEqual([["A", 2023], ["B", 2024]]);
  });

  it("renders line/pie/donut/bar as bar and none as table only", () => {
    const groups = buildChartGroups([
      row("L", "a", 1, 2024, "line", 1),
      row("P", "a", 1, 2024, "pie", 2),
      row("D", "a", 1, 2024, "donut", 3),
      row("B", "a", 1, 2024, "bar", 4),
      row("N", "a", 1, 2024, "none", 5),
    ]);
    expect(groups.map((g) => [g.chartType, g.renderType])).toEqual([
      ["line", "bar"],
      ["pie", "bar"],
      ["donut", "bar"],
      ["bar", "bar"],
      ["none", "none"],
    ]);
  });

  it("takes the chart type from the row with the lowest display_order", () => {
    const [g] = buildChartGroups([row("C", "b", 1, 2024, "bar", 9), row("C", "a", 1, 2024, "none", 1)]);
    expect(g!.renderType).toBe("none");
  });

  it("orders data by display_order, then indicator, and converts numeric strings", () => {
    const [g] = buildChartGroups([row("C", "b", "2.50", 2024, "bar", 2), row("C", "z", "1", 2024, "bar", 1), row("C", "a", "3", 2024, "bar", 2)]);
    expect(g!.data.map((d) => [d.name, d.value])).toEqual([["z", 1], ["a", 3], ["b", 2.5]]);
  });

  it("collects distinct non-null sources and the sample flag", () => {
    const [g] = buildChartGroups([
      row("C", "a", 1, 2024, "bar", 1, { source: "BPS" }),
      row("C", "b", 1, 2024, "bar", 2, { source: "BPS", is_sample: false }),
      row("C", "c", 1, 2024, "bar", 3, { source: null, is_sample: false }),
    ]);
    expect(g!.sources).toEqual(["BPS"]);
    expect(g!.hasSample).toBe(true);
  });
});

describe("chartSummary", () => {
  const groups = buildChartGroups(seed);

  it("matches the exact seed summaries", () => {
    expect(groups.map(chartSummary)).toEqual([
      "Data contoh, bukan data resmi. Grafik batang Jumlah Penduduk tahun 2024: Total 220 jiwa.",
      "Data contoh, bukan data resmi. Grafik batang Kependudukan tahun 2024: Laki-laki 110 jiwa, Perempuan 110 jiwa.",
      "Data contoh, bukan data resmi. Grafik batang Mata Pencaharian tahun 2024: Sektor Contoh A 40 jiwa, Sektor Contoh B 30 jiwa, Sektor Contoh C 20 jiwa, Sektor Contoh D 10 jiwa.",
    ]);
  });

  it("omits the sample prefix for a non-sample group and formats numbers id-ID", () => {
    const [g] = buildChartGroups([
      row("Luas Wilayah", "Sawah", "1234.5", 2024, "bar", 1, { unit: "ha", is_sample: false }),
      row("Luas Wilayah", "Lainnya", "12", 2024, "bar", 2, { unit: null, is_sample: false }),
    ]);
    expect(chartSummary(g!)).toBe("Grafik batang Luas Wilayah tahun 2024: Sawah 1.234,5 ha, Lainnya 12.");
  });
});

describe("chartCaption", () => {
  it("appends (data contoh) only for sample groups", () => {
    const [sample] = buildChartGroups(seed);
    const [real] = buildChartGroups([row("X", "a", 1, 2023, "bar", 1, { is_sample: false })]);
    expect(chartCaption(sample!)).toBe("Jumlah Penduduk tahun 2024 (data contoh)");
    expect(chartCaption(real!)).toBe("X tahun 2023");
  });
});
