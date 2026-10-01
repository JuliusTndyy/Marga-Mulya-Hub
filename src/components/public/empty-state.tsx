import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Empty result with module-specific copy (design D6).
export function EmptyState({ message, children, className }: { message: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center", className)}>
      <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}
