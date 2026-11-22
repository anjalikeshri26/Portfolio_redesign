import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { learning, projects, skills, type Cat } from "../content/data";
import Lines from "./Lines";
import { gsap, usePf } from "./pf";

/* ============ Experiment 1: a spring integrator written from scratch ============ */
const SNIPPET = `// semi-implicit Euler, fixed 1/120 s step
const a = (-k * (x - target) - c * v) / m;
v += a * dt;
x += v * dt;`;
function Spring() {
  const [k, setK] = useState(180), [c, setC] = useState(12), [m, setM] = useState(1);
  const track = useRef<HTMLDivElement>(null), knob = useRef<HTMLButtonElement>(null), plot = useRef<SVGPolylineElement>(null);
  const sim = useRef({ x: 0, v: 0, t: 0, run: false, raf: 0, hist: [] as number[] });
  const params = useRef({ k, c, m }); params.current = { k, c, m };
  const { calm } = usePf();
  const zeta = c / (2 * Math.sqrt(k * m));
  const kind = zeta < 0.98 ? "Underdamped: it overshoots and rings" : zeta > 1.02 ? "Overdamped: it creeps to the target" : "Critically damped: the fastest settle without overshoot";

  const frame = (last: number) => (now: number) => {
    const s = sim.current, { k, c, m } = params.current; let dt = Math.min(0.05, (now - last) / 1000);
    while (dt > 0) { const h = Math.min(dt, 1 / 120), a = (-k * (s.x - s.t) - c * s.v) / m; s.v += a * h; s.x += s.v * h; dt -= h; }
    const w = track.current!.clientWidth - 44;
    knob.current!.style.transform = `translateX(${s.x * w}px)`;
    s.hist.push(s.x); if (s.hist.length > 220) s.hist.shift();
    plot.current?.setAttribute("points", s.hist.map((v, i) => `${(i / 219) * 300},${60 - v * 50}`).join(" "));
    if (Math.abs(s.v) < 0.002 && Math.abs(s.x - s.t) < 0.0005) { s.x = s.t; s.run = false; return; }
    s.raf = requestAnimationFrame(frame(now));
  };
  const start = () => { const s = sim.current; if (s.run) return; s.run = true; s.raf = requestAnimationFrame(frame(performance.now())); };
  useEffect(() => () => cancelAnimationFrame(sim.current.raf), []);
  const aim = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect(), s = sim.current; s.t = Math.min(1, Math.max(0, (e.clientX - r.left - 22) / (r.width - 44)));
    if (calm) { s.x = s.t; knob.current!.style.transform = `translateX(${s.x * (r.width - 44)}px)`; return; } start();
  };
  const key = (e: React.KeyboardEvent) => { const s = sim.current; if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); s.t = Math.min(1, Math.max(0, s.t + (e.key === "ArrowRight" ? 0.25 : -0.25))); if (calm) { s.x = s.t; knob.current!.style.transform = `translateX(${s.x * (track.current!.clientWidth - 44)}px)`; } else start(); } };

  return (
    <div className="xp">
      <div ref={track} className="spring-track" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); aim(e); }} onPointerMove={(e) => e.buttons && aim(e)} data-cursor="Drag">
        <button ref={knob} className="spring-knob" onKeyDown={key} aria-label="Spring target. Use left and right arrow keys, or drag along the track." />
      </div>
      <svg className="spring-plot" viewBox="0 0 300 60" aria-hidden="true"><line x1="0" x2="300" y1="10" y2="10" /><polyline ref={plot} /></svg>
      <div className="xp-ctl">
        <label>Stiffness <output>{k}</output><input type="range" min={20} max={400} value={k} onChange={(e) => setK(+e.target.value)} /></label>
        <label>Damping <output>{c}</output><input type="range" min={1} max={60} value={c} onChange={(e) => setC(+e.target.value)} /></label>
        <label>Mass <output>{m.toFixed(1)}</output><input type="range" min={0.5} max={4} step={0.1} value={m} onChange={(e) => setM(+e.target.value)} /></label>
      </div>
      <p className="xp-read" aria-live="polite">Damping ratio ζ = {zeta.toFixed(2)}. {kind}.</p>
      <pre className="code" aria-label="Integrator source"><code>{SNIPPET}</code></pre>
    </div>
  );
}

/* ============ Experiment 2: a layout that answers to its container, not the viewport ============ */
const CQ = `.cq { container-type: inline-size; }
@container (min-width: 420px) { .grid { grid-template-columns: 1fr 1fr; } }
@container (min-width: 640px) { .grid { grid-template-columns: 2fr 1fr 1fr; } }`;
function Container() {
  const [w, setW] = useState(100), [px, setPx] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const ro = new ResizeObserver(([e]) => setPx(Math.round(e.contentRect.width))); ro.observe(box.current!); return () => ro.disconnect(); }, []);
  const layout = px < 420 ? "one column" : px < 640 ? "two columns" : "featured first, then two columns";
  return (
    <div className="xp">
      <div className="cq-wrap"><div ref={box} className="cq" style={{ width: `${w}%` }}>
        <ul className="cq-grid">{projects.slice(0, 5).map((p) => <li key={p.id} style={{ ["--a" as string]: p.accent }}><b>{p.name}</b><span>{p.type}</span></li>)}</ul>
      </div></div>
      <div className="xp-ctl"><label>Container width <output>{px}px</output><input type="range" min={30} max={100} value={w} onChange={(e) => setW(+e.target.value)} /></label></div>
      <p className="xp-read" aria-live="polite">Layout: {layout}. The viewport never changed.</p>
      <pre className="code" aria-label="Container query source"><code>{CQ}</code></pre>
    </div>
  );
}

