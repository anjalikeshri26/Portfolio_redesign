import { ReactNode } from "react";
import type { Project } from "../content/data";
import { cases } from "../content/cases";
import Lines from "./Lines";

const ext = { target: "_blank", rel: "noreferrer" } as const;

/** Shared frame for a featured project: identity, problem, solution, features, technical highlights, stack, links. */
export default function CaseStudy({ p, variant, children }: { p: Project; variant: "a" | "b" | "c"; children: ReactNode }) {
  const c = cases[p.id];
  return (
    <article className={`case case-${variant}`} style={{ ["--a" as string]: p.accent }} aria-labelledby={`case-${p.id}`}>
      <header className="case-head">
        <p className="case-meta"><span className="case-status">{p.status}</span> {p.type}</p>
        <Lines as="h3" lines={[p.name]} className="case-title" />
        <span id={`case-${p.id}`} className="sr">{p.name}</span>
      </header>
      <div className="case-stage">{children}</div>
      <div className="case-copy">
        <div className="case-ps">
          <section><h4>The problem</h4><p>{c.problem}</p></section>
          <section><h4>My solution</h4><p>{c.solution}</p></section>
        </div>
        <section className="case-list"><h4>Features</h4><ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul></section>
        {c.highlights.length > 0 && <section className="case-list"><h4>Technical highlights</h4><ul>{c.highlights.map((x) => <li key={x}>{x}</li>)}</ul></section>}
        <section><h4>Built with</h4><ul className="stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul></section>
        <p className="case-links">{p.links.map(([l, h]) => <a key={l} href={h} data-cursor="Open" {...(h.startsWith("http") ? ext : {})}>{l}</a>)}</p>
      </div>
    </article>
  );
}
