import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { projects, skills, skillsFoot } from "../content/data";
import Stats from "../ui/Stats";
import Lines from "./Lines";
import { gsap, usePf } from "./pf";

const ALIAS: Record<string, string> = { dsa: "data structures & algorithms" };
const norm = (s: string) => { const k = s.toLowerCase().trim(); return ALIAS[k] ?? k; };
const split = (stack: string[]) => stack.flatMap((s) => (s === "HTML/CSS" ? ["HTML", "CSS"] : [s]));

/** Verified skills plus any technology that appears in a project's own stack, grouped as in the data. */
function buildGroups() {
  const known = new Set(skills.flatMap((s) => s.items.map(norm)));
  const extra = new Set<string>();
  projects.forEach((p) => split(p.stack).forEach((t) => { if (!known.has(norm(t))) extra.add(t); }));
  return [...skills.map((s) => ({ group: s.group, items: s.items })), { group: "Used inside projects", items: [...extra] }];
}
const GROUPS = buildGroups();
const USES = new Map(projects.map((p) => [p.id, new Set(split(p.stack).map(norm))]));

type Sel = { kind: "p" | "s"; id: string };

export default function Toolkit() {
  const { calm } = usePf();
  const [sel, setSel] = useState<Sel>({ kind: "p", id: "sentinel" });
  const [paths, setPaths] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null), refs = useRef(new Map<string, HTMLElement>());
  const reg = (k: string) => (el: HTMLElement | null) => { if (el) refs.current.set(k, el); else refs.current.delete(k); };

  const pairs = useMemo(() => {
    const out: [string, string][] = [];
    projects.forEach((p) => GROUPS.forEach((g) => g.items.forEach((t) => { if (USES.get(p.id)!.has(norm(t))) out.push([p.id, t]); })));
    return out.filter(([p, t]) => (sel.kind === "p" ? p === sel.id : t === sel.id));
  }, [sel]);
  const litSkills = new Set(pairs.map(([, t]) => t)), litProjects = new Set(pairs.map(([p]) => p));
  const linked = useMemo(() => new Set(projects.flatMap((p) => GROUPS.flatMap((g) => g.items.filter((t) => USES.get(p.id)!.has(norm(t)))))), []);

  const measure = useCallback(() => {
    const b = box.current; if (!b || innerWidth < 900) { setPaths([]); return; }
    const o = b.getBoundingClientRect();
    setPaths(pairs.flatMap(([p, t]) => {
      const a = refs.current.get("p:" + p)?.getBoundingClientRect(), c = refs.current.get("s:" + t)?.getBoundingClientRect(); if (!a || !c) return [];
      const x1 = a.right - o.left, y1 = a.top + a.height / 2 - o.top, x2 = c.left - o.left, y2 = c.top + c.height / 2 - o.top, mx = (x1 + x2) / 2;
      return [`M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`];
    }));
  }, [pairs]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => { const ro = new ResizeObserver(measure); ro.observe(box.current!); return () => ro.disconnect(); }, [measure]);
  useLayoutEffect(() => { if (calm) return; const q = gsap.utils.toArray<SVGPathElement>(".tk-lines path"); if (!q.length) return;
    gsap.fromTo(q, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out", stagger: 0.02 }); }, [paths, calm]);

  const hint = sel.kind === "p"
    ? `${projects.find((p) => p.id === sel.id)!.name} uses ${pairs.length} of the technologies shown.`
    : `${sel.id} appears in ${pairs.length} project${pairs.length === 1 ? "" : "s"}${pairs.length ? "" : " here. It is part of my toolkit but not yet tied to one of these projects"}.`;

  return (
    <section id="toolkit" className="toolkit" aria-label="Technical toolkit">
      <div className="tk-head">
        <Lines as="h2" lines={["Technical", "toolkit."]} className="display" />
        <p>Choose a project to see what it was built with, or choose a technology to see where it has been used. Nothing is rated, because a number would say less than a project does.</p>
      </div>
      <div ref={box} className="tk-map">
        <svg className="tk-lines" aria-hidden="true">{paths.map((d, i) => <path key={i} d={d} pathLength={1} />)}</svg>
        <ul className="tk-projects" aria-label="Projects">
          {projects.map((p) => (
            <li key={p.id}><button ref={reg("p:" + p.id)} style={{ ["--a" as string]: p.accent }} aria-pressed={sel.kind === "p" && sel.id === p.id} className={sel.kind === "s" && litProjects.has(p.id) ? "lit" : ""} onClick={() => setSel({ kind: "p", id: p.id })}>{p.name}</button></li>))}
        </ul>
        <div className="tk-groups">
          {GROUPS.map((g) => (
            <section key={g.group}><h3>{g.group}</h3>
              <ul>{g.items.map((t) => (
                <li key={t}><button ref={reg("s:" + t)} aria-pressed={sel.kind === "s" && sel.id === t} className={(sel.kind === "p" && litSkills.has(t) ? "lit " : "") + (!linked.has(t) ? "solo" : "")}
                  onMouseEnter={() => setSel({ kind: "s", id: t })} onFocus={() => setSel({ kind: "s", id: t })} onClick={() => setSel({ kind: "s", id: t })}>{t}</button></li>))}</ul>
            </section>))}
        </div>
      </div>
      <p className="tk-hint" aria-live="polite">{hint}</p>
      <p className="tk-foot">Technologies without a connecting line are part of my toolkit and practice but are not used in one of these {projects.length} projects. {skillsFoot}</p>
      <div className="practice">
        <Lines as="h3" lines={["Practice record."]} className="practice-h" />
        <p className="ct-sub">Pulled from my public profiles, so it changes as I solve problems and push code.</p>
        <Stats />
      </div>
    </section>
  );
}
