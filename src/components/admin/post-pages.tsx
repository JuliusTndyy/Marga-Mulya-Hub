import { notFound } from "next/navigation";
import { deletePost, setPostStatus } from "@/actions/posts";
import { AdminList, type AdminColumn } from "@/components/admin/admin-list";
import { AdminNotice } from "@/components/admin/admin-notice";
import { PostForm } from "@/components/admin/forms/post-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { RichText } from "@/components/public/rich-text";
import { requireAdmin } from "@/lib/auth";
import { POST_TYPES, PRIORITY_LABELS } from "@/lib/config";
import { listRows, parseListParams } from "@/lib/data/admin/lists";
import { getRecordById } from "@/lib/data/admin/records";
import { formatTanggal, getAnnouncementState, todayInSiteTz } from "@/lib/dates";
import { idSchema } from "@/lib/validation/common";
import type { InformationPost, PostType } from "@/types/db";

// Shared page implementations for Berita / Pengumuman / Agenda / Layanan (plan step 2.7).

export const POST_MODULES: Record<PostType, { path: string }> = {
  news: { path: "/admin/berita" },
  announcement: { path: "/admin/pengumuman" },
  event: { path: "/admin/agenda" },
  service: { path: "/admin/layanan" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function PostListPage({ type, searchParams }: { type: PostType; searchParams: SearchParams }) {
  await requireAdmin();
  const { path } = POST_MODULES[type];
  const label = POST_TYPES[type];
  const { q, status, page } = parseListParams(await searchParams, ["draft", "published"]);
  const filters: { column: string; value: string }[] = [{ column: "type", value: type }];
  if (status !== "semua") filters.push({ column: "status", value: status });
  const result = await listRows<InformationPost>("information_posts", {
    q, searchColumns: ["title", "excerpt"], page, filters,
    columns: "id, title, slug, type, status, priority, start_date, end_date, event_date, event_time, created_at, updated_at",
  });
  const today = todayInSiteTz();

  const columns: AdminColumn<InformationPost>[] = [{ header: "Judul", cell: (r) => r.title }];
  if (type === "announcement") {
    columns.push(
      {
        header: "Masa berlaku",
        cell: (r) => (
          <div className="grid gap-1">
            <StatusBadge status={getAnnouncementState(r, today)} />
            <span className="text-muted-foreground">
              {r.start_date ? formatTanggal(r.start_date) : "—"} s.d. {r.end_date ? formatTanggal(r.end_date) : "—"}
            </span>
          </div>
        ),
      },
      { header: "Prioritas", cell: (r) => PRIORITY_LABELS[r.priority] },
    );
  }
  if (type === "event") {
    columns.push({
      header: "Tanggal agenda",
      cell: (r) => (r.event_date ? `${formatTanggal(r.event_date)}${r.event_time ? `, ${r.event_time.slice(0, 5)} WIB` : ""}` : "—"),
    });
  }
  columns.push({ header: "Status", cell: (r) => <StatusBadge status={r.status} /> });

  return (
    <AdminList<InformationPost>
      title={label}
      basePath={path}
      createHref={`${path}/baru`}
      createLabel={`Tambah ${label}`}
      result={result}
      q={q}
      status={status}
      page={page}
      columns={columns}
      getTitle={(r) => r.title}
      toggle={(r) => ({
        action: setPostStatus.bind(null, r.id, r.status === "published" ? "draft" : "published"),
        label: r.status === "published" ? "Jadikan Draf" : "Terbitkan",
      })}
      deleteAction={(r) => deletePost.bind(null, r.id)}
    />
  );
}

export async function PostCreatePage({ type }: { type: PostType }) {
  await requireAdmin();
  const { path } = POST_MODULES[type];
  return (
    <>
      <AdminPageHeader title={`Tambah ${POST_TYPES[type]}`} backHref={path} />
      <PostForm type={type} listHref={path} />
    </>
  );
}

export async function PostEditPage({ type, params }: { type: PostType; params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { path } = POST_MODULES[type];
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const res = await getRecordById<InformationPost>("information_posts", id);
  if (res.ok && (!res.data || res.data.type !== type)) notFound(); // row must belong to this module
  const title = `Edit ${POST_TYPES[type]}`;
  if (!res.ok) {
    return (
      <>
        <AdminPageHeader title={title} backHref={path} />
        <AdminNotice reason={res.reason} />
      </>
    );
  }
  const row = res.data!;
  return (
    <>
      <AdminPageHeader title={title} backHref={path}>
        <StatusBadge status={row.status} />
      </AdminPageHeader>
      <PostForm key={row.updated_at} type={type} listHref={path} initial={row} />
      {row.content ? (
        <section aria-labelledby="pratinjau" className="mt-10 max-w-3xl rounded-xl border bg-card p-5">
          <h2 id="pratinjau" className="mb-3 font-heading text-lg font-semibold">
            Pratinjau
          </h2>
          <RichText html={row.content} />
        </section>
      ) : null}
    </>
  );
}
