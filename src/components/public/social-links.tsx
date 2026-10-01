import { Globe, Link2 } from "lucide-react";
import type { SocialLink } from "@/types/db";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS: Record<SocialLink["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  website: "Situs web",
};

// Text labels with generic icons, no brand logos (design D12).
export function SocialLinks({ links, className }: { links: SocialLink[] | null | undefined; className?: string }) {
  const safe = (links ?? []).filter((l) => typeof l?.url === "string" && /^https:\/\//i.test(l.url));
  if (safe.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {safe.map((l, i) => {
        const Icon = l.platform === "website" ? Globe : Link2;
        return (
          <li key={`${l.platform}-${i}`}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium transition-colors duration-150 hover:bg-secondary"
            >
              <Icon className="size-4" aria-hidden="true" />
              {PLATFORM_LABELS[l.platform] ?? l.platform}
              <span className="sr-only"> (membuka tab baru)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
