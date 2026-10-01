import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Shown when Supabase env is missing (design D6). HTTP status stays 200.
export function ServiceNotice({ className }: { className?: string }) {
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-xl border bg-muted p-5 text-foreground", className)}>
      <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <p>Layanan data belum dikonfigurasi. Hubungi pengelola situs.</p>
    </div>
  );
}
