"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { parseProgram, pointAt, segmentLength, type Segment, type Vec3 } from "@/lib/parser";
import type { SimMode } from "./Simulator";
import { cuttingRadius, isLatheTool, toolOf, type Setup, type Tool } from "./setup";

interface Props { source: string; mode: SimMode; progress: number; setup: Setup; segments?: Segment[] }

const CELL_TARGET = 0.35;   // docelowy rozmiar komórki mapy wysokości [mm]
const GRID_MIN = 100;

/**
 * Górny limit rozdzielczości mapy wysokości. Siatka 420 × 420 to ponad 170 tys.
 * punktów i model o milionie wierzchołków — na telefonie kończy się to
 * wyczerpaniem pamięci i zabiciem karty przez przeglądarkę.
 */
function gridMax() {
  if (typeof window === "undefined") return 260;
  const narrow = window.innerWidth < 900;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (narrow || mem <= 4) return 190;
  if (mem <= 6) return 280;
  return 380;
} // rozdzielczość mapy wysokości (frezowanie) / profilu (toczenie)

export default function Sim3D({ source, mode, progress, setup, segments: segs }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => parseProgram(source, { diameterX: mode === "lathe" }), [source, mode]);
  const program = useMemo(() => (segs ? { ...parsed, segments: segs } : parsed), [parsed, segs]);
  const lengths = useMemo(() => program.segments.map(segmentLength), [program]);
  // narzędzie aktywne w bieżącym miejscu programu
  const activeToolNo = useMemo(() => {
    let acc = 0; let no: number | null = null;
    program.segments.forEach((sg, i) => { if (progress >= acc) no = program.lines[sg.line]?.state.tool ?? no; acc += lengths[i]; });
    return no;
  }, [program, lengths, progress]);
  const tool: Tool = toolOf(setup, activeToolNo, mode);
  const toolD = cuttingRadius(tool) * 2;

  // scena
  const [failed, setFailed] = useState<null | "no-webgl" | "error">(null);
  // Bufor mapy wysokości — pozwala dokładać tylko nowe odcinki zamiast liczyć
  // cały program przy każdej klatce.
  const hmRef = useRef<{ key: string; h: Float32Array; progress: number; meta: MillMeta } | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const viewApi = useRef<((v: "iso" | "top" | "front" | "side" | "fit") => void) | null>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; stock: THREE.Mesh | null; threads: THREE.Group | null; tool: THREE.Mesh; render: () => void; stockMat: THREE.MeshStandardMaterial } | null>(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    if (!webglAvailable()) { queueMicrotask(() => setFailed("no-webgl")); return; }
    const W = el.clientWidth, H = el.clientHeight;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "default", failIfMajorPerformanceCaveat: false });
    } catch {
      queueMicrotask(() => setFailed("no-webgl"));
      return;
    }
    // Utrata kontekstu GPU (np. przy przełączeniu karty) nie może wywracać strony.
    renderer.domElement.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); queueMicrotask(() => setFailed("error")); });
    renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio)); renderer.setSize(W, H); renderer.setClearColor(0x12161c);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 5000);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(60, 120, 80); scene.add(dl);
    const grid = new THREE.GridHelper(400, 40, 0x3a4454, 0x232a35);
    scene.add(grid);
    gridRef.current = grid;
    scene.add(new THREE.AxesHelper(30));
    for (const [label, pos, color] of axisLabels(mode)) scene.add(makeLabel(label, pos, color));
    // znacznik zera detalu
    const om = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xF97316 }));
    scene.add(om);

    // ścieżka
    const seg = program.segments;
    const pts: THREE.Vector3[] = []; const cols: number[] = [];
    const c = { rapid: new THREE.Color("#F59E0B"), linear: new THREE.Color("#22C55E"), arc: new THREE.Color("#38BDF8") };
    for (const s of seg) {
      const n = s.kind === "arc" ? 32 : 1;
      for (let i = 0; i < n; i++) { const a = pointAt(s, i / n), b = pointAt(s, (i + 1) / n); pts.push(toW(a, mode), toW(b, mode)); cols.push(...c[s.kind].toArray(), ...c[s.kind].toArray()); }
    }
    const lg = new THREE.BufferGeometry().setFromPoints(pts); lg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 })));

    // narzędzie
    const toolLen = 30;
    let toolGeo: THREE.BufferGeometry;
    try {
      toolGeo = buildToolGeometry(tool, toolD, toolLen, mode);
      const arr = toolGeo.getAttribute("position")?.array as Float32Array | undefined;
      if (!arr || !arr.length || !Number.isFinite(arr[0])) throw new Error("zła geometria narzędzia");
    } catch {
      toolGeo = new THREE.CylinderGeometry(toolD / 2 || 3, toolD / 2 || 3, toolLen, 20);
      toolGeo.translate(0, toolLen / 2, 0);
    }
    const toolMesh = new THREE.Mesh(toolGeo, new THREE.MeshStandardMaterial({ color: 0xd6dae0, metalness: 0.65, roughness: 0.28 }));
    if (mode === "mill") {
      toolMesh.rotation.z = -(safe(tool.tiltB, 0, -90, 90) * Math.PI) / 180;
      toolMesh.rotation.x = (safe(tool.tiltA, 0, -90, 90) * Math.PI) / 180;
    }
    scene.add(toolMesh);

    const stockMat = new THREE.MeshStandardMaterial({ color: 0x8a94a3, metalness: 0.3, roughness: 0.55, side: THREE.DoubleSide });
    const st = { scene, stock: null as THREE.Mesh | null, threads: null as THREE.Group | null, tool: toolMesh, render: () => { controls.update(); renderer.render(scene, camera); }, stockMat };
    sceneRef.current = st;

    // kamera na obszar + gotowe ustawienia widoku
    const b = program.bounds;
    const ctr = toW({ x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }, mode);
    const span = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z, 40);
    const apply = (v: "iso" | "top" | "front" | "side" | "fit") => {
      const d = span * 1.5;
      if (v === "top") camera.position.set(ctr.x, ctr.y + d, ctr.z + 0.001);
      else if (v === "front") camera.position.set(ctr.x, ctr.y + span * 0.15, ctr.z + d);
      else if (v === "side") camera.position.set(ctr.x + d, ctr.y + span * 0.15, ctr.z);
      else camera.position.set(ctr.x + span * 0.9, ctr.y + span * 0.8, ctr.z + span * 1.1);
      controls.target.copy(ctr);
      controls.update();
    };
    viewApi.current = apply;
    apply("iso");

    let raf = 0;
    const loop = () => {
      try { st.render(); } catch { queueMicrotask(() => setFailed("error")); return; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 8 || h < 8) return;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      renderer.dispose();
      el.innerHTML = "";
      sceneRef.current = null;
    };
  }, [program, mode, toolD, tool]);

  // ubytek materiału + pozycja narzędzia
  useEffect(() => {
    const st = sceneRef.current; if (!st || failed) return;
    let broke = false;
    try {
    const cut = program.segments.filter((s) => s.kind !== "rapid");
    // pozycja
    let acc = 0; let pos: Vec3 = program.segments[0]?.from ?? { x: 0, y: 0, z: 0 };
    program.segments.forEach((sg, i) => { const len = lengths[i]; const d = Math.min(1, Math.max(0, (progress - acc) / (len || 1))); if (d > 0) pos = d < 1 ? pointAt(sg, d) : sg.to; acc += len; });
    st.tool.position.copy(toW(pos, mode));

    // geometria półfabrykatu
    if (st.stock) { st.scene.remove(st.stock); st.stock.geometry.dispose(); st.stock = null; }
    let geo: THREE.BufferGeometry | null;
    if (mode === "mill") {
      if (!cut.length) geo = null;
      else {
        const key = JSON.stringify([source, setup.stock, Object.entries(setup.tools).map(([n, t]) => [n, t.kind, t.d, t.corner])]);
        let buf = hmRef.current;
        if (!buf || buf.key !== key || progress < buf.progress) {
          const meta = millMeta(program, cut, setup);
          const h = new Float32Array((meta.nx + 1) * (meta.ny + 1)).fill(meta.top);
          buf = { key, h, progress: 0, meta };
        }
        if (progress > buf.progress) {
          carve(buf.h, buf.meta, program, lengths, setup, mode, buf.progress, progress);
          buf.progress = progress;
        }
        hmRef.current = buf;
        geo = meshFromHeightmap(buf.h, buf.meta);
      }
    } else {
      geo = latheGeometry(program, cut, lengths, progress, setup);
    }

    // zarys gwintu w otworach obrobionych gwintownikiem lub frezem do gwintów
    if (st.threads) { st.scene.remove(st.threads); disposeTree(st.threads); st.threads = null; }
    if (mode === "mill") {
      const tg = threadVisuals(program, lengths, progress, setup, mode);
      if (tg) { st.threads = tg; st.scene.add(tg); }
    }
    if (geo) {
      st.stock = new THREE.Mesh(geo, st.stockMat);
      st.scene.add(st.stock);
      // siatka zawsze pod detalem — czytelne odniesienie do podłoża
      if (gridRef.current) {
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        if (bb) gridRef.current.position.y = bb.min.y - 0.5;
      }
    }
    } catch { broke = true; }
    if (broke) queueMicrotask(() => setFailed("error"));
  }, [program, lengths, progress, mode, toolD, setup, tool, failed, source]);

  const setView = (v: "iso" | "top" | "front" | "side" | "fit") => {
    const api = viewApi.current; if (api) api(v);
  };

  if (failed) {
    return (
      <div className="sim-3d-fallback">
        <strong>Widok 3D jest niedostępny w tej przeglądarce.</strong>
        {failed === "no-webgl" ? (
          <p>Przeglądarka nie udostępnia WebGL. W Brave sprawdź <code className="inline-code">brave://settings/system</code> i włącz akcelerację sprzętową, albo obniż poziom Shields dla tej strony. Symulacja 2D działa niezależnie i pokazuje ten sam tor.</p>
        ) : (
          <p>Renderowanie zostało przerwane. Spróbuj odświeżyć stronę albo zmniejszyć złożoność programu. Symulacja 2D działa niezależnie.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <div className="view3d">
        <div ref={mountRef} className="sim-canvas sim-canvas-3d" style={{ height: 360 }} />
        <div className="view3d-bar">
          {([["iso", "IZO"], ["top", "GÓRA"], ["front", "PRZÓD"], ["side", "BOK"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k)}>{l}</button>
          ))}
          <button onClick={() => setView("fit")} title="Dopasuj widok">DOPASUJ</button>
        </div>
      </div>
      <p className="text-xs text-muted">Obracaj palcem lub myszą, przybliżaj szczypcami. Widok jest zsynchronizowany z symulacją 2D — sterowanie znajdziesz powyżej.</p>
    </div>
  );
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

/** Etykiety osi w układzie G-kodu (three: Y jest pionem). */
function axisLabels(mode: SimMode): [string, THREE.Vector3, string][] {
  return mode === "mill"
    ? [["X", new THREE.Vector3(36, 0, 0), "#EF4444"], ["Y", new THREE.Vector3(0, 0, -36), "#22C55E"], ["Z", new THREE.Vector3(0, 36, 0), "#38BDF8"]]
    : [["Z", new THREE.Vector3(36, 0, 0), "#38BDF8"], ["X", new THREE.Vector3(0, 36, 0), "#EF4444"]];
}

function makeLabel(text: string, pos: THREE.Vector3, color: string) {
  const cv = document.createElement("canvas"); cv.width = 64; cv.height = 64;
  const c = cv.getContext("2d")!;
  c.fillStyle = color; c.font = "bold 44px ui-monospace, monospace"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, 32, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
  sp.position.copy(pos); sp.scale.set(9, 9, 1);
  return sp;
}

/** Zabezpiecza wartość liczbową przed NaN i wartościami spoza sensownego zakresu —
    wadliwa geometria potrafi wywrócić sterownik GPU. */
function safe(v: number, fallback: number, min = 0.01, max = 1e4) {
  return Number.isFinite(v) && v >= min && v <= max ? v : fallback;
}

/** Bryły narzędzi odwzorowujące rzeczywistą geometrię. */
function buildToolGeometry(tool: Tool, toolD: number, defLen: number, mode: SimMode): THREE.BufferGeometry {
  const r = Math.max(0.15, safe(toolD, 10) / 2);
  const cut = Math.max(2, safe(tool.len, 30, 1, 400));
  const shankLen = 26;
  const k = tool.kind;

  const shank = (rr: number, from: number, len = shankLen) => {
    const g = new THREE.CylinderGeometry(rr, rr, len, 20); g.translate(0, from + len / 2, 0); return g;
  };
  const helix = (g: THREE.BufferGeometry, rr: number, height: number, z: number, thick: number) => {
    const n = Math.max(1, Math.min(8, Math.round(z)));
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let t = 0; t <= 1.0001; t += 0.08) {
        const th = a0 + t * 1.5;
        pts.push(new THREE.Vector3(Math.cos(th) * rr, t * height, Math.sin(th) * rr));
      }
      g = mergeGeo(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, thick, 4, false));
    }
    return g;
  };

  switch (k) {
    case "ballnose": {
      const ball = new THREE.SphereGeometry(r, 28, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      ball.translate(0, r, 0);
      let g: THREE.BufferGeometry = mergeGeo(ball, shank(r, r, cut - r));
      g = helix(g, r, cut, tool.flutes, r * 0.09);
      return mergeGeo(g, shank(r * 0.98, cut));
    }
    case "bullnose": {
      const cr = Math.min(r * 0.95, Math.max(0.05, safe(tool.corner, 1, 0.01, 50)));
      // torus naroża + walec wewnętrzny + płaszcz
      const torus = new THREE.TorusGeometry(r - cr, cr, 12, 28, Math.PI * 2);
      torus.rotateX(Math.PI / 2); torus.translate(0, cr, 0);
      const inner = new THREE.CylinderGeometry(r - cr, r - cr, cr, 24); inner.translate(0, cr / 2, 0);
      let g: THREE.BufferGeometry = mergeGeo(torus, inner);
      g = mergeGeo(g, shank(r, cr, cut - cr));
      g = helix(g, r, cut, tool.flutes, r * 0.08);
      return mergeGeo(g, shank(r * 0.98, cut));
    }
    case "chamfer": {
      const ang = safe(tool.angle, 90, 10, 179) * Math.PI / 180;
      const tipR = r * 0.15;
      const h = (r - tipR) / Math.tan(ang / 2);
      const cone = new THREE.CylinderGeometry(r, tipR, h, 24); cone.translate(0, h / 2, 0);
      return mergeGeo(cone, shank(r, h));
    }
    case "vbit": {
      const ang = safe(tool.angle, 60, 10, 179) * Math.PI / 180;
      const h = r / Math.tan(ang / 2);
      const cone = new THREE.ConeGeometry(r, h, 24); cone.translate(0, h / 2, 0);
      return mergeGeo(cone, shank(r, h));
    }
    case "facemill": {
      const body = new THREE.CylinderGeometry(r, r * 0.92, 12, 28); body.translate(0, 6, 0);
      let g: THREE.BufferGeometry = body;
      const z = Math.max(2, Math.min(10, Math.round(tool.flutes)));
      for (let i = 0; i < z; i++) {
        const a = (i / z) * Math.PI * 2;
        const ins = new THREE.BoxGeometry(r * 0.28, 3, r * 0.2);
        ins.translate(r * 0.82, 1.4, 0); ins.rotateY(a);
        g = mergeGeo(g, ins);
      }
      return mergeGeo(g, shank(r * 0.45, 12, shankLen));
    }
    case "tslot": {
      const disc = new THREE.CylinderGeometry(r, r, Math.max(1.5, safe(tool.len, 6, 0.5, 60)), 28);
      disc.translate(0, safe(tool.len, 6, 0.5, 60) / 2, 0);
      return mergeGeo(disc, shank(r * 0.42, safe(tool.len, 6, 0.5, 60)));
    }
    case "drill": case "spotdrill": {
      const angDeg = Math.min(179, Math.max(30, safe(tool.angle, k === "drill" ? 118 : 90, 30, 179)));
      const tip = Math.max(0.2, r / Math.tan((angDeg * Math.PI / 180) / 2));
      const cone = new THREE.ConeGeometry(r, tip, 24); cone.translate(0, tip / 2, 0);
      let g: THREE.BufferGeometry = cone;
      const bodyLen = k === "drill" ? cut : 8;
      g = mergeGeo(g, shank(r, tip, bodyLen));
      if (k === "drill") g = helix(g, r, bodyLen, 2, r * 0.13);
      return mergeGeo(g, shank(r * 0.95, tip + bodyLen));
    }
    case "reamer": {
      const lead = new THREE.ConeGeometry(r, r * 0.8, 20); lead.translate(0, r * 0.4, 0);
      let g: THREE.BufferGeometry = mergeGeo(lead, shank(r, r * 0.8, cut));
      g = helix(g, r, cut, Math.min(8, tool.flutes), r * 0.05);
      return mergeGeo(g, shank(r * 0.9, cut + r * 0.8));
    }
    case "tap": case "threadmill": {
      const pitch = Math.max(0.3, safe(tool.flutes, 1.5, 0.2, 12));
      const coreR = k === "tap" ? r * 0.78 : r * 0.8;
      let g: THREE.BufferGeometry = shank(coreR, 0, cut);
      const turns = Math.max(2, Math.min(16, Math.floor(cut / pitch)));
      const path: THREE.Vector3[] = [];
      for (let i = 0; i <= turns * 14; i++) {
        const t = i / 14;
        path.push(new THREE.Vector3(Math.cos(t * Math.PI * 2) * r * 0.95, t * pitch, Math.sin(t * Math.PI * 2) * r * 0.95));
      }
      g = mergeGeo(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), Math.min(240, turns * 10), r * 0.15, 5, false));
      if (k === "tap") {
        const lead = new THREE.ConeGeometry(coreR, r * 1.3, 18); lead.translate(0, r * 0.65, 0); lead.rotateX(Math.PI);
        g = mergeGeo(g, lead);
      }
      return mergeGeo(g, shank(coreR, cut));
    }
    default: {
      if (mode === "lathe") return latheToolGeo(tool.angle, tool.d);
      // frez walcowy
      let g: THREE.BufferGeometry = shank(r, 0, cut);
      g = helix(g, r, cut, tool.flutes, r * 0.1);
      return mergeGeo(g, shank(r * 0.98, cut));
    }
  }
}

