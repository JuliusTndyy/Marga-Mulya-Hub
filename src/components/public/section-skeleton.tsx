import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "./section";

// Suspense fallback for a page section (design D14).
export function SectionSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="py-12 md:py-16" aria-hidden="true">
      <Container>
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}

/** Whole-page skeleton for leaf-route loading.tsx files. */
export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Memuat konten">
      <div className="border-b bg-secondary/60">
        <Container className="py-10 md:py-14">
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        </Container>
      </div>
      <SectionSkeleton cards={cards} />
      <span className="sr-only">Memuat konten…</span>
    </div>
  );
}
