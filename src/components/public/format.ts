// Display helpers shared by public components.

const numberFormat = new Intl.NumberFormat("id-ID");

/** Postgres numeric arrives as a string: convert and format with id-ID grouping. */
export function formatNilai(value: number | string): string {
  const n = Number(value);
  return Number.isFinite(n) ? numberFormat.format(n) : String(value);
}

/** "HH:MM:SS" (DB time) → "HH:mm WIB". */
export function formatJam(time: string | null | undefined): string | null {
  return time ? `${time.slice(0, 5)} WIB` : null;
}

/** "-6.123456, 106.123456" from numeric coordinates. */
export function formatKoordinat(lat: number | string, lng: number | string): string {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}
