import { Canvas, useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp, smooth } from "../pf";
import { DESCENT_STEPS, K, K_ITERS, LAYERS, N_POINTS, SURF, descend, forward, kmeans, loss, makeNetwork, makePoints } from "./ml";

export interface Tick { stage: number; i: number; v: number }
interface Shared { p: MutableRefObject<number>; lr: number; calm: boolean; onTick: (t: Tick) => void }
const KC = ["#4fe3ff", "#2447ff", "#ece6d8"].map((c) => new THREE.Color(c));
const NEUTRAL = new THREE.Color("#6f7a99");
const H = 0.62; // vertical exaggeration of the loss surface

/** Cross-fade weights for the three stages. */
const weights = (p: number) => [1 - smooth(0.28, 0.36, p), smooth(0.28, 0.36, p) * (1 - smooth(0.62, 0.7, p)), smooth(0.62, 0.7, p)];

/* ---- Stage 1: a network doing live forward passes ---- */
function Network({ s }: { s: Shared }) {
  const g = useRef<THREE.Group>(null!), nodes = useRef<THREE.InstancedMesh>(null!), lines = useRef<THREE.LineBasicMaterial>(null!), pulses = useRef<THREE.InstancedMesh>(null!);
  const net = useMemo(makeNetwork, []);
  const flat = useMemo(() => net.pos.flat(), [net]);
  const geo = useMemo(() => { const a: number[] = []; net.edges.forEach(([l, i, j]) => a.push(...net.pos[l][i], ...net.pos[l + 1][j])); return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(a, 3)); }, [net]);
  const d = useMemo(() => new THREE.Object3D(), []), c = useMemo(() => new THREE.Color(), []);
  const last = useRef("");
  useFrame((st) => {
    const w = weights(s.p.current)[0], t = s.calm ? 1.2 : st.clock.elapsedTime;
    g.current.visible = w > 0.01; if (!g.current.visible) return;
    lines.current.opacity = 0.32 * w;
    const acts = forward(net.W, [Math.sin(t * 0.9), Math.sin(t * 0.7 + 1.7), Math.cos(t * 0.5 + 0.4), Math.sin(t * 1.1 + 3)]).flat();
    flat.forEach((p, i) => { const a = Math.abs(acts[i]); d.position.set(...p); d.scale.setScalar((0.05 + 0.1 * a) * (0.4 + 0.6 * w)); d.updateMatrix(); nodes.current.setMatrixAt(i, d.matrix); nodes.current.setColorAt(i, c.set("#5a6a96").lerp(KC[0], a)); });
    nodes.current.instanceMatrix.needsUpdate = true; if (nodes.current.instanceColor) nodes.current.instanceColor.needsUpdate = true;
    for (let i = 0; i < 40; i++) { const [l, a, b] = net.edges[(i * 11) % net.edges.length], f = (t * 0.5 + i * 0.137) % 1, A = net.pos[l][a], B = net.pos[l + 1][b];
      d.position.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f); d.scale.setScalar(w); d.updateMatrix(); pulses.current.setMatrixAt(i, d.matrix); }
    pulses.current.instanceMatrix.needsUpdate = true;
    const key = `0:${Math.round(acts[acts.length - 1] * 20)}`; if (key !== last.current) { last.current = key; s.onTick({ stage: 0, i: 0, v: acts[acts.length - 1] }); }
  });
  return (
    <group ref={g}>
      <lineSegments geometry={geo}><lineBasicMaterial ref={lines} color="#2447ff" transparent opacity={0} /></lineSegments>
      <instancedMesh ref={nodes} args={[undefined, undefined, flat.length]}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial /></instancedMesh>
      <instancedMesh ref={pulses} args={[undefined, undefined, 40]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#4fe3ff" /></instancedMesh>
    </group>
  );
}

