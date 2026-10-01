"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, type Path } from "react-hook-form";
import { saveSettings } from "@/actions/settings";
import { FormField } from "@/components/admin/form-field";
import { FormSummary, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { SocialLinksField } from "@/components/admin/social-links-field";
import { LocationPicker } from "@/components/map/location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { settingsSchema, type SettingsInput, type SettingsValues } from "@/lib/validation/settings";
import type { SiteSettings } from "@/types/db";

const s = (v: string | null | undefined) => v ?? "";
const n = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export function SettingsForm({ initial }: { initial: SiteSettings | null }) {
  const form = useForm<SettingsInput, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    shouldFocusError: true,
    defaultValues: {
      village_name: s(initial?.village_name),
      tagline: s(initial?.tagline),
      short_description: s(initial?.short_description),
      hero_title: s(initial?.hero_title),
      hero_description: s(initial?.hero_description),
      hero_image_url: initial?.hero_image_url ?? null,
      address: s(initial?.address),
      phone: s(initial?.phone),
      whatsapp: s(initial?.whatsapp),
      email: s(initial?.email),
      service_hours: s(initial?.service_hours),
      latitude: n(initial?.latitude),
      longitude: n(initial?.longitude),
      social_links: initial?.social_links ?? [],
    },
  });
  // Settings is a singleton: always "edit" (refresh after save).
  const { summary, submit } = useAdminSubmit(form, saveSettings, { id: "1", listHref: "/admin/pengaturan" });
  const err = (name: Path<SettingsInput>) => form.getFieldState(name, form.formState).error?.message;
  const { register } = form;
  const pending = form.formState.isSubmitting;

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
        <FormSummary message={summary} />
        <FormField id="village_name" label="Nama desa" required error={err("village_name")}>
          {(p) => <Input {...p} className="h-11" {...register("village_name")} />}
        </FormField>
        <FormField id="tagline" label="Tagline" error={err("tagline")}>
          {(p) => <Input {...p} className="h-11" {...register("tagline")} />}
        </FormField>
        <FormField id="short_description" label="Deskripsi singkat" error={err("short_description")}>
          {(p) => <Textarea {...p} rows={3} {...register("short_description")} />}
        </FormField>
        <FormField id="hero_title" label="Judul hero" description="Kosongkan untuk memakai nama desa." error={err("hero_title")}>
          {(p) => <Input {...p} className="h-11" {...register("hero_title")} />}
        </FormField>
        <FormField id="hero_description" label="Deskripsi hero" error={err("hero_description")}>
          {(p) => <Textarea {...p} rows={3} {...register("hero_description")} />}
        </FormField>
        <Controller
          control={form.control}
          name="hero_image_url"
          render={({ field, fieldState }) => (
            <ImageUploadField
              id="hero_image_url"
              label="Gambar hero"
              module="settings"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormField id="address" label="Alamat" error={err("address")}>
          {(p) => <Textarea {...p} rows={2} {...register("address")} />}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="phone" label="Telepon" error={err("phone")}>
            {(p) => <Input {...p} type="tel" className="h-11" {...register("phone")} />}
          </FormField>
          <FormField id="whatsapp" label="WhatsApp" description="Contoh: 0812xxxxxxx" error={err("whatsapp")}>
            {(p) => <Input {...p} type="tel" className="h-11" {...register("whatsapp")} />}
          </FormField>
        </div>
        <FormField id="email" label="Email" error={err("email")}>
          {(p) => <Input {...p} type="email" className="h-11" {...register("email")} />}
        </FormField>
        <FormField id="service_hours" label="Jam layanan" error={err("service_hours")}>
          {(p) => <Textarea {...p} rows={2} {...register("service_hours")} />}
        </FormField>
        <LocationPicker legend="Lokasi kantor desa" />
        <SocialLinksField />
        <div className="border-t pt-4">
          <Button type="submit" className="min-h-11" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
