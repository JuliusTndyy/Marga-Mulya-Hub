import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/env";

// Session refresh for the /admin proxy (design D6/D7), following the @supabase/ssr pattern.
// Callers must check isSupabaseConfigured() first; without env this returns a plain pass-through.
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request });
  const env = getPublicSupabaseEnv();
  if (!env) return { response, user: null };

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { response, user };
}
