import CncPanelClient, { type PanelLine, type PanelSeg } from "./CncPanelClient";
import { buildStory } from "@/lib/storyPath";
import { simHref } from "@/lib/simLink";
import { HOME_DEMO, HOME_DEMO_OPS, HOME_DEMO_SINUMERIK, HOME_DEMO_SINUMERIK_OPS } from "@/content/homeDemo";

/*
  Mini-pulpit CNC na stronie głównej. Tor liczy parser przy budowie strony (ten sam program co dotąd
  w sekcji „Jeden program, cztery operacje”, src/content/homeDemo.ts); do przeglądarki idą gotowe ścieżki SVG.
*/
function chapters(src: string, starts: string[]): PanelLine[][] {
  const lines = src.split("\n");
  const first = starts.map((s) => lines.findIndex((l) => l.trim().startsWith(s)));
  if (first.some((i) => i < 0)) throw new Error("CncPanel: brak początku operacji");
  return first.map((f, k) => lines.slice(f, k + 1 < first.length ? first[k + 1] : lines.length).map((raw, j) => ({ n: f + j + 1, raw })));
}

const round = (n: number) => Math.round(n * 1000) / 1000;
const STORY = buildStory(HOME_DEMO, HOME_DEMO_OPS, { holeChapters: [3] });
const SEGS: PanelSeg[] = STORY.segs.map((s) => ({ kind: s.kind, ch: s.ch, d: s.d, hole: s.hole, x: round(s.from[0]), y: round(s.from[1]) }));

export default function CncPanel() {
  return (
    <CncPanelClient
      segs={SEGS}
      box={STORY.box}
      code={{ fanuc: chapters(HOME_DEMO, HOME_DEMO_OPS), sinumerik: chapters(HOME_DEMO_SINUMERIK, HOME_DEMO_SINUMERIK_OPS) }}
      simHref={simHref({ src: HOME_DEMO, mode: "mill", name: "Płytka mocująca 80 × 50" })}
    />
  );
}
