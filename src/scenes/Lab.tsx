import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense } from "react";
import { Character } from "../character/Character";
import { Robot } from "../character/Robot";
import { AvatarFigure } from "../character/AvatarFigure";
import { profile } from "../content/profile";
import { Screen } from "./Screen";
import { IntroState } from "../intro/state";

function CameraRig({ s }: { s: IntroState }) {
  const { camera } = useThree();
  const target = new THREE.Vector3();
  useFrame(() => {
    camera.position.set(s.cam.x, s.cam.y, s.cam.z);
    camera.lookAt(target.set(s.look.x, s.look.y, s.look.z));
  });
  return null;
}

function Room() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#0b1224" metalness={0.6} roughness={0.28} /></mesh>
      <mesh position={[0, 4, -4]} receiveShadow><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#0a1020" roughness={0.9} /></mesh>
      {/* ceiling light strips: purposeful cool key light sources */}
      {[-6, 0, 6].map((x) => (
        <mesh key={x} position={[x, 6.2, -1]}><boxGeometry args={[0.15, 0.05, 9]} /><meshBasicMaterial color="#9fd8ff" /></mesh>
      ))}
      {/* low server racks along the back wall edges */}
      {[-9, -7.6, 7.6, 9].map((x) => (
        <mesh key={x} position={[x, 1.4, -3.5]} castShadow><boxGeometry args={[1.1, 2.8, 0.8]} /><meshStandardMaterial color="#10192e" metalness={0.7} roughness={0.4} /></mesh>
      ))}
      {[-9, -7.6, 7.6, 9].map((x) => (
        <mesh key={"l" + x} position={[x, 1.9, -3.09]}><boxGeometry args={[0.8, 0.03, 0.01]} /><meshBasicMaterial color="#4fe3ff" /></mesh>
      ))}
    </>
  );
}

export default function Lab({ s, ready, onEnter }: { s: IntroState; ready: boolean; onEnter: () => void }) {
  return (
    <Canvas className="stage" shadows dpr={[1, 1.75]} camera={{ fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }} onCreated={({ scene }) => { scene.fog = new THREE.Fog("#060b18", 14, 30); scene.background = new THREE.Color("#060b18"); }}>
      <ambientLight intensity={0.35} color="#8aa6ff" />
      <directionalLight position={[3, 6, 6]} intensity={1.6} color="#cfe3ff" castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-4} />
      <pointLight position={[0, 2.5, -2.2]} intensity={14} color="#4fe3ff" distance={10} />
      <Room />
      <Screen s={s} ready={ready} onEnter={onEnter} />
      {profile.character === "avatar" ? <Suspense fallback={null}><AvatarFigure s={s} src={profile.avatar} /></Suspense>
        : profile.character === "procedural" ? <Character s={s} /> : <Robot s={s} />}
      <CameraRig s={s} />
    </Canvas>
  );
}
