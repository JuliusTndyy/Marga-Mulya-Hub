import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skip-link";
import { getSiteSettings } from "@/lib/data/settings";
import { FALLBACK_SITE_NAME } from "@/lib/data/site-name";

export async function generateMetadata(): Promise<Metadata> {
  const res = await getSiteSettings();
  const s = res.ok ? res.data : null;
  const name = s?.village_name || FALLBACK_SITE_NAME;
  const description = s?.tagline ?? s?.short_description ?? undefined;
  return {
    title: { default: name, template: `%s | ${name}` },
    ...(description ? { description } : {}),
  };
}

// Public shell (design D14): settings load once (cache()) for navbar + footer.
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const res = await getSiteSettings();
  const settings = res.ok ? res.data : null;
  const siteName = settings?.village_name || FALLBACK_SITE_NAME;
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Navbar siteName={siteName} />
      <main id="konten" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer siteName={siteName} settings={settings} />
    </div>
  );
}
