import type { Metadata } from "next";
import { deleteMessage } from "@/actions/messages";
import { AdminList } from "@/components/admin/admin-list";
import { requireAdmin } from "@/lib/auth";
import { listRows, parseListParams } from "@/lib/data/admin/lists";
import type { ContactMessage } from "@/types/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pesan Kontak" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Scope simplification S11: search only (no status filter), newest first.
export default async function MessagesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q, page } = parseListParams(await searchParams, []);
  const result = await listRows<ContactMessage>("contact_messages", {
    q, searchColumns: ["name", "subject", "message"], page,
    order: [{ column: "created_at", ascending: false }],
    columns: "id, name, subject, created_at, updated_at",
  });
  return (
    <AdminList<ContactMessage>
      title="Pesan Kontak"
      basePath="/admin/pesan"
      description="Pesan dikirim warga melalui formulir kontak. Pesan tidak dapat dibuat atau diubah dari CMS."
      result={result}
      q={q}
      status="semua"
      page={page}
      statusOptions={null}
      editLabel="Lihat"
      emptyText="Belum ada pesan."
      columns={[
        { header: "Pengirim", cell: (r) => r.name },
        { header: "Subjek", cell: (r) => r.subject },
      ]}
      getTitle={(r) => r.subject}
      deleteAction={(r) => deleteMessage.bind(null, r.id)}
    />
  );
}
