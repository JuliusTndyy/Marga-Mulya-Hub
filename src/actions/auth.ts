"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/result";
import { safeNext } from "@/lib/safe-next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

const NO_ACCESS = "Akun ini tidak memiliki akses admin.";

// Design D7. Returns a message on failure; redirects on success.
export async function signIn(values: unknown, next: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Periksa kembali isian formulir." };

  const sb = await createSupabaseServerClient();
  if (!sb) return { ok: false, message: "Supabase belum dikonfigurasi. Isi variabel lingkungan sesuai README." };

  const { data, error } = await sb.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    console.warn("[auth] sign-in failed", error?.code ?? error?.status ?? "unknown"); // never the email
    return { ok: false, message: "Email atau kata sandi salah." };
  }

  const { data: row, error: adminError } = await sb
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (adminError || !row) {
    if (adminError) console.error("[auth] admin lookup failed", adminError.code);
    console.warn("[auth] non-admin sign-in", data.user.id);
    // Directly on the same client: the signOut action ends in redirect() and would throw here.
    await sb.auth.signOut();
    return { ok: false, message: NO_ACCESS };
  }

  redirect(safeNext(next));
}

export async function signOut(): Promise<void> {
  const sb = await createSupabaseServerClient();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.error("[auth] sign-out failed", e instanceof Error ? e.message : e);
    }
  }
  redirect("/admin/login");
}
