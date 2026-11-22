import { useLayoutEffect, useRef } from "react";
import { about, hero } from "../content/data";
import { profile } from "../content/profile";
import Lines from "./Lines";
import { gsap, usePf } from "./pf";

// The loop in about.sub: rough idea, something usable, feedback, iteration.
const LOOP = ["A rough idea", "Something usable", "Feedback", "Iteration"];

export default function Mind() {
  const root = useRef<HTMLElement>(null);
  const { calm } = usePf();
  useLayoutEffect(() => {
    if (calm) return;
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.to(".mind-ill img", { yPercent: -7, ease: "none", scrollTrigger: st });
      gsap.to(".mind-tag", { yPercent: -45, ease: "none", scrollTrigger: st });
      gsap.fromTo(".loop-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".loop", start: "top 85%", end: "top 40%", scrub: true } });
      gsap.from(".loop li", { opacity: 0.15, stagger: 0.18, scrollTrigger: { trigger: ".loop", start: "top 85%", end: "top 40%", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [calm]);

  return (
    <section ref={root} id="mind" className="mind" aria-label="About Anjali">
      <div className="mind-head">
        <Lines as="h2" lines={["The mind", "behind the code."]} className="display" />
        <p className="mind-pull">{about.statement}</p>
      </div>
      <div className="mind-body">
        <div className="mind-text">
          {about.paras.map((p) => <p key={p}>{p}</p>)}
          <dl className="mind-facts">
            <div><dt>Programme</dt><dd>B.Tech, Computer Science &amp; Engineering (Artificial Intelligence and Machine Learning)</dd></div>
            <div><dt>Institute</dt><dd>Heritage Institute of Technology, Kolkata · 2025–2029</dd></div>
            <div><dt>Interests</dt><dd>Data analytics, machine learning, AI-driven application development</dd></div>
            <div><dt>Approach</dt><dd>{hero.chips[0]}. {hero.chips[2]}.</dd></div>
          </dl>
        </div>
        <figure className="mind-ill" data-cursor="Hello">
          <img src={profile.illustration} alt="Illustration of Anjali with a laptop, books, a neural network and robots" loading="lazy" width={717} height={1076} />
          <figcaption className="mind-tag">Anjali Keshri · {about.facts[1]}</figcaption>
        </figure>
      </div>
      <div className="loop" aria-label="How I work: a rough idea becomes something usable, then improves through feedback and iteration">
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true"><path className="loop-line" pathLength={1} d="M0 30 H1000" /></svg>
        <ol>{LOOP.map((l) => <li key={l}>{l}</li>)}</ol>
      </div>
    </section>
  );
}