function mergeGeo(a: THREE.BufferGeometry, b: THREE.BufferGeometry): THREE.BufferGeometry {
  // Ujednolicamy do postaci nieindeksowanej — mieszanie indeksowanych i nie
  // dawało uszkodzoną siatkę, co potrafi wywrócić sterownik GPU.
  const na = a.index ? a.toNonIndexed() : a;
  const nb = b.index ? b.toNonIndexed() : b;
  const pa = na.getAttribute("position");
  const pb = nb.getAttribute("position");
  if (!pa || !pb) return na;
  const pos = new Float32Array(pa.count * 3 + pb.count * 3);
  pos.set(pa.array as ArrayLike<number>, 0);
  pos.set(pb.array as ArrayLike<number>, pa.count * 3);
  if (na !== a) na.dispose();
  if (nb !== b) nb.dispose();
  a.dispose(); b.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Nóż tokarski: romb o kącie przystawienia, leżący w płaszczyźnie ZX. */
function latheToolGeo(angle: number, rEps: number): THREE.BufferGeometry {
  const a = (Math.max(35, Math.min(120, angle)) * Math.PI) / 180;
  const L = 16, w = 8;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-L * Math.cos(Math.PI - a), L * Math.sin(Math.PI - a) - w);
  shape.lineTo(-L, -w - 4);
  shape.lineTo(0, -w - 2);
  shape.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(2, rEps * 4), bevelEnabled: false });
  g.rotateY(Math.PI / 2);
  return g;
}

