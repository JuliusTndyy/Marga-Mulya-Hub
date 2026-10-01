// Read-layer and action result contracts (design D6) plus the DB error mapper (design D18).

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "unconfigured" | "error" };

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

/** Minimal shape of a PostgREST / Postgres error. */
export interface DbErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
}

export interface MapDbErrorOptions {
  /** Statistics: a unique violation means (category, indicator, year) already exists. */
  statistics?: boolean;
}

const FORM_INVALID = "Periksa kembali isian formulir.";

/**
 * Maps a DB error to a user-facing ActionResult. Logs follow the D18 table and never contain PII
 * (only the function name, error code and, for CHECK violations, the constraint name).
 */
export function mapDbError(
  fn: string,
  error: DbErrorLike,
  opts: MapDbErrorOptions = {},
): { ok: false; message: string; fieldErrors?: Record<string, string[]> } {
  const code = error.code ?? "";
  switch (code) {
    case "23505":
      if (opts.statistics) {
        const msg = "Indikator untuk tahun ini sudah ada.";
        return { ok: false, message: msg, fieldErrors: { indicator: [msg], year: [msg] } };
      }
      return { ok: false, message: "Slug sudah digunakan.", fieldErrors: { slug: ["Slug sudah digunakan."] } };
    case "42501":
      console.warn(`[action:${fn}]`, code);
      return { ok: false, message: "Anda tidak memiliki izin untuk tindakan ini." };
    case "PGRST116":
      return { ok: false, message: "Data tidak ditemukan." };
    case "23514":
      console.warn(`[action:${fn}]`, code, constraintName(error));
      return { ok: false, message: FORM_INVALID };
    case "22007":
    case "22008":
      console.warn(`[action:${fn}]`, code);
      return { ok: false, message: FORM_INVALID };
    default:
      console.error(`[action:${fn}]`, code || "unknown");
      return { ok: false, message: "Gagal menyimpan data." };
  }
}

function constraintName(error: DbErrorLike): string {
  // Postgres message: 'new row for relation "x" violates check constraint "x_y_check"'
  const m = /constraint "([^"]+)"/.exec(error.message ?? "");
  return m?.[1] ?? "unknown";
}
