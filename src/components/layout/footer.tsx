import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { SocialLinks } from "@/components/public/social-links";
import { telLink, waLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/types/db";
import { NAV_ITEMS } from "./nav-items";

// Settings-driven footer (design D14). Without settings only generic links and the fallback name render.
export function Footer({ siteName, settings }: { siteName: string; settings: SiteSettings | null }) {
  const s = settings;
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="grid content-start gap-3">
          <p className="font-heading text-xl font-bold">{siteName}</p>
          {s?.tagline ? <p className="text-white/90">{s.tagline}</p> : null}
          {s?.short_description ? <p className="text-sm whitespace-pre-line text-white/80">{s.short_description}</p> : null}
        </div>

        <div className="grid content-start gap-3">
          <h2 className="font-heading text-lg font-semibold">Kontak</h2>
          {s && (s.address || s.phone || s.whatsapp || s.email || s.service_hours) ? (
            <ul className="grid gap-2 text-sm text-white/90">
              {s.address ? (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="break-words whitespace-pre-line">{s.address}</span>
                </li>
              ) : null}
              {s.phone ? (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={telLink(s.phone)} className="underline-offset-4 hover:underline">
                    <span className="sr-only">Telepon: </span>
                    {s.phone}
                  </a>
                </li>
              ) : null}
              {s.whatsapp ? (
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                    WhatsApp
                    <span className="sr-only"> (membuka tab baru)</span>
                  </a>
                </li>
              ) : null}
              {s.email ? (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${s.email}`} className="break-all underline-offset-4 hover:underline">
                    {s.email}
                  </a>
                </li>
              ) : null}
              {s.service_hours ? (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-pre-line">{s.service_hours}</span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-white/80">Informasi kontak belum tersedia.</p>
          )}
          {s?.social_links?.length ? <SocialLinks links={s.social_links} className="[&_a]:text-foreground" /> : null}
        </div>

        <div className="grid content-start gap-3">
          <h2 className="font-heading text-lg font-semibold">Tautan Cepat</h2>
          <ul className="grid grid-cols-2 gap-x-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-white/80 sm:px-6">
          <p>Peta © kontributor OpenStreetMap</p>
          <Link href="/admin/login" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Masuk Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
