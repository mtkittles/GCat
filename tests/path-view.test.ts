import { describe, expect, it } from "vitest";
import { DEPTH_DEEP, DEPTH_TOP, deepestCut, depthShade, normalizeView, pathWindow, segPart, tailLength, toolColor, toolSpanAt, VIEW_LESSON, VIEW_MATERIAL } from "../src/components/simulator/pathView";

describe("pathWindow — widoczna część toru", () => {
  const total = 1000;
  it("cały: przygaszony cały tor i wykonana część", () => {
    expect(pathWindow("all", 300, total, null)).toEqual({ ghost: [0, 1000], done: [0, 300] });
    expect(pathWindow("all", 0, total, null).done).toBeNull();
  });
  it("wykonany: bez przygaszonego toru", () => {
    expect(pathWindow("done", 300, total, null)).toEqual({ ghost: null, done: [0, 300] });
  });
  it("ślad: ostatnie 6% drogi (40–400 mm)", () => {
    expect(tailLength(100)).toBe(40);
    expect(tailLength(1000)).toBe(60);
    expect(tailLength(100000)).toBe(400);
    expect(pathWindow("tail", 300, total, null)).toEqual({ ghost: null, done: [240, 300] });
    expect(pathWindow("tail", 20, total, null).done).toEqual([0, 20]);
  });
  it("narzędzie: tor bieżącego narzędzia, wykonane do postępu", () => {
    expect(pathWindow("tool", 300, total, [200, 600])).toEqual({ ghost: [200, 600], done: [200, 300] });
    expect(pathWindow("tool", 300, total, null)).toEqual({ ghost: null, done: null });
  });
  it("brak: nic", () => {
    expect(pathWindow("none", 300, total, null)).toEqual({ ghost: null, done: null });
  });
  it("postęp poza zakresem jest przycinany", () => {
    expect(pathWindow("done", 5000, total, null).done).toEqual([0, 1000]);
  });
});

describe("toolSpanAt — droga bieżącego narzędzia", () => {
  // T1: 0–30, T2: 30–60, T1 (drugi raz): 60–70
  const lengths = [10, 20, 10, 20, 10];
  const tools = [1, 1, 2, 2, 1];
  const of = (i: number) => tools[i];
  it("ciąg odcinków z tym samym narzędziem", () => {
    expect(toolSpanAt(lengths, of, 5)).toEqual([0, 30]);
    expect(toolSpanAt(lengths, of, 45)).toEqual([30, 60]);
  });
  it("powrót do narzędzia po wymianie to nowy ciąg", () => {
    expect(toolSpanAt(lengths, of, 65)).toEqual([60, 70]);
  });
  it("koniec programu — ostatni ciąg", () => {
    expect(toolSpanAt(lengths, of, 70)).toEqual([60, 70]);
  });
  it("pusty program", () => {
    expect(toolSpanAt([], of, 0)).toBeNull();
  });
});

describe("segPart — część odcinka w oknie", () => {
  it("odcinek w całości, w części i poza oknem", () => {
    expect(segPart(10, 10, [0, 100])).toEqual([0, 1]);
    expect(segPart(10, 10, [15, 100])).toEqual([0.5, 1]);
    expect(segPart(10, 10, [0, 12])).toEqual([0, 0.2]);
    expect(segPart(10, 10, [30, 40])).toBeNull();
    expect(segPart(10, 10, [20, 40])).toBeNull();
  });
});

describe("depthShade — cieniowanie głębokości", () => {
  it("nad materiałem nic, na wylot — przejście", () => {
    expect(depthShade(5, 0, -20)).toBeNull();
    expect(depthShade(0, 0, -20)).toBeNull();
    expect(depthShade(-20, 0, -20)).toBe("through");
    expect(depthShade(-25, 0, -20)).toBe("through");
  });
  it("im głębiej, tym ciemniej (każdy kanał)", () => {
    const ch = (s: string | null) => (s ?? "").match(/\d+/g)!.map(Number);
    const a = ch(depthShade(-1, 0, -20)), b = ch(depthShade(-10, 0, -20)), c = ch(depthShade(-19, 0, -20));
    for (let i = 0; i < 3; i++) { expect(a[i]).toBeGreaterThan(b[i]); expect(b[i]).toBeGreaterThan(c[i]); }
  });
  it("skala do najgłębszego wybrania: 5 mm w półfabrykacie 20 mm — najciemniej", () => {
    expect(depthShade(-5, 0, -20, -5)).toBe(`rgb(${[30, 35, 45].join(",")})`);
    expect(depthShade(-8, 0, -20, -5)).toBe(depthShade(-5, 0, -20, -5));
    expect(depthShade(-20, 0, -20, -5)).toBe("through");
  });
  it("deepestCut: najniższy z ruchów w materiale, nie niżej niż dół półfabrykatu", () => {
    expect(deepestCut([5, 0, -4, -5, 2], 0, -20)).toBe(-5);
    expect(deepestCut([5, 2], 0, -20)).toBe(-20);
    expect(deepestCut([-30], 0, -20)).toBe(-20);
  });
  it("wierzch półfabrykatu w ciemnym tonie stali — nie jaśniejszy niż tor i opisy (V5)", () => {
    for (const v of DEPTH_TOP) expect(v).toBeLessThanOrEqual(120);
    DEPTH_TOP.forEach((v, i) => expect(v).toBeGreaterThan(DEPTH_DEEP[i] + 40)); // skala głębokości dalej czytelna
  });
  it("zły półfabrykat (top ≤ bottom) — nic", () => {
    expect(depthShade(-1, 0, 0)).toBeNull();
  });
});

describe("pozostałe", () => {
  it("kolor narzędzia: stały dla numeru, cykliczny", () => {
    expect(toolColor(1)).toBe(toolColor(9));
    expect(toolColor(1)).not.toBe(toolColor(2));
    expect(toolColor(null)).toBe("#94A3B8");
  });
  it("normalizeView uzupełnia stary zapis", () => {
    expect(normalizeView(undefined)).toEqual(VIEW_MATERIAL);
    expect(normalizeView({ path: "zly", stock: false })).toEqual({ ...VIEW_MATERIAL, stock: false });
    expect(normalizeView({ path: "done" }, VIEW_LESSON).path).toBe("done");
  });
});
