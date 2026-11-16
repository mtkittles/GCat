import { describe, expect, it } from "vitest";
import { align, duplicate, edReducer, initEd, patchItems, reorder } from "@/components/rys/state";
import { editTarget, panelUrl } from "@/lib/edycja";
import { compileContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds } from "@/lib/mdx/components";
import {
  arcEnds, arcFrom3, arcPath, arcSweep, autoLegend, autoOrient, bbox, constrain, dimGeom, dimText, handles, moveHandle, parseDoc, snap, snapCache, storeDoc, strokeOf, translate,
  type Item, type RysDoc,
} from "@/lib/rys/model";
import { liveSources } from "@/lib/mdx/live";

/* Rysownik (paczka RA): model rysunku, stan edytora, odwołania <Rys> i adresy trybu edycji. */

const raw = {
  h: 200,
  items: [
    { t: "rect", k: "con", fill: "hatch", x: 60, y: 60, w: 180, h: 100 },
    { t: "line", k: "cut", arrow: "end", x1: 10, y1: 10, x2: 60, y2: 60 },
    { t: "poly", k: "rap", pts: "10,20 30.5,40 50,20", closed: false },
    { t: "arc", k: "arc", cx: 100, cy: 100, r: 20, a0: 0, a1: 90 },
    { t: "dim", x1: 60, y1: 160, x2: 240, y2: 160, off: 14, label: "80", side: -1 },
    { t: "text", x: 5, y: 5, s: "G01 X80." , mono: true },
  ],
};
const doc = () => parseDoc(raw);
const item = <T extends Item["t"]>(d: RysDoc, t: T) => d.items.find((i) => i.t === t) as Extract<Item, { t: T }>;

describe("model: odczyt i zapis", () => {
  it("zapis jest kanoniczny: ponowny odczyt i zapis nic nie zmienia", () => {
    const a = storeDoc(doc());
    expect(storeDoc(parseDoc(a))).toEqual(a);
    expect(JSON.stringify(storeDoc(parseDoc(a)))).toBe(JSON.stringify(a)); // także kolejność kluczy
    expect(a.items[0]).toEqual({ t: "rect", k: "con", sw: "auto", fill: "hatch", x: 60, y: 60, w: 180, h: 100, r: 0 });
    expect(a.k).toBe(1);
    expect(a.items[2].pts).toBe("10,20 30.5,40 50,20");
    expect(a.items.every((i) => !("id" in i))).toBe(true);
  });
  it("styl spoza list wraca do domyślnego, nieznane elementy i pusty tekst odpadają", () => {
    const d = parseDoc({ h: 9999, items: [{ t: "line", k: "różowy", arrow: "x", x1: 1e9, y1: "a", x2: 0, y2: 0 }, { t: "obrazek" }, { t: "text", s: "  " }, null, { t: "poly", pts: "1,1" }] });
    expect(d.h).toBe(480);
    expect(d.items.length).toBe(1);
    expect(d.items[0]).toMatchObject({ t: "line", k: "con", arrow: "none", x1: 1000, y1: 0 });
  });
  it("współrzędne z dokładnością 0,01", () => {
    expect(parseDoc({ items: [{ t: "pt", x: 10.264, y: 10.746 }] }).items[0]).toMatchObject({ x: 10.26, y: 10.75 });
  });
  it("dawny zapis: thick, rozmiar sm/md/lg i mono przechodzą na grubość, rozmiar i czcionkę", () => {
    const d = parseDoc({ items: [{ t: "line", k: "cut", thick: true, x1: 0, y1: 0, x2: 1, y2: 1 }, { t: "text", s: "A", size: "lg", mono: true }, { t: "dim", x1: 0, y1: 0, x2: 10, y2: 0, label: "80" }] });
    expect(d.items[0]).toMatchObject({ sw: "l" });
    expect(d.items[1]).toMatchObject({ size: 14, font: "mono" });
    expect(d.items[2]).toMatchObject({ o: "a", size: 10.5, font: "mono", hz: false, label: "80" });
  });
  it("grubość: wg rodzaju = grubość z CSS rysunków, inaczej z listy", () => {
    expect(strokeOf("con", "auto")).toBe(1.6);
    expect(strokeOf("dim", "xl")).toBe(3.4);
    expect(strokeOf("none", "l")).toBe(0);
  });
  it("legenda automatyczna: użyte rodzaje w stałej kolejności", () => {
    expect(autoLegend(doc())).toEqual(["con", "hatch", "cut", "rap", "arc", "dim"]);
    expect(autoLegend({ items: [] })).toEqual([]);
  });
});

