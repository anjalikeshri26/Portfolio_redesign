import { useEffect, useRef } from "react";
import { finePointer, gsap, usePf } from "./pf";

/**
 * Cursor ring for fine pointers only. It never replaces the native cursor (so it can't hide the pointer
 * from anyone) and takes its label from the nearest [data-cursor] ancestor via one delegated listener.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null), label = useRef<HTMLSpanElement>(null);
  const { calm } = usePf();
  useEffect(() => {
    const el = ring.current;
    if (!el || calm || !finePointer()) return;
    document.documentElement.classList.add("has-cursor");
    const qx = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => { qx(e.clientX); qy(e.clientY); el.classList.add("shown"); };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      el.dataset.mode = t ? "label" : "";
      if (label.current) label.current.textContent = t?.dataset.cursor ?? "";
    };
    const out = () => el.classList.remove("shown");
    window.addEventListener("pointermove", move); window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", out);
    return () => { document.documentElement.classList.remove("has-cursor"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); document.documentElement.removeEventListener("pointerleave", out); };
  }, [calm]);
  return <div ref={ring} className="cursor" aria-hidden="true"><span ref={label} /></div>;
}
