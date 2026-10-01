"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "@/actions/auth";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

interface LoginFormProps {
  next?: string;
  disabled?: boolean;
}

export function LoginForm({ next, disabled = false }: LoginFormProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    shouldFocusError: true,
  });
  const { errors, isSubmitting } = form.formState;

  const onValid = async (values: LoginValues) => {
    setSummary(null);
    try {
      // On success the action redirects, so a result only comes back on failure.
      const res = await signIn(values, next);
      if (res && !res.ok) setSummary(res.message);
    } catch (e) {
      // redirect() surfaces as a thrown NEXT_REDIRECT; let Next handle it.
      if (e instanceof Error && "digest" in e && String((e as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")) throw e;
      setSummary("Gagal masuk. Silakan coba lagi.");
    }
  };
  const onInvalid = () => setSummary("Periksa kembali isian formulir.");

  return (
    <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="grid gap-4">
      {summary ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {summary}
        </div>
      ) : null}
      <fieldset disabled={disabled || isSubmitting} className="grid gap-4">
        <FormField id="email" label="Email" required error={errors.email?.message}>
          {(p) => <Input {...p} type="email" autoComplete="email" className="h-11" {...form.register("email")} />}
        </FormField>
        <FormField id="password" label="Kata sandi" required error={errors.password?.message}>
          {(p) => (
            <Input {...p} type="password" autoComplete="current-password" className="h-11" {...form.register("password")} />
          )}
        </FormField>
        <Button type="submit" className="h-11">
          {isSubmitting ? "Memproses…" : "Masuk"}
        </Button>
      </fieldset>
    </form>
  );
}
