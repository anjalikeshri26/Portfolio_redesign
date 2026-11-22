import { useLayoutEffect, useRef } from "react";
import { profile } from "../content/profile";
import Lines from "./Lines";
import Mag from "./Mag";
import { gsap, usePf } from "./pf";

// Constellation drawn over the portrait: a small network, authored by hand so the composition is deliberate.
const NODES: [number, number][] = [[58, 96], [150, 40], [262, 78], [340, 170], [316, 292], [372, 398], [236, 452], [92, 420], [30, 300], [74, 196]];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [1, 9], [2, 4], [4, 6], [9, 7], [3, 5]];

export default function Hero() {
  const root = useRef<HTMLElement>(null), mask = useRef<HTMLDivElement>(null);
  const { calm } = usePf();

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (calm) return;
      // The one orchestrated moment on this page: headline rises, portrait unmasks, the network draws itself.
      gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 })
        .from(".hero .ln-in", { yPercent: 112, duration: 1.2, stagger: 0.12 }, 0)
        .from(".hero-name", { opacity: 0, y: 12, duration: 0.8 }, 0.1)
        .from(".hero-arch", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.5, ease: "power3.inOut" }, 0.2)
        .from(".hero-arch img", { scale: 1.25, duration: 1.8, ease: "power3.out" }, 0.2)
        .from(".hero-net .e", { strokeDashoffset: 1, duration: 1.6, stagger: 0.05, ease: "power2.inOut" }, 0.8)
        .from(".hero-net .n", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.06, ease: "back.out(3)" }, 1.1)
        .from(".hero-lead, .hero-meta > div, .hero-cta", { opacity: 0, y: 18, duration: 0.9, stagger: 0.1 }, 1.0);
      // Depth: each layer travels at its own rate as the hero leaves.
      const scrub = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-arch", { yPercent: -9, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-net", { yPercent: -16, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-title", { yPercent: 10, ease: "none", scrollTrigger: scrub });
    }, root);
    return () => ctx.revert();
  }, [calm]);

  // Colour is revealed through a soft circular mask that follows the pointer (fine pointers only).
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !mask.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(mask.current, { "--mx": `${e.clientX - r.left}px`, "--my": `${e.clientY - r.top}px`, "--r": "130px", duration: 0.5, ease: "power3" } as gsap.TweenVars);
  };
  const onLeave = () => mask.current && gsap.to(mask.current, { "--r": "0px", duration: 0.6 } as gsap.TweenVars);

  return (
    <section ref={root} id="top" className="hero" aria-label="Introduction">
      <div className="hero-grid" aria-hidden="true" />
      <p className="hero-name">Anjali Keshri</p>
      <div className="hero-title">
        <Lines as="h1" auto={false} className="hero-h" lines={["Curious by nature.", "Engineered to", "create what’s next."]} />
      </div>
      <div className="hero-art" onPointerMove={onMove} onPointerLeave={onLeave} data-cursor="Colour">
        <div className="hero-arch">
          <img src={profile.photo} alt="Portrait of Anjali Keshri" width={674} height={1079} fetchPriority="high" />
          <div ref={mask} className="hero-color"><img src={profile.photo} alt="" aria-hidden="true" width={674} height={1079} /></div>
        </div>
        <svg className="hero-net" viewBox="0 0 400 520" aria-hidden="true">
          {EDGES.map(([a, b], i) => <line key={i} className="e" pathLength={1} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />)}
          {NODES.map(([x, y], i) => <circle key={i} className="n" cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.2} />)}
        </svg>
      </div>
      <p className="hero-lead">I explore the intersection of computer science, intelligent systems, data and thoughtful digital experiences.</p>
      <div className="hero-meta">
        <div><dl><dt>Studying</dt><dd>B.Tech, Computer Science &amp; Engineering (AI &amp; ML)<br />Heritage Institute of Technology, Kolkata<br />2025–2029 · 9.88 CGPA</dd></dl></div>
        <div><dl><dt>Drawn to</dt><dd>Machine learning, data analysis, AI-driven applications and full-stack web development</dd></dl></div>
      </div>
      <div className="hero-cta">
        <Mag><a className="btn-round" href="#work" data-cursor="Go" onClick={(e) => { e.preventDefault(); document.getElementById("work")?.scrollIntoView({ behavior: calm ? "auto" : "smooth" }); }}>Explore<br />projects</a></Mag>
        <div className="scroll-cue" aria-hidden="true"><i /><span>Scroll</span></div>
      </div>
    </section>
  );
}
