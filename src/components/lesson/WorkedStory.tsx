"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { parseProgram } from "@/lib/parser";
import type { WorkedStory as Story } from "@/lib/lesson";
import { focusLines, motionClass, plane, stepLines, storyGeometry, type StoryMode } from "@/lib/workedStory";

/*
  Przykład sterowany przewijaniem (Etap 12, B3). Kroki przewijają się, program i podgląd stoją:
  komputer — dwie kolumny, panel przyklejony z prawej; telefon i wąskie okno — panel przyklejony u góry.
  Krok na środku ekranu wybiera linię programu: podświetlona linia, tor w XY do tej linii, narzędzie na jej końcu.
  Bez przewijania też działa: klik w krok albo strzałki w panelu.
*/

const fmt = (n: number) => (Math.abs(n) < 5e-4 ? "0" : n.toFixed(3).replace(/\.?0+$/, "")).replace("-", "−");

function CodeLine({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /(\([^)]*\))|(\S+)/g;
  let m: RegExpExecArray | null, last = 0, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<span key={k++} className="ws-cm">{m[1]}</span>);
    else { const c = motionClass(m[2]); out.push(c ? <b key={k++} className={`ws-${c}`}>{m[2]}</b> : m[2]); }
    last = m.index + m[0].length;
  }
  return <>{out}</>;
}

