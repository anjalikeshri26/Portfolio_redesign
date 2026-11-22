import { useState } from "react";

const MODULES = [
  { k: "Resume analysis", t: "Identifies skill gaps and generates targeted learning recommendations." },
  { k: "Learning roadmaps", t: "Personalised, career-oriented paths toward a target role." },
  { k: "Adaptive assessments", t: "Mock assessments with topic-wise performance evaluation and progress tracking." },
  { k: "Mock interviews and tutoring", t: "AI-powered interviews, interactive tutoring and study-note generation using the Groq API." },
];
const LAYERS = [["API routes", "FastAPI · JWT"], ["Database operations", "SQLAlchemy · PostgreSQL"], ["AI services", "Generative AI · Groq API"]];

export default function SkillPathDemo() {
  const [i, setI] = useState(0);
  return (
    <div className="sp">
      <div className="sp-mods" role="tablist" aria-label="SkillPath Navigator features">
        {MODULES.map((m, n) => <button key={m.k} role="tab" id={`sp-t${n}`} aria-selected={i === n} aria-controls="sp-panel" onClick={() => setI(n)} className={i === n ? "on" : ""}>{m.k}</button>)}
      </div>
      <p id="sp-panel" role="tabpanel" aria-labelledby={`sp-t${i}`} className="sp-text">{MODULES[i].t}</p>
      <div className="sp-stack" aria-label="Backend structure">
        {LAYERS.map(([a, b]) => <div key={a}><b>{a}</b><span>{b}</span></div>)}
      </div>
      <p className="sw-note">Groups the documented stack. It is a map of the parts, not a deployment diagram.</p>
    </div>
  );
}
