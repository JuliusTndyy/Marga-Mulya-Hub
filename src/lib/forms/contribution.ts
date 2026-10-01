import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/lib/result";
import { isHoneypotFilled, isTooFast } from "@/lib/spam";
import { contributionTextSchema } from "@/lib/validation/public-forms";

// Framework-free contribution handler (design D17 fixed order, text only per scope decision S4:
// no photo upload, so no Storage access). Unit tested with fakes.

export interface ContributionDeps {
  /** Public (anon, cookie-less) client, or null when unconfigured. */
  publicClient: Pick<SupabaseClient, "from"> | null;
  now: number;
}

export const CONTRIBUTION_SUCCESS = "Terima kasih! Kontribusi Anda akan ditinjau oleh admin desa.";

export async function handleContribution(fd: FormData, deps: ContributionDeps): Promise<ActionResult> {
  // 1. Spam: silent fake success, no DB access.
  if (isHoneypotFilled(fd.get("website"))) {
    console.info("[spam] honeypot");
    return { ok: true, message: CONTRIBUTION_SUCCESS };
  }
  if (isTooFast(fd.get("started_at"), deps.now)) {
    console.info("[spam] too fast");
    return { ok: true, message: CONTRIBUTION_SUCCESS };
  }

  // 2. Unconfigured.
  if (deps.publicClient === null) {
    console.warn("[form:contribution] unconfigured");
    return { ok: false, message: "Layanan formulir belum tersedia." };
  }

  // 3. Text fields (missing keys parse as null through the optional helpers).
  const raw = Object.fromEntries(
    [...fd.entries()].filter(([k, v]) => typeof v === "string" && k !== "website" && k !== "started_at"),
  );
  const parsed = contributionTextSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, message: "Periksa kembali isian formulir.", fieldErrors };
  }

  // 4. Insert without .select() (anon can't read citizen_submissions). status/admin fields are omitted:
  // the DB default is 'pending' and the anon insert policy forbids admin fields (D9).
  try {
    const { error } = await deps.publicClient.from("citizen_submissions").insert({ ...parsed.data, image_url: null });
    if (error) {
      console.error("[form:contribution] insert failed", error.code); // code only, no PII
      return { ok: false, message: "Gagal mengirim. Silakan coba lagi." };
    }
  } catch (e) {
    console.error("[form:contribution] insert threw", e instanceof Error ? e.name : "unknown");
    return { ok: false, message: "Gagal mengirim. Silakan coba lagi." };
  }
  return { ok: true, message: CONTRIBUTION_SUCCESS };
}
