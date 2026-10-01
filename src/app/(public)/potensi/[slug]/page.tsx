import { ArrowLeft, Clock, MessageCircle, Phone, User } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapFallbackList } from "@/components/map/map-fallback-list";
import { ErrorState } from "@/components/public/error-state";
import { ImagePlaceholder } from "@/components/public/image-placeholder";
import { RichText } from "@/components/public/rich-text";
import { Container, PageHeader } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { SocialLinks } from "@/components/public/social-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { telLink, waLink } from "@/lib/contact-links";
import { getPublishedPotentialBySlug } from "@/lib/data/potentials";
import { sanitizeRichText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// Hand-typed, awaited page props (design D4).
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublishedPotentialBySlug(slug);
  if (!res.ok) return { title: "Potensi Desa" };
  if (!res.data) return { title: "Halaman tidak ditemukan" };
  const p = res.data;
  return {
    title: p.name,
    ...(p.summary ? { description: p.summary } : {}),
    openGraph: {
      locale: "id_ID",
      title: p.name,
      ...(p.summary ? { description: p.summary } : {}),
      ...(p.image_url ? { images: [{ url: p.image_url }] } : {}),
    },
  };
}

/** Free-text contact rendered as a tel: link only when it looks like a phone number. */
function isPhoneLike(v: string): boolean {
  return /^[+\d][\d\s().-]{5,}$/.test(v.trim());
}

function BackLink() {
  return (
    <Link href="/potensi" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Kembali ke katalog potensi
    </Link>
  );
}

// /potensi/[slug] (design D14). Missing/draft → notFound() before anything renders (HTTP 404).
export default async function PotensiDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getPublishedPotentialBySlug(slug);
  if (res.ok && res.data === null) notFound();

  if (!res.ok) {
    return (
      <>
        <PageHeader title="Potensi Desa" />
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
  const hasCoords = p.latitude !== null && p.longitude !== null;
  const hasContact = !!(p.contact || p.whatsapp || p.operating_hours || p.social_links?.length);

  return (
    <article>
      <Container className="py-8 md:py-12">
        <BackLink />
        <div className="mt-4 grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="grid content-start gap-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-secondary">
              {p.image_url ? (
                <Image src={p.image_url} alt={`Foto ${p.name}`} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
            <header className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{p.category}</Badge>
                {p.is_featured ? <Badge className="bg-accent text-accent-foreground">Unggulan</Badge> : null}
              </div>
              <h1 className="font-heading text-3xl font-extrabold break-words md:text-4xl">{p.name}</h1>
              {p.summary ? <p className="text-lg text-muted-foreground">{p.summary}</p> : null}
            </header>
            {p.description ? (
              <section aria-labelledby="deskripsi-judul">
                <h2 id="deskripsi-judul" className="mb-2 font-heading text-xl font-bold">
                  Deskripsi
                </h2>
                <RichText html={sanitizeRichText(p.description)} />
              </section>
            ) : null}
          </div>

          <aside className="grid content-start gap-6">
            {p.owner_or_manager || p.address ? (
              <section aria-labelledby="info-judul" className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 id="info-judul" className="mb-3 font-heading text-lg font-bold">
                  Informasi
                </h2>
                <dl className="grid gap-3">
                  {p.owner_or_manager ? (
                    <div>
                      <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="size-4" aria-hidden="true" />
                        Pengelola
                      </dt>
                      <dd className="break-words">{p.owner_or_manager}</dd>
                    </div>
                  ) : null}
                  {p.address ? (
                    <div>
                      <dt className="text-sm text-muted-foreground">Alamat</dt>
                      <dd className="break-words whitespace-pre-line">{p.address}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {hasContact ? (
              <section aria-labelledby="kontak-judul" className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 id="kontak-judul" className="mb-3 font-heading text-lg font-bold">
                  Kontak
                </h2>
                <div className="grid gap-3">
                  {p.whatsapp ? (
                    <Button asChild className="min-h-11 w-full sm:w-fit">
                      <a href={waLink(p.whatsapp, `Halo, saya ingin bertanya tentang ${p.name}`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle aria-hidden="true" />
                        Hubungi via WhatsApp
                        <span className="sr-only"> (membuka tab baru)</span>
                      </a>
                    </Button>
                  ) : null}
                  {p.contact ? (
                    <p className="flex items-start gap-2">
                      <Phone className="mt-1 size-4 shrink-0" aria-hidden="true" />
                      {isPhoneLike(p.contact) ? (
                        <a href={telLink(p.contact)} className="text-primary underline-offset-4 hover:underline">
                          <span className="sr-only">Telepon: </span>
                          {p.contact}
                        </a>
                      ) : (
                        <span className="break-words">{p.contact}</span>
                      )}
                    </p>
                  ) : null}
                  {p.operating_hours ? (
                    <p className="flex items-start gap-2">
                      <Clock className="mt-1 size-4 shrink-0" aria-hidden="true" />
                      <span className="break-words whitespace-pre-line">
                        <span className="sr-only">Jam operasional: </span>
                        {p.operating_hours}
                      </span>
                    </p>
                  ) : null}
                  <SocialLinks links={p.social_links} />
                </div>
              </section>
            ) : null}

            {hasCoords ? (
              <section aria-labelledby="lokasi-judul" className="grid gap-3">
                <h2 id="lokasi-judul" className="font-heading text-lg font-bold">
                  Lokasi
                </h2>
                <MapFallbackList
                  label={`Lokasi ${p.name}`}
                  className="grid gap-3"
                  items={[{ id: p.id, name: p.name, category: p.category, latitude: p.latitude!, longitude: p.longitude! }]}
                />
              </section>
            ) : null}
          </aside>
        </div>
      </Container>
    </article>
  );
}
