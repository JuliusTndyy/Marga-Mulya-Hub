"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { submitContactMessage } from "@/actions/public-forms";
import { FormField } from "@/components/admin/form-field";
import { ServiceNotice } from "@/components/public/service-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toFormData } from "@/lib/forms/to-form-data";
import { contactSchema } from "@/lib/validation/public-forms";
import { Honeypot } from "./honeypot";

// The shared schema plus the two spam fields, which the client passes through unvalidated
// (the server decides; design D17).
const clientSchema = contactSchema.extend({
  website: z.string().optional(),
  started_at: z.string().optional(),
});
type Input = z.input<typeof clientSchema>;
type Output = z.output<typeof clientSchema>;

const FIELDS = ["name", "contact", "subject", "message"] as const;

interface ContactFormProps {
  /** Server-issued render timestamp (issueFormTimestamp in the /kontak Server Component). */
  renderedAt: number;
  disabled?: boolean;
}

export function ContactForm({ renderedAt, disabled = false }: ContactFormProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const defaultValues: Input = { name: "", contact: "", subject: "", message: "", website: "", started_at: String(renderedAt) };
  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(clientSchema),
    defaultValues,
    shouldFocusError: true,
  });
  const { register, formState } = form;
  const err = (name: Path<Input>) => form.getFieldState(name, formState).error?.message;

  const onValid = async (values: Output) => {
    setSummary(null);
    setSuccess(null);
    try {
      const res = await submitContactMessage(toFormData(values));
      if (res.ok) {
        setSuccess(res.message);
        toast.success(res.message);
        form.reset(defaultValues);
        return;
      }
      setSummary(res.message);
      for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
        if ((FIELDS as readonly string[]).includes(field) && msgs[0]) {
          form.setError(field as (typeof FIELDS)[number], { message: msgs[0] }, { shouldFocus: true });
        }
      }
    } catch {
      setSummary("Gagal mengirim. Silakan coba lagi.");
    }
  };
  const onInvalid = () => {
    setSuccess(null);
    setSummary("Periksa kembali isian formulir.");
  };

  return (
    <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="relative grid gap-4">
      {disabled ? <ServiceNotice /> : null}
      {summary ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {summary}
        </div>
      ) : null}
      <div role="status" aria-live="polite">
        {success ? (
          <p className="rounded-md border border-success/40 bg-success/10 p-3 text-sm font-medium text-success">{success}</p>
        ) : null}
      </div>
      <fieldset disabled={disabled || formState.isSubmitting} className="grid gap-4 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Nama" required error={err("name")}>
            {(p) => <Input {...p} autoComplete="name" className="h-11" {...register("name")} />}
          </FormField>
          <FormField id="contact" label="Email atau nomor telepon" required error={err("contact")}>
            {(p) => <Input {...p} autoComplete="email" className="h-11" {...register("contact")} />}
          </FormField>
        </div>
        <FormField id="subject" label="Subjek" required error={err("subject")}>
          {(p) => <Input {...p} className="h-11" {...register("subject")} />}
        </FormField>
        <FormField id="message" label="Pesan" required error={err("message")}>
          {(p) => <Textarea {...p} rows={6} {...register("message")} />}
        </FormField>
        <Honeypot registration={register("website")} />
        <input type="hidden" {...register("started_at")} />
        <Button type="submit" className="min-h-11 w-full sm:w-fit sm:px-8">
          {formState.isSubmitting ? "Mengirim…" : "Kirim Pesan"}
        </Button>
      </fieldset>
    </form>
  );
}
