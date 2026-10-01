import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Missing image: secondary surface + icon + text (design D12).
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary text-secondary-foreground", className)}>
      <ImageOff className="size-7" aria-hidden="true" />
      <span className="text-sm">Foto belum tersedia</span>
    </div>
  );
}
