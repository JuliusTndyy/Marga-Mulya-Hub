"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartDatum } from "@/lib/stats";

const numberFormat = new Intl.NumberFormat("id-ID");
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** true when the user asked for reduced motion; server render assumes reduced (no animation). */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

// Bar chart for one statistics group (design D13/D14, simplified to bar only by S2).
// The parent wraps it in role="img" with the text summary, so the SVG itself stays non-interactive
// (accessibilityLayer={false}); tooltips are mouse-only, the <details> table carries the same data.
export function ChartRenderer({ data }: { data: ChartDatum[] }) {
  const reducedMotion = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval={0} />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v: number) => numberFormat.format(v)}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          formatter={(value, _name, item) => {
            const u = (item?.payload as ChartDatum | undefined)?.unit ?? null;
            return [`${numberFormat.format(Number(value))}${u ? ` ${u}` : ""}`, "Nilai"];
          }}
        />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} />
      </BarChart>
    </ResponsiveContainer>
  );
}
