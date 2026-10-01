import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { formatKoordinat } from "@/components/public/format";
import { directionsLink } from "@/lib/contact-links";

export interface MapLocation {
  id: string;
  name: string;
  category?: string | null;
  latitude: number | string;
  longitude: number | string;
  /** Internal detail page, e.g. /potensi/{slug}. */
  href?: string;
}

interface MapFallbackListProps {
  items: MapLocation[];
  /** Accessible name of the list (e.g. "Daftar lokasi potensi desa"). */
  label: string;
  className?: string;
}

// Accessible list of map locations with links (design D13/D20). With scope simplification S1
// this is the location UI everywhere: name, category, coordinates and a "Petunjuk Arah" link.
export function MapFallbackList({ items, label, className }: MapFallbackListProps) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className={className ?? "grid gap-3 sm:grid-cols-2"}>
      {items.map((m) => {
        const lat = Number(m.latitude);
        const lng = Number(m.longitude);
        return (
          <li key={m.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                {m.href ? (
                  <Link href={m.href} className="font-semibold break-words text-primary hover:underline">
                    {m.name}
                  </Link>
                ) : (
                  <span className="font-semibold break-words">{m.name}</span>
                )}
                {m.category ? <p className="text-sm text-muted-foreground">{m.category}</p> : null}
                <p className="text-sm text-muted-foreground">
                  <span className="sr-only">Koordinat: </span>
                  {formatKoordinat(lat, lng)}
                </p>
              </div>
            </div>
            <a
              href={directionsLink(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors duration-150 hover:bg-secondary"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Petunjuk Arah
              <span className="sr-only">
                {" "}
                ke {m.name} (membuka tab baru)
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
