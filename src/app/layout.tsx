import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

// Two OFL fonts, self-hosted at build time by next/font (design D12).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Design D21: metadataBase, default title template, tagline description fallback, id_ID locale,
// no default OG image. The public layout narrows the template to the village name from settings.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Marga Mulya Hub", template: "%s | Marga Mulya Hub" },
  description: "Informasi Desa, Potensi Lokal, dan Partisipasi Masyarakat dalam Satu Platform.",
  openGraph: { locale: "id_ID", type: "website", siteName: "Marga Mulya Hub" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
