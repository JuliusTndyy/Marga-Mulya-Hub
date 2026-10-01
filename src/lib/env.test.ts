import { afterEach, describe, expect, it, vi } from "vitest";
import { getPhotoUploadEnabled, getPublicSupabaseEnv, getSiteUrl, isSupabaseConfigured } from "@/lib/env";

function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPublicSupabaseEnv", () => {
  it("returns null when the URL or key is missing", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: undefined, NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" });
    expect(getPublicSupabaseEnv()).toBeNull();
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" });
    expect(getPublicSupabaseEnv()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns null for an invalid URL", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" });
    expect(getPublicSupabaseEnv()).toBeNull();
  });

  it("normalizes trailing slashes and trims", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: " https://x.supabase.co// ", NEXT_PUBLIC_SUPABASE_ANON_KEY: " k " });
    expect(getPublicSupabaseEnv()).toEqual({ url: "https://x.supabase.co", anonKey: "k" });
    expect(isSupabaseConfigured()).toBe(true);
  });
});

describe("getPhotoUploadEnabled", () => {
  it("is true only with public env and the service key", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k",
      SUPABASE_SERVICE_ROLE_KEY: undefined });
    expect(getPhotoUploadEnabled()).toBe(false);
    setEnv({ SUPABASE_SERVICE_ROLE_KEY: "  " });
    expect(getPhotoUploadEnabled()).toBe(false);
    setEnv({ SUPABASE_SERVICE_ROLE_KEY: "s" });
    expect(getPhotoUploadEnabled()).toBe(true);
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: undefined });
    expect(getPhotoUploadEnabled()).toBe(false);
  });
});

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL without trailing slash", () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: "https://contoh.example/", VERCEL_PROJECT_PRODUCTION_URL: "v.vercel.app" });
    expect(getSiteUrl()).toBe("https://contoh.example");
  });
  it("falls back to the Vercel production URL, then localhost", () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL_PROJECT_PRODUCTION_URL: "v.vercel.app" });
    expect(getSiteUrl()).toBe("https://v.vercel.app");
    setEnv({ VERCEL_PROJECT_PRODUCTION_URL: undefined });
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
