"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { parseProgram, pointAt, segmentLength, type Segment, type Vec3 } from "@/lib/parser";
import type { SimMode } from "./Simulator";
import { isLatheTool, toolOf, type Setup, type Tool } from "./setup";

interface Props { source: string; mode: SimMode; progress: number; setup: Setup; }

const GRID = 140; // rozdzielczość mapy wysokości (frezowanie) / profilu (toczenie)

export default function Sim3D({ source, mode, progress, setup }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const program = useMemo(() => parseProgram(source, { diameterX: mode === "lathe" }), [source, mode]);
  const lengths = useMemo(() => program.segments.map(segmentLength), [program]);
  // narzędzie aktywne w bieżącym miejscu programu
  const activeToolNo = useMemo(() => {
    let acc = 0; let no: number | null = null;
    program.segments.forEach((sg, i) => { if (progress >= acc) no = program.lines[sg.line]?.state.tool ?? no; acc += lengths[i]; });
    return no;
  }, [program, lengths, progress]);
  const tool: Tool = toolOf(setup, activeToolNo, mode);
  const toolD = isLatheTool(tool.kind) ? 6 : tool.d;

  // scena
  const sceneRef = useRef<{ scene: THREE.Scene; stock: THREE.Mesh | null; tool: THREE.Mesh; render: () => void; stockMat: THREE.MeshStandardMaterial } | null>(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); renderer.setSize(W, H); renderer.setClearColor(0x12161c);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 5000);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(60, 120, 80); scene.add(dl);
    const grid = new THREE.GridHelper(400, 40, 0x334, 0x223); scene.add(grid);
    scene.add(new THREE.AxesHelper(30));
    // znacznik zera detalu
    const om = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xE8A317 }));
    scene.add(om);

    // ścieżka
    const seg = program.segments;
    const pts: THREE.Vector3[] = []; const cols: number[] = [];
    const c = { rapid: new THREE.Color("#E8A317"), linear: new THREE.Color("#3FCB84"), arc: new THREE.Color("#5AA9F0") };
    for (const s of seg) {
      const n = s.kind === "arc" ? 32 : 1;
      for (let i = 0; i < n; i++) { const a = pointAt(s, i / n), b = pointAt(s, (i + 1) / n); pts.push(toW(a, mode), toW(b, mode)); cols.push(...c[s.kind].toArray(), ...c[s.kind].toArray()); }
    }
    const lg = new THREE.BufferGeometry().setFromPoints(pts); lg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 })));

    // narzędzie
    const toolLen = 30;
    const k = tool.kind; const r = toolD / 2;
    let toolGeo: THREE.BufferGeometry;
    if (k === "drill") { toolGeo = new THREE.ConeGeometry(r, r * 2, 20); toolGeo.translate(0, r, 0); const shank = new THREE.CylinderGeometry(r, r, toolLen, 20); shank.translate(0, r * 2 + toolLen / 2, 0); toolGeo = mergeGeo(toolGeo, shank); }
    else if (k === "tap") { toolGeo = new THREE.CylinderGeometry(r, r, toolLen, 6); toolGeo.translate(0, toolLen / 2, 0); }
    else if (k === "ballnose") { toolGeo = new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); toolGeo.translate(0, r, 0); const sh = new THREE.CylinderGeometry(r, r, toolLen, 20); sh.translate(0, r + toolLen / 2, 0); toolGeo = mergeGeo(toolGeo, sh); }
    else if (mode === "lathe") { toolGeo = latheToolGeo(tool.angle, tool.d); }
    else { toolGeo = new THREE.CylinderGeometry(r, r, toolLen, 24); toolGeo.translate(0, toolLen / 2, 0); }
    const toolMesh = new THREE.Mesh(toolGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.6, roughness: 0.3 }));
    scene.add(toolMesh);

    const stockMat = new THREE.MeshStandardMaterial({ color: 0x8a94a3, metalness: 0.3, roughness: 0.55, side: THREE.DoubleSide });
    const st = { scene, stock: null as THREE.Mesh | null, tool: toolMesh, render: () => { controls.update(); renderer.render(scene, camera); }, stockMat };
    sceneRef.current = st;

    // kamera na obszar
    const b = program.bounds; const ctr = toW({ x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }, mode);
    const span = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z, 40);
    camera.position.set(ctr.x + span * 0.9, ctr.y + span * 0.8, ctr.z + span * 1.1); controls.target.copy(ctr);

    let raf = 0; const loop = () => { st.render(); raf = requestAnimationFrame(loop); }; loop();
    const onResize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); el.innerHTML = ""; sceneRef.current = null; };
  }, [program, mode, toolD, tool.kind, tool.angle, tool.d]);

  // ubytek materiału + pozycja narzędzia
  useEffect(() => {
    const st = sceneRef.current; if (!st) return;
    const cut = program.segments.filter((s) => s.kind !== "rapid");
    // pozycja
    let acc = 0; let pos: Vec3 = program.segments[0]?.from ?? { x: 0, y: 0, z: 0 };
    program.segments.forEach((sg, i) => { const len = lengths[i]; const d = Math.min(1, Math.max(0, (progress - acc) / (len || 1))); if (d > 0) pos = d < 1 ? pointAt(sg, d) : sg.to; acc += len; });
    st.tool.position.copy(toW(pos, mode));

    // geometria półfabrykatu
    if (st.stock) { st.scene.remove(st.stock); st.stock.geometry.dispose(); }
    const geo = mode === "mill" ? millGeometry(program, cut, lengths, progress, setup, mode) : latheGeometry(program, cut, lengths, progress, setup);
    if (geo) { st.stock = new THREE.Mesh(geo, st.stockMat); st.scene.add(st.stock); }
  }, [program, lengths, progress, mode, toolD, setup, tool]);

  return (
    <div className="grid gap-1">
      <div ref={mountRef} className="sim-canvas" style={{ height: 360 }} />
      <p className="text-xs text-muted">Obracaj palcem lub myszą, przybliżaj szczypcami. Widok jest zsynchronizowany z symulacją 2D — sterowanie znajdziesz powyżej.</p>
    </div>
  );
}

