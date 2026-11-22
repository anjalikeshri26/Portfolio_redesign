import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { IntroState } from "../intro/state";

const HEIGHT = 1.78, ASPECT = 341 / 1400;

/** Photo-real avatar as a depth-lit cutout card. Motion is limited to what a flat image can honestly do:
 *  walk bob + sway, a 3D turn toward the viewer, a welcome nod, and a lean toward the display. */
export function AvatarFigure({ s, src }: { s: IntroState; src: string }) {
  const root = useRef<THREE.Group>(null!), card = useRef<THREE.Group>(null!);
  const tex = useLoader(THREE.TextureLoader, src);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const shadow = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!, r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, "rgba(0,0,0,.65)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const phase = useRef(0);

  useFrame((st, dt) => {
    phase.current += dt * 5.2 * s.walk;
    const p = phase.current, t = st.clock.elapsedTime;
    const side = THREE.MathUtils.clamp((s.rotY + 0.25) / (-Math.PI / 2 + 0.25), 0, 1); // 1 while walking sideways
    root.current.position.set(s.x, 0, s.z);
    card.current.position.y = Math.abs(Math.cos(p)) * 0.03 * s.walk;
    card.current.rotation.set(0, -0.38 * side - 0.28 * s.point, Math.sin(p) * 0.02 * s.walk);
    const breathe = 1 + Math.sin(t * 1.6) * 0.003;
    card.current.scale.set(breathe, breathe + s.welcome * 0.006, 1);
    card.current.rotation.x = -s.welcome * 0.03; // small nod while welcoming
  });

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.9, 0.4]} /><meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <group ref={card}>
        <mesh position={[0, HEIGHT / 2, 0]}>
          <planeGeometry args={[HEIGHT * ASPECT, HEIGHT]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.04} color="#d3dcf2" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