/** G-kod: X w prawo, Y od siebie, Z w górę → three: X, Y(up)=Z, Z=-Y. Tokarka: Z wzdłuż osi obrotu → three X, X promień → three Y. */
function toW(p: Vec3, mode: SimMode) {
  return mode === "mill" ? new THREE.Vector3(p.x, p.z, -p.y) : new THREE.Vector3(p.z, p.x, 0);
}

function cutUpTo(cut: Segment[], allSegs: Segment[], lengths: number[], progress: number) {
  const out: { seg: Segment; t: number }[] = []; let acc = 0;
  allSegs.forEach((sg, i) => { const len = lengths[i]; const d = Math.min(1, Math.max(0, (progress - acc) / (len || 1))); if (d > 0 && sg.kind !== "rapid") out.push({ seg: sg, t: d }); acc += len; });
  return out;
}

export interface MillMeta { minX: number; maxX: number; minY: number; maxY: number; top: number; bottom: number; nx: number; ny: number; cx: number; cy: number }

function millMeta(program: ReturnType<typeof parseProgram>, cut: Segment[], setup: Setup): MillMeta {
  const st = setup.stock;
  let minX: number, maxX: number, minY: number, maxY: number, top: number, bottom: number;
  const maxD = Math.max(...Object.values(setup.tools).filter((t) => !isLatheTool(t.kind)).map((t) => t.d), 6);
  if (st.auto) {
    let aX = Infinity, bX = -Infinity, aY = Infinity, bY = -Infinity, mz = 0;
    for (const sg of cut) for (let t = 0; t <= 1; t += 0.1) { const p = pointAt(sg, t); aX = Math.min(aX, p.x); bX = Math.max(bX, p.x); aY = Math.min(aY, p.y); bY = Math.max(bY, p.y); mz = Math.min(mz, p.z); }
    const m = Math.min(6, 2 + maxD * 0.25);
    minX = aX - m; maxX = bX + m; minY = aY - m; maxY = bY + m; top = 0; bottom = Math.min(mz - 5, -5);
  } else {
    minX = -st.ox; maxX = st.x - st.ox; minY = -st.oy; maxY = st.y - st.oy;
    top = st.z - st.oz; bottom = -st.oz;
  }
  const spanX = Math.max(1e-6, maxX - minX), spanY = Math.max(1e-6, maxY - minY);
  const cap = gridMax();
  const nx = Math.max(GRID_MIN, Math.min(cap, Math.round(spanX / CELL_TARGET)));
  const ny = Math.max(40, Math.min(cap, Math.round(nx * spanY / spanX)));
  return { minX, maxX, minY, maxY, top, bottom, nx, ny, cx: (maxX - minX) / nx, cy: (maxY - minY) / ny };
}