export default function WorkedStory({ story, steps, mode = "mill" }: {
  story: Story;
  /** frezowanie — widok XY z góry; toczenie — widok ZX (Z w prawo, X w górę) */
  mode?: StoryMode;
  steps: { node: ReactNode; code?: string; line?: number; lineTo?: number }[];
}) {
  const lathe = mode === "lathe";
  const geo = useMemo(() => storyGeometry(story, mode, focusLines(steps, story.from)), [story, mode, steps]);
  const prog = useMemo(() => parseProgram(story.program, { diameterX: lathe }), [story.program, lathe]);
  const rows = useMemo(() => story.program.split("\n"), [story.program]);
  const [active, setActive] = useState(-1);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const codeRef = useRef<HTMLOListElement>(null);

  // Pasek aktywacji: komputer — środek ekranu; telefon — tuż pod przyklejonym panelem (panel zasłania górę ekranu).
  // Wysokość panelu trafia też do CSS (--ws-ph): przewinięcie do kroku zatrzymuje go pod panelem.
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [band, setBand] = useState("-45% 0px -50% 0px");
  useEffect(() => {
    const root = rootRef.current, panel = panelRef.current;
    if (!root || !panel || typeof ResizeObserver === "undefined") return;
    const wide = matchMedia("(min-width: 1280px)");
    const update = () => {
      root.style.setProperty("--ws-ph", `${Math.round(panel.offsetHeight)}px`);
      if (wide.matches) { setBand("-45% 0px -50% 0px"); return; }
      const top = parseFloat(getComputedStyle(panel).top) || 0;
      const below = top + panel.offsetHeight + 24;
      setBand(`-${Math.round(below)}px 0px -${Math.max(0, Math.round(window.innerHeight - below - 96))}px 0px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    window.addEventListener("resize", update);
    wide.addEventListener("change", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); wide.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((ents) => {
      for (const e of ents) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: band });
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps.length, band]);

  // [c0, line]: linie bieżącego kroku (podświetlone); podgląd do `line`. Krok bez linii — nic nie podświetla.
  const [c0, line] = stepLines(steps, active, story.from);
  const own = active >= 0 && !!steps[active].line;
  const isCur = (i: number) => own && i >= c0 && i <= line;

  // bieżąca linia widoczna w liście programu (przewija się tylko lista, nie strona)
  useEffect(() => {
    const list = codeRef.current;
    const li = list?.children[Math.max(0, line)] as HTMLElement | undefined;
    if (!list || !li) return;
    const top = list.scrollTop + li.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientHeight / 2 + li.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [line]);

  const go = (i: number) => {
    const n = Math.max(-1, Math.min(steps.length - 1, i));
    setActive(n);
    // komputer: krok na środek (tam jest pasek aktywacji); telefon: pod przyklejony panel (scroll-margin-top)
    if (n >= 0) stepRefs.current[n]?.scrollIntoView({ block: matchMedia("(min-width: 1280px)").matches ? "center" : "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const p = line >= 0 ? geo.pos[line] : null;
  const pv = p ? plane(mode)(p) : [0, 0];
  const sp = line >= 0 ? prog.lines[line]?.state.pos ?? null : null;
  const st = line >= 0 ? prog.lines[line]?.state : null;
  const v = geo.view;
  const unit = Math.max(v.w, v.h) / 100; // grubości kresek niezależne od skali rysunku
  const tr = (story.tool ?? 0) / 2;

  return (
    <div ref={rootRef} className="ws">
      <div ref={panelRef} className="ws-panel" aria-label="Program przykładu i podgląd toru">
        <svg className="ws-view" viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} role="img"
          aria-label={p && geo.xy[line] ? `Tor do linii ${line + 1}; narzędzie w ${lathe ? `X⌀${fmt((sp ?? p).x * 2)} Z${fmt((sp ?? p).z)}` : `X${fmt((sp ?? p).x)} Y${fmt((sp ?? p).y)} Z${fmt((sp ?? p).z)}`}` : "Tor przed pierwszym ruchem"}>
          {story.bar && (
            <>
              <rect className="ws-stock" x={story.bar.z[0]} y={-story.bar.d / 2} width={story.bar.z[1] - story.bar.z[0]} height={story.bar.d / 2} />
              {/* oś toczenia */}
              <path className="ws-axis" d={`M${v.x} 0H${v.x + v.w}`} strokeWidth={unit * 0.3} strokeDasharray={`${unit * 3} ${unit} ${unit * 0.6} ${unit}`} />
            </>
          )}
          {story.stock && <rect className="ws-stock" x={story.stock[0]} y={-story.stock[3]} width={story.stock[2] - story.stock[0]} height={story.stock[3] - story.stock[1]} />}
          {story.part && ("cx" in story.part
            ? <circle className="ws-part" cx={story.part.cx} cy={-story.part.cy} r={story.part.d / 2} strokeWidth={unit * 0.45} />
            : <rect className="ws-part" x={story.part.x[0]} y={-story.part.y[1]} width={story.part.x[1] - story.part.x[0]} height={story.part.y[1] - story.part.y[0]} rx={story.part.r ?? 0} strokeWidth={unit * 0.45} />)}
          {/* otwory z cykli wiercenia — od linii, w której powstały */}
          {geo.holes.filter((h) => h.line <= line).map((h, i) => <circle key={`h${i}`} className="ws-hole" cx={h.x} cy={-h.y} r={Math.max(unit, tr * 0.9)} strokeWidth={unit * 0.35} />)}
          {/* zero W */}
          <g className="ws-zero" strokeWidth={unit * 0.35}><path d={`M${-unit * 3} 0H${unit * 3}M0 ${-unit * 3}V${unit * 3}`} /></g>
          {/* tor środka z korekcją G41/G42 — cienka kropkowana linia pod torem programu */}
          {geo.center.filter((s) => s.line <= line && s.kind !== "rapid").map((s, i) => <path key={`c${i}`} d={s.d} className="ws-center" strokeWidth={unit * 0.35} strokeDasharray={`${unit * 0.5} ${unit * 0.9}`} />)}
          {geo.segs.map((s, i) => {
            const state = s.line > line ? "is-next" : isCur(s.line) ? "is-cur" : "is-done";
            return <path key={i} d={s.d} className={`ws-seg ws-${s.kind} ${state}`} strokeWidth={unit * (state === "is-cur" ? 0.9 : 0.55)}
              strokeDasharray={s.kind === "rapid" ? `${unit * 1.6} ${unit * 1.2}` : undefined} />;
          })}
          {p && geo.xy[line] && (
            <g className="ws-tool">
              {!lathe && tr > 0 && <circle cx={pv[0]} cy={-pv[1]} r={tr} strokeWidth={unit * 0.4} />}
              <circle cx={pv[0]} cy={-pv[1]} r={unit * 0.9} className="ws-tool-c" />
            </g>
          )}
        </svg>
        <div className="ws-dro" aria-live="polite">
          {/* odczyt: punkt z programu (jak w kodzie); znacznik na rysunku — środek freza / naroże z korekcją */}
          {!p || !sp ? <span>przed pierwszym ruchem</span>
            : lathe ? <><span>X {geo.xy[line] ? `⌀${fmt(sp.x * 2)}` : "—"}</span><span>Z {geo.xy[line] ? fmt(sp.z) : "—"}</span></>
            : <><span>X {geo.xy[line] ? fmt(sp.x) : "—"}</span><span>Y {geo.xy[line] ? fmt(sp.y) : "—"}</span><span>Z {fmt(sp.z)}</span></>}
          {st && <span className="ws-mod">G{String(st.motion ?? 0).padStart(2, "0")}{st.feed ? ` · F${st.feed}` : ""}</span>}
        </div>
        <ol ref={codeRef} className="ws-code" aria-label="Program przykładu" tabIndex={0} data-lenis-prevent>
          {rows.map((r, i) => (
            <li key={i} className={isCur(i) ? "is-cur" : i > line ? "is-next" : undefined} aria-current={isCur(i) ? "step" : undefined}>
              <span className="ws-n" aria-hidden>{i + 1}</span><code><CodeLine text={r} /></code>
            </li>
          ))}
        </ol>
        <div className="ws-nav">
          <button type="button" onClick={() => go(active - 1)} disabled={active < 0} aria-label="Poprzedni krok">‹</button>
          <span>{active < 0 ? "Start" : `Krok ${active + 1} z ${steps.length}`}</span>
          <button type="button" onClick={() => go(active + 1)} disabled={active >= steps.length - 1} aria-label="Następny krok">›</button>
        </div>
      </div>
      <ol className="ws-steps">
        {steps.map((s, i) => (
          <li key={i} ref={(el) => { stepRefs.current[i] = el; }} data-i={i} className={i === active ? "is-on" : undefined} onClick={() => go(i)}>
            <span className="ws-k" aria-hidden>{i + 1}</span>
            <div className="ws-x">
              {s.node}
              {s.code && <code className="ws-chip">{s.code}</code>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
