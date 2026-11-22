import { useLayoutEffect, useRef } from "react";
import { projects, type Project } from "../content/data";
import { cases } from "../content/cases";
import CaseStudy from "./CaseStudy";
import Lines from "./Lines";
import { gsap, usePf } from "./pf";
import SentinelDemo from "./work/SentinelDemo";
import SafeWalkDemo from "./work/SafeWalkDemo";
import SkillPathDemo from "./work/SkillPathDemo";
import MyTasteDemo from "./work/MyTasteDemo";
import { BinaryDemo, NexusDemo, QuizDemo, TypistDemo } from "./work/Mini";

const byId = (id: string) => projects.find((p) => p.id === id)!;
const ext = { target: "_blank", rel: "noreferrer" } as const;
const RAIL: [string, React.ReactNode][] = [["nexus", <NexusDemo />], ["quiz", <QuizDemo />], ["typist", <TypistDemo />], ["leetcode", <BinaryDemo />]];

function Panel({ p, children }: { p: Project; children: React.ReactNode }) {
  const c = cases[p.id];
  return (
    <article className="panel" style={{ ["--a" as string]: p.accent }} aria-labelledby={`pn-${p.id}`}>
      <p className="case-meta"><span className="case-status">{p.status}</span> {p.type}</p>
      <h4 id={`pn-${p.id}`} className="panel-title">{p.name}</h4>
      <div className="panel-demo">{children}</div>
      <p className="panel-ps"><b>Problem.</b> {c.problem}</p>
      <p className="panel-ps"><b>Solution.</b> {c.solution}</p>
      <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
      <ul className="stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
      <p className="case-links">{p.links.map(([l, h]) => <a key={l} href={h} data-cursor="Open" {...(h.startsWith("http") ? ext : {})}>{l}</a>)}</p>
    </article>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), bar = useRef<HTMLSpanElement>(null);
  const { calm } = usePf();

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    // Horizontal storytelling only where it helps: wide screens and no reduced-motion preference.
    // Everywhere else the rail is a native, snap-scrolling horizontal strip, so nothing is ever hidden.
    mm.add("(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)", () => {
      if (calm) return;
      const t = track.current!, dist = () => t.scrollWidth - innerWidth;
      gsap.to(t, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".rail", pin: true, scrub: 0.6, start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`; } } });
    });
    return () => mm.revert();
  }, [calm]);

  return (
    <section ref={root} id="work" className="work" aria-label="Selected work">
      <div className="work-head">
        <Lines as="h2" lines={["Selected work."]} className="display" />
        <p>Four products presented as case studies, then four smaller builds. Open a live build or read the source to go deeper.</p>
      </div>
      <CaseStudy p={byId("skillpath")} variant="a"><SkillPathDemo /></CaseStudy>
      <CaseStudy p={byId("safewalk")} variant="b"><SafeWalkDemo /></CaseStudy>
      <CaseStudy p={byId("mytaste")} variant="c"><MyTasteDemo /></CaseStudy>
      <CaseStudy p={byId("sentinel")} variant="a"><SentinelDemo /></CaseStudy>
      <div className="rail" aria-label="More builds">
        <span className="rail-bar" aria-hidden="true"><i ref={bar} /></span>
        <div ref={track} className="rail-track" tabIndex={0} role="region" aria-label="Smaller builds, scrollable">
          <div className="rail-intro"><Lines as="h3" lines={["Smaller builds,", "working demos."]} className="rail-h" /><p>Four more projects. Every demo here is interactive.</p></div>
          {RAIL.map(([id, demo]) => <Panel key={id} p={byId(id)}>{demo}</Panel>)}
        </div>
      </div>
    </section>
  );
}
