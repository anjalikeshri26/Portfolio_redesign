import { useMemo, useRef, useState } from "react";

// Illustrative street grid and two hand-placed routes. Not real map data and not SafeWalk's routing output.
const FAST: [number, number][] = [[40, 300], [120, 250], [200, 200], [290, 150], [380, 100], [470, 60]];
const SAFE: [number, number][] = [[40, 300], [40, 200], [150, 160], [270, 110], [380, 60], [470, 60]];
const LAYERS = [
  { id: "light", label: "Lighting", pts: [[40, 250], [95, 180], [210, 135], [330, 85]] },
  { id: "activity", label: "Activity", pts: [[150, 160], [165, 168], [138, 150], [270, 110], [284, 116]] },
  { id: "shops", label: "Open shops", pts: [[60, 200], [230, 122], [400, 58]] },
] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pts = (t: number) => FAST.map(([x, y], i) => [lerp(x, SAFE[i][0], t), lerp(y, SAFE[i][1], t)] as const);
const d = (p: readonly (readonly [number, number])[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

export default function SafeWalkDemo() {
  const [t, setT] = useState(0.7);
  const [layers, setLayers] = useState<Record<string, boolean>>({ light: true, activity: false, shops: false });
  const live = useMemo(() => d(pts(t)), [t]);
  const label = t < 0.25 ? "Fastest" : t > 0.75 ? "Safest" : "Balanced";
  const ref = useRef<SVGSVGElement>(null);
  return (
    <div className="sw">
      <svg ref={ref} viewBox="0 0 520 340" role="img" aria-label={`Illustrative street map showing a ${label.toLowerCase()} walking route between two points`}>
        {Array.from({ length: 8 }, (_, i) => <line key={"h" + i} x1="0" x2="520" y1={20 + i * 45} y2={20 + i * 45} className="sw-st" />)}
        {Array.from({ length: 11 }, (_, i) => <line key={"v" + i} y1="0" y2="340" x1={20 + i * 48} x2={20 + i * 48} className="sw-st" />)}
        <path d={d(FAST)} className="sw-ref" /><path d={d(SAFE)} className="sw-ref safe" />
        {LAYERS.map((l) => layers[l.id] && l.pts.map(([x, y], i) => l.id === "shops"
          ? <rect key={l.id + i} x={x - 5} y={y - 5} width="10" height="10" className={"sw-m " + l.id} />
          : <circle key={l.id + i} cx={x} cy={y} r={l.id === "light" ? 7 : 4} className={"sw-m " + l.id} />))}
        <path d={live} className="sw-live" />
        <circle cx={FAST[0][0]} cy={FAST[0][1]} r="8" className="sw-end" /><circle cx={FAST[5][0]} cy={FAST[5][1]} r="8" className="sw-end b" />
      </svg>
      <div className="sw-ctl">
        <label htmlFor="sw-range">Route priority <output htmlFor="sw-range">{label}</output></label>
        <input id="sw-range" type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(+e.target.value)} />
        <div className="sw-scale" aria-hidden="true"><span>Fastest</span><span>Safest</span></div>
        <fieldset><legend>Street context</legend>
          {LAYERS.map((l) => <button key={l.id} aria-pressed={layers[l.id]} onClick={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))}>{l.label}</button>)}
        </fieldset>
        <p className="sw-note">Illustration of the idea. The real app scores streets from OpenStreetMap.</p>
      </div>
    </div>
  );
}
