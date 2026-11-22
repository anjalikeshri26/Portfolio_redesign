import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { profile } from "../content/profile";
import { IntroState, SCREEN } from "../intro/state";

const W = 1920, H = 1080;
interface Props { s: IntroState; ready: boolean; onEnter: () => void }
// CTA rectangle in canvas pixels, used for both drawing and hit-testing via UV.
const CTA = { x: 120, y: 790, w: 800, h: 130 };

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "", yy = y;
  for (const word of text.split(" ")) {
    const test = line ? line + " " + word : word;
    if (g.measureText(test).width > max && line) { g.fillText(line, x, yy); line = word; yy += lh; } else line = test;
  }
  g.fillText(line, x, yy); return yy;
}

function draw(g: CanvasRenderingContext2D, reveal: number, ready: boolean, hover: boolean, photo: HTMLImageElement | null) {
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0a1430"); grad.addColorStop(1, "#060b18");
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(47,107,255,.14)"; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const a = (from: number, to: number) => Math.min(1, Math.max(0, (reveal - from) / (to - from)));
  g.textAlign = "left"; g.textBaseline = "alphabetic";
  // portrait on the right of the three intro lines (selfie's side bars are cropped out)
  if (photo && photo.complete && photo.naturalWidth) {
    const PX = 1380, PY = 150, PW = 420, PH = 630;
    const sr = photo.naturalWidth / photo.naturalHeight, dr = PW / PH; let cw = photo.naturalWidth, ch = photo.naturalHeight;
    if (sr > dr) cw = ch * dr; else ch = cw / dr;
    g.globalAlpha = a(0.2, 0.6);
    g.drawImage(photo, (photo.naturalWidth - cw) / 2, 0, cw, ch, PX, PY, PW, PH);
    g.strokeStyle = "#4fe3ff"; g.lineWidth = 3; g.strokeRect(PX, PY, PW, PH);
  }
  g.globalAlpha = a(0, 0.35); g.fillStyle = "#eaf0ff";
  g.font = "700 96px 'Space Grotesk', sans-serif"; g.fillText("HELLO, I'M", 120, 260); g.fillText("ANJALI KESHRI", 120, 365);
  g.globalAlpha = a(0.3, 0.65); g.fillStyle = "#4fe3ff"; g.font = "500 42px 'IBM Plex Sans', sans-serif";
  const y2 = wrap(g, profile.screen.subtitle, 120, 450, 1180, 54);
  g.globalAlpha = a(0.6, 0.9); g.fillStyle = "#aab6d3"; g.font = "400 38px 'IBM Plex Sans', sans-serif";
  wrap(g, profile.screen.tagline, 120, y2 + 90, 1180, 50);
  g.globalAlpha = ready ? 1 : 0.0;
  if (ready) {
    g.fillStyle = hover ? "#4fe3ff" : "#2f6bff";
    g.fillRect(CTA.x, CTA.y, CTA.w, CTA.h);
    g.fillStyle = hover ? "#060b18" : "#ffffff";
    g.font = "700 52px 'Space Grotesk', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(profile.screen.cta, CTA.x + CTA.w / 2 - 30, CTA.y + CTA.h / 2);
    g.beginPath();
    const cx = CTA.x + CTA.w - 130, cy = CTA.y + CTA.h / 2;
    g.moveTo(cx, cy - 22); g.lineTo(cx + 26, cy); g.lineTo(cx, cy + 22);
    g.strokeStyle = g.fillStyle as string; g.lineWidth = 7; g.stroke();
  }
  g.globalAlpha = 1;
}

export function Screen({ s, ready, onEnter }: Props) {
  const group = useRef<THREE.Group>(null!);
  const hover = useRef(false);
  const last = useRef({ r: -1, ready: false, hover: false });
  const photo = useRef<HTMLImageElement | null>(null);
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return { canvas, tex };
  }, []);
  useEffect(() => { const im = new Image(); im.onload = () => { photo.current = im; last.current.r = -1; }; im.src = profile.illustration; }, []);
  useEffect(() => { document.fonts?.ready.then(() => { last.current.r = -1; }); return () => tex.dispose(); }, [tex]);

  useFrame(() => {
    group.current.position.z = SCREEN.z + s.screen.z; group.current.scale.setScalar(s.screen.scale);
    const L = last.current;
    if (Math.abs(L.r - s.reveal) > 0.004 || L.ready !== ready || L.hover !== hover.current) {
      draw(canvas.getContext("2d")!, s.reveal, ready, hover.current, photo.current);
      tex.needsUpdate = true; L.r = s.reveal; L.ready = ready; L.hover = hover.current;
    }
  });

  const overCta = (uv?: THREE.Vector2) => {
    if (!uv || !ready) return false;
    const px = uv.x * W, py = (1 - uv.y) * H;
    return px > CTA.x && px < CTA.x + CTA.w && py > CTA.y && py < CTA.y + CTA.h;
  };
  return (
    <group ref={group} position={[0, SCREEN.y, SCREEN.z]}>
      <mesh position={[0, 0, -0.06]}><boxGeometry args={[SCREEN.w + 0.2, SCREEN.h + 0.2, 0.1]} /><meshStandardMaterial color="#1a2238" metalness={0.8} roughness={0.35} /></mesh>
      <mesh
        onPointerMove={(e) => { const h = overCta(e.uv); if (h !== hover.current) { hover.current = h; document.body.style.cursor = h ? "pointer" : ""; } }}
        onPointerOut={() => { hover.current = false; document.body.style.cursor = ""; }}
        onClick={(e) => { if (overCta(e.uv)) { document.body.style.cursor = ""; onEnter(); } }}
      >
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}
