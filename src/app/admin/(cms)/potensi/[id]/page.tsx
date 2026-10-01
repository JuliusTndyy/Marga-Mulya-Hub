import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { PotentialForm } from "@/components/admin/forms/potential-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { RichText } from "@/components/public/rich-text";
import { requireAdmin } from "@/lib/auth";
import { getRecordById } from "@/lib/data/admin/records";
import { idSchema } from "@/lib/validation/common";
import type { Potential } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Potensi" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPotentialPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<Potential>("potentials", id);
  if (res.ok && !res.data) notFound();
  if (!res.ok) {
    return (
      <>
        <AdminPageHeader title="Edit Potensi" backHref="/admin/potensi" />
        <AdminNotice reason={res.reason} />
      </>
    );
  }
  const row = res.data!;
  return (
    <>
      <AdminPageHeader title="Edit Potensi" backHref="/admin/potensi">
        <StatusBadge status={row.status} />
      </AdminPageHeader>
      <PotentialForm key={row.updated_at} initial={row} />
      {row.description ? (
        <section aria-labelledby="pratinjau" className="mt-10 max-w-3xl rounded-xl border bg-card p-5">
          <h2 id="pratinjau" className="mb-3 font-heading text-lg font-semibold">
            Pratinjau
          </h2>
          <RichText html={row.description} />
        </section>
      ) : null}
    </>
  );
}
