import { z } from "zod";
import { optionalText, requiredInt, requiredText } from "@/lib/validation/common";

export const CHART_TYPE_OPTIONS = [
  { value: "bar", label: "Batang" },
  { value: "line", label: "Garis" },
  { value: "pie", label: "Lingkaran" },
  { value: "donut", label: "Donat" },
  { value: "none", label: "Tanpa grafik" },
] as const;

const VALUE_MSG = "Nilai harus angka antara −999.999.999.999,99 dan 999.999.999.999,99 (maksimal 2 desimal).";
const MAX_VALUE = 999_999_999_999.99;
const hasAtMostTwoDecimals = (v: number) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;

// village_statistics (numeric(14,2)), design D18 Data Desa.
export const statisticSchema = z.object({
  category: requiredText(2, 80, "Kategori wajib diisi (2–80 karakter)."),
  indicator: requiredText(1, 120, "Indikator wajib diisi (1–120 karakter)."),
  value: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : typeof v === "string" ? Number(v.replace(",", ".")) : v),
    z.number({ error: VALUE_MSG }).min(-MAX_VALUE, VALUE_MSG).max(MAX_VALUE, VALUE_MSG).refine(hasAtMostTwoDecimals, VALUE_MSG),
  ),
  unit: optionalText(30),
  year: requiredInt(1900, 2100, "Tahun harus antara 1900 dan 2100."),
  chart_type: z.enum(["bar", "line", "pie", "donut", "none"], { error: "Pilih jenis grafik." }),
  display_order: requiredInt(-100000, 100000, "Urutan harus berupa bilangan bulat."),
  source: optionalText(300),
  is_sample: z.boolean(),
  is_highlight: z.boolean(),
  is_published: z.boolean(),
});

export type StatisticInput = z.input<typeof statisticSchema>;
export type StatisticValues = z.output<typeof statisticSchema>;
