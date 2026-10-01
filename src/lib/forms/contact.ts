import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/lib/result";
import { isHoneypotFilled, isTooFast } from "@/lib/spam";
import { contactSchema } from "@/lib/validation/public-forms";

// Framework-free contact handler (design D17, steps 1–3 then insert). Unit tested with fakes.

export interface ContactDeps {
  /** Public (anon, cookie-less) client, or null when unconfigured. */
  publicClient: Pick<SupabaseClient, "from"> | null;
  now: number;
}

export const CONTACT_SUCCESS = "Terima kasih! Pesan Anda telah terkirim.";

export async function handleContactMessage(fd: FormData, deps: ContactDeps): Promise<ActionResult> {
  // 1. Spam: silent fake success, no DB access.
  if (isHoneypotFilled(fd.get("website"))) {
    console.info("[spam] honeypot");
    return { ok: true, message: CONTACT_SUCCESS };
  }
  if (isTooFast(fd.get("started_at"), deps.now)) {
    console.info("[spam] too fast");
    return { ok: true, message: CONTACT_SUCCESS };
  }

  // 2. Unconfigured.
  if (deps.publicClient === null) {
    console.warn("[form:contact] unconfigured");
    return { ok: false, message: "Layanan formulir belum tersedia." };
  }

  // 3. Text fields.
  const raw = Object.fromEntries(
    [...fd.entries()].filter(([k, v]) => typeof v === "string" && k !== "website" && k !== "started_at"),
  );
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, message: "Periksa kembali isian formulir.", fieldErrors };
  }

  // Insert without .select() (anon can't read contact_messages) and without status (DB default 'unread').
  try {
    const { error } = await deps.publicClient.from("contact_messages").insert(parsed.data);
    if (error) {
      console.error("[form:contact] insert failed", error.code); // code only, no PII
      return { ok: false, message: "Gagal mengirim. Silakan coba lagi." };
    }
  } catch (e) {
    console.error("[form:contact] insert threw", e instanceof Error ? e.name : "unknown");
    return { ok: false, message: "Gagal mengirim. Silakan coba lagi." };
  }
  return { ok: true, message: CONTACT_SUCCESS };
}
