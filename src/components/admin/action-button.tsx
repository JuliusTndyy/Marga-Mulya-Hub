"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/result";

interface ActionButtonProps {
  /** A bound server action, e.g. setPotentialStatus.bind(null, id, "published"). */
  action: () => Promise<ActionResult<unknown>>;
  children: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  /** Navigate here after success instead of refreshing. */
  redirectTo?: string;
  className?: string;
}

// Runs a row action (publish toggle, archive, …) and reports the result with a toast.
export function ActionButton({ action, children, variant = "outline", redirectTo, className }: ActionButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      className={className ?? "min-h-11"}
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={() =>
        startTransition(async () => {
          try {
            const res = await action();
            if (res.ok) {
              toast.success(res.message);
              if (redirectTo) router.push(redirectTo);
              else router.refresh();
            } else {
              toast.error(res.message);
            }
          } catch {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
          }
        })
      }
    >
      {children}
    </Button>
  );
}
