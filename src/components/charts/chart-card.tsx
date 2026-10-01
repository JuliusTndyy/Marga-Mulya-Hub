import { chartCaption, chartSummary, type ChartGroup } from "@/lib/stats";
import { ChartRenderer } from "./chart-renderer";
import { DataTable } from "./data-table";

// One statistics group (design D13/D14, S2): titled card holding a <figure> with a bar chart inside a
// role="img" summary, the real data table in <details>, and a figcaption with category, year and source.
// chart_type "none" → table only.
export function ChartCard({ group }: { group: ChartGroup }) {
  const caption = chartCaption(group);
  const sources = group.sources.length > 0 ? group.sources.join("; ") : "—";

  return (
    <article className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="font-heading text-xl font-bold break-words">{group.category}</h3>
      <figure className="grid gap-4">
        {group.renderType === "bar" ? (
          <>
            <div role="img" aria-label={chartSummary(group)} className="w-full">
              <ChartRenderer data={group.data} />
            </div>
            <details className="rounded-lg border bg-background">
              <summary className="flex min-h-11 cursor-pointer items-center px-4 font-medium">Lihat tabel data</summary>
              <div className="p-3 pt-0">
                <DataTable caption={caption} rows={group.rows} />
              </div>
            </details>
          </>
        ) : (
          <DataTable caption={caption} rows={group.rows} />
        )}
        <figcaption className="text-sm break-words text-muted-foreground">
          <span className="sr-only">{caption}. </span>
          Sumber: {sources} · Tahun data: {group.year}
        </figcaption>
      </figure>
    </article>
  );
}