function mergeGeo(a: THREE.BufferGeometry, b: THREE.BufferGeometry) {
  const pa = a.getAttribute("position").array as ArrayLike<number>;
  const pb = b.getAttribute("position").array as ArrayLike<number>;
  const na = a.index ? Array.from(a.index.array) : null;
  const nb = b.index ? Array.from(b.index.array) : null;
  const pos = new Float32Array(pa.length + pb.length);
  pos.set(pa, 0); pos.set(pb, pa.length);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (na && nb) g.setIndex([...na, ...nb.map((i) => i + pa.length / 3)]);
  g.computeVertexNormals();
  return g;
}

/** Nóż tokarski: romb o kącie przystawienia, leżący w płaszczyźnie ZX. */
function latheToolGeo(angle: number, rEps: number) {
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

function millGeometry(program: ReturnType<typeof parseProgram>, cut: Segment[], lengths: number[], progress: number, setup: Setup, mode: SimMode) {
  if (!cut.length) return null;
  let minX: number, maxX: number, minY: number, maxY: number, top: number, bottom: number;
  const st = setup.stock;
  const maxD = Math.max(...Object.values(setup.tools).filter((t) => !isLatheTool(t.kind)).map((t) => t.d), 6);
  if (st.auto) {
    const m = 4 + maxD;
    let aX = Infinity, bX = -Infinity, aY = Infinity, bY = -Infinity, mz = 0;
    for (const s of cut) for (let t = 0; t <= 1; t += 0.1) { const p = pointAt(s, t); aX = Math.min(aX, p.x); bX = Math.max(bX, p.x); aY = Math.min(aY, p.y); bY = Math.max(bY, p.y); mz = Math.min(mz, p.z); }
    minX = aX - m; maxX = bX + m; minY = aY - m; maxY = bY + m; top = 0; bottom = Math.min(mz - 5, -5);
  } else {
    minX = -st.ox; maxX = st.x - st.ox; minY = -st.oy; maxY = st.y - st.oy;
    top = st.z - st.oz; bottom = -st.oz;
  }
  const nx = GRID, ny = Math.max(20, Math.round(GRID * (maxY - minY) / (maxX - minX)));
  const h = new Float32Array((nx + 1) * (ny + 1)).fill(top);
  const cx = (maxX - minX) / nx, cy = (maxY - minY) / ny;
  for (const { seg, t } of cutUpTo(cut, program.segments, lengths, progress)) {
    const tno = program.lines[seg.line]?.state.tool ?? null;
    const tl = toolOf(setup, tno, mode);
    const r = (isLatheTool(tl.kind) ? 6 : tl.d) / 2;
    const len = segmentLength(seg) * t; const steps = Math.max(1, Math.ceil(len / (Math.min(cx, cy) * 0.7)));
    for (let i = 0; i <= steps; i++) {
      const p = pointAt(seg, (i / steps) * t); if (p.z >= top) continue;
      const i0 = Math.floor((p.x - r - minX) / cx), i1 = Math.ceil((p.x + r - minX) / cx);
      const j0 = Math.floor((p.y - r - minY) / cy), j1 = Math.ceil((p.y + r - minY) / cy);
      for (let j = Math.max(0, j0); j <= Math.min(ny, j1); j++) for (let ii = Math.max(0, i0); ii <= Math.min(nx, i1); ii++) {
        const gx = minX + ii * cx, gy = minY + j * cy;
        if ((gx - p.x) ** 2 + (gy - p.y) ** 2 <= r * r) { const k = j * (nx + 1) + ii; if (p.z < h[k]) h[k] = Math.max(p.z, bottom); }
      }
    }
  }
  // siatka: góra (mapa wysokości) + ściany + dno
  const pos: number[] = []; const idx: number[] = [];
  const V = (x: number, y: number, z: number) => { pos.push(x, z, -y); return pos.length / 3 - 1; };
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) V(minX + i * cx, minY + j * cy, h[j * (nx + 1) + i]);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  // ściany boczne (proste, do dna)
  const wall = (x0: number, y0: number, x1: number, y1: number) => { const a = V(x0, y0, top), b = V(x1, y1, top), c = V(x0, y0, bottom), d = V(x1, y1, bottom); idx.push(a, b, c, b, d, c); };
  wall(minX, minY, maxX, minY); wall(maxX, minY, maxX, maxY); wall(maxX, maxY, minX, maxY); wall(minX, maxY, minX, minY);
  const b0 = V(minX, minY, bottom), b1 = V(maxX, minY, bottom), b2 = V(maxX, maxY, bottom), b3 = V(minX, maxY, bottom); idx.push(b0, b1, b2, b0, b2, b3);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function latheGeometry(program: ReturnType<typeof parseProgram>, cut: Segment[], lengths: number[], progress: number, setup: Setup) {
  if (!cut.length) return null;
  let minZ = Infinity, maxZ = -Infinity, maxR = 0;
  for (const s of cut) for (let t = 0; t <= 1; t += 0.1) { const p = pointAt(s, t); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); maxR = Math.max(maxR, p.x); }
  const st = setup.stock;
  const R0 = st.auto ? maxR + 2 : st.d / 2;
  const z0 = st.auto ? minZ - 8 : -st.len; const z1 = Math.max(maxZ, 0);
  const n = GRID; const prof = new Float32Array(n + 1).fill(R0); const dz = (z1 - z0) / n;
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
