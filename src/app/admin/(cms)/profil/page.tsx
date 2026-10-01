import type { Metadata } from "next";
import { deleteProfile, setProfileStatus } from "@/actions/profiles";
import { AdminList } from "@/components/admin/admin-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { listRows, parseListParams } from "@/lib/data/admin/lists";
import type { VillageProfile } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil Desa" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProfilesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q, status, page } = parseListParams(await searchParams, ["draft", "published"]);
  const result = await listRows<VillageProfile>("village_profiles", {
    q, searchColumns: ["village_name"], page,
    filters: status !== "semua" ? [{ column: "status", value: status }] : [],
  });
  return (
    <AdminList<VillageProfile>
      title="Profil Desa"
      basePath="/admin/profil"
      createHref="/admin/profil/baru"
      createLabel="Tambah Profil"
      description="Halaman publik memakai profil terbit yang terakhir diperbarui."
      result={result}
      q={q}
      status={status}
      page={page}
      columns={[
        { header: "Nama desa", cell: (r) => r.village_name },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      getTitle={(r) => r.village_name}
      toggle={(r) => ({
        action: setProfileStatus.bind(null, r.id, r.status === "published" ? "draft" : "published"),
        label: r.status === "published" ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deleteProfile.bind(null, r.id)}
    />
  );
}
