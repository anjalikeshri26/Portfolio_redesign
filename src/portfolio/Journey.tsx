import { useLayoutEffect, useRef } from "react";
import { certs, education, recognition } from "../content/data";
import Lines from "./Lines";
import { gsap, usePf } from "./pf";

// Rows are matched by an exact word from their title so "Class X" can never match "Class XII".
const edu = (k: string) => education.find((e) => e[1].split(/\s|·/).includes(k)) ?? education[0];
const [bt, xii, x] = [edu("Heritage"), edu("CBSE"), edu("CISCE")] as const;
const ENTRIES = [
  { when: "2023", kind: "edu", big: x[0], title: x[1], sub: x[2].replace(" · 2023", "") },
  { when: "2023 to 2025", kind: "edu", big: xii[0], title: xii[1], sub: xii[2].replace(" · 2023–2025", "") },
  { when: "2025 to 2029", kind: "edu", big: bt[0], title: bt[1], sub: bt[2].replace(" · 2025–2029", ""), note: "CGPA, current" },
  { when: "2026", kind: "rec", big: "", title: `${recognition[0][0]}: ${recognition[0][1]}`, sub: recognition[0][2] },
  { when: "2026", kind: "rec", big: "", title: `${recognition[1][0]}: ${recognition[1][1]}`, sub: recognition[1][2] },
  { when: "Ongoing", kind: "now", big: "", title: recognition[2][1], sub: recognition[2][2] },
] as const;

export default function Journey() {
  const root = useRef<HTMLElement>(null);
  const { calm } = usePf();
  useLayoutEffect(() => {
    if (calm) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".tl-line", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".tl", start: "top 70%", end: "bottom 70%", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".tl li").forEach((li) => gsap.from(li.querySelector(".tl-body"), { opacity: 0, x: 24, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 80%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".tl li").forEach((li) => gsap.to(li, { scrollTrigger: { trigger: li, start: "top 70%", toggleClass: { targets: li, className: "on" } } }));
    }, root);
    return () => ctx.revert();
  }, [calm]);
  return (
    <section ref={root} id="journey" className="journey" aria-label="Academic journey and recognition">
      <div className="jr-side">
        <Lines as="h2" lines={["Academic journey", "& recognition."]} className="display" />
        <p>Where I have studied, how it has gone, and what I have been recognised for. Verified against my résumé.</p>
        <section className="certs"><h3>Certifications</h3>
          <ul>{certs.map((c) => { const i = c.lastIndexOf(", "); return <li key={c}><b>{c.slice(0, i)}</b><span>{c.slice(i + 2)}</span></li>; })}</ul></section>
      </div>
      <ol className="tl">
        <span className="tl-line" aria-hidden="true" />
        {ENTRIES.map((e) => (
          <li key={e.title} className={"tl-" + e.kind + (calm ? " on" : "")}>
            <span className="tl-dot" aria-hidden="true" />
            <div className="tl-body">
              <p className="tl-when">{e.when}</p>
              {e.big && <p className="tl-big">{e.big}{"note" in e && <small>{e.note}</small>}</p>}
              <h3>{e.title}</h3><p>{e.sub}</p>
            </div>
          </li>))}
      </ol>
    </section>
  );
}
