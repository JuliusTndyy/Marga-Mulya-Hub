"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Path } from "react-hook-form";
import { saveOfficial } from "@/actions/officials";
import { FormField } from "@/components/admin/form-field";
import { FormSummary, SaveButtons, useAdminSubmit } from "@/components/admin/form-helpers";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { officialSchema, type OfficialInput, type OfficialValues } from "@/lib/validation/official";
import type { Official } from "@/types/db";

const LIST = "/admin/perangkat";

export function OfficialForm({ initial }: { initial?: Official }) {
  const form = useForm<OfficialInput, unknown, OfficialValues>({
    resolver: zodResolver(officialSchema),
    shouldFocusError: true,
    defaultValues: {
      name: initial?.name ?? "",
      position: initial?.position ?? "",
      photo_url: initial?.photo_url ?? null,
      display_order: String(initial?.display_order ?? 0),
      status: initial?.status ?? "draft",
    },
  });
  const { summary, submit } = useAdminSubmit(form, saveOfficial, { id: initial?.id, listHref: LIST });
  const err = (name: Path<OfficialInput>) => form.getFieldState(name, form.formState).error?.message;
  const save = (status: "draft" | "published") => {
    form.setValue("status", status);
    void submit();
  };

  return (
    <form onSubmit={submit} noValidate className="grid max-w-3xl gap-5">
      <FormSummary message={summary} />
      <FormField id="name" label="Nama" required error={err("name")}>
        {(p) => <Input {...p} className="h-11" {...form.register("name")} />}
      </FormField>
      <FormField id="position" label="Jabatan" required error={err("position")}>
        {(p) => <Input {...p} className="h-11" {...form.register("position")} />}
      </FormField>
      <FormField id="display_order" label="Urutan tampil" required description="Angka kecil tampil lebih dulu." error={err("display_order")}>
        {(p) => <Input {...p} type="number" step={1} inputMode="numeric" className="h-11 max-w-40" {...form.register("display_order")} />}
      </FormField>
      <Controller
        control={form.control}
        name="photo_url"
        render={({ field, fieldState }) => (
          <ImageUploadField
            id="photo_url"
            label="Foto"
            module="officials"
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
