import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "./content/profile";
import { createIntroState } from "./intro/state";
import { buildEnter, buildIntro } from "./intro/timeline";

const Portfolio = lazy(() => import("./ui/Portfolio"));
const Lab = lazy(() => import("./scenes/Lab"));
type Phase = "intro" | "ready" | "entering" | "entered";

const webglOK = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const s = useMemo(createIntroState, []);
  const [phase, setPhase] = useState<Phase>("intro");
  const [gl] = useState(webglOK);
  const [lite] = useState(reduced);
  const veil = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);

  const fadeVeil = (d: number) => gsap.to(veil.current, { opacity: 1, duration: d, ease: "power2.in" });

  useEffect(() => {
    if (!gl || lite) { setPhase("ready"); return; }
    intro.current = buildIntro(s, () => setPhase("ready"));
    return () => { intro.current?.kill(); };
  }, [gl, lite, s]);

  const skip = () => intro.current?.progress(1);
  const enter = () => {
    if (phase !== "ready") return;
    setPhase("entering");
    if (!gl || lite) { fadeVeil(0.35).then(() => setPhase("entered")); return; }
    buildEnter(s, () => { fadeVeil(0.5); }, () => setPhase("entered"));
  };
  const replay = () => window.location.reload();

  if (!gl) return phase === "entered" ? (
    <Suspense fallback={null}><Portfolio gl={false} calm onReplay={replay} /></Suspense>
  ) : (
    <main className="fallback">
      <div><img src={profile.photo} alt="Anjali Keshri" style={{ width: 140, borderRadius: 4, marginBottom: "1rem" }} /><h1>{profile.screen.title}</h1><p>{profile.screen.subtitle}</p><p>{profile.screen.tagline}</p>
        <button className="ui-btn" onClick={() => setPhase("entered")}>{profile.screen.cta}</button></div>
    </main>
  );

  return (
    <>
      {lite ? (
        // Reduced motion: skip the choreography, jump straight to the finished frame.
        phase !== "entered" && <Suspense fallback={null}><LabStatic s={s} onEnter={enter} /></Suspense>
      ) : (
        phase !== "entered" && <Suspense fallback={<div className="veil on" style={{ opacity: 1 }}>Loading the lab…</div>}>
          <Lab s={s} ready={phase === "ready"} onEnter={enter} />
        </Suspense>
      )}
      <div className="sr" role="status" aria-live="polite">{phase === "ready" ? "Press the Enter button to continue." : ""}</div>
      {phase === "ready" && <button className="ui-btn" style={{ left: "1.25rem", bottom: "1.25rem" }} onClick={enter}>{profile.screen.cta}</button>}
      {phase === "intro" && <button className="ui-btn skip" onClick={skip}>Skip intro</button>}
      <div ref={veil} className={"veil" + (phase === "entered" ? " on" : "")} style={phase === "entered" ? { opacity: 1 } : undefined} />
      {phase === "entered" && <Suspense fallback={null}><Portfolio gl calm={lite} onReplay={replay} /></Suspense>}
    </>
  );
}

/** Reduced-motion variant: character already in final pose, screen fully revealed. */
function LabStatic({ s, onEnter }: { s: ReturnType<typeof createIntroState>; onEnter: () => void }) {
  s.x = 4.6; s.rotY = -0.25; s.point = 1; s.reveal = 1; s.cam = { x: 0, y: 1.9, z: 8.2 };
  return <Lab s={s} ready onEnter={onEnter} />;
}

