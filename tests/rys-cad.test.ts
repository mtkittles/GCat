import { describe, expect, it } from "vitest";
import {
  angleSector, handles, measure, measureText, moveHandle, parseDoc, refAngle, rotateItem, scaleItem, snapCache, storeDoc,
  type DimAItem, type DimRItem, type Item,
} from "@/lib/rys/model";
import { cadAngle, snapAngle, track } from "@/lib/rys/track";

/* Rysownik RB1: wymiary ⌀/R i kątowe, obrót i skala grupy, śledzenie jak w CAD (kąty, równoległość, wyrównanie). */

const line = (x1: number, y1: number, x2: number, y2: number, id = "l"): Item => ({ id, t: "line", k: "con", sw: "auto", arrow: "none", x1, y1, x2, y2 });
const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6);

describe("wymiary promienia, średnicy i kąta", () => {
  it("zapis i odczyt zachowuje dimr i dima", () => {
    const doc = parseDoc({
      h: 200, k: 2,
      items: [
        { t: "dimr", d: true, cx: 100, cy: 100, r: 30, a: 45, ext: 10 },
        { t: "dimr", d: false, cx: 50, cy: 50, r: 20, a: 200, ext: -5, label: "R<> max" },
        { t: "dima", cx: 0, cy: 0, a1: 0, a2: 60, r: 40 },
      ],
    });
    const [d, r, a] = doc.items as [DimRItem, DimRItem, DimAItem];
    expect(d.label).toBe("⌀<>");
    expect(r.label).toBe("R<> max");
    expect(a.label).toBe("<>°");
    expect(measure(d, 2)).toBe(30); // ⌀ = 2r / k
    expect(measure(r, 2)).toBe(10);
    expect(measure(a, 2)).toBe(60);
    expect(measureText(d, 2)).toBe("⌀30");
    expect(measureText(a, 1)).toBe("60°");
    const again = parseDoc(storeDoc(doc));
    const noId = (it: Item) => Object.fromEntries(Object.entries(it).filter(([k]) => k !== "id"));
    expect(again.items.map(noId)).toEqual(doc.items.map(noId));
  });

  it("wymiar kątowy wybiera sektor, w którym jest kursor (4 ćwiartki dla dwóch prostych)", () => {
    expect(angleSector(0, 90, 45)).toEqual({ a1: 0, a2: 90 });
    expect(angleSector(0, 90, 135)).toEqual({ a1: 90, a2: 180 });
    expect(angleSector(0, 90, 225)).toEqual({ a1: 180, a2: 270 });
    expect(angleSector(0, 90, 315)).toEqual({ a1: 270, a2: 0 });
    // drugie ramię „przed” pierwszym (kąt −45°): sektor z kursorem pod pierwszym ramieniem
    expect(angleSector(0, -45, 343)).toEqual({ a1: 315, a2: 0 });
    expect(angleSector(0, -45, 100)).toEqual({ a1: 0, a2: 135 });
    // trzy punkty: tylko kąt między ramionami albo jego dopełnienie
    expect(angleSector(0, 90, 200, false)).toEqual({ a1: 90, a2: 0 });
  });
});

describe("obrót i skala", () => {
  it("odcinek obraca się wokół środka, a kąt odniesienia daje kąt wynikowy", () => {
    const l = line(0, 0, 10, 10);
    expect(refAngle(l)).toBeCloseTo(45);
    const r = rotateItem(l, [5, 5], 45) as Extract<Item, { t: "line" }>;
    close(r.x1, r.x2); // pionowo
    close((r.y1 + r.y2) / 2, 5);
  });

  it("prostokąt o 90° zostaje prostokątem, o 30° staje się zamkniętą polilinią", () => {
    const rect: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "none", x: 0, y: 0, w: 20, h: 10, r: 0 };
    const r90 = rotateItem(rect, [10, 5], 90);
    expect(r90.t).toBe("rect");
    expect(r90).toMatchObject({ w: 10, h: 20 });
    const r30 = rotateItem(rect, [10, 5], 30);
    expect(r30.t).toBe("poly");
    expect(r30).toMatchObject({ closed: true });
  });

  it("skala względem punktu stałego", () => {
    const s = scaleItem(line(10, 10, 20, 10), [10, 10], 2) as Extract<Item, { t: "line" }>;
    expect([s.x1, s.y1, s.x2, s.y2]).toEqual([10, 10, 30, 10]);
  });

  it("dociąganie kąta obrotu", () => {
    expect(snapAngle(43, 15)).toBe(45);
    expect(snapAngle(38, 15)).toBe(38); // daleko od 30 i 45 — bez zmian
    expect(snapAngle(38, 15, true)).toBe(45);
    expect(cadAngle(-90)).toBe(90); // oś Y w dół na ekranie, w górę w opisie
  });
});

