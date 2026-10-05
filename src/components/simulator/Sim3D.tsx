"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { initLatheProfile, latheProfileCached, type LatheCache, type LatheProfile, latheChuck } from "./latheStock";
import { latheOutline } from "./latheInsert";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { circleOf, distOf, m3Text, snapAxis, v3, type M3, type P3, type Pick3, type Tool3 } from "./measure3d";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { parseProgram, playLength, pointAt, tableMat, type Kin, type Rot3, type Segment, type Vec3 } from "@/lib/parser";
import { axisAt, rotAt, type PartSeg } from "./multiaxis";
import { allChunks, voxCarve, voxChunkMesh, voxInit, voxMeta, type VoxMeta } from "./voxel";
import { stockBoxes } from "./pieces";
import { carve, millMeta, type MillMeta } from "./heightmap";
import { angleAt, carveCyl, cylInit, cylMesh, cylMeta, cylUpdate, fixtureOf, isCyl, type CylMeta } from "./cylinder";
import type { SimMode } from "./Simulator";
import { cuttingRadius, toolOf, type Setup, type Tool } from "./setup";

export interface Sim3DApi { exportStl: () => Blob | null }
interface Props { source: string; mode: SimMode; progress: number; setup: Setup; segments?: Segment[]; fill?: boolean; ticks?: boolean; /** Zero aktywnego układu programu w maszynie — mały układ osi z etykietą; null = brak. */ zeroMark?: Vec3 | null; onApi?: (api: Sim3DApi | null) => void; /** Półfabrykat widoczny (false = sam tor i narzędzie). */ showStock?: boolean; /** Kinematyka stołu 4/5 osi — do widoku ruchu stołu. */ kin?: Kin; /** Tor narzędzia widoczny. */ showPath?: boolean; onTogglePath?: () => void }


/**
 * Górny limit rozdzielczości mapy wysokości. Siatka 420 × 420 to ponad 170 tys.
 * punktów i model o milionie wierzchołków — na telefonie kończy się to
 * wyczerpaniem pamięci i zabiciem karty przez przeglądarkę.
 */
function gridMax() {
  if (typeof window === "undefined") return 260;
  const narrow = window.innerWidth < 900;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  // Telefon: oszczędnie. Komputer: gęsta siatka — łuki bez widocznych schodków.
  if (narrow) return mem <= 4 ? 190 : 240;
  if (mem < 4) return 280;
  if (mem < 8) return 340;
  return 400;
} // rozdzielczość mapy wysokości (frezowanie) / profilu (toczenie)

