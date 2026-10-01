"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Error boundary for unexpected render exceptions in the public tree (design D6/D19).
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[public:error-boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-3 text-muted-foreground">Halaman ini gagal dimuat. Silakan coba lagi.</p>
      <Button type="button" onClick={reset} className="mt-6 min-h-11 px-6">
        Coba lagi
      </Button>
    </div>
  );
}
