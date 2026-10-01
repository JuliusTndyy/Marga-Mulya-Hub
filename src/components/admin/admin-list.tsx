import Link from "next/link";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/admin/action-button";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { selectClassName } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAGE_SIZE } from "@/lib/config";
import { formatTanggalWaktu } from "@/lib/dates";
import type { ActionResult, DataResult } from "@/lib/result";

export interface AdminColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

type BoundAction = () => Promise<ActionResult<unknown>>;

interface AdminListProps<T extends BaseRow> {
  title: string;
  basePath: string;
  createHref?: string;
  createLabel?: string;
  description?: ReactNode;
  result: DataResult<{ rows: T[]; total: number }>;
  q: string;
  status: string;
  page: number;
  /** Status filter options; `null` hides the status filter. */
  statusOptions?: { value: string; label: string }[] | null;
  /** Extra inputs rendered inside the GET filter form. */
  extraFilters?: ReactNode;
  /** Extra query params kept by pagination. */
  extraParams?: Record<string, string | undefined>;
  columns: AdminColumn<T>[];
  getTitle: (row: T) => string;
  editLabel?: string;
  /** Publish toggle: a bound server action plus its label, or null to hide it. */
  toggle?: (row: T) => { action: BoundAction; label: string } | null;
  /** A bound delete server action for the row. */
  deleteAction: (row: T) => BoundAction;
  emptyText?: string;
}

const DEFAULT_STATUS_OPTIONS = [
  { value: "semua", label: "Semua status" },
  { value: "draft", label: "Draf" },
  { value: "published", label: "Terbit" },
];

// Generic admin list (design D18). Module pages pass the columns and the bound actions,
// so this component never names an action itself.
export function AdminList<T extends BaseRow>(props: AdminListProps<T>) {
  const {
    title, basePath, createHref, createLabel, description, result, q, status, page,
    statusOptions = DEFAULT_STATUS_OPTIONS, extraFilters, extraParams = {}, columns, getTitle,
    editLabel = "Edit", toggle, deleteAction, emptyText = "Belum ada data.",
  } = props;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        {createHref ? (
          <Button asChild className="min-h-11">
            <Link href={createHref}>{createLabel ?? "Tambah"}</Link>
          </Button>
        ) : null}
      </div>
      {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}

      <form method="get" action={basePath} role="search" aria-label={`Cari ${title}`} className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="grid min-w-48 flex-1 gap-1.5">
          <Label htmlFor="admin-q">Kata kunci</Label>
          <Input id="admin-q" name="q" type="search" defaultValue={q} className="h-11" />
        </div>
        {statusOptions ? (
          <div className="grid gap-1.5">
            <Label htmlFor="admin-status">Status</Label>
            <select id="admin-status" name="status" defaultValue={status} className={selectClassName}>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {extraFilters}
        <Button type="submit" variant="secondary" className="min-h-11">
          Terapkan
        </Button>
      </form>

      {!result.ok ? (
        <AdminNotice reason={result.reason} />
      ) : result.data.rows.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <div role="region" aria-label={`Tabel ${title}`} tabIndex={0} className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {columns.map((c) => (
                    <th key={c.header} scope="col" className="px-4 py-3 font-semibold">
                      {c.header}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 font-semibold">Diperbarui</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Dibuat</th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.rows.map((row) => {
                  const t = toggle?.(row) ?? null;
                  return (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      {columns.map((c) => (
                        <td key={c.header} className="px-4 py-3 break-words">
                          {c.cell(row)}
                        </td>
                      ))}
                      <td className="px-4 py-3 whitespace-nowrap">{formatTanggalWaktu(row.updated_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatTanggalWaktu(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline" className="min-h-11">
                            <Link href={`${basePath}/${row.id}`} aria-label={`${editLabel} ${getTitle(row)}`}>
                              {editLabel}
                            </Link>
                          </Button>
                          {t ? <ActionButton action={t.action}>{t.label}</ActionButton> : null}
                          <DeleteDialog title={getTitle(row)} action={deleteAction(row)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination
            basePath={basePath}
            params={{ q: q || undefined, status: statusOptions ? status || undefined : undefined, ...extraParams }}
            page={page}
            total={result.data.total}
            pageSize={PAGE_SIZE.admin}
          />
        </>
      )}
    </div>
  );
}