export default function Sim3D({ source, mode, progress, setup, segments: segs, fill, ticks = false, zeroMark = null, onApi, showStock = true, kin = "AC", showPath = true, onTogglePath }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const showStockRef = useRef(showStock);
  const showPathRef = useRef(showPath);
  const parsed = useMemo(() => parseProgram(source, { diameterX: mode === "lathe" }), [source, mode]);
  const program = useMemo(() => {
    if (!segs) return parsed;
    // 4/5 osi: tor w układzie detalu — kadr z jego obrysu, nie z osi maszyny
    if (!segs.some((sg) => (sg as PartSeg).tax)) return { ...parsed, segments: segs };
    const min = { x: 0, y: 0, z: 0 }, max = { x: 0, y: 0, z: 0 };
    for (const sg of segs) for (const p of [sg.from, sg.to]) for (const k of ["x", "y", "z"] as const) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
    return { ...parsed, segments: segs, bounds: { min, max } };
  }, [parsed, segs]);
  // Frezowanie 4/5-osiowe na prostopadłościanie: ubytek objętościowy, narzędzie pochylone, stół obrotowy.
  const multi = mode === "mill" && !isCyl(setup, mode) && program.segments.some((sg) => !!(sg as PartSeg).tax);
  // widok maszyny (obraca się stół) domyślnie — tak pracuje frezarka stół–stół
  const [machineView, setMachineView] = useState(true);
  const lengths = useMemo(() => program.segments.map(playLength), [program]);
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
  const [ghost, setGhost] = useState(false);
  // Bufor mapy wysokości — pozwala dokładać tylko nowe odcinki zamiast liczyć
  // cały program przy każdej klatce.
  const latheRef = useRef<LatheCache | null>(null);
  // Jeden bufor na detal (G54, G55… mają własne półfabrykaty).
  const hmRef = useRef<{ key: string; parts: { h: Float32Array; meta: MillMeta }[]; progress: number } | null>(null);
  // siatka półfabrykatu frezarki używana ponownie między klatkami + dławienie odświeżania w trakcie animacji
  const meshRef = useRef<{ parts: { h: Float32Array; meta: MillMeta }[]; geos: THREE.BufferGeometry[] } | null>(null);
  // Walec na 4. osi: mapa promienia i siatka (grupa obracana o kąt A).
  const voxRef = useRef<{ key: string; f: Float32Array; meta: VoxMeta; progress: number; dirty: Set<number>; meshes: Map<number, THREE.Mesh>; group: THREE.Group | null; fx: Trunnion | null } | null>(null);
  const cylRef = useRef<{ key: string; h: Float32Array; meta: CylMeta; progress: number; geo: THREE.BufferGeometry | null; group: THREE.Group | null } | null>(null);
  const lastMeshT = useRef(0);
  const trailT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [meshTick, setMeshTick] = useState(0);
  const threadKey = useRef("");
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameRef = useRef<((bb: THREE.Box3) => void) | null>(null);
  const lastFrameKey = useRef("");
  const voxMeshT = useRef(0);
  const viewApi = useRef<((v: "iso" | "top" | "front" | "side" | "fit") => void) | null>(null);
  // pomiar w 3D: kliknięcia na powierzchni detalu (współrzędne w grupie detalu — obracają się razem ze stołem)
  const [measure, setMeasure] = useState(false);
  const [tool3, setTool3] = useState<Tool3>("dist");
  const [meas, setMeas] = useState<M3[]>([]);
  const [picks, setPicks] = useState<Pick3[]>([]);
  const measureRef = useRef(false);
  const pickRef = useRef<((p: Pick3) => void) | null>(null);
  // środki zmierzonych okręgów — do wymiaru „od środka otworu” (wskazanie blisko środka na ekranie)
  const centersRef = useRef<{ c: P3; ax: P3 }[]>([]);
  const measGrp = useRef<THREE.Group | null>(null);
  const [prevSrc, setPrevSrc] = useState(source);
  if (prevSrc !== source) { setPrevSrc(source); setMeas([]); setPicks([]); }
  useEffect(() => {
    measureRef.current = measure;
    centersRef.current = meas.filter((m): m is Extract<M3, { kind: "circ" }> => m.kind === "circ").map((m) => ({ c: m.c, ax: m.ax }));
    pickRef.current = (p) => {
      const need = tool3 === "circ" ? 3 : 2;
      const next = [...picks, p];
      if (next.length < need) { setPicks(next); return; }
      setPicks([]);
      const m: M3 | null = tool3 === "circ" ? circleOf(next) : tool3 === "ang" ? { kind: "ang", a: next[0], b: next[1] } : { kind: "dist", a: next[0], b: next[1] };
      if (m) setMeas((ms) => [...ms.slice(-7), m]);
    };
  }, [measure, tool3, picks, meas]);
  const toolRef = useRef<Tool>(tool);
  const programRef = useRef(program);
  useEffect(() => { toolRef.current = tool; programRef.current = program; }, [tool, program]);
  const sceneRef = useRef<{ scene: THREE.Scene; part: THREE.Group; stock: THREE.Object3D | null; threads: THREE.Group | null; path: THREE.LineSegments | null; tool: THREE.Mesh; render: () => void; stockMat: THREE.MeshStandardMaterial } | null>(null);
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
    // detal (półfabrykat, tor, znacznik zera) w jednej grupie — w widoku maszyny 5-osiowej obraca się ze stołem
    const part = new THREE.Group(); scene.add(part);
    const om = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xF97316 }));
    part.add(om);

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
    stockMat.visible = showStockRef.current;
    // Renderowanie na żądanie: klatka powstaje tylko po zmianie (ruch kamery, postęp, widok).
    // Bezczynna scena nie obciąża karty graficznej ani wątku strony.
    let dirty = true;
    const st = { scene, part, stock: null as THREE.Object3D | null, threads: null as THREE.Group | null, path: null as THREE.LineSegments | null, tool: toolMesh, render: () => { dirty = true; }, stockMat };
    sceneRef.current = st;

    // kamera na obszar + gotowe ustawienia widoku
    // Kadr obejmuje tor i — na tokarce — cały pręt (półfabrykat bywa dłuższy niż tor narzędzia).
    const b0 = programRef.current.bounds;
    const b = { min: { ...b0.min }, max: { ...b0.max } };
    if (mode === "lathe") {
      const pr = initLatheProfile(programRef.current, programRef.current.segments, setup);
      // …i szczęki uchwytu za końcem wysięgu, żeby było widać, czym pręt jest trzymany
      if (pr) { const ch = latheChuck(pr, programRef.current.segments, setup.stock.auto); b.min.z = Math.min(b.min.z, ch.zFace - ch.jawLen); b.max.z = Math.max(b.max.z, pr.z1); b.max.x = Math.max(b.max.x, ch.jawR); b.min.x = Math.min(b.min.x, -ch.jawR); }
    }
    let ctr = toW({ x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }, mode);
    let span = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z, 40);
    // Odległość kamery liczona z węższego kąta widzenia — na pionowym ekranie telefonu
    // detal mieści się w kadrze tak samo jak na szerokim monitorze.
    let lastView: "iso" | "top" | "front" | "side" | "fit" = "iso";
    const apply = (v: "iso" | "top" | "front" | "side" | "fit") => {
      lastView = v;
      const vf = (camera.fov * Math.PI) / 180;
      const hf = 2 * Math.atan(Math.tan(vf / 2) * Math.max(0.2, camera.aspect));
      const R = span * 0.62;
      const d = (R / Math.sin(Math.min(vf, hf) / 2)) * 1.05;
      const dir = v === "top" ? new THREE.Vector3(0, 1, 0.001)
        : v === "front" ? new THREE.Vector3(0, 0.15, 1)
        : v === "side" ? new THREE.Vector3(1, 0.15, 0)
        : new THREE.Vector3(0.9, 0.8, 1.1);
      dir.normalize().multiplyScalar(d);
      camera.position.set(ctr.x + dir.x, ctr.y + dir.y, ctr.z + dir.z);
      controls.target.copy(ctr);
      controls.update();
    };
    // pomiar: stuknięcie/kliknięcie bez przeciągania — punkt na powierzchni półfabrykatu
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let downAt: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => { downAt = e.isPrimary ? { x: e.clientX, y: e.clientY, t: performance.now() } : null; };
    const toPart = new THREE.Matrix4();
    const castAt = (cx: number, cy: number, r: DOMRect) => {
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(part, true).find((h) => (h.object as THREE.Mesh).material === stockMat && !!h.face);
    };
    const onUp = (e: PointerEvent) => {
      const d = downAt; downAt = null;
      if (!measureRef.current || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 700) return;
      const r = renderer.domElement.getBoundingClientRect();
      // środek zmierzonego okręgu pod kursorem (14 px) — punkt „od środka otworu”
      for (const k of centersRef.current) {
        const w = part.localToWorld(new THREE.Vector3(k.c.x, k.c.y, k.c.z)).project(camera);
        const sx = r.left + (w.x + 1) / 2 * r.width, sy = r.top + (1 - w.y) / 2 * r.height;
        if (Math.hypot(sx - e.clientX, sy - e.clientY) < 14) { pickRef.current?.({ p: k.c, n: k.ax, center: true }); return; }
      }
      if (!stockMat.visible) return;
      const hit = castAt(e.clientX, e.clientY, r);
      if (!hit) return;
      // normalna ściany: średnia z kilku promieni wokół wskazania (siatka z wokseli jest schodkowa)
      toPart.copy(part.matrixWorld).invert();
      const n = new THREE.Vector3();
      const tol = 1.5 + hit.distance * 0.01;
      for (const [ox, oy] of [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5]]) {
        const h = ox || oy ? castAt(e.clientX + ox, e.clientY + oy, r) : hit;
        if (!h?.face || h.point.distanceTo(hit.point) > tol) continue;
        const nw = h.face.normal.clone().transformDirection(h.object.matrixWorld);
        if (nw.dot(ray.ray.direction) > 0) nw.negate();     // normalna w stronę patrzącego
        n.add(nw);
      }
      n.transformDirection(toPart);
      const lp = part.worldToLocal(hit.point.clone());
      pickRef.current?.({ p: { x: lp.x, y: lp.y, z: lp.z }, n: snapAxis({ x: n.x, y: n.y, z: n.z }) });
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    // dopóki użytkownik nie obrócił widoku, zmiana proporcji okna kadruje detal od nowa
    let touched = false;
    controls.addEventListener("start", () => { touched = true; });
    viewApi.current = (v) => { touched = false; apply(v); };
    // 4/5 osi: kadr obejmuje cały stół uchylny, nie tylko tor
    frameRef.current = (bb: THREE.Box3) => {
      const c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
      ctr = c; span = Math.max(sz.x, sz.y, sz.z, 40) * 0.85;
      if (!touched) apply(lastView);
    };
    apply("iso");

    let raf = 0;
    const loop = () => {
      try {
        const moved = controls.update();
        if (dirty || moved) { dirty = false; renderer.render(scene, camera); }
      } catch { queueMicrotask(() => setFailed("error")); return; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 8 || h < 8) return;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
      if (!touched) apply(lastView);
      st.render();
    };
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      ro?.disconnect();
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      renderer.dispose();
      el.innerHTML = "";
      sceneRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Wymiana bryły narzędzia — bez dotykania renderera i kontekstu WebGL.
  useEffect(() => {
    const st = sceneRef.current; if (!st || failed) return;
    try {
      const geo = buildToolGeometry(tool, cuttingRadius(tool) * 2, 30, mode);
      st.tool.geometry.dispose();
      st.tool.geometry = geo;
      if (mode === "mill") {
        st.tool.rotation.z = -(safe(tool.tiltB, 0, -90, 90) * Math.PI) / 180;
        st.tool.rotation.x = (safe(tool.tiltA, 0, -90, 90) * Math.PI) / 180;
      }
    } catch { /* wadliwa geometria nie może gasić podglądu */ }
  }, [tool, mode, failed]);

  // Przebudowa toru narzędzia po zmianie programu.
  useEffect(() => {
    const st = sceneRef.current; if (!st || failed) return;
    if (st.path) { st.part.remove(st.path); st.path.geometry.dispose(); st.path = null; }
    const pts: THREE.Vector3[] = []; const cols: number[] = [];
    const c = { rapid: new THREE.Color("#F59E0B"), linear: new THREE.Color("#22C55E"), arc: new THREE.Color("#38BDF8") };
    for (const sg of program.segments) {
      if (sg.kind === "dwell") continue;   // bez ruchu — nic do narysowania na torze 3D
      const n = sg.kind === "arc" ? 32 : 1;
      for (let i = 0; i < n; i++) {
        const a = pointAt(sg, i / n), b = pointAt(sg, (i + 1) / n);
        pts.push(toW(a, mode), toW(b, mode));
        cols.push(...c[sg.kind].toArray(), ...c[sg.kind].toArray());
      }
    }
    if (!pts.length) return;
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    lg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    // gęsty program z CAM: tor przygaszony, żeby było widać powierzchnię detalu
    const line = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: program.segments.length > 2500 ? 0.22 : 0.6 }));
    line.visible = showPathRef.current;
    st.path = line;
    st.part.add(line);
    st.render();
  }, [program, mode, failed]);

  // ubytek materiału + pozycja narzędzia
  useEffect(() => {
    const st = sceneRef.current; if (!st || failed) return;
    let broke = false;
    try {
    const cut = program.segments.filter((s) => s.kind !== "rapid" && s.kind !== "dwell");
    // pozycja
    let acc = 0; let pos: Vec3 = program.segments[0]?.from ?? { x: 0, y: 0, z: 0 };
    let curSeg: Segment | null = program.segments[0] ?? null, curT = 0;
    let fxAng: Rot3 | null = null;   // kąty stołu do ustawienia kołyski (widok maszyny)
    program.segments.forEach((sg, i) => { const len = lengths[i]; const d = Math.min(1, Math.max(0, (progress - acc) / (len || 1))); if (d > 0) { pos = d < 1 ? pointAt(sg, d) : sg.to; curSeg = sg; curT = d; } acc += len; });
    if (multi && curSeg) {
      // 5 osi: oś narzędzia z kątów stołu. Widok detalu — pochylone narzędzie; widok maszyny — obraca się stół.
      const seg: Segment = curSeg;
      const fx = voxRef.current?.fx;
      if (machineView) {
        const ang = rotAt(seg, curT);
        const R = tableMat(kin, ang);
        st.part.quaternion.copy(machineQuat(R));
        fxAng = ang;
        if (fx) poseTrunnion(fx, kin, ang);
        st.tool.quaternion.identity();
        st.tool.position.copy(toW({ x: R[0] * pos.x + R[1] * pos.y + R[2] * pos.z, y: R[3] * pos.x + R[4] * pos.y + R[5] * pos.z, z: R[6] * pos.x + R[7] * pos.y + R[8] * pos.z }, mode));
      } else {
        const ax = axisAt(seg as PartSeg, curT);
        st.part.quaternion.identity();
        if (fx) poseTrunnion(fx, kin, null);
        st.tool.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toW(ax, mode).normalize());
        st.tool.position.copy(toW(pos, mode));
      }
    } else {
      st.part.quaternion.identity();
      if (mode === "mill") st.tool.rotation.set((safe(tool.tiltA, 0, -90, 90) * Math.PI) / 180, 0, -(safe(tool.tiltB, 0, -90, 90) * Math.PI) / 180);
      st.tool.position.copy(toW(pos, mode));
    }

    // Dławienie: w trakcie animacji bryła odświeża się co ~70 ms (pozycja narzędzia — co klatkę).
    // Ostatni stan zawsze się dorysuje (zegar końcowy), więc po pauzie widok jest aktualny.
    const now = performance.now();
    const sameRun = multi ? voxRef.current && progress >= voxRef.current.progress : hmRef.current && progress >= hmRef.current.progress;
    if (sameRun && now - lastMeshT.current < 70) {
      if (!trailT.current) trailT.current = setTimeout(() => { trailT.current = null; lastMeshT.current = 0; setMeshTick((t) => t + 1); }, 80);
      st.render();
      return;
    }
    lastMeshT.current = now;

    let obj: THREE.Object3D | null = null;
    let fresh = true;
    if (!multi && voxRef.current) { if (voxRef.current.fx) disposeTrunnion(st.scene, voxRef.current.fx); voxRef.current = null; }
    if (isCyl(setup, mode)) {
      const key = JSON.stringify([source, setup.stock, Object.entries(setup.tools).map(([n, t]) => [n, t.kind, t.d, t.corner])]);
      let c = cylRef.current;
      if (!c || c.key !== key || progress < c.progress) {
        const meta = cylMeta(setup, gridMax());
        c = { key, h: cylInit(meta), meta, progress: 0, geo: null, group: null };
      }
      if (progress > c.progress) { carveCyl(c.h, c.meta, program, lengths, setup, c.progress, progress); c.progress = progress; }
      cylRef.current = c;
      if (c.geo && c.group && st.stock && c.group.parent === st.stock) {
        const attr = c.geo.getAttribute("position") as THREE.BufferAttribute;
        cylUpdate(attr.array as Float32Array, c.geo.userData.map as Int32Array, c.h, c.meta);
        attr.needsUpdate = true; c.geo.computeVertexNormals();
        fresh = false;
      } else {
        const mg = cylMesh(c.h, c.meta);
        const geo = new THREE.BufferGeometry();
        const attr = new THREE.BufferAttribute(mg.pos, 3); attr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute("position", attr); geo.setIndex(mg.idx); geo.computeVertexNormals(); geo.userData.map = mg.map;
        const g = new THREE.Group(); g.add(new THREE.Mesh(geo, st.stockMat));
        // uchwyt: korpus i trzy szczęki obracają się razem z detalem
        const fx = fixtureOf(setup), chuckMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.5, roughness: 0.45 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(fx.jawR + 13, fx.jawR + 13, fx.x0 - fx.bodyX0, 48), chuckMat);
        body.rotation.z = Math.PI / 2; body.position.x = (fx.bodyX0 + fx.x0) / 2; g.add(body);
        if (fx.grip > 0) for (let k = 0; k < 3; k++) {
          const jaw = new THREE.Mesh(new THREE.BoxGeometry(fx.grip, fx.jawR - fx.R, 10), chuckMat);
          const ang = Math.PI / 2 + (k * 2 * Math.PI) / 3, rr = (fx.R + fx.jawR) / 2;
          jaw.position.set(fx.x0 + fx.grip / 2, rr * Math.sin(ang), -rr * Math.cos(ang));
          jaw.rotation.x = ang - Math.PI / 2;
          g.add(jaw);
        }
        // oś walca leży na wysokości axisZ — grupa stoi na osi, więc obrót stołu to obrót grupy wokół X
        g.position.y = c.meta.axisZ;
        // kieł konika nie obraca się ze stołem — osobny obiekt w grupie zewnętrznej
        const outer = new THREE.Group(); outer.add(g);
        if (fx.tail) {
          const tm = new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.5, roughness: 0.4 });
          const cone = new THREE.Mesh(new THREE.ConeGeometry(fx.tail.r * 0.6, 14, 32), tm);
          cone.rotation.z = Math.PI / 2; cone.position.set(fx.x1 + 7, c.meta.axisZ, 0); outer.add(cone);
          const quill = new THREE.Mesh(new THREE.CylinderGeometry(fx.tail.r, fx.tail.r, fx.tail.x1 - fx.tail.x0 - 14, 32), tm);
          quill.rotation.z = Math.PI / 2; quill.position.set((fx.tail.x0 + 14 + fx.tail.x1) / 2, c.meta.axisZ, 0); outer.add(quill);
        }
        c.geo = geo; c.group = g; obj = outer;
      }
      // obrót stołu A (prawoskrętnie wokół +X maszyny = wokół +X świata)
      const grp = c.group; if (grp) grp.rotation.x = (angleAt(program, lengths, progress) * Math.PI) / 180;
    } else if (multi) {
      const key = JSON.stringify([source, kin, setup.stock, Object.entries(setup.tools).map(([n, t]) => [n, t.kind, t.d, t.corner, t.len, t.angle])]);
      let v = voxRef.current;
      if (!v || v.key !== key || progress < v.progress) {
        const boxes = stockBoxes(program, cut.length ? cut : program.segments, setup);
        const box = boxes.length ? boxes.reduce((a, b) => ({ ...a, x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1), top: Math.max(a.top, b.top), bottom: Math.min(a.bottom, b.bottom) }))
          : { x0: -25, x1: 25, y0: -25, y1: 25, top: 0, bottom: -25, origin: { x: 0, y: 0, z: 0 } };
        const meta = voxMeta(box, voxBudget());
        if (v?.group) for (const m of v.meshes.values()) m.geometry.dispose();
        const prevFx = v?.fx ?? null;
        v = { key, f: voxInit(meta, box), meta, progress: 0, dirty: allChunks(meta), meshes: new Map(), group: null, fx: prevFx };
        // mocowanie: stół uchylny (kołyska A/B + stół C) albo 4. oś A (konik z tarczą) — patrz makeTrunnion
        const g = new THREE.Group();
        if (v.fx) disposeTrunnion(st.scene, v.fx);
        const fx = makeTrunnion(kin, box, g);
        st.scene.add(fx.fixed); if (fx.cradle) st.scene.add(fx.cradle);
        poseTrunnion(fx, kin, fxAng);
        v.fx = fx;
        if (v.key !== lastFrameKey.current) {
          lastFrameKey.current = v.key;
          frameRef.current?.(new THREE.Box3().setFromObject(fx.fixed).expandByObject(fx.cradle ?? fx.fixed));
        }
        v.group = g; obj = g;
      } else fresh = false;
      if (progress > v.progress) {
        // porcja ~25 ms na klatkę — skok na koniec długiego programu nie zamraża strony
        v.progress = voxCarve(v.f, v.meta, program.segments as PartSeg[], lengths, program, setup, v.progress, progress, v.dirty, performance.now() + 25);
        if (v.progress < progress && !trailT.current) trailT.current = setTimeout(() => { trailT.current = null; lastMeshT.current = 0; setMeshTick((t) => t + 1); }, 0);
      }
      // w trakcie liczenia porcjami siatka odświeża się co ~200 ms, na końcu — zawsze
      const carving = v.progress < progress;
      if (carving && v.meshes.size && performance.now() - voxMeshT.current < 200) { voxRef.current = v; st.render(); return; }
      voxMeshT.current = performance.now();
      for (const k of v.dirty) {
        const old = v.meshes.get(k);
        if (old) { v.group!.remove(old); old.geometry.dispose(); v.meshes.delete(k); }
        const cm = voxChunkMesh(v.f, v.meta, k);
        if (!cm) continue;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(cm.pos, 3));
        geo.setAttribute("normal", new THREE.BufferAttribute(cm.nrm, 3));
        geo.setIndex(new THREE.BufferAttribute(cm.idx, 1));
        const mesh = new THREE.Mesh(geo, st.stockMat);
        v.group!.add(mesh); v.meshes.set(k, mesh);
      }
      v.dirty.clear();
      voxRef.current = v;
    } else if (mode === "mill") {
      if (cut.length) {
        const key = JSON.stringify([source, setup.stock, Object.entries(setup.tools).map(([n, t]) => [n, t.kind, t.d, t.corner])]);
        let buf = hmRef.current;
        if (!buf || buf.key !== key || progress < buf.progress) {
          const boxes = stockBoxes(program, cut, setup);
          const parts = boxes.map((b) => { const meta = millMeta(b, boxes.length, gridMax()); return { h: new Float32Array((meta.nx + 1) * (meta.ny + 1)).fill(meta.top), meta }; });
          buf = { key, parts, progress: 0 };
        }
        if (progress > buf.progress) {
          // porcja ~25 ms na klatkę (pierwszy detal wyznacza, dokąd doszło; reszta dociąga do tego miejsca)
          let reach = progress;
          buf.parts.forEach((p, k) => { reach = carve(p.h, p.meta, program, lengths, setup, mode, buf!.progress, reach, k === 0 ? performance.now() + 25 : Infinity); });
          buf.progress = reach;
          if (reach < progress && !trailT.current) trailT.current = setTimeout(() => { trailT.current = null; lastMeshT.current = 0; setMeshTick((t) => t + 1); }, 0);
        }
        hmRef.current = buf;
        const mr = meshRef.current;
        if (mr && mr.parts === buf.parts && st.stock) {
          buf.parts.forEach((p, i) => updateHeightmapMesh(mr.geos[i], p.h));
          fresh = false;
        } else {
          const geos = buf.parts.map((p) => meshFromHeightmap(p.h, p.meta));
          meshRef.current = { parts: buf.parts, geos };
          const g = new THREE.Group();
          for (const geo of geos) g.add(new THREE.Mesh(geo, st.stockMat));
          obj = g;
        }
      }
    } else {
      const geo = latheGeometryFrom(latheProfileCached(latheRef, program, program.segments, lengths, progress, setup));
      obj = geo ? new THREE.Mesh(geo, st.stockMat) : null;
    }
    if (fresh) {
      if (st.stock) { st.part.remove(st.stock); disposeTree(st.stock); st.stock = null; }
      if (obj) {
        st.stock = obj;
        st.part.add(obj);
        // siatka zawsze pod detalem — czytelne odniesienie do podłoża
        if (gridRef.current) {
          const bb = new THREE.Box3().setFromObject(obj);
          if (!bb.isEmpty()) gridRef.current.position.y = bb.min.y - 0.5;
        }
      }
    }

    if (multi && voxRef.current?.fx && gridRef.current) gridRef.current.position.y = voxRef.current.fx.floorY - 0.5;

    // zarys gwintu w otworach — przebudowa tylko, gdy zmienił się zestaw lub głębokość otworów
    if (mode === "mill" && !multi) {
      const holes = threadHoles(program, lengths, progress, setup, mode);
      const hk = JSON.stringify(holes.map((h) => [h.x.toFixed(2), h.y.toFixed(2), h.bottom.toFixed(1)]));
      if (hk !== threadKey.current || !st.threads !== !holes.length) {
        threadKey.current = hk;
        if (st.threads) { st.part.remove(st.threads); disposeTree(st.threads); st.threads = null; }
        const tg = holes.length ? threadGroup(holes) : null;
        if (tg) { st.threads = tg; st.part.add(tg); }
      }
    } else if (st.threads) { st.part.remove(st.threads); disposeTree(st.threads); st.threads = null; threadKey.current = ""; }
    st.render();
    } catch { broke = true; }
    if (broke) queueMicrotask(() => setFailed("error"));
  }, [program, lengths, progress, mode, toolD, setup, tool, failed, source, meshTick, multi, machineView, kin]);
  useEffect(() => () => { if (trailT.current) clearTimeout(trailT.current); }, []);

  // Eksport bryły półfabrykatu po obróbce (mapa wysokości / profil) do STL w milimetrach.
  useEffect(() => {
    if (!onApi) return;
    onApi({
      exportStl: () => {
        const st = sceneRef.current; if (!st?.stock) return null;
        // walec na 4. osi: tylko detal, bez uchwytu i konika
        const cg = cylRef.current?.group;
        const target = cg && cg.parent === st.stock ? cg.children[0] : st.stock;
        const text = new STLExporter().parse(target, { binary: false }) as string;
        return new Blob([text], { type: "model/stl" });
      },
    });
    return () => onApi(null);
  }, [onApi]);

  // „Materiał” wył. — chowamy bryłę półfabrykatu, zostaje tor i narzędzie (jak warstwa materiału w 2D)
  useEffect(() => {
    showStockRef.current = showStock;
    const st = sceneRef.current; if (!st) return;
    st.stockMat.visible = showStock;
    st.render();
  }, [showStock]);

  useEffect(() => {
    showPathRef.current = showPath;
    const st = sceneRef.current; if (!st) return;
    if (st.path) st.path.visible = showPath;
    st.render();
  }, [showPath]);

  const toggleGhost = () => {
    const st = sceneRef.current; if (!st) return;
    const next = !ghost;
    setGhost(next);
    st.stockMat.transparent = next;
    st.stockMat.opacity = next ? 0.28 : 1;
    st.stockMat.depthWrite = !next;
    st.stockMat.needsUpdate = true;
    st.render();
  };

  const setView = (v: "iso" | "top" | "front" | "side" | "fit") => {
    const api = viewApi.current; if (api) api(v);
  };

  // Podziałka współrzędnych w 3D: liczby wzdłuż osi (co „ładny” krok), w układzie G-kodu.
  useEffect(() => {
    const st = sceneRef.current; if (!st) return;
    const old = st.scene.getObjectByName("ticks");
    if (old) { st.scene.remove(old); old.traverse((o) => { const m = (o as THREE.Sprite).material as THREE.SpriteMaterial | undefined; if (m) { m.map?.dispose(); m.dispose(); } }); }
    if (ticks) {
      const b = parsed.bounds, g = new THREE.Group(); g.name = "ticks";
      const span = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z, 10);
      const raw = span / 10, p10 = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map((k) => k * p10).find((v) => v >= raw) ?? 10 * p10;
      const add = (txt: string, v: THREE.Vector3, col: string) => { const sp = makeLabel(txt, v, col, 0.55); g.add(sp); };
      const range = (a: number, c: number) => { const out: number[] = []; for (let v = Math.ceil(a / step) * step; v <= c + 1e-6; v += step) out.push(Math.round(v * 1000) / 1000); return out; };
      if (mode === "mill") {
        for (const x of range(Math.min(0, b.min.x), b.max.x)) if (x !== 0) add(`${x}`, new THREE.Vector3(x, 0, 4), "#FCA5A5");
        for (const y of range(Math.min(0, b.min.y), b.max.y)) if (y !== 0) add(`${y}`, new THREE.Vector3(-4, 0, -y), "#86EFAC");
        for (const z of range(Math.min(0, b.min.z), Math.max(0, b.max.z))) if (z !== 0) add(`${z}`, new THREE.Vector3(-4, z, 4), "#7DD3FC");
      } else {
        for (const z of range(Math.min(0, b.min.z), Math.max(0, b.max.z))) if (z !== 0) add(`${z}`, new THREE.Vector3(z, -4, 0), "#7DD3FC");
        for (const x of range(0, b.max.x)) if (x !== 0) add(`Ø${Math.round(x * 2 * 1000) / 1000}`, new THREE.Vector3(4, x, 0), "#FCA5A5");
      }
      st.scene.add(g);
    }
    st.render();
  }, [ticks, parsed, mode]);

  // Tokarka: uchwyt trójszczękowy za końcem wysięgu pręta (oś obrotu wzdłuż X świata).
  useEffect(() => {
    const st = sceneRef.current; if (!st) return;
    const old = st.scene.getObjectByName("chuck");
    if (old) { st.scene.remove(old); disposeTree(old); }
    if (mode === "lathe") {
      const pr = initLatheProfile(program, program.segments, setup);
      if (pr) {
        const ch = latheChuck(pr, program.segments, setup.stock.auto), g = new THREE.Group(); g.name = "chuck";
        const mat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.5, roughness: 0.45 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(ch.bodyR, ch.bodyR, ch.bodyLen, 48), mat);
        body.rotation.z = Math.PI / 2; body.position.x = ch.zFace - ch.jawLen - ch.bodyLen / 2; g.add(body);
        for (let k = 0; k < 3; k++) {
          const ang = (k * 2 * Math.PI) / 3 + Math.PI / 2, rr = (ch.R0 + ch.jawR) / 2;
          const jaw = new THREE.Mesh(new THREE.BoxGeometry(ch.jawLen, ch.jawR - ch.R0, 12), mat);
          jaw.position.set(ch.zFace - ch.jawLen / 2, rr * Math.sin(ang), rr * Math.cos(ang));
          jaw.rotation.x = -(ang - Math.PI / 2);
          g.add(jaw);
        }
        st.scene.add(g);
      }
    }
    st.render();
  }, [mode, program, setup]);

  // Znacznik zera aktywnego układu (G54–G59/G54.1/G505 + G52 + G92 + TRANS): osie 12 mm i etykieta.
  useEffect(() => {
    const st = sceneRef.current; if (!st) return;
    const old = st.scene.getObjectByName("zero");
    if (old) { st.scene.remove(old); old.traverse((o) => { const m = (o as THREE.Sprite).material as THREE.SpriteMaterial | undefined; if (m?.map) { m.map.dispose(); m.dispose(); } }); }
    if (zeroMark) {
      const g = new THREE.Group(); g.name = "zero";
      // Mapowanie jak dla toru: frezarka (x, z, −y), tokarka (z, x, 0).
      const p = mode === "mill" ? new THREE.Vector3(zeroMark.x, zeroMark.z, -zeroMark.y) : new THREE.Vector3(zeroMark.z, zeroMark.x, 0);
      const ax = new THREE.AxesHelper(12); ax.position.copy(p); g.add(ax);
      g.add(makeLabel("zero układu", p.clone().add(new THREE.Vector3(0, 6, 0)), "#FBBF24", 0.55));
      st.scene.add(g);
    }
    st.render();
  }, [zeroMark, mode]);

  // wymiary 3D: punkty, linia i opis odległości (stały rozmiar na ekranie, zawsze na wierzchu)
  useEffect(() => {
    const st = sceneRef.current; if (!st || failed) return;
    if (measGrp.current) {
      st.part.remove(measGrp.current);
      measGrp.current.traverse((o) => {
        const m = o as THREE.Mesh; m.geometry?.dispose();
        const mat = m.material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
        mat?.map?.dispose(); mat?.dispose();
      });
      measGrp.current = null;
    }
    if (!meas.length && !picks.length) { st.render(); return; }
    const g = new THREE.Group(); g.renderOrder = 999;
    const YEL = 0xfacc15;
    const V = (p: P3) => new THREE.Vector3(p.x, p.y, p.z);
    const lineMat = new THREE.LineBasicMaterial({ color: YEL, depthTest: false, transparent: true });
    const dashMat = new THREE.LineDashedMaterial({ color: YEL, depthTest: false, transparent: true, dashSize: 1.5, gapSize: 1.2, opacity: 0.8 });
    const line = (pts: P3[], dashed = false, loop = false) => {
      const lg = new THREE.BufferGeometry().setFromPoints(pts.map(V));
      const o = loop ? new THREE.LineLoop(lg, lineMat) : new THREE.Line(lg, dashed ? dashMat : lineMat);
      if (dashed) o.computeLineDistances();
      o.renderOrder = 999; g.add(o);
    };
    const dots: number[] = [];
    const dot = (p: P3) => dots.push(p.x, p.y, p.z);
    const lathe = mode === "lathe";
    for (const m of meas) {
      const t = m3Text(m, lathe);
      let at: P3;
      if (m.kind === "dist") {
        const r = distOf(m.a, m.b);
        dot(m.a.p); dot(m.b.p);
        if (r.par) { line([m.a.p, r.foot]); if (v3.len(v3.sub(r.foot, m.b.p)) > 1e-3) line([r.foot, m.b.p], true); at = v3.mul(v3.add(m.a.p, r.foot), 0.5); }
        else { line([m.a.p, m.b.p]); at = v3.mul(v3.add(m.a.p, m.b.p), 0.5); }
      } else if (m.kind === "ang") {
        const L = Math.max(4, v3.len(v3.sub(m.b.p, m.a.p)) * 0.35);
        dot(m.a.p); dot(m.b.p);
        line([m.a.p, v3.add(m.a.p, v3.mul(m.a.n, L))]); line([m.b.p, v3.add(m.b.p, v3.mul(m.b.n, L))]);
        line([m.a.p, m.b.p], true);
        at = v3.mul(v3.add(v3.add(m.a.p, v3.mul(m.a.n, L)), v3.add(m.b.p, v3.mul(m.b.n, L))), 0.5);
      } else {
        // okrąg w płaszczyźnie prostopadłej do osi + krzyż w środku
        const u = v3.unit(Math.abs(m.ax.y) < 0.9 ? v3.cross(m.ax, { x: 0, y: 1, z: 0 }) : v3.cross(m.ax, { x: 1, y: 0, z: 0 }));
        const w = v3.cross(m.ax, u);
        const ring: P3[] = [];
        for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; ring.push(v3.add(m.c, v3.add(v3.mul(u, m.r * Math.cos(a)), v3.mul(w, m.r * Math.sin(a))))); }
        line(ring, false, true);
        const k = Math.max(1, m.r * 0.25);
        line([v3.add(m.c, v3.mul(u, -k)), v3.add(m.c, v3.mul(u, k))]); line([v3.add(m.c, v3.mul(w, -k)), v3.add(m.c, v3.mul(w, k))]);
        line([v3.add(m.c, v3.mul(u, -m.r)), v3.add(m.c, v3.mul(u, m.r))], true);
        for (const p of m.pts) dot(p);
        at = v3.add(m.c, v3.mul(u, m.r));
      }
      g.add(screenLabel(t.main, V(at)));
    }
    for (const p of picks) dot(p.p);
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: YEL, size: 8, sizeAttenuation: false, depthTest: false, transparent: true }));
    pts.renderOrder = 1000; g.add(pts);
    st.part.add(g); measGrp.current = g;
    st.render();
  }, [meas, picks, mode, failed]);

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
    <div className={fill ? "grid h-full" : "grid gap-1"}>
      <div className={`view3d ${fill ? "is-fill" : ""}`}>
        <div ref={mountRef} className="sim-canvas sim-canvas-3d" style={fill ? { height: "100%" } : { height: 360 }} />
        {/* telefon: jedno menu „Widok” zamiast rzędu przycisków na całą szerokość */}
        <details className="view3d-menu">
          <summary aria-label="Widok 3D">Widok ▾</summary>
          <div className="view3d-pop">
            {([["iso", "Izometria"], ["top", "Z góry"], ["front", "Z przodu"], ["side", "Z boku"], ["fit", "Dopasuj"]] as const).map(([k, l]) => (
              <button key={k} onClick={(e) => { setView(k); (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); }}>{l}</button>
            ))}
            <button onClick={toggleGhost} aria-pressed={ghost}>{ghost ? "Materiał pełny" : "Materiał przezroczysty"}</button>
            {multi && <button onClick={() => setMachineView((v) => !v)} aria-pressed={machineView}>{machineView ? "Detal nieruchomy, narzędzie pochylone" : "Ruch stołu (jak na maszynie)"}</button>}
            {onTogglePath && <button onClick={onTogglePath} aria-pressed={!showPath}>{showPath ? "Ukryj tor narzędzia" : "Pokaż tor narzędzia"}</button>}
            <button onClick={(e) => { setMeasure((v) => !v); (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); }} aria-pressed={measure}>{measure ? "Zakończ pomiar" : "Pomiar (odległość, kąt, ⌀)"}</button>
          </div>
        </details>
        <div className="view3d-bar">
          {([["iso", "IZO"], ["top", "GÓRA"], ["front", "PRZÓD"], ["side", "BOK"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k)}>{l}</button>
          ))}
          <button onClick={() => setView("fit")} title="Dopasuj widok">DOPASUJ</button>
          <button onClick={toggleGhost} aria-pressed={ghost} title="Półfabrykat półprzezroczysty — widać gotowy detal w jego wnętrzu">
            {ghost ? "PEŁNY" : "PRZEZR."}
          </button>
          {multi && <button onClick={() => setMachineView((v) => !v)} aria-pressed={machineView} title="Widok maszyny stół–stół: obraca się detal, wrzeciono stoi pionowo">STÓŁ</button>}
          {onTogglePath && <button onClick={onTogglePath} aria-pressed={showPath} title="Tor narzędzia na podglądzie">TOR</button>}
          <button onClick={() => setMeasure((v) => !v)} aria-pressed={measure} title="Pomiar jak w CAD: odległość ścian (prostopadle), kąt między ścianami, średnica z 3 punktów; obracanie widoku działa dalej">MIARA</button>
        </div>
        {(measure || meas.length > 0) && (
          <div className="m3d" aria-live="polite">
            {measure && (
              <div className="m3d-tools" role="tablist" aria-label="Rodzaj pomiaru">
                {([["dist", "Odległość"], ["ang", "Kąt ścian"], ["circ", "⌀ z 3 pkt"]] as const).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tool3 === k} onClick={() => { setTool3(k); setPicks([]); }}>{l}</button>
                ))}
              </div>
            )}
            {meas.map((m, i) => {
              const t = m3Text(m, mode === "lathe");
              return <div key={i} className="m3d-row"><b>{i + 1}.</b> <span className="m3d-l">{t.main}</span> <span>{t.sub}</span></div>;
            })}
            {measure && <div className="m3d-row m3d-hint">{tool3 === "circ"
              ? `Wskaż 3 punkty na krawędzi albo ściance otworu (${picks.length}/3)`
              : tool3 === "ang" ? (picks.length ? "Druga ściana" : "Pierwsza ściana")
              : picks.length ? "Drugi punkt / ściana (równoległa — wymiar prostopadły)" : "Punkt na ścianie albo środek zmierzonego okręgu"}</div>}
            <div className="m3d-act">
              {(meas.length > 0 || picks.length > 0) && <button type="button" onClick={() => { setMeas([]); setPicks([]); }}>Wyczyść</button>}
              {measure && <button type="button" onClick={() => { setMeasure(false); setPicks([]); }}>Zakończ</button>}
            </div>
          </div>
        )}
      </div>
      {!fill && <p className="text-xs text-muted">Obracaj palcem lub myszą, przybliżaj szczypcami. Widok jest zsynchronizowany z symulacją 2D — sterowanie znajdziesz powyżej.</p>}
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

