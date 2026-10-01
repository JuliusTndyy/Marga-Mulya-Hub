"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { submitContribution } from "@/actions/public-forms";
import { FormField, selectClassName } from "@/components/admin/form-field";
import { ServiceNotice } from "@/components/public/service-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUBMISSION_CATEGORIES } from "@/lib/config";
import { toFormData } from "@/lib/forms/to-form-data";
import { contributionTextSchema } from "@/lib/validation/public-forms";
import { Honeypot } from "./honeypot";

// The shared text schema plus the two spam fields, which the client passes through unvalidated
// (the server decides; design D17). Text only: no photo input (scope decision S4).
const clientSchema = z.intersection(
  contributionTextSchema,
  z.object({ website: z.string().optional(), started_at: z.string().optional() }),
);
type FormInput = z.input<typeof clientSchema>;
type FormOutput = z.output<typeof clientSchema>;

const FIELDS = ["submitter_name", "contact", "category", "title", "description", "location", "latitude", "longitude"] as const;
type FieldName = (typeof FIELDS)[number];
/** Element ids are prefixed so they stay unique next to the contact form on /kontak. */
const fid = (name: FieldName) => `kontribusi-${name}`;

interface ContributionFormProps {
  /** Server-issued render timestamp (issueFormTimestamp in the /kontak Server Component). */
  renderedAt: number;
  disabled?: boolean;
}

export function ContributionForm({ renderedAt, disabled = false }: ContributionFormProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const defaultValues: FormInput = {
    submitter_name: "",
    contact: "",
    category: "" as FormInput["category"],
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    website: "",
    started_at: String(renderedAt),
  };
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(clientSchema),
    defaultValues,
    shouldFocusError: true,
  });
  const { register, formState } = form;
  const err = (name: Path<FormInput>) => form.getFieldState(name, formState).error?.message;

  const onValid = async (values: FormOutput) => {
    setSummary(null);
    setSuccess(null);
    try {
      const res = await submitContribution(toFormData(values));
      if (res.ok) {
        setSuccess(res.message);
        toast.success(res.message);
        form.reset(defaultValues);
        return;
      }
      setSummary(res.message);
      for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
        if ((FIELDS as readonly string[]).includes(field) && msgs[0]) {
          form.setError(field as FieldName, { message: msgs[0] }, { shouldFocus: true });
        }
      }
    } catch {
      setSummary("Gagal mengirim. Silakan coba lagi.");
    }
  };
  const onInvalid = () => {
    setSuccess(null);
    setSummary("Periksa kembali isian formulir.");
  };

  return (
    <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="relative grid gap-4">
      {disabled ? <ServiceNotice /> : null}
      {summary ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {summary}
        </div>
      ) : null}
      <div role="status" aria-live="polite">
        {success ? (
          <p className="rounded-md border border-success/40 bg-success/10 p-3 text-sm font-medium text-success">{success}</p>
        ) : null}
      </div>
      <fieldset disabled={disabled || formState.isSubmitting} className="grid gap-4 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={fid("submitter_name")} label="Nama" required error={err("submitter_name")}>
            {(p) => <Input {...p} autoComplete="name" className="h-11" {...register("submitter_name")} />}
          </FormField>
          <FormField
            id={fid("contact")}
            label="Kontak (email atau nomor telepon)"
            description="Tidak ditampilkan di situs, hanya untuk admin desa."
            error={err("contact")}
          >
            {(p) => <Input {...p} className="h-11" {...register("contact")} />}
          </FormField>
        </div>
        <FormField id={fid("category")} label="Kategori" required error={err("category")}>
          {(p) => (
            <select {...p} className={selectClassName} {...register("category")}>
              <option value="">Pilih kategori</option>
              {SUBMISSION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id={fid("title")} label="Judul" required error={err("title")}>
          {(p) => <Input {...p} className="h-11" {...register("title")} />}
        </FormField>
        <FormField id={fid("description")} label="Deskripsi" required error={err("description")}>
          {(p) => <Textarea {...p} rows={6} {...register("description")} />}
        </FormField>
        <FormField id={fid("location")} label="Lokasi" description="Contoh: nama dusun atau patokan terdekat." error={err("location")}>
          {(p) => <Input {...p} className="h-11" {...register("location")} />}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={fid("latitude")} label="Lintang (latitude)" error={err("latitude")}>
            {(p) => <Input {...p} type="text" inputMode="decimal" className="h-11" {...register("latitude")} />}
          </FormField>
          <FormField id={fid("longitude")} label="Bujur (longitude)" error={err("longitude")}>
            {(p) => <Input {...p} type="text" inputMode="decimal" className="h-11" {...register("longitude")} />}
          </FormField>
        </div>
        <Honeypot id="kontribusi-website" registration={register("website")} />
        <input type="hidden" {...register("started_at")} />
        <Button type="submit" className="min-h-11 w-full sm:w-fit sm:px-8">
          {formState.isSubmitting ? "Mengirim…" : "Kirim Kontribusi"}
        </Button>
      </fieldset>
    </form>
  );
}
