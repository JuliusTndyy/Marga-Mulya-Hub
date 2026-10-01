import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { LoginForm } from "@/components/admin/login-form";
import { Button } from "@/components/ui/button";
import { getAdmin, getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

const NO_ACCESS = "Akun ini tidak memiliki akses admin.";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="konten" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-1 font-heading text-2xl font-bold">Masuk Admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">Kelola konten situs desa melalui CMS.</p>
        {children}
      </div>
    </main>
  );
}

// Render order follows design D7.
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const next = first(sp.next);

  // 1. Unconfigured: notice + disabled form.
  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div role="status" className="mb-4 rounded-md border bg-muted p-3 text-sm">
          Supabase belum dikonfigurasi. Isi variabel lingkungan sesuai README.
        </div>
        <LoginForm disabled />
      </Shell>
    );
  }

  // 2. Already an admin: continue to the requested admin page.
  const admin = await getAdmin();
  if (admin) redirect(safeNext(next));

  // 3. Signed in but not an admin: explain and offer sign-out (Server Components can't clear cookies).
  const user = await getSessionUser();
  if (user) {
    return (
      <Shell>
        <div role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {NO_ACCESS}
        </div>
        <form action={signOut}>
          <Button type="submit" className="h-11 w-full">
            Keluar
          </Button>
        </form>
      </Shell>
    );
  }

  // 4. Not signed in.
  return (
    <Shell>
      {first(sp.error) === "akses" ? (
        <div role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {NO_ACCESS}
        </div>
      ) : null}
      <LoginForm next={next} />
    </Shell>
  );
}