/* ============ Experiment 3: FLIP-animated chart of the technologies in my own project data ============ */
function Flip() {
  const [cat, setCat] = useState<"all" | Cat>("all"), [by, setBy] = useState<"count" | "name">("count");
  const rows = useMemo(() => {
    const m = new Map<string, number>();
    projects.filter((p) => cat === "all" || p.cat === cat).forEach((p) => p.stack.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    const top = [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
    return by === "name" ? top.sort((a, b) => a[0].localeCompare(b[0])) : top;
  }, [cat, by]);
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const list = useRef<HTMLOListElement>(null), prev = useRef(new Map<string, number>());
  const { calm } = usePf();
  useLayoutEffect(() => {
    const els = Array.from(list.current!.children) as HTMLElement[], next = new Map<string, number>();
    els.forEach((el) => { const top = el.offsetTop; next.set(el.dataset.k!, top); const before = prev.current.get(el.dataset.k!);
      if (calm) return;
      if (before === undefined) gsap.fromTo(el, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 });
      else if (before !== top) gsap.fromTo(el, { y: before - top }, { y: 0, duration: 0.7, ease: "power3.out" }); });
    prev.current = next;
  }, [rows, calm]);
  const filters: ["all" | Cat, string][] = [["all", "All projects"], ["ai", "AI and Python"], ["web", "Web"], ["problem", "Problem solving"]];
  return (
    <div className="xp">
      <div className="xp-chips" role="group" aria-label="Filter by project type">{filters.map(([k, l]) => <button key={k} aria-pressed={cat === k} onClick={() => setCat(k)}>{l}</button>)}</div>
      <div className="xp-chips" role="group" aria-label="Sort order">{(["count", "name"] as const).map((k) => <button key={k} aria-pressed={by === k} onClick={() => setBy(k)}>{k === "count" ? "Most used" : "A to Z"}</button>)}</div>
      <ol ref={list} className="flip">{rows.map(([n, v]) => <li key={n} data-k={n}><span>{n}</span><i style={{ width: `${(v / max) * 100}%` }} /><b>{v}</b></li>)}</ol>
      <p className="xp-read">Technologies counted across the {cat === "all" ? projects.length : "matching"} projects in this portfolio’s own data. Rows move with a hand-written FLIP routine.</p>
    </div>
  );
}

const EXPS = [["spring", "Spring physics", <Spring />], ["container", "Container-driven layout", <Container />], ["flip", "Animated data", <Flip />]] as const;
const KNOWN = ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "Git", "GitHub"].filter((t) => skills.some((s) => s.items.includes(t)));
const BUILD = ["TypeScript", "Three.js", "React Three Fiber", "GSAP and ScrollTrigger", "CSS container queries", "SVG"];

export default function Lab() {
  const [tab, setTab] = useState(0);
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "ArrowRight") setTab((t) => (t + 1) % EXPS.length); if (e.key === "ArrowLeft") setTab((t) => (t + EXPS.length - 1) % EXPS.length); };
  return (
    <section id="engineering" className="lab" aria-label="Engineering lab">
      <div className="lab-side">
        <Lines as="h2" lines={["Engineering", "lab."]} className="display" />
        <p>Three small experiments, each a working piece of front-end engineering rather than a screenshot. Everything here is plain TypeScript and CSS.</p>
        <div className="lab-tabs" role="tablist" aria-label="Experiments" onKeyDown={onKey}>
          {EXPS.map(([id, label], i) => <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === i} aria-controls={`pn-${id}`} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}>{label}</button>)}
        </div>
      </div>
      <div className="lab-bench">
        {EXPS.map(([id, , node], i) => <div key={id} id={`pn-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={tab !== i}>{tab === i && node}</div>)}
      </div>
      <div className="lab-know">
        <section><h3>Know</h3><p className="ct-sub">From my résumé</p><ul>{KNOWN.map((t) => <li key={t}>{t}</li>)}</ul></section>
        <section><h3>Explored in this portfolio</h3><p className="ct-sub">Used to build what you are looking at</p><ul>{BUILD.map((t) => <li key={t}>{t}</li>)}</ul></section>
        {learning.length > 0 && <section><h3>Currently learning</h3><ul>{learning.map((t) => <li key={t}>{t}</li>)}</ul></section>}
      </div>
    </section>
  );
}