/** Nanosi na mapę wysokości ubytek z podanego zakresu postępu. */
function carve(h: Float32Array, m: MillMeta, program: ReturnType<typeof parseProgram>, lengths: number[], setup: Setup, mode: SimMode, from: number, to: number) {
  let acc = 0;
  program.segments.forEach((sg, i) => {
    const len = lengths[i];
    const segStart = acc, segEnd = acc + len;
    acc = segEnd;
    if (sg.kind === "rapid" || segEnd <= from || segStart >= to) return;
    const t0 = Math.max(0, (from - segStart) / (len || 1));
    const t1 = Math.min(1, (to - segStart) / (len || 1));
    if (t1 <= t0) return;
    const tl = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, mode);
    const r = cuttingRadius(tl);
    const ball = tl.kind === "ballnose";
    const cornerR = tl.kind === "bullnose" ? Math.min(r * 0.95, Math.max(0, tl.corner)) : 0;
    const steps = Math.max(1, Math.ceil((len * (t1 - t0)) / (Math.min(m.cx, m.cy) * 0.7)));
    for (let k = 0; k <= steps; k++) {
      const p = pointAt(sg, t0 + ((t1 - t0) * k) / steps);
      if (p.z >= m.top) continue;
      const i0 = Math.floor((p.x - r - m.minX) / m.cx), i1 = Math.ceil((p.x + r - m.minX) / m.cx);
      const j0 = Math.floor((p.y - r - m.minY) / m.cy), j1 = Math.ceil((p.y + r - m.minY) / m.cy);
      for (let j = Math.max(0, j0); j <= Math.min(m.ny, j1); j++) {
        for (let ii = Math.max(0, i0); ii <= Math.min(m.nx, i1); ii++) {
          const gx = m.minX + ii * m.cx, gy = m.minY + j * m.cy;
          const d2 = (gx - p.x) ** 2 + (gy - p.y) ** 2;
          if (d2 > r * r) continue;
          const idx = j * (m.nx + 1) + ii;
          let zHere = p.z;
          if (ball) zHere = p.z + (r - Math.sqrt(Math.max(0, r * r - d2)));
          else if (cornerR > 0) {
            const dd = Math.sqrt(d2);
            if (dd > r - cornerR) { const t2 = dd - (r - cornerR); zHere = p.z + (cornerR - Math.sqrt(Math.max(0, cornerR * cornerR - t2 * t2))); }
          }
          if (zHere < h[idx]) h[idx] = Math.max(zHere, m.bottom);
        }
      }
    }
  });
}

