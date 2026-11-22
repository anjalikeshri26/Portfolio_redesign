import { useEffect, useMemo } from "react";
import Cursor from "../portfolio/Cursor";
import Contact from "../portfolio/Contact";
import Hero from "../portfolio/Hero";
import Intelligence from "../portfolio/Intelligence";
import Journey from "../portfolio/Journey";
import Lab from "../portfolio/Lab";
import Mind from "../portfolio/Mind";
import Nav from "../portfolio/Nav";
import Toolkit from "../portfolio/Toolkit";
import Work from "../portfolio/Work";
import { PfContext, ScrollTrigger } from "../portfolio/pf";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/hanken-grotesk/latin-400.css";
import "@fontsource/hanken-grotesk/latin-500.css";
import "@fontsource/hanken-grotesk/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "../portfolio/styles/base.css";
import "../portfolio/styles/hero.css";
import "../portfolio/styles/mind.css";
import "../portfolio/styles/work.css";
import "../portfolio/styles/intel.css";
import "../portfolio/styles/lab.css";
import "../portfolio/styles/toolkit.css";
import "../portfolio/styles/journey.css";
import "../portfolio/styles/contact.css";

/**
 * The main portfolio. It scrolls the document itself (so pinning, horizontal rails and the browser's own
 * scroll behaviour all work normally) and shares two capability flags with every chapter through context.
 */
export default function Portfolio({ gl, calm, onReplay }: { gl: boolean; calm: boolean; onReplay: () => void }) {
  const flags = useMemo(() => ({ gl, calm }), [gl, calm]);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("pf-on"); scrollTo(0, 0);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh); addEventListener("load", refresh);
    return () => { root.classList.remove("pf-on"); removeEventListener("load", refresh); };
  }, []);
  return (
    <PfContext.Provider value={flags}>
      <div className="pf" lang="en">
        <a className="skip-link" href="#mind">Skip to the portfolio</a>
        <Cursor />
        <Nav />
        <main id="content">
          <Hero /><Mind /><Work /><Intelligence /><Lab /><Toolkit /><Journey /><Contact onReplay={onReplay} />
        </main>
      </div>
    </PfContext.Provider>
  );
}