/* ---- Stage 2: k-means, one real iteration at a time ---- */
function Clusters({ s }: { s: Shared }) {
  const pts = useRef<THREE.Points>(null!), mat = useRef<THREE.PointsMaterial>(null!), cents = useRef<THREE.Group>(null!);
  const data = useMemo(() => { const p = makePoints(); return { p, steps: kmeans(p) }; }, []);
  const geo = useMemo(() => new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(data.p, 3)).setAttribute("color", new THREE.BufferAttribute(new Float32Array(N_POINTS * 3), 3)), [data]);
  const shown = useRef(-2);
  useFrame(() => {
    const w = weights(s.p.current)[1]; mat.current.opacity = w; pts.current.visible = cents.current.visible = w > 0.01; if (w <= 0.01) return;
    const prog = clamp((s.p.current - 0.36) / 0.26) , x = clamp((prog - 0.06) / 0.88) * (K_ITERS - 1), idx = prog < 0.04 ? -1 : Math.floor(x), fr = x - Math.floor(x);
    if (idx !== shown.current) {
      shown.current = idx; const col = geo.attributes.color.array as Float32Array;
      for (let i = 0; i < N_POINTS; i++) { const k = idx < 0 ? NEUTRAL : KC[data.steps[idx].assign[i]]; col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b; }
      geo.attributes.color.needsUpdate = true; s.onTick({ stage: 1, i: Math.max(idx, 0), v: data.steps[Math.max(idx, 0)].inertia });
    }
    const a = data.steps[Math.max(idx, 0)].cent, b = data.steps[Math.min(Math.max(idx, 0) + 1, K_ITERS - 1)].cent;
    cents.current.children.forEach((m, k) => { m.position.set(a[k][0] + (b[k][0] - a[k][0]) * fr, a[k][1] + (b[k][1] - a[k][1]) * fr, a[k][2] + (b[k][2] - a[k][2]) * fr); (m as THREE.Mesh).scale.setScalar(w * (idx < 0 ? 0.01 : 1)); });
  });
  return (
    <>
      <points ref={pts} geometry={geo}><pointsMaterial ref={mat} size={0.085} vertexColors transparent opacity={0} depthWrite={false} /></points>
      <group ref={cents}>{Array.from({ length: K }, (_, k) => <mesh key={k}><octahedronGeometry args={[0.2]} /><meshBasicMaterial color={KC[k]} wireframe /></mesh>)}</group>
    </>
  );
}