function makeLabel(text: string, pos: THREE.Vector3, color: string, size = 1) {
  // płótno dopasowane do długości tekstu — liczby podziałki mają po kilka znaków
  const w = Math.max(64, 28 * text.length + 16);
  const cv = document.createElement("canvas"); cv.width = w; cv.height = 64;
  const c = cv.getContext("2d")!;
  c.fillStyle = color; c.font = "bold 44px ui-monospace, monospace"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, w / 2, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
  sp.position.copy(pos); sp.scale.set(9 * size * (w / 64), 9 * size, 1);
  return sp;
}

/** Zabezpiecza wartość liczbową przed NaN i wartościami spoza sensownego zakresu —
    wadliwa geometria potrafi wywrócić sterownik GPU. */
function safe(v: number, fallback: number, min = 0.01, max = 1e4) {
  return Number.isFinite(v) && v >= min && v <= max ? v : fallback;
}

/** Bryły narzędzi odwzorowujące rzeczywistą geometrię. */
function buildToolGeometry(tool: Tool, toolD: number, defLen: number, mode: SimMode): THREE.BufferGeometry {
  if (mode === "lathe") return latheToolGeo(tool);
  const r = Math.max(0.15, safe(toolD, 10) / 2);
  const cut = Math.max(2, safe(tool.len, 30, 1, 400));
  const shankLen = 26;
  const k = tool.kind;

  // stożek wierzchołkiem w dół: czubek w punkcie narzędzia (y = 0), podstawa o promieniu rr na wysokości h
  const tipCone = (rr: number, h: number, seg = 24, rTip = 0) => { const g = new THREE.CylinderGeometry(rr, rTip, h, seg); g.translate(0, h / 2, 0); return g; };
  const shank = (rr: number, from: number, len = shankLen) => {
    const g = new THREE.CylinderGeometry(rr, rr, len, 20); g.translate(0, from + len / 2, 0); return g;
  };
  const helix = (g: THREE.BufferGeometry, rr: number, height: number, z: number, thick: number, y0 = 0) => {
    const n = Math.max(1, Math.min(8, Math.round(z)));
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let t = 0; t <= 1.0001; t += 0.08) {
        const th = a0 + t * 1.5;
        pts.push(new THREE.Vector3(Math.cos(th) * rr, y0 + t * height, Math.sin(th) * rr));
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
      return mergeGeo(tipCone(r, h), shank(r, h));
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
      // ostrze stożkowe (118° wiertło, 90° nawiertak) wierzchołkiem w dół, dwie krawędzie skrawające
      const tip = Math.max(0.2, r / Math.tan((angDeg * Math.PI / 180) / 2));
      let g: THREE.BufferGeometry = tipCone(r, tip, 28);
      for (const a of [0, Math.PI]) {
        const edge = new THREE.LineCurve3(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(r * 1.01 * Math.cos(a), tip + 0.02, r * 1.01 * Math.sin(a)));
        g = mergeGeo(g, new THREE.TubeGeometry(edge, 1, Math.max(0.05, r * 0.06), 4, false));
      }
      const bodyLen = k === "drill" ? Math.max(cut - tip, r) : Math.max(4, r);
      g = mergeGeo(g, shank(r, tip, bodyLen));
      if (k === "drill") g = helix(g, r, bodyLen, 2, r * 0.13, tip);
      return mergeGeo(g, shank(r * 0.95, tip + bodyLen));
    }
    case "reamer": {
      // stożek wejściowy rozwiertaka: ścięty, 45°
      const lead = tipCone(r, r * 0.25, 20, r * 0.75);
      let g: THREE.BufferGeometry = mergeGeo(lead, shank(r, r * 0.25, cut));
      g = helix(g, r, cut, Math.min(8, tool.flutes), r * 0.05, r * 0.25);
      return mergeGeo(g, shank(r * 0.9, cut + r * 0.8));
    }
    case "tap": case "threadmill": {
      const pitch = Math.max(0.3, safe(tool.flutes, 1.5, 0.2, 12));
      const coreR = k === "tap" ? r * 0.78 : r * 0.8;
      const leadH = k === "tap" ? r * 1.3 : 0;
      let g: THREE.BufferGeometry = shank(coreR, leadH, Math.max(1, cut - leadH));
      const turns = Math.max(2, Math.min(16, Math.floor(cut / pitch)));
      const path: THREE.Vector3[] = [];
      for (let i = 0; i <= turns * 14; i++) {
        const t = i / 14;
        path.push(new THREE.Vector3(Math.cos(t * Math.PI * 2) * r * 0.95, t * pitch, Math.sin(t * Math.PI * 2) * r * 0.95));
      }
      g = mergeGeo(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), Math.min(240, turns * 10), r * 0.15, 5, false));
      // gwintownik: nakrój stożkowy u dołu (ścięty czubek)
      if (k === "tap") g = mergeGeo(g, tipCone(coreR, leadH, 18, coreR * 0.55));
      return mergeGeo(g, shank(coreR, cut));
    }
    default: {
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

/** Nóż tokarski: płytka o kształcie ISO z oprawką, w płaszczyźnie ZX (three X = Z, three Y = X). */
function latheToolGeo(tool: Tool): THREE.BufferGeometry {
  const o = latheOutline(tool);
  const extrude = (pts: [number, number][], depth: number) => {
    const sh = new THREE.Shape();
    pts.forEach(([z, x], k) => (k ? sh.lineTo(z, x) : sh.moveTo(z, x)));
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  // Płytka na przedzie, oprawka (trzonek albo wytaczak) cofnięta za płytkę — nie zasłania jej kształtu.
  const ins = extrude(o.insert, 4.8);
  if (!o.holder) return ins;
  const hold = extrude(o.holder, 7);
  hold.translate(0, 0, -6);
  return mergeGeo(ins, hold);
}

/** Obrót stołu (macierz w osiach maszyny) jako kwaternion sceny: świat = T·R·Tᵀ, T: (x, y, z) → (x, z, −y). */
function machineQuat(R: number[]): THREE.Quaternion {
  // kolumny R w osiach maszyny → kolumny w świecie
  const col = (j: number) => new THREE.Vector3(R[j], R[6 + j], -R[3 + j]);
  const ex = col(0), ey = col(1), ez = col(2);           // obraz osi X, Y, Z maszyny
  // oś świata X = maszyna X, oś świata Y = maszyna Z, oś świata Z = −maszyna Y
  const m = new THREE.Matrix4().makeBasis(ex, ez, ey.clone().negate());
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/** Stół 4/5 osi: `fixed` — podpory (nieruchome), `cradle` — kołyska A/B, `table` — stół C (w kołysce). */
type Trunnion = { fixed: THREE.Group; cradle: THREE.Group | null; table: THREE.Group | null; floorY: number };

/**
 * Model stołu uchylnego dla widoku maszyny. Oś pochylania (A wzdłuż X, B wzdłuż Y) i oś stołu C
 * przechodzą przez zero maszyny — tak jak w kinematyce symulatora. Przy samej osi A: konik z tarczą,
 * tarcza obraca się z detalem (dodana do `part`).
 */
function makeTrunnion(kin: Kin, box: { x0: number; x1: number; y0: number; y1: number; top: number; bottom: number }, part: THREE.Group): Trunnion {
  const steel = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.5, roughness: 0.45 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2f3742, metalness: 0.4, roughness: 0.6 });
  const fixed = new THREE.Group(); fixed.name = "fx-fixed";
  // u — wzdłuż osi pochylania, v — w poprzek, w — w górę (oś Z maszyny)
  const BC = kin === "BC";
  const M = (u: number, v: number, w: number) => (BC ? new THREE.Vector3(v, w, -u) : new THREE.Vector3(u, w, -v));
  const block = (mat: THREE.Material, u0: number, u1: number, v0: number, v1: number, w0: number, w1: number) => {
    const du = Math.abs(u1 - u0), dv = Math.abs(v1 - v0), dw = Math.abs(w1 - w0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(BC ? dv : du, dw, BC ? du : dv), mat);
    m.position.copy(M((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2));
    return m;
  };
  const axisCyl = (mat: THREE.Material, r: number, u0: number, u1: number) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(u1 - u0), 32), mat);
    if (BC) c.rotation.x = Math.PI / 2; else c.rotation.z = Math.PI / 2;
    c.position.copy(M((u0 + u1) / 2, 0, 0));
    return c;
  };
  if (kin === "A") {
    // 4. oś: wrzeciennik (nieruchomy) i tarcza na lewym czole detalu, oś obrotu wzdłuż X przez zero
    const Rp = 0.6 * Math.hypot(box.y1 - box.y0, box.top - box.bottom) + 6;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(Rp, Rp, 10, 64), steel);
    plate.rotation.z = Math.PI / 2; plate.position.set(box.x0 - 5.05, 0, 0);
    part.add(plate);
    const floor = -Rp - 22;
    fixed.add(block(dark, box.x0 - 58, box.x0 - 10.1, -Rp * 0.8, Rp * 0.8, floor, Rp * 0.7));
    fixed.add(block(dark, box.x0 - 70, box.x1 + 30, -Rp * 1.1, Rp * 1.1, floor - 8, floor));
    fixed.add(makeLabel("A", M(box.x0 - 34, 0, Rp * 0.7 + 8), "#FCA5A5", 1.1));
    return { fixed, cradle: null, table: null, floorY: floor - 8 };
  }
  // stół C: środek na osi obrotu (zero), promień obejmuje cały detal
  const corners = [[box.x0, box.y0], [box.x1, box.y0], [box.x0, box.y1], [box.x1, box.y1]];
  const R = Math.max(...corners.map(([x, y]) => Math.hypot(x, y))) + 6;
  const tTop = box.bottom - 0.05, tBot = tTop - 10;
  const table = new THREE.Group(); table.name = "fx-table";
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 10, 64), steel);
  disc.position.set(0, (tTop + tBot) / 2, 0); table.add(disc);
  // rowki teowe na stole — widać obrót C
  for (const k of [-1, 0, 1]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(2 * R * 0.92 * Math.sqrt(1 - (k * 0.45) ** 2), 0.6, 3), dark); sl.position.set(0, tTop + 0.1, k * R * 0.45); table.add(sl); }
  table.add(makeLabel("C", new THREE.Vector3(R + 6, tTop + 2, 0), "#7DD3FC", 1.1));
  // kołyska: płyta pod stołem i dwie ścianki do osi pochylania (w = 0)
  const cradle = new THREE.Group(); cradle.name = "fx-cradle";
  const W = R + 6, pb = tBot - 14;
  cradle.add(block(steel, -W - 12, W + 12, -R * 0.75, R * 0.75, pb, tBot - 2));
  for (const sgn of [-1, 1]) cradle.add(block(steel, sgn * W, sgn * (W + 12), -R * 0.5, R * 0.5, pb, 12));
  cradle.add(table);
  // podpory z łożyskami osi pochylania i podstawa (nie ruszają się)
  const swing = Math.hypot(Math.abs(pb), R * 0.75) + 6, floor = -swing;
  for (const sgn of [-1, 1]) {
    fixed.add(block(dark, sgn * (W + 22), sgn * (W + 46), -R * 0.55, R * 0.55, floor, 22));
    fixed.add(axisCyl(steel, 9, sgn * (W + 12), sgn * (W + 22)));
  }
  fixed.add(block(dark, -(W + 46), W + 46, -R * 0.9, R * 0.9, floor - 10, floor));
  fixed.add(makeLabel(BC ? "B" : "A", M(W + 34, 0, 34), BC ? "#86EFAC" : "#FCA5A5", 1.1));
  return { fixed, cradle, table, floorY: floor - 10 };
}

