import type { DataResult } from "@/lib/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminTable } from "./lists";

/** One row by id with the cookie client. Missing row → `{ ok: true, data: null }`. */
export async function getRecordById<T>(
  table: AdminTable | "site_settings",
  id: string | number,
): Promise<DataResult<T | null>> {
  const sb = await createSupabaseServerClient();
  if (!sb) return { ok: false, reason: "unconfigured" };
  try {
    const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle<T>();
    if (error) {
      console.error(`[data:admin:getRecordById:${table}]`, error.code, error.message);
      return { ok: false, reason: "error" };
    }
    return { ok: true, data: data ?? null };
  } catch (e) {
    console.error(`[data:admin:getRecordById:${table}]`, e instanceof Error ? e.message : e);
    return { ok: false, reason: "error" };
  }
}

/** Distinct values of a text column (small admin vocabularies such as statistic categories). */
export async function getDistinctValues(
  table: AdminTable,
  column: string,
): Promise<DataResult<string[]>> {
  const sb = await createSupabaseServerClient();
  if (!sb) return { ok: false, reason: "unconfigured" };
  try {
    const { data, error } = await sb.from(table).select(column).order(column).limit(1000);
    if (error) {
      console.error(`[data:admin:getDistinctValues:${table}]`, error.code, error.message);
      return { ok: false, reason: "error" };
    }
    const values = (data as unknown as Record<string, unknown>[]).map((r) => String(r[column] ?? ""));
    return { ok: true, data: [...new Set(values.filter((v) => v !== ""))] };
  } catch (e) {
    console.error(`[data:admin:getDistinctValues:${table}]`, e instanceof Error ? e.message : e);
    return { ok: false, reason: "error" };
  }
}
