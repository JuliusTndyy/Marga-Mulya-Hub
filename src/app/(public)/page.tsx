import { ArrowRight, HandHeart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapFallbackList } from "@/components/map/map-fallback-list";
import { AgendaList } from "@/components/public/agenda-list";
import { AnnouncementList } from "@/components/public/announcement-list";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { Hero } from "@/components/public/hero";
import { PostCard } from "@/components/public/post-card";
import { PotentialCard } from "@/components/public/potential-card";
import { SampleNotice } from "@/components/public/sample-notice";
import { Container, Section } from "@/components/public/section";
import { SectionSkeleton } from "@/components/public/section-skeleton";
import { ServiceNotice } from "@/components/public/service-notice";
import { StatCard } from "@/components/public/stat-card";
import { Button } from "@/components/ui/button";
import { getActiveAnnouncements, getLatestNews, getUpcomingEvents, type PostCardRow } from "@/lib/data/posts";
import { getFeaturedPotentials, getPotentialMarkers, type PotentialCardRow, type PotentialMarkerRow } from "@/lib/data/potentials";
import { getSiteSettings } from "@/lib/data/settings";
import { getHighlightStatistics, type PublicStatistic } from "@/lib/data/statistics";
import { todayInSiteTz } from "@/lib/dates";
import type { DataResult } from "@/lib/result";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Beranda" };

type P<T> = Promise<DataResult<T>>;

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="ghost" className="min-h-11 text-primary">
      <Link href={href}>
        {label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );
}

/** Shared per-section result handling: error → compact ErrorState; unconfigured → nothing (one notice per page). */
function SectionError({ res }: { res: Extract<DataResult<unknown>, { ok: false }> }) {
  return res.reason === "error" ? <ErrorState compact /> : null;
}

