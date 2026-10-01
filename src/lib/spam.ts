import { SPAM_MIN_FILL_MS } from "@/lib/config";

// Spam helpers (design D17 verbatim). Pure apart from issueFormTimestamp.
export const issueFormTimestamp = (): number => Date.now();          // called only by the /kontak Server Component
export function isTooFast(startedAt: unknown, now: number): boolean {
  const t = typeof startedAt === "string" && startedAt.trim() !== "" ? Number(startedAt) : NaN;
  return !Number.isFinite(t) || now - t < SPAM_MIN_FILL_MS;           // missing / NaN / too fast → spam
}
export const isHoneypotFilled = (v: unknown) => typeof v === "string" && v.trim() !== "";
