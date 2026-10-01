import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildHref } from "./url";

interface PaginationProps {
  basePath: string;
  params: Record<string, string | null | undefined>;
  page: number;
  totalPages: number;
}

const itemClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors duration-150";

// Link-based pagination (`halaman`), 44 px targets, works without JS.
export function Pagination({ basePath, params, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;
  const href = (p: number) => buildHref(basePath, { ...params, halaman: p > 1 ? p : null });
  const pages = pageWindow(page, totalPages);
  return (
    <nav aria-label="Navigasi halaman" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={href(page - 1)} className={cn(itemClass, "bg-card hover:bg-secondary")}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              Sebelumnya
            </Link>
          </li>
        ) : null}
        {pages.map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Halaman ${p}`}
                className={cn(itemClass, p === page ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        {page < totalPages ? (
          <li>
            <Link href={href(page + 1)} className={cn(itemClass, "bg-card hover:bg-secondary")}>
              Berikutnya
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

/** 1 … (p-1) p (p+1) … last */
function pageWindow(page: number, total: number): (number | null)[] {
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (const p of sorted) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && p - prev > 1) out.push(null);
    out.push(p);
  }
  return out;
}

/** Parses `halaman` (int ≥ 1, default 1). */
export function parsePage(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
