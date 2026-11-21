"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useLive } from "@/components/obszary/live";
import { useMedia } from "@/lib/ui/prefs";
import type { HDetal, HSeg } from "./heroData";

/*
  Strona startowa (V3.1): okno programu pod nagłówkiem. Trzy detale na zmianę (płytka, wałek, korpus): program
  wykonuje się płynnie, narzędzie zbiera materiał (ślad o szerokości freza, przy toczeniu — zebrany obszar przekroju),
  bieżąca linia kodu podświetla się, X/Y/Z na żywo. Po programie — przejście do następnego detalu.
  Kod w zapisie Fanuc (ISO); najechanie na linię podświetla jej ruch. Zapis Sinumerik — w nauce, nie na stronie głównej.
  Ruch tylko w widoku; „ogranicz ruch” — gotowy detal bez odtwarzania, ▶ uruchamia ręcznie.
*/
const DUR = 11; // s na program
const HOLD = 1.8; // s pauzy po programie
const COL = { rapid: "var(--pv-g0)", linear: "var(--pv-g1)", arc: "var(--pv-g2)" } as const;

function timeline(segs: HSeg[]) {
  const total = segs.reduce((a, s) => a + s.w, 0);
  let acc = 0;
  return { total, start: segs.map((s) => { const a = acc; acc += s.w; return a; }) };
}

/** Punkty odcinka do ułamka f (0–1) jego długości. */
function partial(pts: HSeg["pts"], f: number): HSeg["pts"] {
  if (f >= 1) return pts;
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const want = L.at(-1)! * f;
  const out: HSeg["pts"] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= want) { out.push(pts[i]); continue; }
    const t = (want - L[i - 1]) / (L[i] - L[i - 1] || 1);
    const a = pts[i - 1], b = pts[i];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    break;
  }
  return out;
}

