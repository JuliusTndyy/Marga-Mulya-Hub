import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/env";

// Cookie-bound client. Used ONLY by lib/auth.ts, lib/data/admin/*, admin pages and admin
// server actions (never by public pages). Returns null when env is missing (design D6).
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getPublicSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
        }
      },
    },
  });
}
