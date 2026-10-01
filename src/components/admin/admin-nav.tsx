"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Module order from design D18.
export const ADMIN_MODULES = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pengaturan", label: "Pengaturan Website" },
  { href: "/admin/profil", label: "Profil Desa" },
  { href: "/admin/perangkat", label: "Perangkat Desa" },
  { href: "/admin/data-desa", label: "Data Desa" },
  { href: "/admin/potensi", label: "Potensi" },
  { href: "/admin/berita", label: "Berita" },
  { href: "/admin/pengumuman", label: "Pengumuman" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/layanan", label: "Layanan" },
  { href: "/admin/galeri", label: "Galeri" },
  { href: "/admin/pesan", label: "Pesan Kontak" },
  { href: "/admin/kontribusi", label: "Kontribusi Warga" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pendingCount, onNavigate }: { pendingCount: number | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-1">
      {ADMIN_MODULES.map((m) => {
        const active = isActive(pathname, m.href);
        const showBadge = m.href === "/admin/kontribusi" && pendingCount !== null && pendingCount > 0;
        return (
          <li key={m.href}>
            <Link
              href={m.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 rounded-md px-3 text-sm transition-colors",
                active ? "bg-secondary font-semibold text-secondary-foreground" : "hover:bg-muted",
              )}
            >
              <span>{m.label}</span>
              {showBadge ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  {pendingCount}
                  <span className="sr-only"> menunggu tinjauan</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminSidebarNav({ pendingCount }: { pendingCount: number | null }) {
  return (
    <nav aria-label="Navigasi admin">
      <NavLinks pendingCount={pendingCount} />
    </nav>
  );
}

export function AdminMobileNav({ pendingCount }: { pendingCount: number | null }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="size-11 lg:hidden" aria-label="Buka menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu Admin</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigasi admin" className="px-4 pb-6">
          <NavLinks pendingCount={pendingCount} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