/** Kołyska obrócona o A (albo B), stół w niej o C; null — położenie podstawowe (widok detalu). */
function poseTrunnion(fx: Trunnion, kin: Kin, ang: Rot3 | null) {
  if (!ang) { fx.cradle?.quaternion.identity(); fx.table?.quaternion.identity(); return; }
  fx.cradle?.quaternion.copy(machineQuat(kin === "BC" ? tableMat("BC", { b: ang.b, c: 0 }) : tableMat("A", { a: ang.a })));
  fx.table?.quaternion.copy(machineQuat(tableMat("AC", { a: 0, c: ang.c })));
}

function disposeTrunnion(scene: THREE.Scene, fx: Trunnion) {
  scene.remove(fx.fixed); disposeTree(fx.fixed);
  if (fx.cradle) { scene.remove(fx.cradle); disposeTree(fx.cradle); }
}

/** Budżet punktów siatki objętościowej — telefon oszczędnie, komputer gęściej. */
function voxBudget() {
  if (typeof window === "undefined") return 300_000;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (window.innerWidth < 900) return mem <= 4 ? 220_000 : 380_000;
  return mem < 8 ? 500_000 : 750_000;
}

/** G-kod: X w prawo, Y od siebie, Z w górę → three: X, Y(up)=Z, Z=-Y. Tokarka: Z wzdłuż osi obrotu → three X, X promień → three Y. */
function toW(p: Vec3, mode: SimMode) {
  return mode === "mill" ? new THREE.Vector3(p.x, p.z, -p.y) : new THREE.Vector3(p.z, p.x, 0);
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
type ThreadHole = { x: number; y: number; top: number; bottom: number; pitch: number; r: number };
function threadHoles(program: ReturnType<typeof parseProgram>, lengths: number[], progress: number, setup: Setup, mode: SimMode): ThreadHole[] {
  const holes: ThreadHole[] = [];
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
  return holes;
}

function threadGroup(holes: ThreadHole[]) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.45, roughness: 0.5, side: THREE.DoubleSide });
  // Ścianka gwintu: zarys piłowy 60° na obwodzie otworu, wtopiony w ściankę (od średnicy
  // rdzenia do średnicy nominalnej), z fazą linii śrubowej — wygląda jak prawdziwy gwint.
  for (const h of holes) {
    const depth = Math.max(0.5, h.top - h.bottom);
    const hDepth = Math.min(h.r * 0.35, 0.5413 * h.pitch);
    const rMin = Math.max(0.2, h.r - hDepth);
    const segA = 72, perPitch = 10;
    const segZ = Math.max(4, Math.min(1400, Math.round((depth / h.pitch) * perPitch)));
    const pos: number[] = [], idx: number[] = [];
    for (let j = 0; j <= segZ; j++) {
      const z = h.top - (j / segZ) * depth;
      for (let i = 0; i <= segA; i++) {
        const a = (i / segA) * Math.PI * 2;
        const ph = (((h.top - z) / h.pitch + i / segA) % 1 + 1) % 1;
        const tri = 1 - Math.abs(2 * ph - 1);
        const r = rMin + hDepth * tri;
        pos.push(h.x + r * Math.cos(a), z, -(h.y + r * Math.sin(a)));
      }
    }
    for (let j = 0; j < segZ; j++) for (let i = 0; i < segA; i++) {
      const a = j * (segA + 1) + i, b = a + 1, c = a + segA + 1, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    group.add(new THREE.Mesh(g, mat));
  }
  return group;
}

