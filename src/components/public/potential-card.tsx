import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PotentialCardRow } from "@/lib/data/potentials";
import { ImagePlaceholder } from "./image-placeholder";

// Catalog card (design D14): photo, name, category, summary, location, "Unggulan" badge.
export function PotentialCard({ potential, headingLevel = 3 }: { potential: PotentialCardRow; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-secondary">
        {potential.image_url ? (
          <Image
            src={potential.image_url}
            alt=""
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{potential.category}</Badge>
          {potential.is_featured ? <Badge className="bg-accent text-accent-foreground">Unggulan</Badge> : null}
        </div>
        <Heading className="font-heading text-lg font-bold break-words">
          <Link href={`/potensi/${potential.slug}`} className="after:absolute after:inset-0 hover:underline">
            {potential.name}
          </Link>
        </Heading>
        {potential.summary ? <p className="line-clamp-3 text-muted-foreground">{potential.summary}</p> : null}
        {potential.address ? (
          <p className="mt-auto flex items-start gap-1.5 pt-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="break-words">{potential.address}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
