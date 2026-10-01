"use client";

import { useEffect } from "react";
import "./globals.css";

// Last-resort boundary when the root layout itself fails; renders its own <html> (design D3).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main id="konten" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Terjadi kesalahan</h1>
          <p className="mt-3">Situs gagal dimuat. Silakan coba lagi.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 min-h-11 rounded-md bg-primary px-6 font-medium text-primary-foreground"
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
