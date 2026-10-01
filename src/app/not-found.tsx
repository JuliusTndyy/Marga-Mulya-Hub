import type { Metadata } from "next";
import { SkipLink } from "@/components/layout/skip-link";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

// Unmatched URLs outside the (public) group: same copy in a minimal shell (design D14).
export default function RootNotFound() {
  return (
    <>
      <SkipLink />
      <main id="konten" tabIndex={-1} className="min-h-screen">
        <NotFoundContent />
      </main>
    </>
  );
}
