"use server";

import { handleContactMessage } from "@/lib/forms/contact";
import { handleContribution } from "@/lib/forms/contribution";
import type { ActionResult } from "@/lib/result";
import { getPublicSupabaseClient } from "@/lib/supabase/public";

// Public form actions (design D17). Inserts use the PUBLIC (anon, cookie-less) client only.

export async function submitContactMessage(fd: FormData): Promise<ActionResult> {
  return handleContactMessage(fd, { publicClient: getPublicSupabaseClient(), now: Date.now() });
}

// Text-only contribution (scope decision S4): no photo, so no service client.
export async function submitContribution(fd: FormData): Promise<ActionResult> {
  return handleContribution(fd, { publicClient: getPublicSupabaseClient(), now: Date.now() });
}
