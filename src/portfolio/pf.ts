import { createContext, useContext } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

/** Capability flags shared by every chapter: calm = prefers-reduced-motion, gl = WebGL available. */
export interface PfFlags { calm: boolean; gl: boolean }
export const PfContext = createContext<PfFlags>({ calm: false, gl: true });
export const usePf = () => useContext(PfContext);

export const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
