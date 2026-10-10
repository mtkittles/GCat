import { Code, Fig, mapper, T } from "@/components/fig";
import { orderOf, type Track } from "@/lib/course";
import { partFeatures } from "@/content/nauka/partstate";

/*
  Mały rysunek stanu detalu przewodniego po lekcji: co program już obrabia,
  a co dochodzi w tej lekcji (pomarańczowo). Geometria zgodna z buildup.ts.
*/

type M = ReturnType<typeof mapper>;

function reached(track: Track, lessonId: string) {
  const here = orderOf(track, lessonId);
  const feats = partFeatures[track].map((f) => ({ ...f, at: orderOf(track, f.since) }));
  const done = feats.filter((f) => f.at <= here);
  const has = (id: string) => done.some((f) => f.id === id);
  const isNew = (id: string) => done.some((f) => f.id === id && f.since === lessonId);
  const next = feats.find((f) => f.at > here);
  return { done, has, isNew, next };
}

function Notes({ done, lessonId }: { done: { label: string; since: string }[]; lessonId: string }) {
  if (done.length === 0) return <Code k="dim">surówka — program jeszcze nie skrawa</Code>;
  return <>{done.map((f) => <Code key={f.label} k={f.since === lessonId ? "acc" : "con"}>{f.label}</Code>)}</>;
}

/* ---------- frezowanie: płytka 80 × 50 z góry ---------- */
function rrect(m: M, x0: number, y0: number, x1: number, y1: number, r: number) {
  return { x: m.X(x0), y: m.Y(y1), width: (x1 - x0) * m.u, height: (y1 - y0) * m.u, rx: r * m.u };
}

function MillState({ lessonId }: { lessonId: string }) {
  const { done, has, isNew, next } = reached("frezowanie", lessonId);
  const R: [number, number, number, number] = [-6, 86, -6, 56];
  const m = mapper(R, [12, 8, 336, 204]);
  const holes: [number, number][] = [[10, 10], [70, 10], [70, 40], [10, 40]];
  const cls = (id: string, base = "p-con") => (isNew(id) ? "p-acc thick" : base);
  const hole = { fill: "var(--panel)" };
  const arc = (x: number, y: number, r: number) => {
    const p = (a: number) => `${m.X(x + r * Math.cos(a))} ${m.Y(y + r * Math.sin(a))}`;
    return `M ${p(0)} A ${r * m.u} ${r * m.u} 0 1 0 ${p(-Math.PI / 2)}`;
  };
  return (
    <Fig id={`ps-${lessonId}`} code="XY" title={`Stan płytki po lekcji ${lessonId} — widok z góry`} h={224}
      notes={<Notes done={done} lessonId={lessonId} />}
      caption={<>Pomarańczowo — to, co program obrabia od tej lekcji. {next ? <>Następny element: {next.label} (lekcja {next.since}).</> : "Program obrabia już cały detal."}</>}>
      {(c) => (
        <g>
          {has("contour")
            ? <rect {...rrect(m, 0, 0, 80, 50, has("corners") ? 10 : 0)} style={{ fill: c.hatch }} className={isNew("contour") || isNew("corners") ? "p-acc thick" : "p-con"} />
            : <><rect {...rrect(m, 0, 0, 80, 50, 0)} className="stock-out" /><T x={m.X(40)} y={m.Y(25) + 4} anchor="middle" cls="t-mut">kontur 80 × 50 jeszcze nieobrobiony</T></>}
          {has("pocket") && <rect {...rrect(m, 17, 15, 43, 35, 6)} className={`${cls("pocket")}`} style={hole} />}
          {has("circle") && <circle cx={m.X(60)} cy={m.Y(25)} r={10 * m.u} className={`${cls("circle")}`} style={hole} />}
          {holes.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {has("spot") && !has("drill") && <circle cx={m.X(x)} cy={m.Y(y)} r={3 * m.u} className={`${cls("spot")}`} style={hole} />}
              {has("drill") && <circle cx={m.X(x)} cy={m.Y(y)} r={2.5 * m.u} className={`${cls("drill")}`} style={hole} />}
              {has("tap") && <path d={arc(x, y, 3)} fill="none" className={isNew("tap") ? "p-acc" : "p-dim"} />}
            </g>
          ))}
          {has("pocket") && <T x={m.X(30)} y={m.Y(25) + 4} anchor="middle" cls="t-mut t-sm">gł. 4</T>}
          {has("circle") && <T x={m.X(60)} y={m.Y(25) + 4} anchor="middle" cls="t-mut t-sm">Ø20</T>}
          {has("drill") && <T x={m.X(14)} y={m.Y(10) + 4} cls="t-mut t-sm">{has("tap") ? "4× M6" : "4× Ø5"}</T>}
          <T x={m.X(0) - 2} y={m.Y(0) + 14} anchor="end" cls="t-acc t-b t-sm">W</T>
        </g>
      )}
    </Fig>
  );
}

