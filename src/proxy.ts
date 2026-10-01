import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/proxy";

// Next 16 proxy (formerly middleware), design D7. It only sends unauthenticated users to the
// login page and never redirects away from it, so it can't loop with the login page.
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!isSupabaseConfigured()) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }
  let result: { response: NextResponse; user: User | null };
  try {
    result = await updateSession(request);
  } catch (e) {
    console.error("[proxy] getUser failed", e instanceof Error ? e.message : e);
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (!result.user && !isLogin) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(url);
    result.response.cookies.getAll().forEach((c) => redirect.cookies.set(c)); // keep refreshed/cleared cookies
    return redirect;
  }
  return result.response;
}

export const config = { matcher: ["/admin/:path*"] };
