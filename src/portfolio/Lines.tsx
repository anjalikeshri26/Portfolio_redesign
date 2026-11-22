import { createElement, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, usePf } from "./pf";

interface Props { lines: string[]; as?: "h1" | "h2" | "h3" | "p"; className?: string; auto?: boolean; stagger?: number }

/**
 * Masked line reveal. Lines are authored explicitly (no runtime text splitting), so the heading keeps one
 * accessible name and layout never depends on font metrics. With `auto`, each heading reveals once on scroll;
 * the hero passes auto={false} and drives the same `.ln-in` spans from its own timeline.
 */
export default function Lines({ lines, as = "h2", className = "", auto = true, stagger = 0.09 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { calm } = usePf();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || calm || !auto) return;
    const tween = gsap.from(el.querySelectorAll(".ln-in"), {
      yPercent: 108, duration: 1.05, ease: "power4.out", stagger, paused: true,
    });
    const st = ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => tween.play() });
    return () => { st.kill(); tween.kill(); };
  }, [calm, auto, stagger]);
  return createElement(as, { ref, className: "lines " + className, "aria-label": lines.join(" ") },
    lines.map((l) => <span key={l} className="ln" aria-hidden="true"><span className="ln-in">{l}</span></span>));
}
