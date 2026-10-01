import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server-side auth checks with the cookie-bound client (design D7).

/** The signed-in Supabase user, or null when unconfigured / no session / auth error. */
export async function getSessionUser(): Promise<User | null> {
  const sb = await createSupabaseServerClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch (e) {
    console.error("[auth] getUser failed", e instanceof Error ? e.message : e);
    return null;
  }
}

/** The admin row for the signed-in user, or null (not signed in, not an admin, or a query error). */
export async function getAdmin(): Promise<{ id: string; email: string } | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const sb = await createSupabaseServerClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("admin_users")
      .select("id, email")
      .eq("id", user.id)
      .maybeSingle<{ id: string; email: string }>();
    if (error) {
      console.error("[auth] admin lookup failed", error.code);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error("[auth] admin lookup failed", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Redirects to the login page unless the caller is an admin. */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?error=akses");
  return admin;
}
