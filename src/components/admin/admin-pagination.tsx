import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  basePath: string;
  /** Current query params to keep (q, status, filters). `halaman` is replaced. */
  params: Record<string, string | undefined>;
  page: number;
  total: number;
  pageSize: number;
}

function href(basePath: string, params: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  if (page > 1) sp.set("halaman", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border bg-background px-3 text-sm hover:bg-muted";

export function AdminPagination({ basePath, params, page, total, pageSize }: AdminPaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Halaman {page} dari {pages} ({total} data)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className={linkClass} href={href(basePath, params, page - 1)}>
            Sebelumnya
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-50")} aria-disabled="true">
            Sebelumnya
          </span>
        )}
        {page < pages ? (
          <Link className={linkClass} href={href(basePath, params, page + 1)}>
            Berikutnya
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-50")} aria-disabled="true">
            Berikutnya
          </span>
        )}
      </div>
    </nav>
  );
}