async function StatsSection({ data }: { data: P<PublicStatistic[]> }) {
  const res = await data;
  return (
    <Section id="statistik" title="Data Singkat Desa" action={<SeeAll href="/data-desa" label="Lihat data desa" />}>
      {!res.ok ? (
        <SectionError res={res} />
      ) : res.data.length === 0 ? (
        <EmptyState message="Data statistik belum tersedia." />
      ) : (
        <>
          {res.data.some((s) => s.is_sample) ? <SampleNotice className="mb-4" /> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {res.data.map((s) => (
              <StatCard key={s.id} stat={s} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

async function AnnouncementsSection({ data, today }: { data: P<PostCardRow[]>; today: string }) {
  const res = await data;
  return (
    <Section
      id="pengumuman"
      title="Pengumuman Aktif"
      className="bg-secondary/40"
      action={<SeeAll href="/informasi?jenis=pengumuman" label="Semua pengumuman" />}
    >
      {!res.ok ? (
        <SectionError res={res} />
      ) : res.data.length === 0 ? (
        <EmptyState message="Belum ada pengumuman aktif." />
      ) : (
        <AnnouncementList items={res.data} today={today} />
      )}
    </Section>
  );
}

async function PotentialsSection({ data }: { data: P<PotentialCardRow[]> }) {
  const res = await data;
  return (
    <Section id="potensi-unggulan" title="Potensi Unggulan" action={<SeeAll href="/potensi" label="Jelajah potensi" />}>
      {!res.ok ? (
        <SectionError res={res} />
      ) : res.data.length === 0 ? (
        <EmptyState message="Belum ada potensi yang ditampilkan." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.data.map((p) => (
            <PotentialCard key={p.id} potential={p} />
          ))}
        </div>
      )}
    </Section>
  );
}

async function AgendaSection({ data }: { data: P<PostCardRow[]> }) {
  const res = await data;
  return (
    <Section id="agenda" title="Agenda Terdekat" className="bg-secondary/40" action={<SeeAll href="/informasi?jenis=agenda" label="Semua agenda" />}>
      {!res.ok ? (
        <SectionError res={res} />
      ) : res.data.length === 0 ? (
        <EmptyState message="Belum ada agenda terdekat." />
      ) : (
        <AgendaList items={res.data} />
      )}
    </Section>
  );
}

async function MapPreviewSection({ data }: { data: P<PotentialMarkerRow[]> }) {
  const res = await data;
  if (res.ok && res.data.length === 0) return null; // section omitted without coordinates (D14)
  if (!res.ok && res.reason === "unconfigured") return null;
  return (
    <Section id="peta-potensi" title="Lokasi Potensi Desa" action={<SeeAll href="/potensi#peta" label="Buka peta lengkap" />}>
      {!res.ok ? (
        <SectionError res={res} />
      ) : (
        <MapFallbackList
          label="Daftar lokasi potensi desa"
          items={res.data.slice(0, 6).map((m) => ({
            id: m.id,
            name: m.name,
            category: m.category,
            latitude: m.latitude!,
            longitude: m.longitude!,
            href: `/potensi/${m.slug}`,
          }))}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        />
      )}
    </Section>
  );
}

async function NewsSection({ data, today }: { data: P<PostCardRow[]>; today: string }) {
  const res = await data;
  return (
    <Section id="berita" title="Berita Terbaru" action={<SeeAll href="/informasi?jenis=berita" label="Semua berita" />}>
      {!res.ok ? (
        <SectionError res={res} />
      ) : res.data.length === 0 ? (
        <EmptyState message="Belum ada berita." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.data.map((p) => (
            <PostCard key={p.id} post={p} today={today} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ContributionCta() {
  return (
    <section aria-labelledby="kontribusi-cta-judul" className="py-12 md:py-16">
      <Container>
        <div className="flex flex-col items-start gap-4 rounded-xl border bg-accent/25 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <HandHeart className="mt-1 size-8 shrink-0 text-accent-strong" aria-hidden="true" />
            <div>
              <h2 id="kontribusi-cta-judul" className="font-heading text-2xl font-bold">
                Punya informasi untuk desa?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Kirim informasi kegiatan, potensi lokal, atau kondisi lingkungan. Kiriman akan ditinjau oleh admin desa sebelum
                ditampilkan.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="min-h-11 shrink-0">
            <Link href="/kontak#kontribusi">Kirim Kontribusi</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

// Beranda (design D6 settings cases + D14 section table).
export default async function HomePage() {
  const settingsRes = await getSiteSettings();

  // Case 1: unconfigured → hero fallback + one ServiceNotice, nothing else.
  if (!settingsRes.ok && settingsRes.reason === "unconfigured") {
    return (
      <>
        <Hero fallback />
        <Container className="py-12">
          <ServiceNotice />
        </Container>
      </>
    );
  }

  // Cases 2–4: all section queries start together (parallel, like Promise.all) and each section
  // awaits its own promise inside <Suspense>, so one slow or failing section doesn't block the others.
  const today = todayInSiteTz();
  const [stats, announcements, potentials, events, markers, news] = [
    getHighlightStatistics(),
    getActiveAnnouncements(today),
    getFeaturedPotentials(),
    getUpcomingEvents(today),
    getPotentialMarkers(),
    getLatestNews(),
  ] as const;

  const s = settingsRes.ok ? settingsRes.data : null;
  return (
    <>
      {s ? (
        <Hero
          title={s.hero_title || s.village_name}
          eyebrow={s.hero_title ? s.village_name : null}
          description={s.hero_description}
          imageUrl={s.hero_image_url}
        />
      ) : (
        <Hero fallback />
      )}
      {!settingsRes.ok ? (
        <Container className="pt-6">
          <ErrorState compact message="Pengaturan situs gagal dimuat." />
        </Container>
      ) : null}
      <Suspense fallback={<SectionSkeleton cards={4} />}>
        <StatsSection data={stats} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <AnnouncementsSection data={announcements} today={today} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PotentialsSection data={potentials} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <AgendaSection data={events} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <MapPreviewSection data={markers} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <NewsSection data={news} today={today} />
      </Suspense>
      <ContributionCta />
    </>
  );
}
