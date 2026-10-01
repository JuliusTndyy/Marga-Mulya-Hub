import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  idSchema, optionalDate, optionalNumber, optionalRichText, optionalText, optionalTime,
  optionalWhatsapp, requiredText, stripControlChars, withCoordinatePair,
} from "@/lib/validation/common";

describe("optionalText", () => {
  it("maps blank and missing values to null", () => {
    expect(optionalText(10).parse("")).toBeNull();
    expect(optionalText(10).parse("   ")).toBeNull();
    expect(optionalText(10).parse(undefined)).toBeNull();
    expect(optionalText(10).parse(null)).toBeNull();
    expect(optionalText(10).parse(" ab ")).toBe("ab");
    expect(optionalText(3).safeParse("abcd").success).toBe(false);
  });
});

describe("optionalNumber", () => {
  it("maps blank / NaN to null and coerces numbers", () => {
    const s = optionalNumber(-90, 90);
    expect(s.parse("")).toBeNull();
    expect(s.parse(Number.NaN)).toBeNull();
    expect(s.parse(undefined)).toBeNull();
    expect(s.parse("12.5")).toBe(12.5);
    expect(s.safeParse(91).success).toBe(false);
  });
});

describe("optionalWhatsapp", () => {
  it("normalizes Indonesian numbers", () => {
    expect(optionalWhatsapp.parse("0812 3456 7890")).toBe("6281234567890");
    expect(optionalWhatsapp.parse("+6281234567890")).toBe("6281234567890");
    expect(optionalWhatsapp.parse("")).toBeNull();
    expect(optionalWhatsapp.parse(undefined)).toBeNull();
  });
  it("rejects too-short numbers", () => {
    expect(optionalWhatsapp.safeParse("123").success).toBe(false);
  });
});

describe("withCoordinatePair", () => {
  const schema = withCoordinatePair(
    z.object({ latitude: optionalNumber(-90, 90), longitude: optionalNumber(-180, 180) }),
  );
  it("accepts both or neither", () => {
    expect(schema.safeParse({ latitude: "", longitude: "" }).success).toBe(true);
    expect(schema.safeParse({ latitude: 1, longitude: 2 }).success).toBe(true);
  });
  it("puts the error on latitude when only one is set", () => {
    const r = schema.safeParse({ latitude: 1, longitude: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(["latitude"]);
      expect(r.error.issues[0]?.message).toBe("Isi lintang dan bujur bersamaan.");
    }
  });
});

describe("idSchema", () => {
  it("accepts uuids only", () => {
    expect(idSchema.safeParse("6f1c2c1e-8a8b-4d4e-9f00-1234567890ab").success).toBe(true);
    expect(idSchema.safeParse("abc").success).toBe(false);
  });
});

describe("optionalDate / optionalTime", () => {
  it("validates calendar dates", () => {
    expect(optionalDate.parse("")).toBeNull();
    expect(optionalDate.parse(undefined)).toBeNull();
    expect(optionalDate.parse("2025-02-28")).toBe("2025-02-28");
    expect(optionalDate.safeParse("2025-02-31").success).toBe(false);
  });
  it("validates minute-precision times", () => {
    expect(optionalTime.parse("")).toBeNull();
    expect(optionalTime.parse("08:00")).toBe("08:00");
    expect(optionalTime.safeParse("25:99").success).toBe(false);
    expect(optionalTime.safeParse("08:00:00").success).toBe(false);
  });
});

describe("optionalRichText", () => {
  it("enforces the 50 000 character input cap", () => {
    expect(optionalRichText.safeParse("a".repeat(50_000)).success).toBe(true);
    expect(optionalRichText.safeParse("a".repeat(50_001)).success).toBe(false);
  });
  it("maps whitespace-only to null", () => {
    expect(optionalRichText.parse("   \n ")).toBeNull();
  });
});

describe("requiredText", () => {
  it("returns its custom message for a missing key", () => {
    const schema = z.object({ name: requiredText(2, 100, "Nama wajib diisi (2–100 karakter).") });
    const r = schema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe("Nama wajib diisi (2–100 karakter).");
  });
});

describe("stripControlChars", () => {
  it("removes control characters but keeps newlines and tabs", () => {
    expect(stripControlChars("a\u0000b\u0007c\nd\te")).toBe("abc\nd\te");
  });
});
