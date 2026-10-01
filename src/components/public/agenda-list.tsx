import Link from "next/link";
import type { PostCardRow } from "@/lib/data/posts";
import { EventMeta } from "./post-card";

const dayFormat = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "short" });

// Compact list of upcoming events (homepage): date block + title + time/location/organizer.
export function AgendaList({ items }: { items: PostCardRow[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((e) => {
        const d = e.event_date ? new Date(`${e.event_date}T00:00:00Z`) : null;
        return (
          <li key={e.id} className="relative flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
            {d ? (
              <div
                aria-hidden="true"
                className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
              >
                <span className="font-heading text-2xl leading-none font-bold">{dayFormat.format(d)}</span>
                <span className="text-sm uppercase">{monthFormat.format(d).replace(/\.$/, "")}</span>
              </div>
            ) : null}
            <div className="grid min-w-0 gap-1">
              <h3 className="font-heading font-bold break-words">
                <Link href={`/informasi/${e.slug}`} className="after:absolute after:inset-0 hover:underline">
                  {e.title}
                </Link>
              </h3>
              <EventMeta post={e} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
