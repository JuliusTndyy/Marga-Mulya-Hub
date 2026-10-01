import { Megaphone } from "lucide-react";
import Link from "next/link";
import type { PostCardRow } from "@/lib/data/posts";
import { announcementPeriodText } from "./post-card";
import { AnnouncementStateBadge, PriorityBadge } from "./post-badges";

// Compact list of active announcements (homepage).
export function AnnouncementList({ items, today }: { items: PostCardRow[]; today: string }) {
  return (
    <ul className="grid gap-3">
      {items.map((a) => {
        const period = announcementPeriodText(a);
        return (
          <li key={a.id} className="relative flex gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <Megaphone className="mt-1 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
            <div className="grid min-w-0 gap-1">
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={a.priority} />
                <AnnouncementStateBadge post={a} today={today} />
              </div>
              <h3 className="font-heading font-bold break-words">
                <Link href={`/informasi/${a.slug}`} className="after:absolute after:inset-0 hover:underline">
                  {a.title}
                </Link>
              </h3>
              {period ? <p className="text-sm text-muted-foreground">{period}</p> : null}
              {a.excerpt ? <p className="line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
