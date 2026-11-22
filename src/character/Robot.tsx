import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { IntroState } from "../intro/state";

type G = React.RefObject<THREE.Group>;
const shell = <meshStandardMaterial color="#c9d3e6" metalness={0.75} roughness={0.28} />;
const dark = <meshStandardMaterial color="#141c33" metalness={0.6} roughness={0.45} />;
const glow = <meshStandardMaterial color="#4fe3ff" emissive="#4fe3ff" emissiveIntensity={2.2} />;

function Arm({ side, arm, elb }: { side: 1 | -1; arm: G; elb: G }) {
  return (
    <group ref={arm} position={[side * 0.34, 0.5, 0]}>
      <mesh castShadow><sphereGeometry args={[0.075, 16, 16]} />{dark}</mesh>
      <mesh position={[0, -0.17, 0]} castShadow><capsuleGeometry args={[0.05, 0.22, 6, 14]} />{shell}</mesh>
      <group ref={elb} position={[0, -0.34, 0]}>
        <mesh castShadow><sphereGeometry args={[0.055, 14, 14]} />{dark}</mesh>
        <mesh position={[0, -0.16, 0]} castShadow><capsuleGeometry args={[0.045, 0.2, 6, 14]} />{shell}</mesh>
        {/* hand: palm plus an extended index finger so pointing reads clearly */}
        <mesh position={[0, -0.37, 0]} castShadow><boxGeometry args={[0.09, 0.1, 0.045]} />{shell}</mesh>
        <mesh position={[0, -0.46, 0]} castShadow><capsuleGeometry args={[0.014, 0.08, 4, 8]} />{glow}</mesh>
        <mesh position={[side * 0.045, -0.4, 0.01]} castShadow><capsuleGeometry args={[0.014, 0.05, 4, 8]} />{shell}</mesh>
      </group>
    </group>
  );
}

function Leg({ x, leg, knee }: { x: number; leg: G; knee: G }) {
  return (
    <group ref={leg} position={[x, 0, 0]}>
      <mesh position={[0, -0.23, 0]} castShadow><capsuleGeometry args={[0.07, 0.34, 6, 14]} />{shell}</mesh>
      <group ref={knee} position={[0, -0.47, 0]}>
        <mesh castShadow><sphereGeometry args={[0.065, 14, 14]} />{dark}</mesh>
        <mesh position={[0, -0.22, 0]} castShadow><capsuleGeometry args={[0.06, 0.32, 6, 14]} />{shell}</mesh>
        <mesh position={[0, -0.47, 0.04]} castShadow><boxGeometry args={[0.13, 0.07, 0.26]} />{dark}</mesh>
      </group>
    </group>
  );
}

/** Procedurally rigged humanoid robot. Same state weights as the other figures: walk, welcome (wave), point. */
export function Robot({ s }: { s: IntroState }) {
  const root = useRef<THREE.Group>(null!), hips = useRef<THREE.Group>(null!), spine = useRef<THREE.Group>(null!), head = useRef<THREE.Group>(null!);
  const lLeg = useRef<THREE.Group>(null!), rLeg = useRef<THREE.Group>(null!), lKnee = useRef<THREE.Group>(null!), rKnee = useRef<THREE.Group>(null!);
  const lArm = useRef<THREE.Group>(null!), rArm = useRef<THREE.Group>(null!), lElb = useRef<THREE.Group>(null!), rElb = useRef<THREE.Group>(null!);
  const phase = useRef(0);

  useFrame((st, dt) => {
    phase.current += dt * 5.0 * s.walk;
    const p = phase.current, w = s.walk, sw = Math.sin(p) * 0.55 * w, t = st.clock.elapsedTime;
    root.current.position.set(s.x, 0, s.z);
    root.current.rotation.y = s.rotY;
    hips.current.position.y = 0.98 + Math.abs(Math.cos(p)) * 0.03 * w;
    lLeg.current.rotation.x = sw; rLeg.current.rotation.x = -sw;
    lKnee.current.rotation.x = Math.max(0, -Math.sin(p + 0.6)) * 0.75 * w;
    rKnee.current.rotation.x = Math.max(0, Math.sin(p + 0.6)) * 0.75 * w;
    spine.current.rotation.y = -s.point * 0.3 - Math.sin(p) * 0.08 * w;
    spine.current.rotation.x = Math.sin(t * 1.4) * 0.008;
    const open = s.welcome, pt = s.point, idle = 1 - Math.max(open, pt);
    // left arm waves overhead during the welcome; right arm opens, then extends toward the display
    lArm.current.rotation.set(-sw * 0.8 * idle, 0, 0.06 + open * 2.35);
    lElb.current.rotation.set(0.1 + open * 0.25, 0, Math.sin(t * 10) * 0.45 * open);
    rArm.current.rotation.set(sw * 0.8 * idle, 0, -0.06 - open * 0.8 - pt * 1.5);
    rElb.current.rotation.set(0.1 + open * 0.5 - pt * 0.1, 0, 0);
    head.current.rotation.y = -pt * 0.55 + Math.sin(t * 0.8) * 0.04 * (1 - w);
    head.current.rotation.x = Math.sin(t * 1.1) * 0.02;
  });

  return (
    <group ref={root}>
      <group ref={hips} position={[0, 0.98, 0]}>
        <Leg x={-0.12} leg={lLeg} knee={lKnee} /><Leg x={0.12} leg={rLeg} knee={rKnee} />
        <mesh castShadow><boxGeometry args={[0.34, 0.14, 0.2]} />{dark}</mesh>
        <group ref={spine} position={[0, 0.08, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.46, 0.5, 0.26]} />{shell}</mesh>
          <mesh position={[0, 0.34, 0.135]}><circleGeometry args={[0.05, 24]} />{glow}</mesh>
          <mesh position={[0, 0.2, 0.131]}><boxGeometry args={[0.26, 0.02, 0.005]} />{dark}</mesh>
          <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.05, 0.06, 0.08, 12]} />{dark}</mesh>
          <Arm side={1} arm={lArm} elb={lElb} /><Arm side={-1} arm={rArm} elb={rElb} />
          <group ref={head} position={[0, 0.78, 0]}>
            <mesh castShadow><boxGeometry args={[0.24, 0.22, 0.22]} />{shell}</mesh>
            <mesh position={[0, 0.0, 0.112]}><boxGeometry args={[0.2, 0.1, 0.01]} />{dark}</mesh>
            {[-0.045, 0.045].map((x) => <mesh key={x} position={[x, 0, 0.12]}><boxGeometry args={[0.04, 0.035, 0.006]} />{glow}</mesh>)}
            <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />{dark}</mesh>
            <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.02, 10, 10]} />{glow}</mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
