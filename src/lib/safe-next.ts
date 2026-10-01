// Open-redirect guard for the admin login flow (design D7, plan cross-chunk decision 8).
// Accepts only same-site paths under /admin that aren't protocol-relative and aren't the login
// page itself. Anything else falls back to the dashboard.

const DEFAULT = "/admin";

export function safeNext(next: unknown): string {
  const raw = Array.isArray(next) ? next[0] : next;
  if (typeof raw !== "string") return DEFAULT;
  const v = raw.trim();
  if (v === "" || v.startsWith("//") || v.includes("\\")) return DEFAULT;
  // "/admin" itself, or "/admin" followed by a path, query or hash (not "/administrator")
  if (!/^\/admin(?:[/?#]|$)/.test(v)) return DEFAULT;
  if (/^\/admin\/login(?:[/?#]|$)/.test(v)) return DEFAULT;
  return v;
}
