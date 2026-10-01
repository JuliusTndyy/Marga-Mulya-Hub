import { afterEach, describe, expect, it, vi } from "vitest";
import { mediaPathFromUrl, mediaPublicPrefix, sniffImageType } from "@/lib/storage";

afterEach(() => {
  vi.unstubAllEnvs();
});

const bytes = (...b: number[]) => new Uint8Array([...b, ...Array(12).fill(0)].slice(0, Math.max(12, b.length)));

describe("sniffImageType", () => {
  it("detects JPEG, PNG and WEBP", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe("webp");
  });
  it("rejects GIF and garbage", () => {
    expect(sniffImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBeNull();
    expect(sniffImageType(bytes(1, 2, 3))).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });
});

describe("mediaPathFromUrl", () => {
  it("returns null when unconfigured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(mediaPublicPrefix()).toBeNull();
    expect(mediaPathFromUrl("https://x.supabase.co/storage/v1/object/public/media/a.jpg")).toBeNull();
  });
  it("strips the prefix with and without a trailing-slash env", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "k");
    for (const url of ["https://x.supabase.co", "https://x.supabase.co/"]) {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      expect(mediaPublicPrefix()).toBe("https://x.supabase.co/storage/v1/object/public/media/");
      expect(mediaPathFromUrl("https://x.supabase.co/storage/v1/object/public/media/potentials/a.jpg"))
        .toBe("potentials/a.jpg");
    }
  });
  it("rejects foreign URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "k");
    expect(mediaPathFromUrl("https://evil.example/media/a.jpg")).toBeNull();
  });
});
