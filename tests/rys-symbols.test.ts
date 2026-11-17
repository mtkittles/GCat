import { describe, expect, it } from "vitest";
import { bbox, parseDoc, rotateItem, storeDoc, translate, type DatumItem, type GdtItem, type Item, type RoughItem } from "@/lib/rys/model";
import { datumLayout, gdtGlyph, gdtLayout, nextDatum, placeGdt, roughLocal } from "@/lib/rys/symbols";
import { mirrorItem } from "@/lib/rys/edit";

/* Rysownik RB6a: ramka tolerancji geometrycznej (ISO 1101), symbol bazy (ISO 5459), znak chropowatości (ISO 21920-1). */

const gdt = (o: Partial<GdtItem> = {}): GdtItem => ({ id: "g", t: "gdt", x: 10, y: 50, sym: "pos", tol: "0,1", dia: true, mod: "M", dat: "A|B|C", size: 10.5, font: "mono", ...o });
const datum = (o: Partial<DatumItem> = {}): DatumItem => ({ id: "d", t: "datum", x: 40, y: 80, bx: 40, by: 50, s: "A", solid: true, size: 10.5, font: "mono", ...o });
const rough = (o: Partial<RoughItem> = {}): RoughItem => ({ id: "r", t: "rough", x: 0, y: 0, a: 0, kind: "mrr", s: "Ra 1,6", size: 10.5, font: "mono", ...o });

describe("symbole rysunku technicznego", () => {
  it("zapis i odczyt bez strat (z linią odniesienia i bez)", () => {
    const items: Item[] = [gdt({ lx: 0, ly: 80 }), gdt({ dat: "", mod: "" }), datum({ solid: false }), rough({ a: 90, kind: "nmr" })];
    const back = parseDoc(storeDoc({ h: 120, k: 1, items }));
    expect(back.items.map((it) => ({ ...it, id: "x" }))).toEqual(items.map((it) => ({ ...it, id: "x" })));
    expect(storeDoc({ h: 120, k: 1, items: [gdt()] }).items[0]).not.toHaveProperty("lx");
  });

  it("ramka: pole cechy, tolerancji i do trzech baz; linia odniesienia z bliższego boku", () => {
    const L = gdtLayout(gdt());
    expect(L.cells).toHaveLength(5);
    expect(L.cells[0].x1 - L.cells[0].x0).toBeCloseTo(L.h, 5); // pole cechy kwadratowe
    expect(L.cells[1]).toMatchObject({ text: "⌀0,1", mod: "M" });
    expect(L.cells.slice(2).map((c) => c.text)).toEqual(["A", "B", "C"]);
    expect(gdtLayout(gdt({ dat: "A|B|C|D" })).cells).toHaveLength(5); // najwyżej trzy bazy
    expect(gdtLayout(gdt({ lx: 0, ly: 50 })).lead!.a).toEqual([10, 50]); // strzałka po lewej — z lewego boku
    const right = gdtLayout(gdt({ lx: 400, ly: 50 }));
    expect(right.lead!.a).toEqual([10 + right.w, 50]);
  });

  it("każda cecha ISO 1101 ma rysunek; bicie ma groty", () => {
    for (const s of ["str", "flat", "circ", "cyl", "pline", "psurf", "par", "perp", "ang", "pos", "coax", "sym", "run", "trun"] as const) {
      const g = gdtGlyph(s, 0, 0, 5);
      expect(g.lines.length + g.circles.length + g.paths.length).toBeGreaterThan(0);
    }
    expect(gdtGlyph("run", 0, 0, 5).heads).toHaveLength(1);
    expect(gdtGlyph("trun", 0, 0, 5).heads).toHaveLength(2);
    expect(gdtGlyph("pos", 0, 0, 5).circles).toHaveLength(1);
    expect(gdtGlyph("coax", 0, 0, 5).circles).toHaveLength(2);
  });

  it("baza: podstawa trójkąta na elemencie, linia do ramki z literą", () => {
    const L = datumLayout(datum());
    expect((L.tri[0][1] + L.tri[1][1]) / 2).toBeCloseTo(80, 5);
    expect(L.tri[2][1]).toBeLessThan(80); // wierzchołek w stronę litery
    expect(L.lead).not.toBeNull();
    expect(L.box[3]).toBeCloseTo(50 + (1.7 * 10.5) / 2, 1); // dolny bok ramki (bok 1,7 × wysokość pisma)
    expect(nextDatum(["A", "B", "H"])).toBe("C");
    expect(nextDatum([..."ABCDEFGH"])).toBe("J"); // bez I, O, Q
  });

  it("chropowatość: ramiona 60°, kreska przy usunięciu materiału, obrót i lustro", () => {
    const g = roughLocal(rough());
    expect(Math.atan2(-g.Lp[1], -g.Lp[0]) * 180 / Math.PI).toBeCloseTo(60, 5);
    expect(Math.atan2(-g.R[1], g.R[0]) * 180 / Math.PI).toBeCloseTo(60, 5);
    expect(-g.R[1] / -g.Lp[1]).toBeCloseTo(3 / 1.4, 5);
    expect((rotateItem(rough(), [0, 0], 90) as RoughItem).a).toBe(90);
    expect((mirrorItem(rough(), [0, 0], [100, 0]) as RoughItem).a).toBe(180); // odbicie względem poziomej osi — znak do dołu
    const b = bbox(rough());
    expect(b[3]).toBeCloseTo(0, 5); // wierzchołek na powierzchni, reszta nad nią
  });

  it("przesunięcie i obrót: linia odniesienia i litera bazy idą razem, ramka zostaje pozioma", () => {
    expect(translate(gdt({ lx: 0, ly: 80 }), 5, -5)).toMatchObject({ x: 15, y: 45, lx: 5, ly: 75 });
    expect(translate(datum(), 5, 5)).toMatchObject({ x: 45, y: 85, bx: 45, by: 55 });
    const r = rotateItem(gdt({ lx: 0, ly: 80 }), [10, 50], 90) as GdtItem;
    expect([r.x, r.y, r.lx, r.ly]).toEqual([10, 50, -20, 40]);
    expect(placeGdt(gdt(), [100, 100], [60, 70])).toMatchObject({ y: 70, lx: 100, ly: 100 }); // ramka po lewej strzałki
    expect(placeGdt(gdt(), [100, 100], [120, 70]).x).toBe(120);
  });
});
