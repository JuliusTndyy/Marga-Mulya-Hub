import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getPendingSubmissionCount } from "@/lib/data/admin/dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function CmsLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const pendingCount = await getPendingSubmissionCount();
  return (
    <AdminShell email={admin.email} pendingCount={pendingCount}>
      {children}
    </AdminShell>
  );
}
