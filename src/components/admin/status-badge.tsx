import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Text badges (never color alone, design D13).
const LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draf", className: "border-border bg-muted text-foreground" },
  published: { label: "Terbit", className: "bg-primary text-primary-foreground" },
  unread: { label: "Belum dibaca", className: "bg-accent text-accent-foreground" },
  read: { label: "Dibaca", className: "border-border bg-muted text-foreground" },
  archived: { label: "Diarsipkan", className: "border-border bg-background text-muted-foreground" },
  pending: { label: "Menunggu", className: "bg-accent text-accent-foreground" },
  approved: { label: "Disetujui", className: "bg-primary text-primary-foreground" },
  rejected: { label: "Ditolak", className: "bg-destructive text-white" },
  active: { label: "Aktif", className: "bg-primary text-primary-foreground" },
  expired: { label: "Berakhir", className: "border-border bg-muted text-foreground" },
  scheduled: { label: "Akan datang", className: "bg-secondary text-secondary-foreground" },
  sample: { label: "Data contoh", className: "border-border bg-muted text-foreground" },
  featured: { label: "Unggulan", className: "bg-accent text-accent-foreground" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = LABELS[status] ?? { label: status, className: "border-border bg-muted text-foreground" };
  return <Badge className={cn("text-sm", s.className, className)}>{s.label}</Badge>;
}

/** Statistics use is_published instead of a status column. */
export function PublishedBadge({ published }: { published: boolean }) {
  return <StatusBadge status={published ? "published" : "draft"} />;
}
