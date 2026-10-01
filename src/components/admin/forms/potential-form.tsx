"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, type Path } from "react-hook-form";
import { savePotential } from "@/actions/potentials";
import { FormField, selectClassName } from "@/components/admin/form-field";
import { FormSummary, SaveButtons, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextField } from "@/components/admin/rich-text-field";
import { SocialLinksField } from "@/components/admin/social-links-field";
import { LocationPicker } from "@/components/map/location-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { POTENTIAL_CATEGORIES } from "@/lib/config";
import { potentialSchema, type PotentialInput, type PotentialValues } from "@/lib/validation/potential";
import type { Potential } from "@/types/db";

const LIST = "/admin/potensi";
const s = (v: string | null | undefined) => v ?? "";
const n = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export function PotentialForm({ initial }: { initial?: Potential }) {
  const form = useForm<PotentialInput, unknown, PotentialValues>({
    resolver: zodResolver(potentialSchema),
    shouldFocusError: true,
    defaultValues: {
      name: s(initial?.name),
      slug: s(initial?.slug),
      category: (initial?.category as PotentialInput["category"] | undefined) ?? "Lainnya",
      summary: s(initial?.summary),
      description: s(initial?.description),
      image_url: initial?.image_url ?? null,
      owner_or_manager: s(initial?.owner_or_manager),
      address: s(initial?.address),
      latitude: n(initial?.latitude),
      longitude: n(initial?.longitude),
      contact: s(initial?.contact),
      whatsapp: s(initial?.whatsapp),
      operating_hours: s(initial?.operating_hours),
      social_links: initial?.social_links ?? [],
      is_featured: initial?.is_featured ?? false,
      status: initial?.status ?? "draft",
    },
  });
  const { summary, submit } = useAdminSubmit(form, savePotential, { id: initial?.id, listHref: LIST });
  const err = (name: Path<PotentialInput>) => form.getFieldState(name, form.formState).error?.message;
  const { register } = form;
  const save = (status: "draft" | "published") => {
    form.setValue("status", status);
    void submit();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
        <FormSummary message={summary} />
        <FormField id="name" label="Nama potensi" required error={err("name")}>
          {(p) => <Input {...p} className="h-11" {...register("name")} />}
        </FormField>
        <FormField id="slug" label="Slug (alamat halaman)" description="Kosongkan untuk dibuat otomatis dari judul." error={err("slug")}>
          {(p) => <Input {...p} className="h-11" {...register("slug")} />}
        </FormField>
        <FormField id="category" label="Kategori" required error={err("category")}>
          {(p) => (
            <select {...p} className={selectClassName} {...register("category")}>
              {POTENTIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="summary" label="Ringkasan" description="Maksimal 300 karakter." error={err("summary")}>
          {(p) => <Textarea {...p} rows={3} {...register("summary")} />}
        </FormField>
        <RichTextField id="description" label="Deskripsi lengkap" registration={register("description")} error={err("description")} />
        <Controller
          control={form.control}
          name="image_url"
          render={({ field, fieldState }) => (
            <ImageUploadField
              id="image_url"
              label="Foto"
              module="potentials"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormField id="owner_or_manager" label="Pemilik / pengelola" error={err("owner_or_manager")}>
          {(p) => <Input {...p} className="h-11" {...register("owner_or_manager")} />}
        </FormField>
        <FormField id="address" label="Alamat" error={err("address")}>
          {(p) => <Textarea {...p} rows={2} {...register("address")} />}
        </FormField>
        <LocationPicker />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="contact" label="Kontak" description="Telepon atau email." error={err("contact")}>
            {(p) => <Input {...p} className="h-11" {...register("contact")} />}
          </FormField>
          <FormField id="whatsapp" label="WhatsApp" description="Contoh: 0812xxxxxxx" error={err("whatsapp")}>
            {(p) => <Input {...p} type="tel" className="h-11" {...register("whatsapp")} />}
          </FormField>
        </div>
        <FormField id="operating_hours" label="Jam operasional" error={err("operating_hours")}>
          {(p) => <Input {...p} className="h-11" {...register("operating_hours")} />}
        </FormField>
        <SocialLinksField />
        <Controller
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} aria-describedby="is_featured-desc" className="mt-1" />
              <div>
                <Label htmlFor="is_featured">Potensi unggulan</Label>
                <p id="is_featured-desc" className="text-sm text-muted-foreground">
                  Tampilkan di bagian Potensi Unggulan pada Beranda.
                </p>
              </div>
            </div>
          )}
        />
        <SaveButtons pending={form.formState.isSubmitting} onSave={save} cancelHref={LIST} />
      </form>
    </FormProvider>
  );
}
