"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Path } from "react-hook-form";
import { saveGalleryItem } from "@/actions/gallery";
import { FormField, selectClassName } from "@/components/admin/form-field";
import { FormSummary, SaveButtons, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GALLERY_CATEGORIES } from "@/lib/config";
import { gallerySchema, type GalleryInput, type GalleryValues } from "@/lib/validation/gallery";
import type { GalleryItem } from "@/types/db";

const LIST = "/admin/galeri";
const s = (v: string | null | undefined) => v ?? "";

export function GalleryForm({ initial }: { initial?: GalleryItem }) {
  const form = useForm<GalleryInput, unknown, GalleryValues>({
    resolver: zodResolver(gallerySchema),
    shouldFocusError: true,
    defaultValues: {
      title: s(initial?.title),
      description: s(initial?.description),
      image_url: initial?.image_url ?? "",
      alt_text: s(initial?.alt_text),
      category: (initial?.category as GalleryInput["category"] | undefined) ?? "Kegiatan",
      event_date: s(initial?.event_date),
      location: s(initial?.location),
      status: initial?.status ?? "draft",
    },
  });
  const { summary, submit } = useAdminSubmit(form, saveGalleryItem, { id: initial?.id, listHref: LIST });
  const err = (name: Path<GalleryInput>) => form.getFieldState(name, form.formState).error?.message;
  const { register } = form;
  const save = (status: "draft" | "published") => {
    form.setValue("status", status);
    void submit();
  };

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
      <FormSummary message={summary} />
      <Controller
        control={form.control}
        name="image_url"
        render={({ field, fieldState }) => (
          <ImageUploadField
            id="image_url"
            label="Foto"
            module="gallery"
            required
            value={field.value}
            onChange={(v) => field.onChange(v ?? "")}
            error={fieldState.error?.message}
          />
        )}
      />
      <FormField id="title" label="Judul" required error={err("title")}>
        {(p) => <Input {...p} className="h-11" {...register("title")} />}
      </FormField>
      <FormField id="alt_text" label="Teks alternatif" required description="Jelaskan isi foto untuk pengguna pembaca layar" error={err("alt_text")}>
        {(p) => <Input {...p} className="h-11" {...register("alt_text")} />}
      </FormField>
      <FormField id="description" label="Deskripsi" error={err("description")}>
        {(p) => <Textarea {...p} rows={4} {...register("description")} />}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="category" label="Kategori" required error={err("category")}>
          {(p) => (
            <select {...p} className={selectClassName} {...register("category")}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField id="event_date" label="Tanggal" error={err("event_date")}>
          {(p) => <Input {...p} type="date" className="h-11" {...register("event_date")} />}
        </FormField>
      </div>
      <FormField id="location" label="Lokasi" error={err("location")}>
        {(p) => <Input {...p} className="h-11" {...register("location")} />}
      </FormField>
      <SaveButtons pending={form.formState.isSubmitting} onSave={save} cancelHref={LIST} />
    </form>
  );
}
