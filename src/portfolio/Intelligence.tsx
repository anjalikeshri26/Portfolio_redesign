import { Component, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Lines from "./Lines";
import { gsap, ScrollTrigger, usePf } from "./pf";
import IntelligenceScene, { Tick } from "./intel/IntelligenceScene";
import Spark from "./intel/Spark";
import { DESCENT_STEPS, K_ITERS, LAYERS, N_POINTS, WEIGHT_COUNT, descend, kmeans, makePoints } from "./intel/ml";

const STAGES = [
  { h: "A network makes a prediction", t: "Inputs flow through layers of weighted connections. Node brightness is its live activation, computed by a forward pass with fixed random weights." },
  { h: "Structure without labels", t: "K-means assigns every point to its nearest centroid, then moves each centroid to the mean of its points. Scroll to step through the iterations." },
  { h: "Learning is descent", t: "Gradient descent walks downhill on a loss surface. The learning rate sets the step size: too small crawls, too large overshoots. Try it." },
];
const WORKFLOW = [
  ["Load and clean", "NumPy, Pandas"], ["Explore", "Matplotlib, Seaborn"], ["Model", "Machine learning, Scikit-learn"], ["Evaluate", "Accuracy, ROC-AUC (SENTINEL)"], ["Serve", "Flask REST API (SENTINEL)"],
];
const STAGE_P = [0.12, 0.5, 0.86];

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

/** Static stand-in when WebGL is missing or fails: the same network, as plain SVG. */
function NetworkSvg() {
  const xs = LAYERS.map((_, l) => 60 + l * 120), ys = (n: number, i: number) => 100 + (i - (n - 1) / 2) * 34;
  return (
    <svg className="intel-fallback" viewBox="0 0 420 200" role="img" aria-label={`A feed-forward network with layers of ${LAYERS.join(", ")} nodes`}>
      {LAYERS.slice(0, -1).flatMap((n, l) => Array.from({ length: n }, (_, a) => Array.from({ length: LAYERS[l + 1] }, (_, b) => <line key={`${l}${a}${b}`} x1={xs[l]} y1={ys(n, a)} x2={xs[l + 1]} y2={ys(LAYERS[l + 1], b)} />)))}
      {LAYERS.flatMap((n, l) => Array.from({ length: n }, (_, i) => <circle key={`${l}-${i}`} cx={xs[l]} cy={ys(n, i)} r="5" />))}
    </svg>
  );
}

export default function Intelligence() {
  const { calm, gl } = usePf();
  const root = useRef<HTMLElement>(null), pin = useRef<HTMLDivElement>(null);
  const p = useRef(0);
  const [stage, setStage] = useState(0), [active, setActive] = useState(false), [lr, setLr] = useState(0.25), [tick, setTick] = useState<Tick>({ stage: 0, i: 0, v: 0 });
  const stRef = useRef<ScrollTrigger | null>(null);

  const losses = useMemo(() => descend(lr).map((q) => q[2]), [lr]);
  const inertia = useMemo(() => kmeans(makePoints()).map((s) => s.inertia), []);
  const onTick = useCallback((t: Tick) => setTick(t), []);
  const shared = useMemo(() => ({ p, lr, calm, onTick }), [lr, calm, onTick]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const upd = (v: number) => { p.current = v; setStage(v < 0.33 ? 0 : v < 0.66 ? 1 : 2); };
      if (calm) { p.current = STAGE_P[0]; return; }
      const o = { v: 0 };
      gsap.to(o, { v: 1, ease: "none", scrollTrigger: { trigger: pin.current, pin: true, start: "top top", end: "+=320%", scrub: 0.8, anticipatePin: 1,
        onUpdate: (s) => { stRef.current = s; upd(o.v); }, onToggle: (s) => { stRef.current = s; } }, onUpdate: () => upd(o.v) });
    }, root);
    return () => ctx.revert();
  }, [calm]);

  // Render the WebGL scene only while the chapter is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(root.current!); return () => io.disconnect();
  }, []);

  const goStage = (i: number) => {
    const st = stRef.current ?? ScrollTrigger.getAll().find((t) => t.pin === pin.current);
    if (!calm && st) { scrollTo({ top: st.start + (st.end - st.start) * STAGE_P[i], behavior: "smooth" }); return; }
    p.current = STAGE_P[i]; setStage(i);
  };

  const s = STAGES[stage];
  return (
    <section ref={root} id="intelligence" className="intel" aria-label="Intelligence in motion">
      <div ref={pin} className="intel-pin">
        {gl && <Boundary fallback={<NetworkSvg />}><IntelligenceScene s={shared} active={active} /></Boundary>}
        {!gl && <NetworkSvg />}
        <div className="intel-ui">
          <Lines as="h2" lines={["Intelligence", "in motion."]} className="display" />
          <div className="intel-copy" aria-live="polite">
            <h3>{s.h}</h3><p>{s.t}</p>
            {stage === 2 && <label className="intel-lr">Learning rate <output>{lr.toFixed(2)}</output><input type="range" min={0.03} max={0.9} step={0.01} value={lr} onChange={(e) => setLr(+e.target.value)} aria-label="Learning rate" /></label>}
          </div>
          <div className="intel-hud">
            {stage === 0 && <dl><div><dt>Architecture</dt><dd>{LAYERS.join(" → ")}</dd></div><div><dt>Weights</dt><dd>{WEIGHT_COUNT}</dd></div><div><dt>Output signal</dt><dd>{tick.stage === 0 ? tick.v.toFixed(2) : "–"}</dd></div></dl>}
            {stage === 1 && <><dl><div><dt>Points</dt><dd>{N_POINTS}</dd></div><div><dt>Iteration</dt><dd>{tick.stage === 1 ? tick.i + 1 : 1} / {K_ITERS}</dd></div><div><dt>Inertia</dt><dd>{tick.stage === 1 ? tick.v.toFixed(0) : "–"}</dd></div></dl><Spark values={inertia} index={tick.stage === 1 ? tick.i : 0} label="Inertia falling across k-means iterations" /></>}
            {stage === 2 && <><dl><div><dt>Step</dt><dd>{tick.stage === 2 ? tick.i : 0} / {DESCENT_STEPS}</dd></div><div><dt>Loss</dt><dd>{tick.stage === 2 ? tick.v.toFixed(3) : "–"}</dd></div></dl><Spark values={losses} index={tick.stage === 2 ? tick.i : 0} label="Loss across gradient descent steps" /></>}
          </div>
          <div className="intel-steps" role="group" aria-label="Visualization stage">
            {STAGES.map((x, i) => <button key={x.h} aria-pressed={stage === i} onClick={() => goStage(i)}>{x.h}</button>)}
          </div>
          <p className="intel-note">Illustrative visualizations generated in the browser. They are not output from my projects.</p>
        </div>
      </div>
      <div className="workflow">
        <Lines as="h3" lines={["The toolkit as a data workflow."]} className="workflow-h" />
        <ol>{WORKFLOW.map(([a, b], i) => <li key={a} tabIndex={0}><i>{i + 1}</i><b>{a}</b><span>{b}</span></li>)}</ol>
      </div>
    </section>
  );
}
