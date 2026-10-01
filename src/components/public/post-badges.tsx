import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/config";
import { ANNOUNCEMENT_STATE_LABELS, getAnnouncementState } from "@/lib/dates";
import { cn } from "@/lib/utils";

// Text badges (never color-only, design D13).

export function PriorityBadge({ priority }: { priority: 0 | 1 | 2 }) {
  if (priority === 0) return null;
  return (
    <Badge className={priority === 2 ? "bg-destructive text-white" : "bg-accent text-accent-foreground"}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function AnnouncementStateBadge({
  post,
  today,
}: {
  post: { start_date: string | null; end_date: string | null };
  today: string;
}) {
  const state = getAnnouncementState(post, today);
  return (
    <Badge
      variant="outline"
      className={cn(
        state === "active" && "border-success text-success",
        state === "expired" && "border-muted-foreground text-muted-foreground",
        state === "scheduled" && "border-primary text-primary",
      )}
    >
      {ANNOUNCEMENT_STATE_LABELS[state]}
    </Badge>
  );
}
