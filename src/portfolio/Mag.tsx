import { ReactNode, useEffect, useRef } from "react";
import { finePointer, gsap, usePf } from "./pf";

/** Magnetic wrapper: the child drifts toward the pointer inside a padded field and springs back on leave. */
export default function Mag({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { calm } = usePf();
  useEffect(() => {
    const el = ref.current;
    if (!el || calm || !finePointer()) return;
    const qx = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
    const qy = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * strength); qy((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { qx(0); qy(0); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.set(el, { x: 0, y: 0 }); };
  }, [calm, strength]);
  return <span ref={ref} className={"mag " + className}>{children}</span>;
}
