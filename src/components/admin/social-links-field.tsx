"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { selectClassName } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/lib/config";

const MAX = 8;
const PLATFORM_LABELS: Record<(typeof SOCIAL_PLATFORMS)[number], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  website: "Situs web",
};

// Repeatable platform + https URL rows (design D18), at most 8. Must be inside a FormProvider
// whose values include `social_links`.
export function SocialLinksField() {
  const { control, register, getFieldState, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "social_links" });
  const listError = getFieldState("social_links", formState).error;

  return (
    <fieldset className="grid gap-3 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">Media sosial</legend>
      {fields.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada tautan.</p> : null}
      {fields.map((field, i) => {
        const platformErr = getFieldState(`social_links.${i}.platform`, formState).error?.message;
        const urlErr = getFieldState(`social_links.${i}.url`, formState).error?.message;
        return (
          <div key={field.id} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`social-${i}-platform`}>Platform {i + 1}</Label>
              <select
                id={`social-${i}-platform`}
                className={selectClassName}
                aria-invalid={platformErr ? true : undefined}
                aria-describedby={platformErr ? `social-${i}-platform-error` : undefined}
                {...register(`social_links.${i}.platform`)}
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
              {platformErr ? (
                <p id={`social-${i}-platform-error`} className="text-sm text-destructive">{platformErr}</p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`social-${i}-url`}>URL {i + 1}</Label>
              <Input
                id={`social-${i}-url`}
                type="url"
                inputMode="url"
                placeholder="https://"
                className="h-11"
                aria-invalid={urlErr ? true : undefined}
                aria-describedby={urlErr ? `social-${i}-url-error` : undefined}
                {...register(`social_links.${i}.url`)}
              />
              {urlErr ? <p id={`social-${i}-url-error`} className="text-sm text-destructive">{urlErr}</p> : null}
            </div>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => remove(i)}>
              Hapus<span className="sr-only"> tautan {i + 1}</span>
            </Button>
          </div>
        );
      })}
      {listError?.message ? <p className="text-sm text-destructive">{listError.message}</p> : null}
      <div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={fields.length >= MAX}
          onClick={() => append({ platform: "website", url: "" })}
        >
          Tambah tautan
        </Button>
        <p className="mt-1 text-sm text-muted-foreground">Maksimal {MAX} tautan, diawali https://.</p>
      </div>
    </fieldset>
  );
}