export default function HeroWindow({ detale }: { detale: HDetal[] }) {
  const [ref, inView] = useLive<HTMLDivElement>();
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const [di, setDi] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [started, setStarted] = useState(false); // przy „ogranicz ruch” odtwarzanie tylko po ▶
  const [t, setT] = useState<number | null>(null); // s od startu programu; null = gotowy detal
  const [fade, setFade] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const codeRef = useRef<HTMLOListElement>(null);

  const d = detale[di];
  const tl = useMemo(() => timeline(d.segs), [d]);
  const run = inView && playing && (!reduce || started);

  // pętla odtwarzania (requestAnimationFrame); zmiana detalu z krótkim przejściem
  useEffect(() => {
    if (!run) return;
    let raf = 0, last = performance.now(), cur = t ?? 0, switching = false;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (!document.hidden && !switching) {
        cur += dt;
        if (cur >= DUR + HOLD) {
          switching = true;
          setFade(true);
          window.setTimeout(() => { setDi((x) => (x + 1) % detale.length); setT(0); setFade(false); }, 380);
        } else setT(cur);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, di]); // eslint-disable-line react-hooks/exhaustive-deps

  // pozycja w programie
  const at = t === null ? tl.total : (Math.min(t, DUR) / DUR) * tl.total;
  let si = d.segs.length - 1;
  for (let i = 0; i < d.segs.length; i++) if (tl.start[i] + d.segs[i].w > at) { si = i; break; }
  const sf = t === null ? 1 : Math.max(0, Math.min(1, (at - tl.start[si]) / d.segs[si].w));
  const curSeg = d.segs[si];
  const curPts = partial(curSeg.pts, sf);
  const pos = curPts.at(-1)!;
  const line = t === null ? d.code.length - 1 : curSeg.line;
  const op = t === null ? d.ops.length - 1 : curSeg.op;

  // kod: bieżąca linia w polu widzenia listy (bez przewijania strony)
  useEffect(() => {
    const ol = codeRef.current, li = ol?.children[line] as HTMLElement | undefined;
    if (!ol || !li) return;
    const top = li.offsetTop - ol.clientHeight / 2 + li.clientHeight / 2;
    ol.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }, [line, di, reduce]);

  // geometria widoku
  const lathe = d.mode === "lathe";
  const { x0, y0, x1, y1 } = d.stock;
  const pad = lathe ? 8 : 9;
  const vx0 = x0 - pad, vx1 = x1 + pad + (lathe ? 6 : 0), vy0 = (lathe ? -y1 : y0) - pad, vy1 = y1 + pad;
  const W = vx1 - vx0, H = vy1 - vy0;
  const P = (p: number[]) => `${(p[0] - vx0).toFixed(2)} ${(vy1 - p[1]).toFixed(2)}`;
  const path = (pts: HSeg["pts"]) => pts.map((p, i) => `${i ? "L" : "M"}${P(p)}`).join("");
  const done = (i: number) => (t === null ? true : i < si);
  const shown = (i: number) => (done(i) ? d.segs[i].pts : i === si ? curPts : null);
  const R0 = y1;
  const latheCut = (pts: HSeg["pts"]) => `${path(pts)}L${P([pts.at(-1)![0], R0])}L${P([pts[0][0], R0])}Z`;
  const mirror = `translate(0 ${2 * (vy1 - 0)}) scale(1 -1)`;

  const fmt = (v: number) => v.toFixed(3);
  const dro = lathe ? [["X", fmt(pos[1] * 2)], ["Z", fmt(pos[0])]] : [["X", fmt(pos[0])], ["Y", fmt(pos[1])], ["Z", fmt(pos[2])]];
  const code = d.code;

  const pick = (k: number) => { if (k === di) return; setFade(true); window.setTimeout(() => { setDi(k); setT(run ? 0 : null); setFade(false); }, 260); };
  const toggle = () => {
    if (run) { setPlaying(false); return; }
    if (t === null || t >= DUR) setT(0);
    setStarted(true); setPlaying(true);
  };

  return (
    <div ref={ref} className="hw">
      <div className="hw-glow" aria-hidden />
      <section className="hw-win" aria-label="Podgląd programu CNC">
        <header className="hw-bar">
          <span className="hw-dots" aria-hidden><i /><i /><i /></span>
          <div className="hw-tabs" role="group" aria-label="Detal">
            {detale.map((x, k) => (
              <button key={x.key} type="button" aria-pressed={k === di} onClick={() => pick(k)}>{x.name.split(" ")[0]}</button>
            ))}
          </div>
          <button type="button" className="hw-play" onClick={toggle} aria-label={run ? "Wstrzymaj" : "Odtwórz"}>
            {run ? <Pause aria-hidden /> : <Play aria-hidden />}
          </button>
        </header>

        <div className={`hw-body${fade ? " is-fade" : ""}`}>
          <ol ref={codeRef} className="hw-code" aria-label={`Program — ${d.name}, Fanuc`}>
            {code.map((c, i) => {
              const fi = i;
              return (
                <li key={i} className={`${i === line ? "is-on" : ""}${i > line ? " is-next" : ""}`}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse" && fi >= 0) setHover(fi); }} onPointerLeave={() => setHover(null)}>
                  <em>{i + 1}</em><span className={c.k ? `k-${c.k}` : /^\s*[(;]/.test(c.t) ? "k-cm" : undefined}>{c.t}</span>
                </li>
              );
            })}
          </ol>

          <div className="hw-view">
            <svg viewBox={`0 0 ${W.toFixed(2)} ${H.toFixed(2)}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
              {lathe && <path d={`M${P([vx0 + 2, 0])}H${(vx1 - vx0 - 2).toFixed(2)}`} className="hw-axis" />}
              {/* półfabrykat */}
              {lathe ? (
                <>
                  <rect x={x0 - vx0} y={vy1 - R0} width={x1 - x0} height={2 * R0} className="hw-stock" />
                  <rect x={x0 - vx0 - 7} y={vy1 - R0 - 4} width={7} height={2 * R0 + 8} className="hw-chuck" />
                </>
              ) : <rect x={x0 - vx0} y={vy1 - y1} width={x1 - x0} height={y1 - y0} rx={0.6} className="hw-stock" />}

              {/* zebrany materiał */}
              <g className="hw-cut">
                {d.segs.map((s, i) => {
                  const pts = shown(i);
                  if (!pts || pts.length < 2) return null;
                  if (lathe) return s.kind === "rapid" ? null : (
                    <g key={i}><path d={latheCut(pts)} /><path d={latheCut(pts)} transform={mirror} /></g>
                  );
                  if (s.hole && (done(i) || (i === si && sf > 0.5))) return <circle key={i} cx={s.hole[0] - vx0} cy={vy1 - s.hole[1]} r={s.hole[2]} />;
                  return s.cut ? <path key={i} d={path(pts)} strokeWidth={s.dia} className="hw-sweep" /> : null;
                })}
              </g>

              {/* tor środka narzędzia */}
              {d.segs.map((s, i) => {
                const pts = shown(i);
                if (!pts || pts.length < 2 || s.hole) return null;
                const hot = hover !== null && s.line === hover;
                return <path key={i} d={path(pts)} stroke={COL[s.kind]} className={`hw-path${s.kind === "rapid" ? " is-rapid" : ""}${hot ? " is-hot" : ""}`} />;
              })}

              {/* narzędzie */}
              {lathe ? (
                <g transform={`translate(${pos[0] - vx0} ${vy1 - pos[1]})`} className="hw-tool">
                  <path d="M0 0 L7 -3.2 L5 -9 Z" />
                  <circle r={0.9} className="hw-tip" />
                </g>
              ) : (
                <g transform={`translate(${pos[0] - vx0} ${vy1 - pos[1]})`} className={`hw-tool${pos[2] > 0 ? " is-up" : ""}`}>
                  <circle r={curSeg.dia / 2} />
                  <circle r={0.9} className="hw-tip" />
                </g>
              )}
            </svg>
            <div className="hw-dro" aria-hidden>{dro.map(([a, v]) => <span key={a}><b>{a}</b>{v}</span>)}</div>
            <p className="hw-name"><b>{d.name}</b><span>{d.sub}</span></p>
          </div>
        </div>

        <footer className="hw-foot">
          <ol className="hw-ops" aria-label="Operacje">
            {d.ops.map((o, k) => (
              <li key={k} className={k === op ? "is-on" : k < op ? "is-done" : undefined}><b>{String(k + 1).padStart(2, "0")}</b>{o.name}<span>{o.tool}</span></li>
            ))}
          </ol>
          <Link href={d.simHref} className="hw-open">Otwórz w symulatorze<ArrowUpRight aria-hidden /></Link>
        </footer>
      </section>
    </div>
  );
}
