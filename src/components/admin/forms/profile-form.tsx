"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Path } from "react-hook-form";
import { saveProfile } from "@/actions/profiles";
import { FormField } from "@/components/admin/form-field";
import { FormSummary, SaveButtons, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema, type ProfileInput, type ProfileValues } from "@/lib/validation/profile";
import type { VillageProfile } from "@/types/db";

const LIST = "/admin/profil";
const LONG_FIELDS = [
  { name: "description", label: "Deskripsi" },
  { name: "history", label: "Sejarah" },
  { name: "vision", label: "Visi" },
  { name: "mission", label: "Misi", hint: "Satu poin per baris." },
  { name: "geography", label: "Kondisi geografis" },
  { name: "facilities", label: "Fasilitas umum", hint: "Satu fasilitas per baris." },
] as const;

export function ProfileForm({ initial }: { initial?: VillageProfile }) {
  const form = useForm<ProfileInput, unknown, ProfileValues>({
    resolver: zodResolver(profileSchema),
    shouldFocusError: true,
    defaultValues: {
      village_name: initial?.village_name ?? "",
      description: initial?.description ?? "",
      history: initial?.history ?? "",
      vision: initial?.vision ?? "",
      mission: initial?.mission ?? "",
      geography: initial?.geography ?? "",
      facilities: initial?.facilities ?? "",
      hero_image_url: initial?.hero_image_url ?? null,
      status: initial?.status ?? "draft",
    },
  });
  const { summary, submit } = useAdminSubmit(form, saveProfile, { id: initial?.id, listHref: LIST });
  const err = (name: Path<ProfileInput>) => form.getFieldState(name, form.formState).error?.message;
  const save = (status: "draft" | "published") => {
    form.setValue("status", status);
    void submit();
  };

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
      <FormSummary message={summary} />
      <FormField id="village_name" label="Nama desa" required error={err("village_name")}>
        {(p) => <Input {...p} className="h-11" {...form.register("village_name")} />}
      </FormField>
      {LONG_FIELDS.map((f) => (
        <FormField key={f.name} id={f.name} label={f.label} description={"hint" in f ? f.hint : undefined} error={err(f.name)}>
          {(p) => <Textarea {...p} rows={6} {...form.register(f.name)} />}
        </FormField>
      ))}
      <Controller
        control={form.control}
        name="hero_image_url"
        render={({ field, fieldState }) => (
          <ImageUploadField
            id="hero_image_url"
            label="Foto profil desa"
            module="profile"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <SaveButtons pending={form.formState.isSubmitting} onSave={save} cancelHref={LIST} />
    </form>
  );
}
