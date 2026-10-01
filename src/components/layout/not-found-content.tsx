import Link from "next/link";
import { Button } from "@/components/ui/button";

// Shared 404 copy (design D14): used by (public)/not-found.tsx and the root not-found.tsx.
export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-5xl font-extrabold text-primary" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-muted-foreground">Halaman yang Anda cari tidak ada atau belum diterbitkan.</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        <li>
          <Button asChild className="min-h-11 px-6">
            <Link href="/">Beranda</Link>
          </Button>
        </li>
        <li>
          <Button asChild variant="outline" className="min-h-11 px-6">
            <Link href="/potensi">Potensi</Link>
          </Button>
        </li>
        <li>
          <Button asChild variant="outline" className="min-h-11 px-6">
            <Link href="/informasi">Informasi</Link>
          </Button>
        </li>
      </ul>
    </div>
  );
}
