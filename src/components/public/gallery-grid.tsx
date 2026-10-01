import Image from "next/image";
import type { GalleryRow } from "@/lib/data/gallery";
import { formatTanggal } from "@/lib/dates";

// Plain responsive grid with title/caption under each photo (scope simplification S8: no lightbox,
// so this stays a Server Component). Images are lazy by default.
export function GalleryGrid({ items }: { items: GalleryRow[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((g) => (
        <li key={g.id}>
          <figure className="grid gap-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <Image
                src={g.image_url}
                alt={g.alt_text}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
            <figcaption className="grid gap-0.5">
              <span className="font-semibold break-words">{g.title}</span>
              {g.description ? <span className="line-clamp-3 text-sm break-words text-muted-foreground">{g.description}</span> : null}
              {g.event_date || g.location ? (
                <span className="text-sm text-muted-foreground">
                  {[g.event_date ? formatTanggal(g.event_date) : null, g.location].filter(Boolean).join(" · ")}
                </span>
              ) : null}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