describe("model: geometria", () => {
  it("łuk: rozwarcie zgodnie z zegarem, pełny okrąg przy równych kątach", () => {
    expect(arcSweep(0, 90)).toBe(90);
    expect(arcSweep(90, 0)).toBe(270);
    expect(arcSweep(45, 45)).toBe(360);
    expect(arcPath({ cx: 0, cy: 0, r: 10, a0: 0, a1: 90 })).toBe("M 10 0 A 10 10 0 0 1 0 10");
    expect(arcPath({ cx: 0, cy: 0, r: 10, a0: 90, a1: 0 })).toContain("A 10 10 0 1 1");
  });
  it("przyciąganie jak w CAD: koniec, przecięcie, środek, prostopadle, na linii, siatka", () => {
    const items = parseDoc({ items: [
      { t: "line", x1: 0, y1: 0, x2: 100, y2: 0 }, { t: "line", x1: 50, y1: -50, x2: 50, y2: 50 }, { t: "circle", cx: 200, cy: 0, r: 20 },
    ] }).items;
    const cache = snapCache(items);
    expect(snap(1.5, 1, { grid: 5, cache })).toEqual({ x: 0, y: 0, to: "end" });
    expect(snap(51, -1.2, { grid: 5, cache })).toEqual({ x: 50, y: 0, to: "int" }); // przecięcie wygrywa ze środkiem odcinka
    expect(snap(201, 1, { grid: 5, cache })).toEqual({ x: 200, y: 0, to: "center" });
    expect(snap(30.3, 2, { grid: 5, cache })).toEqual({ x: 30.3, y: 0, to: "near" }); // na linii, dokładnie na niej
    expect(snap(37, 2, { grid: 5, cache, from: [37, 40] })).toEqual({ x: 37, y: 0, to: "perp" });
    const n = snap(214.2, 14.3, { grid: 5, cache, tol: 3 }); // punkt na okręgu
    expect(n.to).toBe("near");
    expect(Math.hypot(n.x - 200, n.y)).toBeCloseTo(20, 1);
    expect(snap(133, 12, { grid: 5, cache })).toEqual({ x: 135, y: 10, to: "grid" });
    expect(snap(133.2, 12.4, { grid: 0 })).toEqual({ x: 133.2, y: 12.4, to: "free" });
  });
  it("przecięcie linii z łukiem leży na łuku — linia dorysowana do niego łączy się dokładnie", () => {
    const items = parseDoc({ items: [{ t: "arc", cx: 0, cy: 0, r: 50, a0: 0, a1: 90 }, { t: "line", x1: 30, y1: -10, x2: 30, y2: 100 }] }).items;
    const s = snap(30.5, 39, { grid: 5, cache: snapCache(items) });
    expect(s.to).toBe("int");
    expect(s.x).toBe(30); expect(s.y).toBe(40);
  });
  it("Shift: kierunek co 45°", () => {
    expect(constrain(0, 0, 50, 4)).toEqual([50, 0]);
    expect(constrain(0, 0, 3, -40)).toEqual([0, -40]);
    expect(constrain(0, 0, 30, 26)).toEqual([30, 30]);
  });
  it("uchwyt rogu prostokąta: róg przeciwległy zostaje w miejscu", () => {
    const r = item(doc(), "rect");
    expect(moveHandle(r, "nw", 40, 50)).toMatchObject({ x: 40, y: 50, w: 200, h: 110 });
    expect(moveHandle(r, "se", 50, 40)).toMatchObject({ x: 50, y: 40, w: 10, h: 20 }); // przeciągnięcie „na drugą stronę”
  });
  it("uchwyt wymiaru odsuwa linię wymiarową, końce zostają", () => {
    const d = item(doc(), "dim");
    const h = handles(d).find((x) => x.key === "off")!;
    expect([h.x, h.y]).toEqual([150, 174]);
    expect(moveHandle(d, "off", 150, 190)).toMatchObject({ off: 30, x1: 60, x2: 240 });
  });
  it("wymiar poziomy i pionowy jak w CAD; „<>” = zmierzona wartość w mm wg skali", () => {
    const p1: [number, number] = [0, 0], p2: [number, number] = [40, 30];
    expect(autoOrient(p1, p2, [20, -20])).toBe("h"); // kursor nad odcinkiem
    expect(autoOrient(p1, p2, [70, 15])).toBe("v"); // kursor z boku
    const h = dimGeom({ o: "h", x1: 0, y1: 0, x2: 40, y2: 30, off: -35 });
    expect(h.A).toEqual([0, -20]); expect(h.B).toEqual([40, -20]); expect(h.len).toBe(40);
    const v = dimGeom({ o: "v", x1: 0, y1: 0, x2: 40, y2: 30, off: 40 });
    expect(v.A).toEqual([60, 0]); expect(v.len).toBe(30);
    expect(dimGeom({ o: "a", x1: 0, y1: 0, x2: 40, y2: 30, off: 0 }).len).toBe(50);
    expect(dimText({ label: "⌀<>" }, h, 2)).toBe("⌀20");
    expect(dimText({ label: "<> h7" }, v, 4)).toBe("7,5 h7");
  });
  it("łuk z cięciwy: przez początek, punkt na łuku i koniec, w dobrą stronę", () => {
    const g = arcFrom3([0, 0], [50, -50], [100, 0])!; // łuk nad cięciwą (y w dół)
    expect(g).toMatchObject({ cx: 50, cy: 0, r: 50 });
    const [s, m, e] = arcEnds(g);
    expect(m[1]).toBeCloseTo(-50, 5);
    expect([s, e].map((p) => p.map((v) => Math.round(v)))).toEqual(expect.arrayContaining([[0, 0], [100, 0]]));
    const g2 = arcFrom3([0, 0], [50, 50], [100, 0])!; // ten sam okrąg, łuk pod cięciwą
    expect(arcEnds(g2)[1][1]).toBeCloseTo(50, 5);
    expect(arcFrom3([0, 0], [50, 0], [100, 0])).toBeNull();
  });
  it("uchwyty łuku jak w CAD: koniec przesuwa się, drugi koniec i punkt środkowy zostają", () => {
    const a = parseDoc({ items: [{ t: "arc", cx: 50, cy: 0, r: 50, a0: 180, a1: 360 }] }).items[0];
    const moved = moveHandle(a, "e", 100, 20) as Extract<Item, { t: "arc" }>;
    const [s, m, e] = arcEnds(moved);
    expect(s.map(Math.round)).toEqual([0, 0]);
    expect(e[0]).toBeCloseTo(100, 1); expect(e[1]).toBeCloseTo(20, 1);
    expect(Math.hypot(m[0] - 50, m[1] + 50)).toBeGreaterThan(0); // łuk przebudowany przez trzy punkty
  });
  it("przesunięcie i prostokąt otaczający", () => {
    const p = translate(item(doc(), "poly"), 5, -5);
    expect(p.pts).toEqual([[15, 15], [35.5, 35], [55, 15]]);
    expect(bbox(p)).toEqual([15, 15, 55, 35]);
  });
});

