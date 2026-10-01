"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks } from "./nav-links";

// Mobile menu: Radix Dialog via shadcn Sheet (focus trap, Escape, focus return; design D13).
export function MobileNav({ siteName }: { siteName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="size-11 lg:hidden" aria-label="Buka menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading">{siteName}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigasi utama" className="px-4 pb-6">
          <NavLinks orientation="vertical" onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
