import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { ContributionForm } from "@/components/forms/contribution-form";
import { MapFallbackList } from "@/components/map/map-fallback-list";
import { ErrorState } from "@/components/public/error-state";
import { Container, PageHeader } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { SocialLinks } from "@/components/public/social-links";
import { telLink, waLink } from "@/lib/contact-links";
import { getSiteSettings } from "@/lib/data/settings";
import { issueFormTimestamp } from "@/lib/spam";
import type { SiteSettings } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi pemerintah desa dan kirim kontribusi informasi warga.",
};

function ContactCard({ s }: { s: SiteSettings }) {
  const hasAny = s.address || s.phone || s.whatsapp || s.email || s.service_hours || s.social_links?.length;
  if (!hasAny) return <p className="text-muted-foreground">Informasi kontak belum tersedia.</p>;
  return (
    <div className="grid gap-4">
      <ul className="grid gap-3">
        {s.address ? (
          <li className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">Alamat</p>
              <p className="break-words whitespace-pre-line">{s.address}</p>
            </div>
          </li>
        ) : null}
        {s.phone ? (
          <li className="flex items-start gap-3">
            <Phone className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">Telepon</p>
              <a href={telLink(s.phone)} className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline">
                {s.phone}
              </a>
            </div>
          </li>
        ) : null}
        {s.whatsapp ? (
          <li className="flex items-start gap-3">
            <MessageCircle className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">WhatsApp</p>
              <a
                href={waLink(s.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline"
              >
                Kirim pesan WhatsApp
                <span className="sr-only"> (membuka tab baru)</span>
              </a>
            </div>
          </li>
        ) : null}
        {s.email ? (
          <li className="flex items-start gap-3">
            <Mail className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Email</p>
              <a href={`mailto:${s.email}`} className="inline-flex min-h-11 items-center break-all text-primary underline-offset-4 hover:underline">
                {s.email}
              </a>
            </div>
          </li>
        ) : null}
        {s.service_hours ? (
          <li className="flex items-start gap-3">
            <Clock className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">Jam layanan</p>
              <p className="whitespace-pre-line">{s.service_hours}</p>
            </div>
          </li>
        ) : null}
      </ul>
      <SocialLinks links={s.social_links} />
    </div>
  );
}

// /kontak (design D14): settings-driven contact card, location list + "Petunjuk Arah" (S1),
// contact form, and the #kontribusi section with the text-only contribution form (S4).
export default async function KontakPage() {
  const renderedAt = issueFormTimestamp();
  const res = await getSiteSettings();
  const unconfigured = !res.ok && res.reason === "unconfigured";
  const s = res.ok ? res.data : null;
  const hasCoords = s?.latitude != null && s?.longitude != null;

  return (
    <>
      <PageHeader title="Kontak" description="Hubungi kami atau kirim informasi untuk desa." />
      <Container className="grid gap-10 py-10 md:py-12 lg:grid-cols-[2fr_3fr]">
        <section aria-labelledby="info-kontak-judul" className="grid content-start gap-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 id="info-kontak-judul" className="mb-4 font-heading text-xl font-bold">
              Informasi Kontak
            </h2>
            {unconfigured ? (
              <ServiceNotice />
            ) : !res.ok ? (
              <ErrorState compact />
            ) : s ? (
              <ContactCard s={s} />
            ) : (
              <p className="text-muted-foreground">Informasi kontak belum tersedia.</p>
            )}
          </div>
          {s && hasCoords ? (
            <div className="grid gap-3">
              <h3 className="font-heading text-lg font-bold">Lokasi Kantor Desa</h3>
              <MapFallbackList
                label="Lokasi kantor desa"
                className="grid gap-3"
                items={[{ id: "kantor-desa", name: s.village_name, latitude: s.latitude!, longitude: s.longitude! }]}
              />
            </div>
          ) : null}
        </section>

        <section aria-labelledby="form-kontak-judul" className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 id="form-kontak-judul" className="mb-1 font-heading text-xl font-bold">
            Kirim Pesan
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">Pesan Anda akan diterima oleh pengelola situs desa.</p>
          <ContactForm renderedAt={renderedAt} disabled={unconfigured} />
        </section>
      </Container>

      <section id="kontribusi" aria-labelledby="kontribusi-judul" className="scroll-mt-20 border-t bg-secondary/40 py-12 md:py-16">
        <Container>
          <h2 id="kontribusi-judul" className="font-heading text-2xl font-bold md:text-3xl">
            Kontribusi Warga
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Kirim informasi kegiatan masyarakat, potensi lokal, infrastruktur, atau lingkungan. Kiriman akan ditinjau oleh admin
            desa sebelum ditampilkan.
          </p>
          <div className="mt-6 max-w-3xl rounded-xl border bg-card p-5 shadow-sm md:p-6">
            <ContributionForm renderedAt={renderedAt} disabled={unconfigured} />
          </div>
        </Container>
      </section>
    </>
  );
}
