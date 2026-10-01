import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { potentialSchema } from "./potential";

const PREFIX = "https://abc.supabase.co/storage/v1/object/public/media/";

const base = {
  name: "Contoh Potensi",
  slug: "",
  category: "Lainnya",
  summary: "",
  description: "",
  image_url: null,
  owner_or_manager: "",
  address: "",
  latitude: "",
  longitude: "",
  contact: "",
  whatsapp: "",
  operating_hours: "",
  social_links: [],
  is_featured: false,
  status: "draft",
};

describe("potentialSchema", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co/");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("turns blank optional fields into null", () => {
    const r = potentialSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.slug).toBeNull();
    expect(r.data.summary).toBeNull();
    expect(r.data.description).toBeNull();
    expect(r.data.image_url).toBeNull();
    expect(r.data.latitude).toBeNull();
    expect(r.data.longitude).toBeNull();
    expect(r.data.whatsapp).toBeNull();
    expect(r.data.social_links).toEqual([]);
  });

  it("accepts a media URL under the bucket prefix and rejects other hosts", () => {
    expect(potentialSchema.safeParse({ ...base, image_url: `${PREFIX}potentials/x.jpg` }).success).toBe(true);
    const bad = potentialSchema.safeParse({ ...base, image_url: "https://example.com/x.jpg" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0]?.path).toEqual(["image_url"]);
  });

  it("rejects any image URL when Supabase is unconfigured", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(potentialSchema.safeParse({ ...base, image_url: `${PREFIX}potentials/x.jpg` }).success).toBe(false);
    expect(potentialSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(potentialSchema.safeParse({ ...base, category: "Tambang" }).success).toBe(false);
  });

  it("requires latitude and longitude together", () => {
    const r = potentialSchema.safeParse({ ...base, latitude: "-6.2" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["latitude"]);
    expect(potentialSchema.safeParse({ ...base, latitude: "-6.2", longitude: "106.8" }).success).toBe(true);
  });

  it("normalizes WhatsApp numbers and validates social links", () => {
    const r = potentialSchema.safeParse({
      ...base,
      whatsapp: "0812 3456 7890",
      social_links: [{ platform: "instagram", url: "https://instagram.com/contoh" }],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.whatsapp).toBe("6281234567890");
    expect(
      potentialSchema.safeParse({ ...base, social_links: [{ platform: "instagram", url: "http://x.test" }] }).success,
    ).toBe(false);
    const nine = Array.from({ length: 9 }, () => ({ platform: "website", url: "https://x.test" }));
    expect(potentialSchema.safeParse({ ...base, social_links: nine }).success).toBe(false);
  });

  it("caps rich text input at 50 000 characters", () => {
    expect(potentialSchema.safeParse({ ...base, description: "a".repeat(50_000) }).success).toBe(true);
    expect(potentialSchema.safeParse({ ...base, description: "a".repeat(50_001) }).success).toBe(false);
  });
});
