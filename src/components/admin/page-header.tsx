import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({ title, backHref, backLabel = "Kembali ke daftar", children }: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 grid gap-2">
      {backHref ? (
        <Link href={backHref} className="inline-flex min-h-11 w-fit items-center text-sm text-primary underline-offset-4 hover:underline">
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold break-words">{title}</h1>
        {children}
      </div>
    </div>
  );
}
