import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/public/empty-state";
import { ErrorState } from "@/components/public/error-state";
import { Container, PageHeader, Section } from "@/components/public/section";
import { ServiceNotice } from "@/components/public/service-notice";
import { getRecentGallery } from "@/lib/data/gallery";
import { getPublishedOfficials, getPublishedProfile, type PublicOfficial } from "@/lib/data/profile";
import { getSiteSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil Desa" };

/** Lines of a plain-text field (split on \n, trimmed, empty lines removed). */
function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** mission/facilities: a <ul> when the text has line breaks, otherwise a paragraph (design D14). */
function ListOrParagraph({ text }: { text: string }) {
  const items = lines(text);
  if (items.length > 1) {
    return (
      <ul className="grid list-disc gap-1 pl-6">
        {items.map((l, i) => (
          <li key={i} className="break-words">
            {l}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="break-words whitespace-pre-line">{text}</p>;
}

function Prose({ text }: { text: string }) {
  return <p className="max-w-3xl break-words whitespace-pre-line">{text}</p>;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function OfficialCard({ official }: { official: PublicOfficial }) {
  return (
    <li className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-secondary">
        {official.photo_url ? (
          <Image src={official.photo_url} alt={`Foto ${official.name}`} fill sizes="64px" className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center font-heading text-lg font-bold text-secondary-foreground"
          >
            {initials(official.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-heading font-bold break-words">{official.name}</p>
        <p className="text-sm break-words text-muted-foreground">{official.position}</p>
      </div>
    </li>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-2 font-heading text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

// /profil (design D14): sections hidden when their field is empty; nothing invented.
export default async function ProfilPage() {
  const [profileRes, officialsRes, galleryRes, settingsRes] = await Promise.all([
    getPublishedProfile(),
    getPublishedOfficials(),
    getRecentGallery(6),
    getSiteSettings(),
  ]);

  if (!profileRes.ok && profileRes.reason === "unconfigured") {
    return (
      <>
        <PageHeader title="Profil Desa" />
        <Container className="py-12">
          <ServiceNotice />
        </Container>
      </>
    );
  }

  const profile = profileRes.ok ? profileRes.data : null;
  const settings = settingsRes.ok ? settingsRes.data : null;
  const title = profile ? `Profil ${profile.village_name}` : "Profil Desa";

  return (
    <>
      <PageHeader title={title} />
      {!profileRes.ok ? (
        <Container className="py-12">
          <ErrorState />
        </Container>
      ) : !profile ? (
        <Container className="py-12">
          <EmptyState message="Profil desa belum diterbitkan." />
        </Container>
      ) : (
        <>
          <Section id="identitas" title="Identitas">
            <div className="grid gap-6 md:grid-cols-2">
              <dl className="grid content-start gap-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Nama desa</dt>
                  <dd className="font-semibold break-words">{profile.village_name}</dd>
                </div>
                {settings?.address ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">Alamat</dt>
                    <dd className="break-words whitespace-pre-line">{settings.address}</dd>
                  </div>
                ) : null}
              </dl>
              {profile.hero_image_url ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-secondary">
                  <Image
                    src={profile.hero_image_url}
                    alt={`Foto ${profile.village_name}`}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </Section>

          {profile.description ? (
            <Section id="deskripsi" title="Deskripsi" className="pt-0 md:pt-0">
              <Prose text={profile.description} />
            </Section>
          ) : null}

          {profile.history ? (
            <Section id="sejarah" title="Sejarah" className="bg-secondary/40">
              <Prose text={profile.history} />
            </Section>
          ) : null}

          {profile.vision || profile.mission ? (
            <Section id="visi-misi" title="Visi & Misi">
              <div className="grid gap-4 md:grid-cols-2">
                {profile.vision ? (
                  <Block title="Visi">
                    <p className="break-words whitespace-pre-line">{profile.vision}</p>
                  </Block>
                ) : null}
                {profile.mission ? (
                  <Block title="Misi">
                    <ListOrParagraph text={profile.mission} />
                  </Block>
                ) : null}
              </div>
            </Section>
          ) : null}

          {profile.geography ? (
            <Section id="geografis" title="Kondisi Geografis" className="bg-secondary/40">
              <Prose text={profile.geography} />
            </Section>
          ) : null}
        </>
      )}

      {officialsRes.ok && officialsRes.data.length > 0 ? (
        <Section id="pemerintahan" title="Struktur Pemerintahan">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officialsRes.data.map((o) => (
              <OfficialCard key={o.id} official={o} />
            ))}
          </ul>
        </Section>
      ) : !officialsRes.ok && officialsRes.reason === "error" ? (
        <Section id="pemerintahan" title="Struktur Pemerintahan">
          <ErrorState compact />
        </Section>
      ) : null}

      {profile?.facilities ? (
        <Section id="fasilitas" title="Fasilitas Umum" className="bg-secondary/40">
          <ListOrParagraph text={profile.facilities} />
        </Section>
      ) : null}

      {galleryRes.ok && galleryRes.data.length > 0 ? (
        <Section id="dokumentasi" title="Dokumentasi">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {galleryRes.data.map((g) => (
              <li key={g.id}>
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
                    <Image
                      src={g.image_url}
                      alt={g.alt_text}
                      fill
                      sizes="(min-width:768px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm break-words">{g.title}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
