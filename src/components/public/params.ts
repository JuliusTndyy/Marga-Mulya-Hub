/** Hand-typed page search params (design D4: never the generated PageProps<>). */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** First value of a search param, trimmed; "" when absent. */
export function param(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

/** Case- and diacritic-insensitive comparison key. */
export function fold(s: string): string {
  return s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}
