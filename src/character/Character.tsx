import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { IntroState } from "../intro/state";

const skin = "#c99a7b", blazer = "#14213f", trousers = "#0d1426", hair = "#2a1713", shirt = "#e9eef9";
const M = (c: string, r = 0.6, m = 0) => <meshStandardMaterial color={c} roughness={r} metalness={m} />;

/** Procedurally rigged figure: a joint hierarchy (hips > spine > shoulders > elbows, hips > knees) driven by state weights. */
export function Character({ s }: { s: IntroState }) {
  const root = useRef<THREE.Group>(null!);
  const hips = useRef<THREE.Group>(null!), spine = useRef<THREE.Group>(null!), head = useRef<THREE.Group>(null!);
  const lLeg = useRef<THREE.Group>(null!), rLeg = useRef<THREE.Group>(null!);
  const lKnee = useRef<THREE.Group>(null!), rKnee = useRef<THREE.Group>(null!);
  const lArm = useRef<THREE.Group>(null!), rArm = useRef<THREE.Group>(null!);
  const lElb = useRef<THREE.Group>(null!), rElb = useRef<THREE.Group>(null!);
  const phase = useRef(0);

  useFrame((st, dt) => {
    phase.current += dt * 5.2 * s.walk;
    const p = phase.current, w = s.walk, sw = Math.sin(p) * 0.55 * w, t = st.clock.elapsedTime;
    root.current.position.set(s.x, 0, s.z);
    root.current.rotation.y = s.rotY;
    hips.current.position.y = 0.97 + Math.abs(Math.cos(p)) * 0.035 * w;
    lLeg.current.rotation.x = sw; rLeg.current.rotation.x = -sw;
    lKnee.current.rotation.x = Math.max(0, -Math.sin(p + 0.6)) * 0.7 * w;
    rKnee.current.rotation.x = Math.max(0, Math.sin(p + 0.6)) * 0.7 * w;
    const breathe = Math.sin(t * 1.6) * 0.012;
    spine.current.rotation.x = breathe; spine.current.rotation.z = Math.sin(p) * 0.03 * w;
    // arms: swing while walking, open to welcome, extend toward the screen to point
    const open = s.welcome, pt = s.point, idle = 1 - Math.max(open, pt);
    lArm.current.rotation.set(-sw * 0.8 * idle, 0, 0.08 + open * 0.95);
    lElb.current.rotation.x = 0.15 + open * 0.7;
    rArm.current.rotation.set(sw * 0.8 * idle, 0, -0.08 - open * 0.95 - pt * 1.2);
    rElb.current.rotation.x = 0.15 + open * 0.7 - pt * 0.15;
    head.current.rotation.y = pt * -0.35 + Math.sin(t * 0.7) * 0.03 * (1 - w);
  });

  return (
    <group ref={root}>
      <group ref={hips} position={[0, 0.97, 0]}>
        {/* legs */}
        {[[-0.1, lLeg, lKnee], [0.1, rLeg, rKnee]].map(([x, r, k], i) => (
          <group key={i} ref={r as React.RefObject<THREE.Group>} position={[x as number, 0, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow><capsuleGeometry args={[0.075, 0.38, 6, 12]} />{M(trousers)}</mesh>
            <group ref={k as React.RefObject<THREE.Group>} position={[0, -0.48, 0]}>
              <mesh position={[0, -0.24, 0]} castShadow><capsuleGeometry args={[0.062, 0.38, 6, 12]} />{M(trousers)}</mesh>
              <mesh position={[0, -0.5, 0.05]} castShadow><boxGeometry args={[0.1, 0.06, 0.24]} />{M("#0a0a0f", 0.3)}</mesh>
            </group>
          </group>
        ))}
        <mesh position={[0, 0.02, 0]} castShadow><capsuleGeometry args={[0.17, 0.1, 6, 14]} />{M(trousers)}</mesh>
        {/* torso with blazer */}
        <group ref={spine} position={[0, 0.1, 0]}>
          <mesh position={[0, 0.27, 0]} castShadow scale={[1.05, 1, 0.68]}><capsuleGeometry args={[0.18, 0.28, 8, 16]} />{M(blazer, 0.55)}</mesh>
          <mesh position={[0, 0.4, 0.115]}><boxGeometry args={[0.1, 0.22, 0.02]} />{M(shirt, 0.8)}</mesh>
          <mesh position={[-0.075, 0.4, 0.13]} rotation={[0, 0, 0.35]}><boxGeometry args={[0.05, 0.24, 0.02]} />{M(blazer)}</mesh>
          <mesh position={[0.075, 0.4, 0.13]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.05, 0.24, 0.02]} />{M(blazer)}</mesh>
          <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.04, 0.045, 0.1, 10]} />{M(skin, 0.7)}</mesh>
          {/* arms */}
          {[[-0.235, lArm, lElb, 1], [0.235, rArm, rElb, -1]].map(([x, a, e], i) => (
            <group key={i} ref={a as React.RefObject<THREE.Group>} position={[-(x as number), 0.5, 0]}>
              <mesh position={[0, -0.16, 0]} castShadow><capsuleGeometry args={[0.052, 0.24, 6, 12]} />{M(blazer, 0.55)}</mesh>
              <group ref={e as React.RefObject<THREE.Group>} position={[0, -0.32, 0]}>
                <mesh position={[0, -0.15, 0]} castShadow><capsuleGeometry args={[0.045, 0.22, 6, 12]} />{M(blazer, 0.55)}</mesh>
                <mesh position={[0, -0.33, 0]}><sphereGeometry args={[0.045, 12, 12]} />{M(skin, 0.7)}</mesh>
              </group>
            </group>
          ))}
          {/* head: shoulder-length wavy hair with a side-swept fringe, per the reference */}
          <group ref={head} position={[0, 0.74, 0]}>
            <mesh castShadow scale={[0.9, 1.08, 0.95]}><sphereGeometry args={[0.115, 24, 24]} />{M(skin, 0.65)}</mesh>
            <mesh position={[0, 0.02, -0.02]} scale={[1.02, 1.08, 1.02]}><sphereGeometry args={[0.122, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />{M(hair, 0.8)}</mesh>
            <mesh position={[-0.05, 0.06, 0.1]} rotation={[0.2, 0, 0.9]} scale={[1, 0.45, 0.5]}><sphereGeometry args={[0.09, 16, 16]} />{M(hair, 0.8)}</mesh>
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.11, -0.12, -0.02]} scale={[0.9, 1, 0.9]} castShadow><capsuleGeometry args={[0.045, 0.2, 6, 12]} />{M(hair, 0.85)}</mesh>
            ))}
            <mesh position={[0, -0.1, -0.075]} scale={[1.1, 1, 0.8]} castShadow><capsuleGeometry args={[0.1, 0.16, 6, 14]} />{M(hair, 0.85)}</mesh>
            {[-0.04, 0.04].map((ex) => (
              <mesh key={ex} position={[ex, 0.005, 0.1]}><sphereGeometry args={[0.009, 8, 8]} />{M("#120a08")}</mesh>
            ))}
            <mesh position={[0, -0.06, 0.1]} scale={[1.6, 0.6, 0.6]}><sphereGeometry args={[0.014, 10, 10]} />{M("#a8323a", 0.5)}</mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
