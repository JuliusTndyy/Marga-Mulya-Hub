import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { sanitizeRichText } = await import("@/lib/sanitize");

describe("sanitizeRichText", () => {
  it("removes script, style and event handlers", () => {
    const out = sanitizeRichText(`<p onclick="x()">Halo</p><script>alert(1)</script><style>p{}</style><img src=x onerror=alert(1)>`);
    expect(out).toBe("<p>Halo</p>");
  });
  it("removes javascript: hrefs", () => {
    const out = sanitizeRichText(`<a href="javascript:alert(1)">x</a>`);
    expect(out).not.toContain("javascript");
  });
  it("turns plain text into paragraphs", () => {
    expect(sanitizeRichText("Baris satu\nbaris dua\n\nParagraf & dua")).toBe(
      "<p>Baris satu<br>baris dua</p><p>Paragraf &amp; dua</p>",
    );
  });
  it("adds rel and target to external links", () => {
    const out = sanitizeRichText(`<a href="https://example.com">x</a>`);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });
  it("does not force target on mailto links", () => {
    const out = sanitizeRichText(`<a href="mailto:a@example.com" target="_blank">x</a>`);
    expect(out).toBe('<a href="mailto:a@example.com">x</a>');
  });
  it("keeps allowlisted tags", () => {
    expect(sanitizeRichText("<h2>Judul</h2><ul><li><strong>a</strong></li></ul>")).toBe(
      "<h2>Judul</h2><ul><li><strong>a</strong></li></ul>",
    );
  });
});
