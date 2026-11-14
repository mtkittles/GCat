"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { pointAt, segAt, type Story } from "@/lib/storyPath";

/*
  Strona główna, komputer: program pokazowy rozłożony na operacje. Sekcja jest przypięta pod nagłówkiem,
  a przewijanie strony prowadzi narzędzie po torze — postęp 0–1 trafia do zmiennej CSS --p, z której
  każdy odcinek sam wylicza, ile jest narysowany (globals.css, .st-*). JS ustawia tylko --p, położenie
  narzędzia i bieżący rozdział. Bez JS i przy „ogranicz ruch” sekcja jest zwykłym, w pełni narysowanym blokiem.
*/
export type StoryOp = { title: string; text: string };

const TOP = 74; // nagłówek strony + odstęp; ta sama wartość co `top` w .st-stage
const cls = { rapid: "is-rap", linear: "is-cut", arc: "is-arc" } as const;
const sv = (o: Record<string, number>) => o as unknown as CSSProperties;

function tokens(raw: string) {
  const out: { t: string; c: string }[] = [];
  const re = /(\([^)]*\))|([A-Z])(-?\d*\.?\d*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m[1]) out.push({ t: m[1], c: "k-cm" });
    else if (m[2]) {
      const n = Number(m[3]);
      const c = m[2] === "G" ? (n === 0 ? "k-rap" : n === 1 ? "k-cut" : n === 2 || n === 3 ? "k-arc" : "k-g") : m[2] === "M" ? "k-m" : m[2] === "T" || m[2] === "H" ? "k-t" : m[2] === "F" || m[2] === "S" ? "k-fs" : "k-ax";
      out.push({ t: m[2] + m[3], c });
    } else out.push({ t: m[4] ?? m[5], c: "" });
  }
  return out;
}

