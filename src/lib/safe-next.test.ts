import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("accepts admin paths", () => {
    expect(safeNext("/admin")).toBe("/admin");
    expect(safeNext("/admin/potensi")).toBe("/admin/potensi");
    expect(safeNext("/admin/potensi?q=kopi")).toBe("/admin/potensi?q=kopi");
  });

  it("takes the first value of an array param", () => {
    expect(safeNext(["/admin/berita", "/x"])).toBe("/admin/berita");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNext("//x")).toBe("/admin");
    expect(safeNext("//evil.example/admin")).toBe("/admin");
    expect(safeNext("https://x")).toBe("/admin");
    expect(safeNext("/admin\\..\\x")).toBe("/admin");
  });

  it("rejects the login page and non-admin paths", () => {
    expect(safeNext("/admin/login")).toBe("/admin");
    expect(safeNext("/admin/login?next=/admin")).toBe("/admin");
    expect(safeNext("/administrator")).toBe("/admin");
    expect(safeNext("/potensi")).toBe("/admin");
  });

  it("falls back to /admin for empty or missing values", () => {
    expect(safeNext("")).toBe("/admin");
    expect(safeNext(undefined)).toBe("/admin");
    expect(safeNext(null)).toBe("/admin");
  });
});
