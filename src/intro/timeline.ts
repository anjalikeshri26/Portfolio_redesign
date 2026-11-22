import gsap from "gsap";
import { IntroState, STAND_X } from "./state";

/** Establishing shot, entrance, turn, welcome, point, reveal. Ends waiting for the click. */
export function buildIntro(s: IntroState, onReady: () => void) {
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: onReady });
  tl.to(s.cam, { x: 0, y: 1.9, z: 8.2, duration: 9, ease: "sine.inOut" }, 0);
  tl.set(s, { walk: 1 }, 1.2)
    .to(s, { x: STAND_X, duration: 5, ease: "none" }, 1.2)
    .to(s, { walk: 0, duration: 0.5 }, 5.9)
    .to(s, { rotY: -0.25, duration: 1.0 }, 6.1)
    .to(s, { welcome: 1, duration: 0.9 }, 7.3)
    .to(s, { welcome: 0, point: 1, duration: 0.9 }, 9.0)
    .to(s, { reveal: 1, duration: 1.6, ease: "none" }, 9.5);
  return tl;
}

/** Click transition: display grows toward the camera, camera pushes through until it fills the viewport. */
export function buildEnter(s: IntroState, onFill: () => void, onDone: () => void) {
  const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: onDone });
  tl.to(s.screen, { z: 1.4, scale: 1.1, duration: 1.4 }, 0)
    .to(s.cam, { x: 0, y: 2.45, z: -0.2, duration: 1.4 }, 0)
    .to(s.look, { x: 0, y: 2.45, z: -3.6, duration: 1.4 }, 0)
    .add(onFill, 1.0);
  return tl;
}