function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}

/**
 * Gwint jest powierzchnią z podcięciem, więc mapa wysokości go nie odwzoruje.
 * Dokładamy więc osobną geometrię: spiralę o zarysie gwintu w miejscu każdego
 * otworu obrobionego gwintownikiem albo frezem do gwintów.
 */
function threadVisuals(program: ReturnType<typeof parseProgram>, lengths: number[], progress: number, setup: Setup, mode: SimMode) {
  const holes: { x: number; y: number; top: number; bottom: number; pitch: number; r: number }[] = [];
  let acc = 0;
  program.segments.forEach((sg, i) => {
    const len = lengths[i];
    const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
    acc += len;
    if (done <= 0 || sg.kind === "rapid") return;
    const t = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, mode);
    if (t.kind !== "tap" && t.kind !== "threadmill") return;
    const p = pointAt(sg, done);
    if (p.z >= 0) return;
    const key = holes.find((h) => Math.abs(h.x - p.x) < 0.6 && Math.abs(h.y - p.y) < 0.6);
    const pitch = Math.max(0.3, safe(t.flutes, 1.5, 0.2, 12));
    if (key) key.bottom = Math.min(key.bottom, p.z);
    else holes.push({ x: p.x, y: p.y, top: 0, bottom: p.z, pitch, r: Math.max(0.4, t.d / 2) });
  });
  if (!holes.length) return null;

  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.45, roughness: 0.5, side: THREE.DoubleSide });
  for (const h of holes) {
    const depth = Math.max(0.5, h.top - h.bottom);
    const turns = Math.max(1, Math.min(40, Math.floor(depth / h.pitch)));
    const pts: THREE.Vector3[] = [];
    const perTurn = 20;
    for (let i = 0; i <= turns * perTurn; i++) {
      const t = i / perTurn;
      const ang = t * Math.PI * 2;
      pts.push(new THREE.Vector3(h.x + h.r * Math.cos(ang), -t * h.pitch, -(h.y + h.r * Math.sin(ang))));
    }
    if (pts.length < 2) continue;
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.min(600, turns * perTurn), h.pitch * 0.28, 5, false);
    group.add(new THREE.Mesh(tube, mat));
  }
  return group;
}

