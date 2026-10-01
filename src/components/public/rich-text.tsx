import { sanitizeRichText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

// Renders stored rich text. Content was sanitized on write; it is sanitized again here on render
// (design D15). `whitespace-pre-line` keeps plain-text line breaks (scope simplification S6).
export function RichText({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  const clean = sanitizeRichText(html);
  return (
    <div
      className={cn(
        "max-w-none break-words whitespace-pre-line leading-relaxed",
        "[&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_h4]:mt-4 [&_h4]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