describe("uchwyt środka odcinka", () => {
  it("przesuwa cały odcinek", () => {
    const l = line(0, 0, 10, 0);
    expect(handles(l).map((h) => h.key)).toEqual(["p1", "p2", "m"]);
    expect(moveHandle(l, "m", 5, 7)).toMatchObject({ x1: 0, y1: 7, x2: 10, y2: 7 });
  });
});

describe("śledzenie jak w CAD", () => {
  it("od punktu poza siatką kierunek pionowy jest dokładny", () => {
    // problem z importu: koniec w 246,196 przy skoku siatki 2,5 — siatka ściągała drugi koniec ukośnie
    const t = track([247.3, 260], { from: [246, 196], polar: 15, tol: 3 });
    expect(t?.p).toEqual([246, 260]);
    expect(t?.label).toBe("270°");
  });

  it("równolegle i prostopadle do istniejącej linii", () => {
    const cache = snapCache([line(0, 0, 30, 10, "a")]);
    const par = track([140, 133.7], { from: [100, 120], parallel: true, cache, tol: 3 });
    expect(par?.label).toBe("∥ równolegle");
    expect(par!.p[1] - 120).toBeCloseTo((par!.p[0] - 100) / 3, 2);
    const perp = track([104, 108], { from: [100, 120], parallel: true, cache, tol: 3 });
    expect(perp?.label).toBe("⊥ prostopadle");
  });

  it("wyrównanie z osią symetrii (środek okręgu)", () => {
    const cache = snapCache([{ id: "c", t: "circle", k: "con", sw: "auto", fill: "none", cx: 100, cy: 100, r: 10 }]);
    const t = track([101.2, 160], { align: true, cache, tol: 3 });
    expect(t?.p).toEqual([100, 160]);
    expect(t?.label).toBe("oś symetrii");
  });

  it("przecięcie kierunku z wyrównaniem wygrywa", () => {
    const cache = snapCache([line(0, 50, 0, 60, "a")]); // koniec w (0, 50)
    const t = track([50.5, 51], { from: [0, 100], polar: 45, align: true, cache, tol: 3 });
    expect(t?.p).toEqual([50, 50]);
  });
});

describe("opis wymiaru poza liniami pomocniczymi", () => {
  it("tp: zapis, uchwyt „t” przesuwa opis wzdłuż linii, powrót na środek kasuje pole", async () => {
    const { parseDoc, storeDoc, moveHandle, handles } = await import("@/lib/rys/model");
    const d = parseDoc({ h: 100, k: 1, items: [{ t: "dim", o: "h", x1: 0, y1: 0, x2: 10, y2: 0, off: -10, tp: 14 }] });
    const dim = d.items[0];
    expect(dim.t === "dim" && dim.tp).toBe(14);
    expect(storeDoc(d).items[0].tp).toBe(14);
    expect(handles(dim).map((h) => h.key)).toContain("t");
    const moved = moveHandle(dim, "t", 30, -10);
    expect(moved.t === "dim" && moved.tp).toBe(25);
    const back = moveHandle(dim, "t", 5, -10);
    expect(back.t === "dim" && "tp" in back).toBe(false);
  });
});
