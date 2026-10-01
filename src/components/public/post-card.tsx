import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { POST_TYPES } from "@/lib/config";
import type { PostCardRow } from "@/lib/data/posts";
import { formatTanggal, todayInSiteTz } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { formatJam } from "./format";
import { ImagePlaceholder } from "./image-placeholder";
import { AnnouncementStateBadge, PriorityBadge } from "./post-badges";

interface PostCardProps {
  post: PostCardRow;
  headingLevel?: 2 | 3;
  /** Show the cover image area (news lists); compact lists skip it. */
  showImage?: boolean;
  today?: string;
}

// Information card (design D14): type badge, date, excerpt; announcements add priority + state
// badges; events add date, time (HH:mm WIB), location and organizer.
export function PostCard({ post, headingLevel = 3, showImage = true, today = todayInSiteTz() }: PostCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const dateText = post.published_at ?? post.sort_date;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      {showImage ? (
        <div className="relative aspect-[16/9] bg-secondary">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{POST_TYPES[post.type]}</Badge>
          {post.type === "announcement" ? (
            <>
              <PriorityBadge priority={post.priority} />
              <AnnouncementStateBadge post={post} today={today} />
            </>
          ) : null}
        </div>
        <Heading className="font-heading text-lg font-bold break-words">
          <Link href={`/informasi/${post.slug}`} className="after:absolute after:inset-0 hover:underline">
            {post.title}
          </Link>
        </Heading>
        {post.type === "event" ? (
          <EventMeta post={post} />
        ) : dateText && post.type !== "announcement" ? (
          <p className="text-sm text-muted-foreground">
            <time dateTime={dateText}>{formatTanggal(dateText)}</time>
          </p>
        ) : null}
        {post.type === "announcement" ? <AnnouncementPeriod post={post} /> : null}
        {post.excerpt ? <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

export function EventMeta({ post, className }: { post: Pick<PostCardRow, "event_date" | "event_time" | "location" | "organizer">; className?: string }) {
  const jam = formatJam(post.event_time);
  return (
    <ul className={cn("grid gap-1 text-sm text-muted-foreground", className)}>
      {post.event_date ? (
        <li className="flex items-start gap-1.5">
          <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="sr-only">Tanggal: </span>
            <time dateTime={post.event_date}>{formatTanggal(post.event_date)}</time>
          </span>
        </li>
      ) : null}
      {jam ? (
        <li className="flex items-start gap-1.5">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="sr-only">Waktu: </span>
            {jam}
          </span>
        </li>
      ) : null}
      {post.location ? (
        <li className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="break-words">
            <span className="sr-only">Lokasi: </span>
            {post.location}
          </span>
        </li>
      ) : null}
      {post.organizer ? (
        <li className="flex items-start gap-1.5">
          <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="break-words">
            <span className="sr-only">Penyelenggara: </span>
            {post.organizer}
          </span>
        </li>
      ) : null}
    </ul>
  );
}

/** "Berlaku {start} – {end}" (either side may be open). */
export function announcementPeriodText(p: Pick<PostCardRow, "start_date" | "end_date">): string | null {
  if (p.start_date && p.end_date) return `Berlaku ${formatTanggal(p.start_date)} – ${formatTanggal(p.end_date)}`;
  if (p.start_date) return `Berlaku mulai ${formatTanggal(p.start_date)}`;
  if (p.end_date) return `Berlaku sampai ${formatTanggal(p.end_date)}`;
  return null;
}

function AnnouncementPeriod({ post }: { post: Pick<PostCardRow, "start_date" | "end_date"> }) {
  const text = announcementPeriodText(post);
  return text ? <p className="text-sm text-muted-foreground">{text}</p> : null;
}