/**
 * Siatka półfabrykatu z mapy wysokości. Budowana raz dla danego układu siatki;
 * kolejne klatki tylko przepisują wysokości (updateHeightmapMesh) — bez nowych tablic,
 * bez sprzątania pamięci w trakcie animacji.
 */
function meshFromHeightmap(h: Float32Array, m: MillMeta) {
  const G = (m.nx + 1) * (m.ny + 1);
  const wallPts = 2 * (m.nx + 1) + 2 * (m.ny + 1);
  const wallVerts = (wallPts - 4) * 4;
  const N = G + wallVerts + 4;
  const pos = new Float32Array(N * 3);
  const map = new Int32Array(N).fill(-1); // indeks w mapie wysokości (−1: wierzchołek dna)
  const idx: number[] = [];
  let n = 0;
  const V = (x: number, y: number, z: number, hi: number) => { pos[n * 3] = x; pos[n * 3 + 1] = z; pos[n * 3 + 2] = -y; map[n] = hi; return n++; };
  const gx = (i: number) => m.minX + i * m.cx;
  const gy = (j: number) => m.minY + j * m.cy;
  const gi = (i: number, j: number) => j * (m.nx + 1) + i;

  // powierzchnia górna z mapy wysokości
  for (let j = 0; j <= m.ny; j++) for (let i = 0; i <= m.nx; i++) V(gx(i), gy(j), h[gi(i, j)], gi(i, j));
  for (let j = 0; j < m.ny; j++) for (let i = 0; i < m.nx; i++) {
    const a = j * (m.nx + 1) + i, b = a + 1, c = a + m.nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }

  // Ściany boczne z rzeczywistych wysokości brzegowych — materiał zebrany przy krawędzi znika też ze ściany.
  const wallStrip = (pts: { x: number; y: number; k: number }[]) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const p = pts[k], q = pts[k + 1];
      const a = V(p.x, p.y, h[p.k], p.k), b = V(q.x, q.y, h[q.k], q.k);
      const c = V(p.x, p.y, m.bottom, -1), d = V(q.x, q.y, m.bottom, -1);
      idx.push(a, b, c, b, d, c);
    }
  };
  const south: { x: number; y: number; k: number }[] = [], north: typeof south = [], west: typeof south = [], east: typeof south = [];
  for (let i = 0; i <= m.nx; i++) { south.push({ x: gx(i), y: gy(0), k: gi(i, 0) }); north.push({ x: gx(i), y: gy(m.ny), k: gi(i, m.ny) }); }
  for (let j = 0; j <= m.ny; j++) { west.push({ x: gx(0), y: gy(j), k: gi(0, j) }); east.push({ x: gx(m.nx), y: gy(j), k: gi(m.nx, j) }); }
  wallStrip(south); wallStrip([...north].reverse()); wallStrip([...west].reverse()); wallStrip(east);

  // dno
  const b0 = V(m.minX, m.minY, m.bottom, -1), b1 = V(m.maxX, m.minY, m.bottom, -1);
  const b2 = V(m.maxX, m.maxY, m.bottom, -1), b3 = V(m.minX, m.maxY, m.bottom, -1);
  idx.push(b0, b1, b2, b0, b2, b3);

  const g = new THREE.BufferGeometry();
  const attr = new THREE.BufferAttribute(pos.subarray(0, n * 3), 3);
  attr.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("position", attr);
  g.setIndex(idx); g.computeVertexNormals();
  g.computeBoundingBox();
  g.userData.map = map.subarray(0, n);
  return g;
}

