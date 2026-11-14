import { describe, expect, it } from "vitest";
import { buildStory, pointAt, segAt } from "@/lib/storyPath";
import { HOME_DEMO, HOME_DEMO_OPS } from "@/content/homeDemo";

const story = buildStory(HOME_DEMO, HOME_DEMO_OPS, { holeChapters: [3] });
const near = (p: [number, number], x: number, y: number) => { expect(p[0]).toBeCloseTo(x, 3); expect(p[1]).toBeCloseTo(y, 3); };

describe("storyPath — program strony głównej", () => {
  it("dzieli program na cztery operacje i mieści ruchy każdej w jej ćwiartce postępu", () => {
    expect(story.chapters).toHaveLength(4);
    expect(story.chapters[0].lines[0].raw).toMatch(/^\(KONTUR/);
    expect(story.chapters[3].lines.at(-1)!.raw).toBe("M30");
    for (const s of story.segs) {
      expect(s.a).toBeGreaterThanOrEqual(s.ch / 4 - 1e-9);
      expect(s.a + s.w).toBeLessThanOrEqual((s.ch + 0.8) / 4 + 1e-9);
    }
    // postęp rośnie z kolejnymi ruchami
    for (let i = 1; i < story.segs.length; i++) expect(story.segs[i].a).toBeGreaterThanOrEqual(story.segs[i - 1].a - 1e-9);
  });

  it("kontur: cztery łuki G03 o promieniu 10, przeciwnie do ruchu wskazówek zegara", () => {
    const arcs = story.segs.filter((s) => s.ch === 0 && s.kind === "arc");
    expect(arcs).toHaveLength(4);
    for (const a of arcs) { expect(a.r).toBeCloseTo(10, 6); expect(a.da).toBeCloseTo(Math.PI / 2, 6); expect(a.d).toMatch(/A10 10 0 0 0 /); }
  });

  it("kieszeń: dwa pełne okręgi G02 (promień 6 i 10) rysowane dwiema połówkami", () => {
    const arcs = story.segs.filter((s) => s.ch === 1 && s.kind === "arc");
    expect(arcs.map((a) => a.r)).toEqual([6, 10]);
    for (const a of arcs) { expect(a.da).toBeCloseTo(-2 * Math.PI, 6); expect(a.d!.match(/A/g)).toHaveLength(2); expect(a.d).toMatch(/ 0 1 1 /); }
    // w połowie okręgu R10 narzędzie jest po przeciwnej stronie środka X40 Y25
    const big = arcs[1];
    near(pointAt(story.segs, big.a + big.w / 2), 50, 25);
  });

  it("otwory: cztery zagłębienia cyklu G81 w punktach z programu", () => {
    const holes = story.segs.filter((s) => s.hole);
    expect(holes.map((h) => h.from)).toEqual([[12, 10], [68, 10], [68, 40], [12, 40]]);
    expect(story.segs.filter((s) => s.hole && s.ch !== 3)).toHaveLength(0);
  });

  it("pointAt: początek, koniec i środek prostej", () => {
    const line = story.segs.find((s) => s.ch === 0 && s.kind === "linear" && s.d && s.to[0] === 70)!; // G01 X70
    near(pointAt(story.segs, line.a), 10, 0);
    near(pointAt(story.segs, line.a + line.w / 2), 40, 0);
    near(pointAt(story.segs, 1), ...story.segs.at(-1)!.to);
    expect(segAt(story.segs, 0)).toBe(0);
  });
});