/* ---- Stage 3: gradient descent on a loss surface ---- */
function Descent({ s }: { s: Shared }) {
  const g = useRef<THREE.Group>(null!), ball = useRef<THREE.Mesh>(null!), grid = useRef<THREE.LineBasicMaterial>(null!), ballM = useRef<THREE.MeshBasicMaterial>(null!);
  const surface = useMemo(() => {
    const n = 40, pos: number[] = [], col: number[] = [], c = new THREE.Color(), lo = new THREE.Color("#4fe3ff"), hi = new THREE.Color("#2447ff");
    const v = (i: number, j: number) => { const x = -SURF + (i / n) * 2 * SURF, y = -SURF + (j / n) * 2 * SURF, h = loss(x, y); c.copy(lo).lerp(hi, clamp((h - 0.2) / 2.2)); return [x, h * H, y, c.r, c.g, c.b]; };
    for (let i = 0; i <= n; i++) for (let j = 0; j < n; j++) { for (const [a, b] of [[i, j], [i, j + 1]]) { const q = v(a, b); pos.push(q[0], q[1], q[2]); col.push(q[3], q[4], q[5]); } }
    for (let j = 0; j <= n; j++) for (let i = 0; i < n; i++) { for (const [a, b] of [[i, j], [i + 1, j]]) { const q = v(a, b); pos.push(q[0], q[1], q[2]); col.push(q[3], q[4], q[5]); } }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)).setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  }, []);
  const path = useMemo(() => descend(s.lr), [s.lr]);
  const trail = useMemo(() => { const g2 = new THREE.BufferGeometry(); g2.setAttribute("position", new THREE.Float32BufferAttribute(path.flatMap(([x, y, l]) => [x, l * H + 0.06, y]), 3)); return g2; }, [path]);
  const trailMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#ece6d8", transparent: true, opacity: 0 }), []);
  const trailLine = useMemo(() => new THREE.Line(trail, trailMat), [trail, trailMat]);
  const last = useRef(-1);
  useEffect(() => { last.current = -1; }, [path]);
  useFrame(() => {
    const w = weights(s.p.current)[2]; g.current.visible = w > 0.01; if (!g.current.visible) return;
    grid.current.opacity = 0.5 * w; trailMat.opacity = w; ballM.current.opacity = w;
    const prog = clamp((s.p.current - 0.7) / 0.26), x = prog * DESCENT_STEPS, i = Math.min(DESCENT_STEPS, Math.floor(x)), f = x - i, A = path[i], B = path[Math.min(DESCENT_STEPS, i + 1)];
    const px = A[0] + (B[0] - A[0]) * f, py = A[1] + (B[1] - A[1]) * f, pl = loss(px, py);
    ball.current.position.set(px, pl * H + 0.12, py); trail.setDrawRange(0, i + 2);
    if (i !== last.current) { last.current = i; s.onTick({ stage: 2, i, v: A[2] }); }
  });
  return (
    <group ref={g} position={[0, -0.9, 0]}>
      <lineSegments geometry={surface}><lineBasicMaterial ref={grid} vertexColors transparent opacity={0} /></lineSegments>
      <primitive object={trailLine} />
      <mesh ref={ball}><sphereGeometry args={[0.14, 16, 16]} /><meshBasicMaterial ref={ballM} color="#ece6d8" transparent opacity={0} /></mesh>
    </group>
  );
}

/** Scroll-driven camera: it flies through the network, settles in front of the cloud, then rises over the surface. */
function Rig({ s }: { s: Shared }) {
  const keys = useMemo(() => [[-6.5, 1.4, 7.5, 0, 0, 0], [5.5, 0.9, 6.5, 0, 0, 0], [0.5, 0.4, 8.6, 0, 0, 0], [3.5, 1.2, 7.2, 0, 0, 0], [0, 6.2, 7.4, 0, -0.6, 0], [4.8, 4.0, 5.6, 0, -0.9, 0]].map((k) => k.map(Number)), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, pointer, size }) => {
    const fit = Math.max(1, 1.5 / (size.width / size.height)); // pull back on narrow screens so the scene always fits
    const u = clamp(s.p.current) * (keys.length - 1), i = Math.min(keys.length - 2, Math.floor(u)), f = smooth(0, 1, u - i), a = keys[i], b = keys[i + 1];
    camera.position.set((a[0] + (b[0] - a[0]) * f) * fit + pointer.x * 0.35, (a[1] + (b[1] - a[1]) * f) * fit + pointer.y * 0.2, (a[2] + (b[2] - a[2]) * f) * fit);
    look.set(a[3] + (b[3] - a[3]) * f, a[4] + (b[4] - a[4]) * f, a[5] + (b[5] - a[5]) * f); camera.lookAt(look);
  });
  return null;
}

/** On wide screens the scene sits to the right of the caption instead of behind it. */
function Shift({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ size }) => { g.current.position.x = size.width / size.height > 1.25 ? 1.9 : 0; });
  return <group ref={g}>{children}</group>;
}

export default function IntelligenceScene({ s, active }: { s: Shared; active: boolean }) {
  return (
    <Canvas className="intel-canvas" frameloop={active ? "always" : "never"} dpr={[1, 1.5]} camera={{ fov: 42, position: [-6.5, 1.4, 7.5] }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} aria-hidden="true">
      <Rig s={s} /><Shift><Network s={s} /><Clusters s={s} /><Descent s={s} /></Shift>
    </Canvas>
  );
}
export { LAYERS };
