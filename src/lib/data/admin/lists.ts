import { PAGE_SIZE } from "@/lib/config";
import type { DataResult } from "@/lib/result";
import { normalizeSearchTerm } from "@/lib/search-term";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ADMIN read layer (cookie client), design D18 generic list.

export type AdminTable =
  | "village_profiles"
  | "officials"
  | "village_statistics"
  | "potentials"
  | "information_posts"
  | "gallery_items"
  | "contact_messages"
  | "citizen_submissions";

export interface ListRowsOptions {
  q?: string;
  searchColumns: string[];
  /** Equality filters, e.g. [{ column: "status", value: "draft" }]. */
  filters?: { column: string; value: string | number | boolean }[];
  page?: number;
  pageSize?: number;
  order?: { column: string; ascending?: boolean }[];
  columns?: string;
}

export async function listRows<T>(
  table: AdminTable,
  opts: ListRowsOptions,
): Promise<DataResult<{ rows: T[]; total: number }>> {
  const sb = await createSupabaseServerClient();
  if (!sb) return { ok: false, reason: "unconfigured" };
  const pageSize = opts.pageSize ?? PAGE_SIZE.admin;
  const page = Math.max(1, opts.page ?? 1);
  try {
    let query = sb.from(table).select(opts.columns ?? "*", { count: "exact" });
    for (const f of opts.filters ?? []) query = query.eq(f.column, f.value);
    const t = normalizeSearchTerm(opts.q ?? "");
    if (t && opts.searchColumns.length === 1) {
      query = query.ilike(opts.searchColumns[0]!, `%${t}%`);
    } else if (t && opts.searchColumns.length > 1) {
      query = query.or(opts.searchColumns.map((c) => `${c}.ilike.*${t}*`).join(","));
    }
    for (const o of opts.order ?? [{ column: "updated_at", ascending: false }]) {
      query = query.order(o.column, { ascending: o.ascending ?? false });
    }
    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .range(from, from + pageSize - 1)
      .overrideTypes<T[], { merge: false }>();
    if (error) {
      console.error(`[data:admin:listRows:${table}]`, error.code, error.message);
      return { ok: false, reason: "error" };
    }
    return { ok: true, data: { rows: data ?? [], total: count ?? 0 } };
  } catch (e) {
    console.error(`[data:admin:listRows:${table}]`, e instanceof Error ? e.message : e);
    return { ok: false, reason: "error" };
  }
}

/** First value of a search param. */
export function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Common list params: q, status (semua|...), halaman. */
export function parseListParams(
  sp: Record<string, string | string[] | undefined>,
  allowedStatuses: readonly string[],
  defaultStatus = "semua",
): { q: string; status: string; page: number } {
  const q = (firstParam(sp.q) ?? "").slice(0, 200);
  const rawStatus = firstParam(sp.status) ?? defaultStatus;
  const status = rawStatus === "semua" || allowedStatuses.includes(rawStatus) ? rawStatus : defaultStatus;
  const n = Number(firstParam(sp.halaman));
  const page = Number.isInteger(n) && n > 0 ? n : 1;
  return { q, status, page };
}
