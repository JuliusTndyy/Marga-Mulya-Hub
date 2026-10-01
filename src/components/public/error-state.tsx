import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  /** Smaller inline variant for a single homepage section. */
  compact?: boolean;
  className?: string;
}

// A section or page whose data failed to load (design D6/D19).
export function ErrorState({ message = "Data gagal dimuat. Silakan muat ulang halaman.", compact, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive",
        compact ? "p-3 text-sm" : "p-5",
        className,
      )}
    >
      <TriangleAlert className={cn("shrink-0", compact ? "mt-0.5 size-4" : "mt-0.5 size-5")} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
