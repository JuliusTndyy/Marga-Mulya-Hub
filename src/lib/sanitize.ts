import "server-only";
import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "b", "i", "u", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a"],
  // target/rel must be allowlisted: sanitize-html filters attributes after transformTags.
  allowedAttributes: { a: ["href", "title", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const attrs = { ...attribs };
      if (/^https?:\/\//i.test(attrs.href ?? "")) {
        attrs.rel = "noopener noreferrer";
        attrs.target = "_blank";
      } else {
        delete attrs.rel;
        delete attrs.target;
      }
      return { tagName, attribs: attrs };
    },
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitizes admin rich text (design D15). Input without "<" becomes paragraphs
 * (blank lines split paragraphs, single newlines become <br>). Runs on write and on render.
 */
export function sanitizeRichText(html: string): string {
  if (!html.includes("<")) {
    return html
      .replace(/\r\n?/g, "\n")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p !== "")
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }
  return sanitizeHtml(html, OPTIONS);
}
