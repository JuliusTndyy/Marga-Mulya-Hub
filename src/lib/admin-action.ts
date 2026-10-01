import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { mapDbError, type ActionResult } from "@/lib/result";
import { removeMediaObject } from "@/lib/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { idSchema } from "@/lib/validation/common";

// Shared pieces of the D18 server action template. Used only by "use server" modules in src/actions.

export type Fail = { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export const SESSION_EXPIRED: Fail = { ok: false, message: "Sesi berakhir. Silakan masuk kembali." };
export const NOT_FOUND: Fail = { ok: false, message: "Data tidak ditemukan." };

/** Cookie client for a signed-in admin, or null (caller returns SESSION_EXPIRED). */
export async function adminClient(): Promise<SupabaseClient | null> {
  const admin = await getAdmin();
  if (!admin) return null;
  return createSupabaseServerClient();
}

/** Validated uuid, or null. */
export function parseId(id: unknown): string | null {
  const p = idSchema.safeParse(id);
  return p.success ? p.data : null;
}

export function invalidForm(error: z.ZodError): Fail {
  return {
    ok: false,
    message: "Periksa kembali isian formulir.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

/** Update a single row by id (status toggles). Returns the selected columns of the updated row. */
export async function updateRowById(
  fn: string,
  table: string,
  idRaw: unknown,
  values: Record<string, unknown>,
  select = "id",
): Promise<ActionResult<Record<string, unknown>>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  const id = parseId(idRaw);
  if (!id) return NOT_FOUND;
  const { data, error } = await sb.from(table).update(values).eq("id", id).select(select).maybeSingle<Record<string, unknown>>();
  if (error) return mapDbError(fn, error);
  if (!data) return NOT_FOUND;
  return { ok: true, message: "Status berhasil diperbarui.", data };
}

/** Delete a row by id; optionally removes the media object referenced by `imageColumn` (best effort). */
export async function deleteRowById(
  fn: string,
  table: string,
  idRaw: unknown,
  opts: { imageColumn?: string; select?: string } = {},
): Promise<ActionResult<Record<string, unknown>>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  const id = parseId(idRaw);
  if (!id) return NOT_FOUND;
  const columns = [opts.select ?? "id", opts.imageColumn].filter(Boolean).join(", ");
  const { data, error } = await sb.from(table).delete().eq("id", id).select(columns).maybeSingle<Record<string, unknown>>();
  if (error) return mapDbError(fn, error);
  if (!data) return NOT_FOUND;
  const url = opts.imageColumn ? data[opts.imageColumn] : null;
  if (typeof url === "string" && url) await removeMediaObject(sb, url);
  return { ok: true, message: "Data berhasil dihapus.", data };
}

/**
 * Insert (no id) or update (id) for modules without slugs or rich text, following the D18 template:
 * admin guard → idSchema → safeParse → write → mapDbError → old image cleanup when the URL changed.
 */
export async function saveRecord<T extends Record<string, unknown>>(opts: {
  fn: string;
  table: string;
  schema: z.ZodType<T>;
  input: unknown;
  id: unknown;
  imageColumn?: string;
  statistics?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  let rowId: string | undefined;
  if (opts.id !== undefined && opts.id !== null) {
    rowId = parseId(opts.id) ?? undefined;
    if (!rowId) return NOT_FOUND;
  }
  const parsed = opts.schema.safeParse(opts.input);
  if (!parsed.success) return invalidForm(parsed.error);

  let prevImage: string | null = null;
  if (rowId) {
    const { data: prev, error } = await sb
      .from(opts.table)
      .select(opts.imageColumn ?? "id")
      .eq("id", rowId)
      .maybeSingle<Record<string, unknown>>();
    if (error) return mapDbError(opts.fn, error);
    if (!prev) return NOT_FOUND;
    const v = opts.imageColumn ? prev[opts.imageColumn] : null;
    prevImage = typeof v === "string" ? v : null;
  }

  const values: Record<string, unknown> = parsed.data;
  const { data, error } = rowId
    ? await sb.from(opts.table).update(values).eq("id", rowId).select("id").single<{ id: string }>()
    : await sb.from(opts.table).insert(values).select("id").single<{ id: string }>();
  if (error) return mapDbError(opts.fn, error, { statistics: opts.statistics });
  if (opts.imageColumn && prevImage && prevImage !== values[opts.imageColumn]) await removeMediaObject(sb, prevImage);
  return { ok: true, message: "Data berhasil disimpan.", data: { id: data.id } };
}

/** Strip row data before returning to the client. */
export function plain(res: ActionResult<unknown>, message?: string): ActionResult {
  return res.ok ? { ok: true, message: message ?? res.message } : res;
}
