"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField } from "@/components/admin/form-field";
import { Textarea } from "@/components/ui/textarea";

interface RichTextFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  rows?: number;
}

// Plain labelled Textarea (plan scope simplification S6: no toolbar). The server action
// sanitizes the content with the allowlist in lib/sanitize.ts; text without tags becomes paragraphs.
export function RichTextField({ id, label, registration, error, required, rows = 12 }: RichTextFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      required={required}
      error={error}
      description="Teks tanpa tag otomatis dijadikan paragraf."
    >
      {(p) => <Textarea {...p} rows={rows} className="font-mono text-sm" {...registration} />}
    </FormField>
  );
}
