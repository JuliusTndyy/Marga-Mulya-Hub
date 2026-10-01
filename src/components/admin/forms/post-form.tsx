"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Path } from "react-hook-form";
import { savePost } from "@/actions/posts";
import { FormField, selectClassName } from "@/components/admin/form-field";
import { FormSummary, SaveButtons, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextField } from "@/components/admin/rich-text-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_LABELS } from "@/lib/config";
import { postSchema, type PostInput, type PostValues } from "@/lib/validation/post";
import type { InformationPost, PostType } from "@/types/db";

const s = (v: string | null | undefined) => v ?? "";

interface PostFormProps {
  type: PostType;
  listHref: string;
  initial?: InformationPost;
}

// One form for all post types; fields shown per type (design D18).
export function PostForm({ type, listHref, initial }: PostFormProps) {
  const form = useForm<PostInput, unknown, PostValues>({
    resolver: zodResolver(postSchema),
    shouldFocusError: true,
    defaultValues: {
      type,
      title: s(initial?.title),
      slug: s(initial?.slug),
      excerpt: s(initial?.excerpt),
      content: s(initial?.content),
      cover_image_url: initial?.cover_image_url ?? null,
      event_date: s(initial?.event_date),
      // Postgres returns time as HH:MM:SS; the schema accepts minute precision only.
      event_time: initial?.event_time?.slice(0, 5) ?? "",
      location: s(initial?.location),
      organizer: s(initial?.organizer),
      priority: String(initial?.priority ?? 0),
      start_date: s(initial?.start_date),
      end_date: s(initial?.end_date),
      status: initial?.status ?? "draft",
    },
  });
  const { summary, submit } = useAdminSubmit(form, savePost, { id: initial?.id, listHref });
  const err = (name: Path<PostInput>) => form.getFieldState(name, form.formState).error?.message;
  const { register } = form;
  const save = (status: "draft" | "published") => {
    form.setValue("status", status);
    void submit();
  };

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
      <FormSummary message={summary} />
      <FormField id="title" label="Judul" required error={err("title")}>
        {(p) => <Input {...p} className="h-11" {...register("title")} />}
      </FormField>
      <FormField id="slug" label="Slug (alamat halaman)" description="Kosongkan untuk dibuat otomatis dari judul." error={err("slug")}>
        {(p) => <Input {...p} className="h-11" {...register("slug")} />}
      </FormField>
      <FormField id="excerpt" label="Ringkasan" description="Maksimal 400 karakter." error={err("excerpt")}>
        {(p) => <Textarea {...p} rows={3} {...register("excerpt")} />}
      </FormField>

      {type === "announcement" ? (
        <fieldset className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Masa berlaku pengumuman</legend>
          <FormField id="priority" label="Prioritas" error={err("priority")}>
            {(p) => (
              <select {...p} className={selectClassName} {...register("priority")}>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="start_date" label="Tanggal mulai" description="Kosongkan agar langsung berlaku." error={err("start_date")}>
              {(p) => <Input {...p} type="date" className="h-11" {...register("start_date")} />}
            </FormField>
            <FormField id="end_date" label="Tanggal selesai" description="Kosongkan bila tanpa batas." error={err("end_date")}>
              {(p) => <Input {...p} type="date" className="h-11" {...register("end_date")} />}
            </FormField>
          </div>
        </fieldset>
      ) : null}

      {type === "event" ? (
        <fieldset className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Detail agenda</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="event_date" label="Tanggal agenda" required error={err("event_date")}>
              {(p) => <Input {...p} type="date" className="h-11" {...register("event_date")} />}
            </FormField>
            <FormField id="event_time" label="Jam (WIB)" description="Contoh: 08:00" error={err("event_time")}>
              {(p) => <Input {...p} type="time" className="h-11" {...register("event_time")} />}
            </FormField>
          </div>
          <FormField id="location" label="Lokasi" error={err("location")}>
            {(p) => <Input {...p} className="h-11" {...register("location")} />}
          </FormField>
          <FormField id="organizer" label="Penyelenggara" error={err("organizer")}>
            {(p) => <Input {...p} className="h-11" {...register("organizer")} />}
          </FormField>
        </fieldset>
      ) : null}

      <RichTextField id="content" label="Isi" registration={register("content")} error={err("content")} />
      <Controller
        control={form.control}
        name="cover_image_url"
        render={({ field, fieldState }) => (
          <ImageUploadField
            id="cover_image_url"
            label="Gambar sampul"
            module="posts"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <SaveButtons pending={form.formState.isSubmitting} onSave={save} cancelHref={listHref} />
    </form>
  );
}