describe("stan edytora", () => {
  it("cofnij i ponów; przeciąganie to jeden wpis historii", () => {
    const d0 = doc();
    let s = initEd(d0);
    const id = d0.items[0].id;
    const d1 = patchItems(d0, [id], (it) => translate(it, 10, 0));
    const d2 = patchItems(d0, [id], (it) => translate(it, 20, 0));
    s = edReducer(s, { type: "live", doc: d1 });
    s = edReducer(s, { type: "live", doc: d2 });
    s = edReducer(s, { type: "settle", from: d0 });
    expect(s.past.length).toBe(1);
    s = edReducer(s, { type: "undo" });
    expect(s.doc).toBe(d0);
    s = edReducer(s, { type: "redo" });
    expect(s.doc).toBe(d2);
    expect(edReducer(s, { type: "settle", from: d2 })).toBe(s); // kliknięcie bez ruchu nie tworzy wpisu
  });
  it("usunięty element znika z zaznaczenia", () => {
    const d0 = doc();
    let s = edReducer(initEd(d0), { type: "sel", sel: [d0.items[0].id, d0.items[1].id] });
    s = edReducer(s, { type: "set", doc: { ...d0, items: d0.items.slice(1) } });
    expect(s.sel).toEqual([d0.items[1].id]);
  });
  it("kolejność, duplikat, wyrównanie", () => {
    const d0 = doc(), ids = d0.items.map((i) => i.id);
    expect(reorder(d0, [ids[0]], "top").items.map((i) => i.id)).toEqual([...ids.slice(1), ids[0]]);
    expect(reorder(d0, [ids[2]], "down").items.map((i) => i.id).slice(0, 3)).toEqual([ids[0], ids[2], ids[1]]);
    const dup = duplicate(d0, [ids[0]]);
    expect(dup.doc.items.length).toBe(d0.items.length + 1);
    expect(dup.doc.items.at(-1)).toMatchObject({ t: "rect", x: 70, y: 70 });
    expect(dup.ids[0]).not.toBe(ids[0]);
    const al = align(d0, [ids[0], ids[1]], "left");
    expect(bbox(al.items[0])[0]).toBe(10);
    expect(bbox(al.items[1])[0]).toBe(10);
  });
});

describe("<Rys> w treści i tryb edycji", () => {
  const opts = { file: "test.mdx", components: componentNames, diagramIds, sources: liveSources };
  it("<Rys id> musi wskazywać istniejący rysunek", async () => {
    await expect(compileContent('<Rys id="wzornik-rysownika" />', { ...opts, rysIds: new Set(["wzornik-rysownika"]) })).resolves.toBeTruthy();
    await expect(compileContent('<Rys id="nie-ma" />', { ...opts, rysIds: new Set(["wzornik-rysownika"]) })).rejects.toThrow(/content\/rysunki\/nie-ma\.yaml/);
    await expect(compileContent("<Rys />", opts)).rejects.toThrow(/wymaga id/);
  });
  it("strona serwisu → wpis w panelu", () => {
    expect(editTarget("/kody/g01")).toEqual({ href: "/edytor/kody/g01", label: "Edytuj tę kartę" });
    expect(editTarget("/slownik/")?.href).toBe("/edytor#slownik");
    expect(editTarget("/nauka/frezowanie/f1-1")).toBeNull();
    expect(panelUrl("slownik", "kąt-przystawienia")).toMatch(/\/collection\/slownik\/item\/k%C4%85t-przystawienia$/);
    expect(panelUrl("rysunki", "create")).toMatch(/\/collection\/rysunki\/create$/);
  });
});
