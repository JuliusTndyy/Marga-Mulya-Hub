import type { SupabaseClient } from "@supabase/supabase-js";
import type { DataResult } from "@/lib/result";
import { getPublicSupabaseClient } from "@/lib/supabase/public";

// Shared runner for the PUBLIC read layer (design D6 contract): null client → "unconfigured";
// PostgREST error or thrown exception → log `[data:fn] code msg` and "error"; never throws.
// Only the cookie-less public client is used here, so every read runs as `anon`.

interface QueryResult<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  count?: number | null;
}

/**
 * Paged lists: PostgREST answers an offset past the last row with PGRST103 (416). Treat that as an
 * empty page instead of a server error, so a stale `?halaman=` shows the empty state.
 */
export async function emptyPastLastPage<T>(q: PromiseLike<QueryResult<T[]>>): Promise<QueryResult<T[]>> {
  const res = await q;
  return res.error?.code === "PGRST103" ? { data: [], error: null, count: 0 } : res;
}

export async function publicRead<T, R>(
  fn: string,
  build: (sb: SupabaseClient) => PromiseLike<QueryResult<T>>,
  map: (data: T | null, count: number | null) => R,
): Promise<DataResult<R>> {
  const sb = getPublicSupabaseClient();
  if (!sb) return { ok: false, reason: "unconfigured" };
  try {
    const { data, error, count } = await build(sb);
    if (error) {
      console.error(`[data:${fn}]`, error.code, error.message);
      return { ok: false, reason: "error" };
    }
    return { ok: true, data: map(data, count ?? null) };
  } catch (e) {
    console.error(`[data:${fn}]`, "exception", e instanceof Error ? e.message : String(e));
    return { ok: false, reason: "error" };
  }
}
