import { describe, expect, it } from "vitest";
import { normalizeSearchTerm } from "@/lib/search-term";

describe("normalizeSearchTerm", () => {
  it("strips PostgREST metacharacters", () => {
    expect(normalizeSearchTerm(`a,b(c).d*e%f:g"h\\i`)).toBe("a b c d e f g h i");
  });
  it("collapses whitespace and trims", () => {
    expect(normalizeSearchTerm("  kopi    gunung  ")).toBe("kopi gunung");
  });
  it("keeps Unicode letters, digits and hyphens", () => {
    expect(normalizeSearchTerm("Café-2024")).toBe("Café-2024");
  });
  it("returns empty for fewer than 2 meaningful characters", () => {
    expect(normalizeSearchTerm("a")).toBe("");
    expect(normalizeSearchTerm("*.%")).toBe("");
    expect(normalizeSearchTerm("- -")).toBe("");
    expect(normalizeSearchTerm("ab")).toBe("ab");
  });
  it("caps at 100 characters", () => {
    expect(normalizeSearchTerm("x".repeat(150)).length).toBe(100);
  });
});