/** Przepisanie wysokości w istniejącej siatce (bez alokacji). */
function updateHeightmapMesh(g: THREE.BufferGeometry, h: Float32Array) {
  const attr = g.getAttribute("position") as THREE.BufferAttribute;
  const pos = attr.array as Float32Array;
  const map = g.userData.map as Int32Array;
  for (let v = 0; v < map.length; v++) { const k = map[v]; if (k >= 0) pos[v * 3 + 1] = h[k]; }
  attr.needsUpdate = true;
  g.computeVertexNormals();
}

/** Bryła pręta z profilu (zewnętrznego i otworu) — obrót wokół osi Z tokarki. */
function latheGeometryFrom(pr: LatheProfile | null) {
  if (!pr) return null;
  // Bryła tylko tam, gdzie zostaje materiał (promień zewnętrzny > otwór). Kolumny zdjęte do zera
  // (splanowane czoło, odcięcie) nie mogą zamknąć się tarczą — inaczej zasłaniały otwór w czole.
  const n = pr.rout.length - 1, every = Math.max(1, Math.floor(n / 500));
  const has = (k: number) => pr.rout[k] - pr.rin[k] > 0.02;
  const zk = (k: number) => pr.z0 + k * pr.dz;
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= n; k++) {
    if (!has(k)) continue;
    let e = k; while (e + 1 <= n && has(e + 1)) e++;
    if (e > k) {
      const ks: number[] = []; for (let q = k; q <= e; q += every) ks.push(q); if (ks[ks.length - 1] !== e) ks.push(e);
      const pts: THREE.Vector2[] = [new THREE.Vector2(pr.rin[k], zk(k))];
      for (const q of ks) pts.push(new THREE.Vector2(Math.max(0.05, pr.rout[q]), zk(q)));
      pts.push(new THREE.Vector2(pr.rin[e], zk(e)));
      for (let q = ks.length - 1; q >= 0; q--) pts.push(new THREE.Vector2(pr.rin[ks[q]], zk(ks[q])));
      const g = new THREE.LatheGeometry(pts, 72); // obrót wokół Y; Y = Z tokarki
      g.rotateZ(-Math.PI / 2); // Y → X (three X = Z tokarki)
      parts.push(g);
    }
    k = e;
  }
  if (!parts.length) return null;
  return parts.reduce((a, b) => mergeGeo(a, b));
}

/** Napis o stałym rozmiarze na ekranie (nie maleje przy oddalaniu), zawsze na wierzchu. */
function screenLabel(text: string, pos: THREE.Vector3) {
  const w = Math.max(96, 26 * text.length + 28);
  const cv = document.createElement("canvas"); cv.width = w; cv.height = 64;
  const c = cv.getContext("2d")!;
  c.fillStyle = "rgba(5,7,10,0.88)"; c.fillRect(0, 0, w, 64);
  c.strokeStyle = "rgba(250,204,21,0.8)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, 61);
  c.fillStyle = "#FACC15"; c.font = "600 40px ui-monospace, monospace"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, w / 2, 33);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false, sizeAttenuation: false }));
  const h = 0.042;
  sp.position.copy(pos); sp.scale.set(h * (w / 64), h, 1); sp.center.set(0.5, -0.25);
  sp.renderOrder = 1001;
  return sp;
}
