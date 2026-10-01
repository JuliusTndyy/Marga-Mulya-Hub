import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { AdminMobileNav, AdminSidebarNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  email: string;
  pendingCount: number | null;
  children: ReactNode;
}

// Responsive admin shell (design D18): sidebar on desktop, Sheet on mobile; header with the
// admin email, "Lihat situs" and the logout form. Neutral surfaces with the site tokens.
export function AdminShell({ email, pendingCount, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Lewati ke konten utama
      </a>
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AdminMobileNav pendingCount={pendingCount} />
            <Link href="/admin" className="font-heading text-lg font-bold">
              CMS Desa
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline" title={email}>
              {email}
            </span>
            <Button asChild variant="ghost" className="min-h-11">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                Lihat situs
              </Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="outline" className="min-h-11">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r bg-card p-4 lg:block">
          <AdminSidebarNav pendingCount={pendingCount} />
        </aside>
        <main id="konten" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
