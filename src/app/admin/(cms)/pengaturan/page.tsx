import type { Metadata } from "next";
import { AdminNotice } from "@/components/admin/admin-notice";
import { SettingsForm } from "@/components/admin/forms/settings-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import type { SiteSettings } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pengaturan Website" };

export default async function SettingsPage() {
  await requireAdmin();
  const res = await getRecordById<SiteSettings>("site_settings", 1);
  return (
    <>
      <AdminPageHeader title="Pengaturan Website" />
      {res.ok ? <SettingsForm initial={res.data} /> : <AdminNotice reason={res.reason} />}
    </>
  );
}
