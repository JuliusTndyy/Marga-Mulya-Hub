import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

// Shown above statistics when any row is sample data (design D11/D13).
export function SampleNotice({ className }: { className?: string }) {
  return (
    <div role="note" className={cn("flex items-start gap-3 rounded-xl border border-accent bg-accent/20 p-4 text-sm", className)}>
      <FlaskConical className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
      <p>
        <strong>Data contoh, bukan data resmi.</strong> Angka di bawah ini hanya contoh tampilan dan akan diganti dengan data
        resmi desa melalui CMS.
      </p>
    </div>
  );
}
