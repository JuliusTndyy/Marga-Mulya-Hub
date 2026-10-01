import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

// Browser client, used only by the admin image upload field. NEXT_PUBLIC_* values are inlined
// at build time, so a build without them yields null and the field disables itself (design D6).
let client: SupabaseClient | null | undefined;

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const env = getPublicSupabaseEnv();
  client = env ? createBrowserClient(env.url, env.anonKey) : null;
  return client;
}
