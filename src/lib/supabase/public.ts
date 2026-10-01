import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

// The ONLY client for public reads, /api/search, sitemap, generateMetadata and public form inserts.
// It never reads or writes cookies, so it always runs as `anon` (design D6).
let client: SupabaseClient | null | undefined;

export function getPublicSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const env = getPublicSupabaseEnv();
  client = env
    ? createClient(env.url, env.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;
  return client;
}
