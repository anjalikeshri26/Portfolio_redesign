import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, usePf } from "../pf";

// Pipeline steps restate the project description: TF-IDF features, Logistic Regression, Flask REST API.
const STEPS = [
  { k: "Chat message", t: "Text from a live chat arrives for moderation." },
  { k: "TF-IDF features", t: "The message is converted into TF-IDF features." },
  { k: "Logistic Regression", t: "A Logistic Regression classifier decides whether the message is potentially toxic." },
  { k: "Flask REST API", t: "The model is served through a REST API that accepts individual and batch predictions." },
];
const METRICS: [string, number, string][] = [["95.66%", 0.9566, "accuracy"], ["0.9859", 0.9859, "ROC-AUC"]];
const R = 52, C = 2 * Math.PI * R;

export default function SentinelDemo() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [on, setOn] = useState(0);
  const { calm } = usePf();

  const run = () => {
    tl.current?.kill();
    if (calm) return;
    const t = gsap.timeline();
    STEPS.forEach((_, i) => t.call(() => setOn(i), undefined, i * 0.8));
    t.fromTo(root.current!.querySelector(".sd-pulse"), { left: "0%" }, { left: "100%", duration: STEPS.length * 0.8 - 0.4, ease: "none" }, 0);
    tl.current = t;
  };

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (calm) return;
      gsap.from(".sd-arc", { strokeDashoffset: C, duration: 1.6, ease: "power3.out", stagger: 0.15, paused: true, scrollTrigger: { trigger: el, start: "top 75%", once: true, toggleActions: "play none none none" } });
      ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: run });
    }, root);
    return () => { ctx.revert(); tl.current?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm]);

  return (
    <div ref={root} className="sd">
      <div className="sd-flow" role="tablist" aria-label="SENTINEL pipeline">
        <span className="sd-track" aria-hidden="true"><i className="sd-pulse" /></span>
        {STEPS.map((s, i) => (
          <button key={s.k} role="tab" id={`sd-t${i}`} aria-selected={on === i} aria-controls="sd-panel" className={on === i ? "on" : ""} onClick={() => { tl.current?.kill(); setOn(i); }}>
            <b>{i + 1}</b><span>{s.k}</span>
          </button>))}
      </div>
      <p id="sd-panel" role="tabpanel" aria-labelledby={`sd-t${on}`} className="sd-text" aria-live="polite">{STEPS[on].t}</p>
      <div className="sd-bottom">
        <button className="sd-run" onClick={run} disabled={calm} title={calm ? "Animation is off because of your motion preference" : undefined}>Replay the pipeline</button>
        <div className="sd-gauges">
          {METRICS.map(([label, v, l]) => (
            <figure key={l}>
              <svg viewBox="0 0 120 120" role="img" aria-label={`${l}: ${label}`}>
                <circle cx="60" cy="60" r={R} className="sd-bg" />
                <circle cx="60" cy="60" r={R} className="sd-arc" strokeDasharray={C} strokeDashoffset={C * (1 - v)} transform="rotate(-90 60 60)" />
                <text x="60" y="66" textAnchor="middle">{label}</text>
              </svg>
              <figcaption>{l}</figcaption>
            </figure>))}
        </div>
      </div>
    </div>
  );
}
