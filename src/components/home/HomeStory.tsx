import StoryStage, { type StoryOp } from "./StoryStage";
import { buildStory } from "@/lib/storyPath";
import { simHref } from "@/lib/simLink";
import { HOME_DEMO, HOME_DEMO_OPS } from "@/content/homeDemo";

/* Opisy czterech operacji programu pokazowego — liczby wprost z bloków w src/content/homeDemo.ts. */
const OPS: StoryOp[] = [
  { title: "Kontur", text: "Frez ⌀10 schodzi na Z-3 i obchodzi płytkę 80 × 50. Proste to G01, cztery naroża R10 to G03." },
  { title: "Kieszeń", text: "Dwa pełne okręgi G02 wokół X40 Y25. Blok podaje tylko środek (I, J), bo okrąg kończy się tam, gdzie zaczął." },
  { title: "Rowki", text: "Dwa rowki po 10 mm na głębokości 2 mm. Między nimi narzędzie wraca G00 na Z5 i przejeżdża nad materiałem." },
  { title: "Otwory", text: "Wymiana na wiertło ⌀6 i cykl G81. Pierwszy blok opisuje cały otwór, trzy następne podają tylko zmienioną współrzędną." },
];

const STORY = buildStory(HOME_DEMO, HOME_DEMO_OPS, { holeChapters: [3] });
// do przeglądarki idą liczby zaokrąglone do 5 miejsc
const round = (n: number) => Math.round(n * 1e5) / 1e5;
const LEAN = { ...STORY, segs: STORY.segs.map((s) => ({ ...s, a: round(s.a), w: round(s.w), ...(s.a0 != null ? { a0: round(s.a0), da: round(s.da!) } : {}) })) };

export default function HomeStory() {
  return <StoryStage story={LEAN} ops={OPS} simHref={simHref({ src: HOME_DEMO, mode: "mill", name: "Płytka mocująca 80 × 50" })} />;
}