export default function StoryStage({ story, ops, simHref }: { story: Story; ops: StoryOp[]; simHref: string }) {
  const N = ops.length;
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tool = useRef<SVGGElement>(null);
  const [ch, setCh] = useState(0);
  const [line, setLine] = useState(-1);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const w = wrap.current, s = stage.current;
    if (!w || !s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 900px)");
    let raf = 0, cur = -1, target = 0, on = false;

    const apply = (p: number) => {
      s.style.setProperty("--p", p.toFixed(4));
      const [x, y] = pointAt(story.segs, p);
      tool.current?.setAttribute("transform", `translate(${x.toFixed(2)} ${(-y).toFixed(2)})`);
      const sg = story.segs[segAt(story.segs, p)];
      setCh(Math.min(N - 1, Math.floor(p * N)));
      setLine(p <= 0 ? -1 : sg.line);
    };
    const read = () => {
      const span = w.offsetHeight - s.offsetHeight;
      target = span > 0 ? Math.min(1, Math.max(0, (TOP - w.getBoundingClientRect().top) / span)) : 0;
    };
    // wygładzenie: wyświetlany postęp dogania pozycję przewijania, więc skok kółka myszy nie szarpie rysunkiem
    const tick = () => {
      raf = 0;
      cur = cur < 0 ? target : cur + (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      apply(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => { read(); if (!raf) raf = requestAnimationFrame(tick); };
    const start = () => {
      const run = wide.matches && !reduce.matches;
      setStill(!run);
      if (run && !on) { on = true; window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); onScroll(); }
      if (!run && on) { on = false; window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
      if (!run) { if (raf) cancelAnimationFrame(raf); raf = 0; cur = -1; s.style.removeProperty("--p"); }
    };
    start();
    reduce.addEventListener("change", start); wide.addEventListener("change", start);
    return () => {
      reduce.removeEventListener("change", start); wide.removeEventListener("change", start);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [story, N]);

  const go = (k: number) => {
    const w = wrap.current, s = stage.current;
    if (!w || !s) return;
    const span = w.offsetHeight - s.offsetHeight;
    window.scrollTo({ top: window.scrollY + w.getBoundingClientRect().top - TOP + span * ((k + 0.72) / N), behavior: "smooth" });
  };

  const { box } = story;
  const pad = 13;
  const vb = `${box.minX - pad} ${-box.maxY - pad} ${box.maxX - box.minX + 2 * pad} ${box.maxY - box.minY + 2 * pad}`;
  const end = story.segs[story.segs.length - 1].to;

  return (
    <div ref={wrap} className={`st${still ? " is-still" : ""}`} id="program" style={sv({ "--n": N })}>
      <div ref={stage} className="st-stage" data-ch={ch}>
        <header className="st-head">
          <h2 className="st-title">Jeden program, cztery operacje</h2>
          <ol className="st-rail">
            {ops.map((o, k) => (
              <li key={o.title} style={sv({ "--k": k })}>
                <button type="button" onClick={() => go(k)} aria-current={!still && k === ch ? "step" : undefined}>
                  <span className="st-rail-n">{k + 1}</span>{o.title}<i aria-hidden />
                </button>
              </li>
            ))}
          </ol>
        </header>

        <div className="st-code">
          {story.chapters.map((c, k) => (
            <ol key={k} className={`st-lines${k === ch ? " is-on" : ""}`} aria-label={`Bloki operacji: ${ops[k].title}`}>
              {c.lines.map((l) => (
                <li key={l.n} className={l.n === line ? "is-active" : undefined}>
                  <span className="st-ln">{String(l.n + 1).padStart(2, "0")}</span>
                  <code>{tokens(l.raw).map((t, i) => (t.c ? <span key={i} className={t.c}>{t.t}</span> : t.t))}</code>
                </li>
              ))}
            </ol>
          ))}
        </div>

        <div className="st-view">
          <svg viewBox={vb} role="img" aria-label="Tor narzędzia w płaszczyźnie XY: kontur płytki, kieszeń okrągła, dwa rowki i cztery otwory">
            <defs>
              <pattern id="st-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" className="st-gridline" /></pattern>
            </defs>
            <rect x={box.minX - pad} y={-box.maxY - pad} width={box.maxX - box.minX + 2 * pad} height={box.maxY - box.minY + 2 * pad} fill="url(#st-grid)" />
            <rect x="-5" y="-55" width="90" height="60" rx="1.5" className="st-stock" />
            {/* ślad freza ⌀10: materiał zebrany przez ruchy robocze operacji 1–3 */}
            {story.segs.map((s, i) => s.d && s.kind !== "rapid" && s.ch < 3 && <path key={`w${i}`} d={s.d} pathLength={1} className="st-seg st-swath" style={sv({ "--a": s.a, "--w": s.w })} />)}
            {story.segs.map((s, i) => s.hole && <circle key={`h${i}`} cx={s.from[0]} cy={-s.from[1]} r="3" className="st-hole" style={sv({ "--a": s.a, "--w": s.w })} />)}
            {story.segs.map((s, i) => s.d && <path key={i} d={s.d} pathLength={1} className={`st-seg st-path ${cls[s.kind]}`} style={sv({ "--a": s.a, "--w": s.w, "--e": (s.ch + 1) / N })} />)}
            <g className="st-zero"><circle r="1.6" /><path d="M-3.4 0H3.4M0 -3.4V3.4" /><text x="2.6" y="9.6">X0 Y0</text></g>
            <g ref={tool} className="st-tool" transform={`translate(${end[0]} ${-end[1]})`}>
              <circle className="st-tool-ring" r="5" /><circle r=".9" />
            </g>
          </svg>
          <ul className="st-legend">
            <li className="is-rap">G00 ruch szybki</li><li className="is-cut">G01 ruch roboczy</li><li className="is-arc">G02, G03 łuk</li>
          </ul>
        </div>

        <footer className="st-foot">
          <div className="st-caps">
            {ops.map((o, k) => <p key={o.title} className={k === ch ? "is-on" : undefined}><b>{o.title}.</b> {o.text}</p>)}
          </div>
          <Link href={simHref} className="btn ghost">Otwórz ten program w symulatorze</Link>
        </footer>
      </div>
    </div>
  );
}
