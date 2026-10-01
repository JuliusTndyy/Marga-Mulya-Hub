const MAX_TERM = 100;

/**
 * Keeps only Unicode letters, digits, spaces and hyphens (removing the PostgREST filter
 * metacharacters , ( ) . * % : " \), collapses whitespace and caps at 100 characters.
 * Returns "" when fewer than 2 meaningful (letter/digit) characters remain (design D14/D15).
 */
export function normalizeSearchTerm(q: string): string {
  const t = q
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TERM)
    .trim();
  const meaningful = t.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  return meaningful < 2 ? "" : t;
}