/* ---------- toczenie: wałek z boku, górna połowa w przekroju ---------- */
function LatheState({ lessonId }: { lessonId: string }) {
  const { done, has, isNew, next } = reached("toczenie", lessonId);
  const R: [number, number, number, number] = [-66, 6, -24, 24];
  const m = mapper(R, [10, 8, 340, 208]);
  /* profil [z, r] od osi na czole do osi przy uchwycie */
  let prof: [number, number][];
  if (has("steps")) {
    const neck: [number, number][] = has("groove") ? [[-16, 10], [-16, 8.5], [-20, 8.5]] : [[-20, 10]];
    prof = [[0, 9], [-1, 10], ...neck, [-20, 14], [-21, 15], [-40, 15], [-40, 18], [-55, 18], [-55, 20], [-62, 20]];
  } else if (has("rough")) {
    prof = [[0, 18.2], [-54.8, 18.2], [-54.8, 20], [-62, 20]];
  } else {
    prof = [[0, 20], [-62, 20]];
  }
  const core: [number, number][] = has("hole") ? [[-62, 0], [-15, 0], [-12.6, 4], [0, 4]] : [[-62, 0], [0, 0]];
  const pts = [...prof, ...core];
  /* dolna połowa to widok z zewnątrz — otworu osiowego w niej nie widać */
  const view = [...prof, [-62, 0], [0, 0]] as [number, number][];
  const poly = (mirror: boolean) => (mirror ? view : pts).map(([z, r]) => `${m.X(z)},${m.Y(mirror ? -r : r)}`).join(" ");
  const fresh = ["rough", "steps", "radii", "groove", "hole", "face"].some(isNew);
  return (
    <Fig id={`ps-${lessonId}`} code="Ø" title={`Stan wałka po lekcji ${lessonId} — widok z boku`} h={224}
      notes={<Notes done={done} lessonId={lessonId} />}
      caption={<>Górna połowa w przekroju, linia przerywana — pręt Ø40. Pomarańczowo — kontur po tej lekcji. {next ? <>Następny element: {next.label} (lekcja {next.since}).</> : "Program obrabia już cały detal."}</>}>
      {(c) => (
        <g>
          <rect x={m.X(-62)} y={m.Y(20)} width={62 * m.u} height={40 * m.u} className="stock-out" />
          <polygon points={poly(false)} style={{ fill: c.hatch }} className={fresh ? "p-acc thick" : "p-con"} />
          <polygon points={poly(true)} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          {has("thread") && <line x1={m.X(-1)} y1={m.Y(-9.08)} x2={m.X(-16)} y2={m.Y(-9.08)} className={isNew("thread") ? "p-acc" : "p-dim"} />}
          <line x1={m.X(-66)} y1={m.Y(0)} x2={m.X(6)} y2={m.Y(0)} className="p-cons" />
          {!has("face") && <T x={m.X(-2)} y={m.Y(22) - 2} anchor="end" cls="t-mut t-sm">czoło surowe</T>}
          {has("thread") && <T x={m.X(-8)} y={m.Y(-10) + 14} anchor="middle" cls="t-mut t-sm">M20 × 1,5</T>}
          <T x={m.X(0) + 4} y={m.Y(0) + 14} cls="t-acc t-b t-sm">W</T>
        </g>
      )}
    </Fig>
  );
}

export default function PartState({ track, lessonId }: { track: Track; lessonId: string }) {
  return track === "frezowanie" ? <MillState lessonId={lessonId} /> : <LatheState lessonId={lessonId} />;
}
