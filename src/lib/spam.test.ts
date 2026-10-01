import { describe, expect, it } from "vitest";
import { isHoneypotFilled, isTooFast } from "./spam";

describe("isTooFast", () => {
  const now = 1_700_000_000_000;
  it("treats a missing timestamp as spam", () => {
    expect(isTooFast(null, now)).toBe(true);
    expect(isTooFast(undefined, now)).toBe(true);
    expect(isTooFast("", now)).toBe(true);
  });
  it("treats a non-numeric timestamp as spam", () => {
    expect(isTooFast("abc", now)).toBe(true);
  });
  it("flags a submission 1 s after render", () => {
    expect(isTooFast(String(now - 1000), now)).toBe(true);
  });
  it("accepts a submission 5 s after render", () => {
    expect(isTooFast(String(now - 5000), now)).toBe(false);
  });
  it("flags a timestamp in the future", () => {
    expect(isTooFast(String(now + 10_000), now)).toBe(true);
  });
});

describe("isHoneypotFilled", () => {
  it("is false for empty or missing values", () => {
    expect(isHoneypotFilled("")).toBe(false);
    expect(isHoneypotFilled("   ")).toBe(false);
    expect(isHoneypotFilled(null)).toBe(false);
  });
  it("is true when filled", () => {
    expect(isHoneypotFilled("x")).toBe(true);
  });
});
