import { useEffect, useRef, useState } from "react";
import { chapters } from "./chapters";
import { usePf } from "./pf";

/** Fixed index bar. Active chapter comes from an IntersectionObserver (immune to pin-spacing shifts). */
export default function Nav() {
  const { calm } = usePf();
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const seen = new Map<string, number>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = "", max = 0.01;
      seen.forEach((v, k) => { if (v > max) { max = v; best = k; } });
      setActive(best);
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-30% 0px -30% 0px" });
    chapters.forEach((c) => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; }); };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { io.disconnect(); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [open]);

  const go = (id: string) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: calm ? "auto" : "smooth" }); };
  return (
    <>
    <header className="nav">
      <button className="nav-brand" onClick={() => { setOpen(false); scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }); }} aria-label="Anjali Keshri, back to top">AK</button>
      <nav className="nav-index" aria-label="Chapters">
        {chapters.map((c) => (
          <button key={c.id} onClick={() => go(c.id)} aria-current={active === c.id ? "true" : undefined} title={c.name}>
            <b>{c.letter}</b><span>{c.name}</span>
          </button>))}
      </nav>
      <button className="nav-toggle" aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Chapters"}</button>
      <span ref={bar} className="nav-progress" aria-hidden="true" />
    </header>
    <div id="nav-sheet" className={"nav-sheet" + (open ? " open" : "")} hidden={!open}>
      {chapters.map((c) => <button key={c.id} onClick={() => go(c.id)}><b>{c.letter}</b>{c.name}</button>)}
    </div>
    </>
  );
}
