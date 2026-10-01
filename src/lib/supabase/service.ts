import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

// Service-role client: SERVER ONLY. Used solely for citizen photo uploads to the private
// "submissions" bucket (design D10). The key has no NEXT_PUBLIC_ prefix, so it never ships to the browser.
export function getServiceSupabaseClient(): SupabaseClient | null {
  const env = getPublicSupabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!env || !key) return null;
  return createClient(env.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