function meshFromHeightmap(h: Float32Array, m: MillMeta) {
  const pos: number[] = []; const idx: number[] = [];
  const V = (x: number, y: number, z: number) => { pos.push(x, z, -y); return pos.length / 3 - 1; };
  const H = (i: number, j: number) => h[j * (m.nx + 1) + i];
  const gx = (i: number) => m.minX + i * m.cx;
  const gy = (j: number) => m.minY + j * m.cy;

  // powierzchnia górna z mapy wysokości
  for (let j = 0; j <= m.ny; j++) for (let i = 0; i <= m.nx; i++) V(gx(i), gy(j), H(i, j));
  for (let j = 0; j < m.ny; j++) for (let i = 0; i < m.nx; i++) {
    const a = j * (m.nx + 1) + i, b = a + 1, c = a + m.nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }

  // Ściany boczne budowane z rzeczywistych wysokości brzegowych — dzięki temu
  // materiał zebrany przy krawędzi znika także ze ściany, bez pozostawiania rantu.
  const wallStrip = (pts: { x: number; y: number; z: number }[]) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const p = pts[k], q = pts[k + 1];
      const a = V(p.x, p.y, p.z), b = V(q.x, q.y, q.z);
      const c = V(p.x, p.y, m.bottom), d = V(q.x, q.y, m.bottom);
      idx.push(a, b, c, b, d, c);
    }
  };

  const south: { x: number; y: number; z: number }[] = [];
  const north: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i <= m.nx; i++) {
    south.push({ x: gx(i), y: gy(0), z: H(i, 0) });
    north.push({ x: gx(i), y: gy(m.ny), z: H(i, m.ny) });
  }
  const west: { x: number; y: number; z: number }[] = [];
  const east: { x: number; y: number; z: number }[] = [];
  for (let j = 0; j <= m.ny; j++) {
    west.push({ x: gx(0), y: gy(j), z: H(0, j) });
    east.push({ x: gx(m.nx), y: gy(j), z: H(m.nx, j) });
  }
  wallStrip(south);
  wallStrip([...north].reverse());
  wallStrip([...west].reverse());
  wallStrip(east);

  // dno
  const b0 = V(m.minX, m.minY, m.bottom), b1 = V(m.maxX, m.minY, m.bottom);
  const b2 = V(m.maxX, m.maxY, m.bottom), b3 = V(m.minX, m.maxY, m.bottom);
  idx.push(b0, b1, b2, b0, b2, b3);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function latheGeometry(program: ReturnType<typeof parseProgram>, cut: Segment[], lengths: number[], progress: number, setup: Setup) {
  if (!cut.length) return null;
  let minZ = Infinity, maxZ = -Infinity, maxR = 0;
  for (const s of cut) for (let t = 0; t <= 1; t += 0.1) { const p = pointAt(s, t); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); maxR = Math.max(maxR, p.x); }
  const st = setup.stock;
  const R0 = st.auto ? maxR + 2 : st.d / 2;
  const z0 = st.auto ? minZ - 8 : -st.len; const z1 = Math.max(maxZ, 0);
  const n = Math.min(260, gridMax()); const prof = new Float32Array(n + 1).fill(R0); const dz = (z1 - z0) / n;
  for (const { seg, t } of cutUpTo(cut, program.segments, lengths, progress)) {
    const steps = Math.max(2, Math.ceil((segmentLength(seg) * t) / (dz * 0.5)));
    for (let i = 0; i <= steps; i++) { const p = pointAt(seg, (i / steps) * t); const k = Math.round((p.z - z0) / dz); if (k >= 0 && k <= n && p.x < prof[k]) prof[k] = Math.max(0.2, p.x); }
    // narzędzie usuwa też wszystko "nad" torem na odcinku planowania — uproszczenie: ruch w -X obniża profil w tym Z
  }
  const points: THREE.Vector2[] = [new THREE.Vector2(0, z0)];
  for (let k = 0; k <= n; k++) points.push(new THREE.Vector2(prof[k], z0 + k * dz));
  points.push(new THREE.Vector2(0, z1));
  const g = new THREE.LatheGeometry(points, 64); // obrót wokół Y; Y = Z tokarki
  g.rotateZ(-Math.PI / 2); // Y → X (three X = Z tokarki)
  return g;
}
