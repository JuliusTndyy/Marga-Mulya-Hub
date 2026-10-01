import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postSchema } from "./post";

const PREFIX = "https://abc.supabase.co/storage/v1/object/public/media/";

const base = {
  type: "news",
  title: "Judul Contoh",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: null,
  event_date: "",
  event_time: "",
  location: "",
  organizer: "",
  priority: "0",
  start_date: "",
  end_date: "",
  status: "draft",
};

function issuePaths(input: unknown) {
  const r = postSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

describe("postSchema", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("turns blank optional fields into null", () => {
    const r = postSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toMatchObject({
      slug: null, excerpt: null, content: null, cover_image_url: null, event_date: null, event_time: null,
      location: null, organizer: null, start_date: null, end_date: null, priority: 0,
    });
  });

  it("announcement: end date must not be before start date", () => {
    const ann = { ...base, type: "announcement" };
    expect(issuePaths({ ...ann, start_date: "2025-03-10", end_date: "2025-03-09" })).toEqual([
      { path: "end_date", message: "Tanggal selesai harus setelah tanggal mulai." },
    ]);
    expect(postSchema.safeParse({ ...ann, start_date: "2025-03-10", end_date: "2025-03-10" }).success).toBe(true);
    expect(postSchema.safeParse({ ...ann, start_date: "2025-03-10", end_date: "" }).success).toBe(true);
  });

  it("event: requires a valid date and a minute-precision time", () => {
    const ev = { ...base, type: "event" };
    expect(issuePaths(ev)).toEqual([{ path: "event_date", message: "Tanggal agenda wajib diisi." }]);
    expect(issuePaths({ ...ev, event_date: "2025-02-31" }).map((i) => i.path)).toContain("event_date");
    expect(issuePaths({ ...ev, event_date: "2025-06-14", event_time: "25:99" }).map((i) => i.path)).toContain("event_time");
    const ok = postSchema.safeParse({ ...ev, event_date: "2025-06-14", event_time: "08:00", location: "Balai" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data).toMatchObject({ event_date: "2025-06-14", event_time: "08:00", location: "Balai" });
  });

  it("forces fields that don't apply to the type to null", () => {
    const r = postSchema.safeParse({
      ...base, type: "news", event_date: "2025-06-14", event_time: "08:00", location: "X", organizer: "Y",
      start_date: "2025-01-01", end_date: "2025-01-02", priority: "2",
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toMatchObject({
      event_date: null, event_time: null, location: null, organizer: null, start_date: null, end_date: null, priority: 0,
    });
  });

  it("keeps announcement priority and dates", () => {
    const r = postSchema.safeParse({ ...base, type: "announcement", priority: "2", start_date: "2025-01-01", end_date: "2025-01-31" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ priority: 2, start_date: "2025-01-01", end_date: "2025-01-31" });
  });

  it("checks the cover image prefix", () => {
    expect(postSchema.safeParse({ ...base, cover_image_url: `${PREFIX}posts/a.webp` }).success).toBe(true);
    expect(postSchema.safeParse({ ...base, cover_image_url: "https://evil.example/a.webp" }).success).toBe(false);
  });

  it("is idempotent on its own output (client sends parsed values, server re-parses)", () => {
    const first = postSchema.parse({ ...base, type: "event", event_date: "2025-06-14", event_time: "08:00" });
    expect(postSchema.parse(first)).toEqual(first);
  });
});
