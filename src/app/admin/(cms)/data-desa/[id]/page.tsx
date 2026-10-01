import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { StatisticForm } from "@/components/admin/forms/statistic-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PublishedBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getDistinctValues, getRecordById } from "@/lib/data/admin/records";
import { idSchema } from "@/lib/validation/common";
import type { VillageStatistic } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Data Desa" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStatisticPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [res, categories] = await Promise.all([
    getRecordById<VillageStatistic>("village_statistics", id),
    getDistinctValues("village_statistics", "category"),
  ]);
  if (res.ok && !res.data) notFound();
  return (
    <>
      <AdminPageHeader title="Edit Data Desa" backHref="/admin/data-desa">
        {res.ok && res.data ? <PublishedBadge published={res.data.is_published} /> : null}
      </AdminPageHeader>
      {res.ok && res.data ? (
        <StatisticForm key={res.data.updated_at} initial={res.data} categories={categories.ok ? categories.data : []} />
      ) : !res.ok ? (
        <AdminNotice reason={res.reason} />
      ) : null}
    </>
  );
}
