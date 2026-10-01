import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page container (design D12). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

interface SectionProps {
  id?: string;
  title: string;
  description?: ReactNode;
  /** Link/button shown next to the heading (e.g. "Lihat semua"). */
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
  children: ReactNode;
}

// Section with heading + container (`py-12 md:py-16`, design D12).
export function Section({ id, title, description, action, headingLevel = 2, className, children }: SectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = id ? `${id}-judul` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-20 py-12 md:py-16", className)}>
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Heading id={headingId} className="font-heading text-2xl font-bold md:text-3xl">
              {title}
            </Heading>
            {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </Container>
    </section>
  );
}

/** Page header with the single <h1>. */
export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="border-b bg-secondary/60">
      <Container className="py-10 md:py-14">
        <h1 className="font-heading text-3xl font-extrabold break-words md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{description}</p> : null}
      </Container>
    </div>
  );
}
