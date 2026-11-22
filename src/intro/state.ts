// Shared mutable animation state: GSAP writes it, the 3D scene reads it each frame.
export interface IntroState {
  x: number; z: number; rotY: number;
  walk: number; welcome: number; point: number;
  reveal: number;
  cam: { x: number; y: number; z: number };
  look: { x: number; y: number; z: number };
  screen: { z: number; scale: number };
}
export const createIntroState = (): IntroState => ({
  x: 9, z: 0.4, rotY: -Math.PI / 2, walk: 0, welcome: 0, point: 0, reveal: 0,
  cam: { x: -6, y: 2.0, z: 9.5 }, look: { x: 0, y: 1.8, z: -2 },
  screen: { z: 0, scale: 1 },
});
export const SCREEN = { w: 6.4, h: 3.6, y: 2.45, z: -3.6 };
export const STAND_X = 4.6; // she stops at the viewer's right of the screen
