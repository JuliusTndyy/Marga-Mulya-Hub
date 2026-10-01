import { Badge } from "@/components/ui/badge";
import type { PublicStatistic } from "@/lib/data/statistics";
import { formatNilai } from "./format";

type StatCardRow = Pick<PublicStatistic, "category" | "indicator" | "value" | "unit" | "year" | "is_sample">;

// Highlight statistic. Sample rows carry a visible text badge next to the value (design D13).
export function StatCard({ stat }: { stat: StatCardRow }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {stat.category} · {stat.indicator}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-heading text-3xl font-bold text-primary">{formatNilai(stat.value)}</span>
        {stat.unit ? <span className="text-muted-foreground">{stat.unit}</span> : null}
        {stat.is_sample ? (
          <Badge variant="outline" className="border-accent-strong text-accent-strong">
            Data contoh
          </Badge>
        ) : null}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Tahun {stat.year}</p>
    </div>
  );
}
