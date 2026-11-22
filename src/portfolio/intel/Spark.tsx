/** Tiny SVG line chart with a marker at `index`. Used for k-means inertia and the descent loss curve. */
export default function Spark({ values, index, label }: { values: number[]; index: number; label: string }) {
  const W = 220, Hh = 54, max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const pt = (v: number, i: number) => [(i / (values.length - 1)) * W, 4 + (1 - (v - min) / span) * (Hh - 8)] as const;
  const [mx, my] = pt(values[Math.min(index, values.length - 1)], Math.min(index, values.length - 1));
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label={label}>
      <polyline points={values.map((v, i) => pt(v, i).join(",")).join(" ")} />
      <circle cx={mx} cy={my} r="3.5" />
    </svg>
  );
}
