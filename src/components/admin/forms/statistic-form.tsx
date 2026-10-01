"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm, type Path } from "react-hook-form";
import { saveStatistic } from "@/actions/statistics";
import { FormField, selectClassName } from "@/components/admin/form-field";
import { FormSummary, useAdminSubmit } from "@/components/admin/form-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CHART_TYPE_OPTIONS, statisticSchema, type StatisticInput, type StatisticValues,
} from "@/lib/validation/statistic";
import type { VillageStatistic } from "@/types/db";

const LIST = "/admin/data-desa";
const SWITCHES = [
  { name: "is_published", label: "Terbitkan", hint: "Tampilkan di halaman Data Desa." },
  { name: "is_highlight", label: "Sorot", hint: "Tampilkan sebagai kartu statistik di Beranda." },
  { name: "is_sample", label: "Data contoh", hint: "Tandai sebagai data contoh (bukan data resmi)." },
] as const;

export function StatisticForm({ initial, categories }: { initial?: VillageStatistic; categories: string[] }) {
  const form = useForm<StatisticInput, unknown, StatisticValues>({
    resolver: zodResolver(statisticSchema),
    shouldFocusError: true,
    defaultValues: {
      category: initial?.category ?? "",
      indicator: initial?.indicator ?? "",
      value: initial ? String(Number(initial.value)) : "",
      unit: initial?.unit ?? "",
      year: initial ? String(initial.year) : "",
      chart_type: initial?.chart_type ?? "bar",
      display_order: String(initial?.display_order ?? 0),
      source: initial?.source ?? "",
      is_sample: initial?.is_sample ?? false,
      is_highlight: initial?.is_highlight ?? false,
      is_published: initial?.is_published ?? false,
    },
  });
  const { summary, submit } = useAdminSubmit(form, saveStatistic, { id: initial?.id, listHref: LIST });
  const err = (name: Path<StatisticInput>) => form.getFieldState(name, form.formState).error?.message;
  const { register } = form;
  const pending = form.formState.isSubmitting;

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
      <FormSummary message={summary} />
      <FormField id="category" label="Kategori" required description="Pilih kategori yang ada atau ketik kategori baru." error={err("category")}>
        {(p) => <Input {...p} list="stat-categories" className="h-11" {...register("category")} />}
      </FormField>
      <datalist id="stat-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <FormField id="indicator" label="Indikator" required error={err("indicator")}>
        {(p) => <Input {...p} className="h-11" {...register("indicator")} />}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField id="value" label="Nilai" required description="Maksimal 2 desimal." error={err("value")}>
          {(p) => <Input {...p} type="number" step="0.01" inputMode="decimal" className="h-11" {...register("value")} />}
        </FormField>
        <FormField id="unit" label="Satuan" description="Contoh: jiwa, ha, %" error={err("unit")}>
          {(p) => <Input {...p} className="h-11" {...register("unit")} />}
        </FormField>
        <FormField id="year" label="Tahun" required error={err("year")}>
          {(p) => <Input {...p} type="number" step={1} min={1900} max={2100} inputMode="numeric" className="h-11" {...register("year")} />}
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="chart_type" label="Jenis grafik" required error={err("chart_type")}>
          {(p) => (
            <select {...p} className={selectClassName} {...register("chart_type")}>
              {CHART_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="display_order" label="Urutan tampil" required error={err("display_order")}>
          {(p) => <Input {...p} type="number" step={1} inputMode="numeric" className="h-11" {...register("display_order")} />}
        </FormField>
      </div>
      <FormField id="source" label="Sumber data" error={err("source")}>
        {(p) => <Input {...p} className="h-11" {...register("source")} />}
      </FormField>
      <div className="grid gap-3 rounded-lg border p-4">
        {SWITCHES.map((s) => (
          <Controller
            key={s.name}
            control={form.control}
            name={s.name}
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Switch
                  id={s.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-describedby={`${s.name}-desc`}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor={s.name}>{s.label}</Label>
                  <p id={`${s.name}-desc`} className="text-sm text-muted-foreground">
                    {s.hint}
                  </p>
                </div>
              </div>
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button type="submit" className="min-h-11" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
        <Button asChild variant="ghost" className="min-h-11">
          <Link href={LIST}>Batal</Link>
        </Button>
      </div>
    </form>
  );
}
