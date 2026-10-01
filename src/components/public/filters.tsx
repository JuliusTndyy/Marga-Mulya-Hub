import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildHref } from "./url";

export interface ChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  basePath: string;
  /** Query param the chips set (e.g. "kategori"). */
  param: string;
  options: ChipOption[];
  /** Active value; null = "Semua". */
  active: string | null;
  /** Other params to keep (e.g. the search term). Pagination resets. */
  keep?: Record<string, string | null | undefined>;
  label?: string;
  /** Value used for the "Semua" chip (omitted from the URL when undefined). */
  allValue?: string;
}

// Category chips as links (design D14): "Semua" first, aria-current on the active chip,
// 44 px targets, works without JS.
export function FilterChips({ basePath, param, options, active, keep = {}, label = "Filter kategori", allValue }: FilterChipsProps) {
  const all: ChipOption = { value: allValue ?? "", label: "Semua" };
  const isAllActive = active === null || active === (allValue ?? "");
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {[all, ...options].map((o) => {
          const current = o === all ? isAllActive : o.value === active;
          return (
            <li key={o.value || "__semua"}>
              <Link
                href={buildHref(basePath, { ...keep, [param]: o === all && allValue === undefined ? null : o.value })}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  current ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                )}
              >
                {o.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
