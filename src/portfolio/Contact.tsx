import { useLayoutEffect, useRef, useState } from "react";
import { contact } from "../content/data";
import { profile } from "../content/profile";
import Lines from "./Lines";
import Mag from "./Mag";
import { gsap, usePf } from "./pf";

const ext = { target: "_blank", rel: "noreferrer" } as const;
const RING = "Open to internships and collaborations · ";

export default function Contact({ onReplay }: { onReplay: () => void }) {
  const root = useRef<HTMLElement>(null);
  const { calm } = usePf();
  const [copied, setCopied] = useState(false);
  useLayoutEffect(() => {
    if (calm) return;
    const ctx = gsap.context(() => {
      const trigger = { trigger: root.current, start: "top 60%", once: true };
      gsap.from(".ct-ring", { scale: 0.55, rotate: -120, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: trigger });
      gsap.from(".ct-rows > li", { opacity: 0, y: 28, duration: 0.9, stagger: 0.09, ease: "power3.out", scrollTrigger: { ...trigger, start: "top 45%" } });
    }, root);
    return () => ctx.revert();
  }, [calm]);
  const copy = async () => { try { await navigator.clipboard.writeText(profile.links.email); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { location.href = `mailto:${profile.links.email}`; } };
  const rows: [string, string, string, boolean?][] = [
    ["Email", profile.links.email, `mailto:${profile.links.email}?subject=Let's%20connect`],
    ["LinkedIn", "anjali-keshri", profile.links.linkedin, true],
    ["GitHub", "anjalikeshri26", profile.links.github, true],
    ["Résumé", "Download (.docx)", contact.resume],
  ];
  return (
    <section ref={root} id="contact" className="contact" aria-label="Contact">
      <Lines as="h2" lines={["Let’s build", "something", "intelligent."]} className="ct-h" />
      <div className="ct-side">
        <p className="ct-sub">{contact.body}</p>
        <Mag strength={0.28}>
          <a className="ct-ring" href={`mailto:${profile.links.email}?subject=Let's%20connect`} data-cursor="Write" aria-label="Email Anjali">
            <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ct-c" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" /></defs><text><textPath href="#ct-c">{RING.repeat(2)}</textPath></text></svg>
            <span>Say<br />hello</span>
          </a>
        </Mag>
      </div>
      <ul className="ct-rows">
        {rows.map(([k, v, h, e]) => <li key={k}><a href={h} data-cursor={k === "Résumé" ? "Save" : "Open"} {...(e ? ext : {})} {...(k === "Résumé" ? { download: true } : {})}><span>{k}</span><b>{v}</b></a></li>)}
        <li><button onClick={copy} className="ct-copy"><span>Email address</span><b>{copied ? "Copied to clipboard" : "Copy"}</b></button></li>
      </ul>
      <p className="sr" role="status">{copied ? "Email address copied" : ""}</p>
      <footer className="ct-foot">
        <span>© {new Date().getFullYear()} Anjali Keshri. Kolkata, India.</span>
        <span><a href={`tel:${contact.phone}`}>Call +91 98362 43935</a> · <a href="https://leetcode.com/u/Anjali_keshri_260906" {...ext}>LeetCode</a> · <a href="https://www.geeksforgeeks.org/profile/anjali3g3v" {...ext}>GeeksforGeeks</a></span>
        <span><button onClick={onReplay}>Replay intro</button> · <button onClick={() => scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" })}>Back to top</button></span>
      </footer>
    </section>
  );
}
