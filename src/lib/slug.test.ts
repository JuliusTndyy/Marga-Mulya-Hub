import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureUniqueSlug, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Kopi Gunung")).toBe("kopi-gunung");
  });
  it("strips diacritics and punctuation", () => {
    expect(slugify("Café  Désa, Ñ!")).toBe("cafe-desa-n");
    expect(slugify("--Halo...Dunia--")).toBe("halo-dunia");
  });
  it("cuts to 80 characters at a dash boundary", () => {
    const s = slugify(`${"abcdefghij ".repeat(10)}`);
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
    expect(s).toBe(Array(7).fill("abcdefghij").join("-"));
  });
  it("returns konten for empty input", () => {
    expect(slugify("")).toBe("konten");
    expect(slugify("!!!")).toBe("konten");
  });
  it("is idempotent on a valid slug", () => {
    expect(slugify("kopi-gunung")).toBe("kopi-gunung");
    expect(slugify(slugify("Kopi Gunung 2"))).toBe("kopi-gunung-2");
  });
});

function fakeClient(rows: { id: string; slug: string }[]): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        like: (_col: string, pattern: string) =>
          Promise.resolve({
            data: rows.filter((r) => r.slug.startsWith(pattern.replace(/%$/, ""))),
            error: null,
          }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("ensureUniqueSlug", () => {
  it("returns the base when free", async () => {
    expect(await ensureUniqueSlug(fakeClient([]), "potentials", "kopi")).toBe("kopi");
  });
  it("appends the next free suffix", async () => {
    const sb = fakeClient([{ id: "1", slug: "kopi" }, { id: "2", slug: "kopi-2" }]);
    expect(await ensureUniqueSlug(sb, "potentials", "kopi")).toBe("kopi-3");
  });
  it("ignores the row being edited", async () => {
    const sb = fakeClient([{ id: "1", slug: "kopi" }]);
    expect(await ensureUniqueSlug(sb, "potentials", "kopi", "1")).toBe("kopi");
  });
});
