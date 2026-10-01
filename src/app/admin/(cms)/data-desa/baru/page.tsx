import type { Metadata } from "next";
import { StatisticForm } from "@/components/admin/forms/statistic-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { getDistinctValues } from "@/lib/data/admin/records";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Data Desa" };

export default async function NewStatisticPage() {
  await requireAdmin();
  const categories = await getDistinctValues("village_statistics", "category");
  return (
    <>
      <AdminPageHeader title="Tambah Data Desa" backHref="/admin/data-desa" />
      <StatisticForm categories={categories.ok ? categories.data : []} />
    </>
  );
}
