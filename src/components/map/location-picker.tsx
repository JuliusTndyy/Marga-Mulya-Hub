"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationPickerProps {
  legend?: string;
}

// Numeric latitude/longitude inputs plus "Hapus titik" (plan decision 2 and scope S1: no map).
// Must be inside a FormProvider whose values include `latitude` and `longitude`.
export function LocationPicker({ legend = "Titik lokasi" }: LocationPickerProps) {
  const { register, setValue, getFieldState, formState } = useFormContext();
  const latErr = getFieldState("latitude", formState).error?.message;
  const lngErr = getFieldState("longitude", formState).error?.message;

  return (
    <fieldset className="grid gap-3 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      <p id="location-help" className="text-sm text-muted-foreground">
        Isi lintang dan bujur bersamaan (contoh: -6.2 dan 106.8), atau kosongkan keduanya.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="latitude">Lintang (latitude)</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            inputMode="decimal"
            className="h-11"
            aria-invalid={latErr ? true : undefined}
            aria-describedby={["location-help", latErr ? "latitude-error" : ""].filter(Boolean).join(" ")}
            {...register("latitude")}
          />
          {latErr ? <p id="latitude-error" className="text-sm text-destructive">{latErr}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="longitude">Bujur (longitude)</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            inputMode="decimal"
            className="h-11"
            aria-invalid={lngErr ? true : undefined}
            aria-describedby={["location-help", lngErr ? "longitude-error" : ""].filter(Boolean).join(" ")}
            {...register("longitude")}
          />
          {lngErr ? <p id="longitude-error" className="text-sm text-destructive">{lngErr}</p> : null}
        </div>
      </div>
      <div>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            setValue("latitude", "", { shouldDirty: true });
            setValue("longitude", "", { shouldDirty: true });
          }}
        >
          Hapus titik
        </Button>
      </div>
    </fieldset>
  );
}
