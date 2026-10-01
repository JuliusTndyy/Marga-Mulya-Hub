import { Leaf } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

// Server navbar: brand + links. aria-current comes from the small NavLinks client island.
// Smart search (SearchDialog) is dropped by scope simplification S5.
export function Navbar({ siteName }: { siteName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2 font-heading text-lg font-bold text-primary">
          <Leaf className="size-6 shrink-0" aria-hidden="true" />
          <span className="truncate">{siteName}</span>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <NavLinks />
        </nav>
        <MobileNav siteName={siteName} />
      </div>
    </header>
  );
}
