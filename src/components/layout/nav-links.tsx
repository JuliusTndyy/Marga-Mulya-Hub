"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, NAV_ITEMS } from "./nav-items";

// Small client island: only needed for aria-current via usePathname (design D13).
export function NavLinks({ orientation = "horizontal", onNavigate }: { orientation?: "horizontal" | "vertical"; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={cn(orientation === "horizontal" ? "flex items-center gap-1" : "grid gap-1")}>
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150",
                active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted",
                orientation === "vertical" && "text-base",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
