import type { SupabaseClient } from "@supabase/supabase-js";
import { POST_TYPES } from "@/lib/config";
import { todayInSiteTz } from "@/lib/dates";
import type { DataResult } from "@/lib/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostType } from "@/types/db";

// Dashboard counts (design D18; scope simplification S10: count cards only, no recent list).
// A failed count is null ("—" on the card) and is logged.

export interface DashboardCounts {
  potentials: number | null;
  posts: Record<PostType, number | null>;
  gallery: number | null;
  statistics: number | null;
  officials: number | null;
  activeAnnouncements: number | null;
  upcomingEvents: number | null;
  pendingSubmissions: number | null;
  /** All contact messages (S11: the message status isn't used by the UI). */
  messages: number | null;
}

// The filter builder returned by select(..., { head: true }) (untyped client).
type CountQuery = ReturnType<ReturnType<SupabaseClient["from"]>["select"]>;
type Filter = (q: CountQuery) => CountQuery;

async function countRows(sb: SupabaseClient, table: string, filter: Filter = (q) => q): Promise<number | null> {
  try {
    const { count, error } = await filter(sb.from(table).select("id", { count: "exact", head: true }));
    if (error) {
      console.error(`[data:admin:dashboard:${table}]`, error.code, error.message);
      return null;
    }
    return count ?? 0;
  } catch (e) {
    console.error(`[data:admin:dashboard:${table}]`, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function getDashboardCounts(): Promise<DataResult<DashboardCounts>> {
  const sb = await createSupabaseServerClient();
  if (!sb) return { ok: false, reason: "unconfigured" };
  const today = todayInSiteTz();
  const postTypes = Object.keys(POST_TYPES) as PostType[];
  const [potentials, gallery, statistics, officials, activeAnnouncements, upcomingEvents, pendingSubmissions, messages, ...postCounts] =
    await Promise.all([
      countRows(sb, "potentials"),
      countRows(sb, "gallery_items"),
      countRows(sb, "village_statistics"),
      countRows(sb, "officials"),
      countRows(sb, "information_posts", (q) =>
        q.eq("type", "announcement").eq("status", "published").lte("effective_start", today).gte("effective_end", today),
      ),
      countRows(sb, "information_posts", (q) => q.eq("type", "event").eq("status", "published").gte("event_date", today)),
      countRows(sb, "citizen_submissions", (q) => q.eq("status", "pending")),
      countRows(sb, "contact_messages"),
      ...postTypes.map((t) => countRows(sb, "information_posts", (q) => q.eq("type", t))),
    ]);
  const posts = Object.fromEntries(postTypes.map((t, i) => [t, postCounts[i] ?? null])) as Record<PostType, number | null>;
  return {
    ok: true,
    data: { potentials, posts, gallery, statistics, officials, activeAnnouncements, upcomingEvents, pendingSubmissions, messages },
  };
}

/** Sidebar badge. Null on any failure (the badge then shows nothing). */
export async function getPendingSubmissionCount(): Promise<number | null> {
  const sb = await createSupabaseServerClient();
  if (!sb) return null;
  return countRows(sb, "citizen_submissions", (q) => q.eq("status", "pending"));
}
