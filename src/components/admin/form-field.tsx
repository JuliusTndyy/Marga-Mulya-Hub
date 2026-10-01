import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
  /** Receives the id and ARIA wiring for the control. */
  children: (control: FieldControlProps) => ReactNode;
}

// Label + description + error wiring (design D13): errors render in <p id="{id}-error">,
// linked through aria-describedby and aria-invalid; required fields carry the text "(wajib)".
export function FormField({ id, label, required, description, error, className, children }: FormFieldProps) {
  const descId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="font-normal text-muted-foreground">(wajib)</span> : null}
      </Label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {description ? (
        <p id={descId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Native select styled like the shadcn Input (simple, keyboard and screen-reader friendly). */
export const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm";
