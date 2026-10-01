import { formatNilai } from "@/components/public/format";

export interface DataTableRow {
  id: string;
  indicator: string;
  value: number | string;
  unit: string | null;
  year: number;
}

// Real <table> alternative for statistics (design D13): <caption>, th scope, scroll region.
export function DataTable({ caption, rows }: { caption: string; rows: DataTableRow[] }) {
  return (
    <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <caption className="px-4 pt-4 pb-2 text-left font-heading text-base font-semibold">{caption}</caption>
        <thead className="border-b bg-muted/60">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Indikator
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Nilai
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Satuan
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Tahun
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-b-0">
              <th scope="row" className="px-4 py-3 font-medium">
                {r.indicator}
              </th>
              <td className="px-4 py-3 text-right tabular-nums">{formatNilai(r.value)}</td>
              <td className="px-4 py-3">{r.unit ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
