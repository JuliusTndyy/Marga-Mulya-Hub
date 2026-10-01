import { SITE_TIMEZONE } from "@/lib/config";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date in the site time zone (WIB), as YYYY-MM-DD. */
export function todayInSiteTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

/** Date-only strings are calendar dates (no zone shift); timestamps are shown in WIB. */
function toDateAndZone(date: string | Date): { d: Date; timeZone: string } {
  if (typeof date === "string" && DATE_ONLY.test(date)) {
    return { d: new Date(`${date}T00:00:00Z`), timeZone: "UTC" };
  }
  return { d: typeof date === "string" ? new Date(date) : date, timeZone: SITE_TIMEZONE };
}

/** id-ID long date, e.g. "14 Juni 2025". */
export function formatTanggal(date: string | Date): string {
  const { d, timeZone } = toDateAndZone(date);
  return new Intl.DateTimeFormat("id-ID", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Admin lists: `dd MMM yyyy HH:mm` in id-ID, WIB, e.g. "02 Jan 2025 00:30". */
export function formatTanggalWaktu(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: SITE_TIMEZONE, day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} ${get("month").replace(/\.$/, "")} ${get("year")} ${get("hour")}:${get("minute")}`;
}

export type AnnouncementState = "active" | "expired" | "scheduled";
export function getAnnouncementState(
  p: { start_date: string | null; end_date: string | null }, today: string,
): AnnouncementState {
  if (p.start_date && p.start_date > today) return "scheduled";
  if (p.end_date && p.end_date < today) return "expired";
  return "active";                                  // inclusive end date
}
export const isAnnouncementActive = (
  p: { type: string; status: string; start_date: string | null; end_date: string | null }, today: string,
) => p.type === "announcement" && p.status === "published" && getAnnouncementState(p, today) === "active";
export const ANNOUNCEMENT_STATE_LABELS = { active: "Aktif", expired: "Berakhir", scheduled: "Akan datang" } as const;
