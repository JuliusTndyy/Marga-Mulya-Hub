import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/public/error-state";
import { AnnouncementStateBadge, PriorityBadge } from "@/components/public/post-badges";
import { announcementPeriodText, EventMeta, PostCard } from "@/components/public/post-card";
import { RichText } from "@/components/public/rich-text";
import { Container, PageHeader } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { Badge } from "@/components/ui/badge";
import { POST_TYPES } from "@/lib/config";
import { getPublishedPostBySlug, getRelatedPosts } from "@/lib/data/posts";
import { formatTanggal, todayInSiteTz } from "@/lib/dates";
import type { PostType } from "@/types/db";

export const dynamic = "force-dynamic";

// Hand-typed, awaited page props (design D4).
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublishedPostBySlug(slug);
  if (!res.ok) return { title: "Informasi Desa" };
  if (!res.data) return { title: "Halaman tidak ditemukan" };
  const p = res.data;
  return {
    title: p.title,
    ...(p.excerpt ? { description: p.excerpt } : {}),
    openGraph: {
      locale: "id_ID",
      type: "article",
      title: p.title,
      ...(p.excerpt ? { description: p.excerpt } : {}),
      ...(p.cover_image_url ? { images: [{ url: p.cover_image_url }] } : {}),
    },
  };
}

function BackLink() {
  return (
    <Link href="/informasi" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Kembali ke informasi
    </Link>
  );
}

/** Related posts: an error hides the block (logged by the data layer); it never fails the page. */
async function Related({ type, id, today }: { type: PostType; id: string; today: string }) {
  const res = await getRelatedPosts(type, id);
  if (!res.ok || res.data.length === 0) return null;
  return (
    <section aria-labelledby="terkait-judul" className="mt-12 border-t pt-10">
      <h2 id="terkait-judul" className="mb-6 font-heading text-2xl font-bold">
        Informasi Terkait
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {res.data.map((p) => (
          <PostCard key={p.id} post={p} today={today} />
        ))}
      </div>
    </section>
  );
}

// /informasi/[slug] (design D14). Missing/draft → notFound() before anything renders (HTTP 404).
export default async function InformasiDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getPublishedPostBySlug(slug);
  if (res.ok && res.data === null) notFound();

  if (!res.ok) {
    return (
      <>
        <PageHeader title="Informasi Desa" />
        <Container className="py-12">
          {res.reason === "unconfigured" ? <ServiceNotice /> : <ErrorState />}
          <div className="mt-6">
            <BackLink />
          </div>
        </Container>
      </>
    );
  }

  const p = res.data!;
  const today = todayInSiteTz();
  const period = p.type === "announcement" ? announcementPeriodText(p) : null;
  const dateText = p.published_at ?? p.sort_date;

  return (
    <Container className="py-8 md:py-12">
      <BackLink />
      <article className="mx-auto mt-4 max-w-3xl">
        <header className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{POST_TYPES[p.type]}</Badge>
            {p.type === "announcement" ? (
              <>
                <PriorityBadge priority={p.priority} />
                <AnnouncementStateBadge post={p} today={today} />
              </>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl font-extrabold break-words md:text-4xl">{p.title}</h1>
          {p.type === "announcement" ? (
            period ? <p className="text-muted-foreground">{period}</p> : null
          ) : p.type === "event" ? null : dateText ? (
            <p className="text-muted-foreground">
              <time dateTime={dateText}>{formatTanggal(dateText)}</time>
            </p>
          ) : null}
          {p.excerpt ? <p className="text-lg text-muted-foreground">{p.excerpt}</p> : null}
        </header>

        {p.cover_image_url ? (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border bg-secondary">
            <Image src={p.cover_image_url} alt="" fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
          </div>
        ) : null}

        {p.type === "event" && (p.event_date || p.event_time || p.location || p.organizer) ? (
          <section aria-labelledby="detail-agenda-judul" className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
            <h2 id="detail-agenda-judul" className="mb-3 font-heading text-lg font-bold">
              Detail Agenda
            </h2>
            <EventMeta post={p} className="text-base text-foreground" />
          </section>
        ) : null}

        {p.content ? (
          <div className="mt-6">
            <RichText html={p.content} />
          </div>
        ) : null}
      </article>
      <Related type={p.type} id={p.id} today={today} />
    </Container>
  );
}
