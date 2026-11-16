import { describe, expect, it } from "vitest";
import { group, regroup, ungroup, withGroups, duplicate } from "@/components/rys/state";
import { rysunekSchema } from "@/lib/mdx/schema";
import { autoLegend, bbox, handles, moveHandle, parseDoc, scaleItem, snapCache, storeDoc, visibleItems, type Item, type RysDoc } from "@/lib/rys/model";

/* Rysownik RB2: warstwy, grupy i układ współrzędnych w modelu oraz zapisie pliku. */

const raw = {
  h: 200, k: 2,
  layers: [{ id: "0", name: "Kontur", vis: true, lock: false }, { id: "pom", name: "Pomocnicze", vis: false, lock: false }, { id: "wym", name: "Wymiary", vis: true, lock: true }],
  items: [
    { t: "line", k: "con", x1: 0, y1: 0, x2: 10, y2: 0, g: "g1" },
    { t: "line", k: "cons", x1: 0, y1: 5, x2: 10, y2: 5, l: "pom", g: "g1" },
    { t: "axes", x: 40, y: 150, xn: 10, xp: 120, yn: 0, yp: 100, xl: "Z", yl: "X", ts: 20, tv: 10, l: "wym" },
    { t: "line", k: "acc", x1: 0, y1: 9, x2: 10, y2: 9, l: "nieznana" },
  ],
};

describe("warstwy i grupy w zapisie", () => {
  it("odczyt i zapis zachowują warstwy, grupy i oś", () => {
    const doc = parseDoc(raw);
    expect(doc.layers?.map((l) => l.id)).toEqual(["0", "pom", "wym"]);
    expect(doc.items[0].g).toBe("g1");
    expect(doc.items[1].l).toBe("pom");
    expect(doc.items[3].l).toBeUndefined(); // warstwa, której nie ma — element wraca na podstawową
    const stored = storeDoc(doc);
    expect(stored.items[1]).toMatchObject({ l: "pom", g: "g1" });
    expect(stored.items[2]).toMatchObject({ t: "axes", xl: "Z", yl: "X", ts: 20, tv: 10, l: "wym" });
    expect(JSON.stringify(storeDoc(parseDoc(stored)))).toBe(JSON.stringify(stored)); // zapis kanoniczny (loader)
    expect(rysunekSchema.safeParse({ title: "T", rys: stored }).success).toBe(true);
  });

  it("rysunek bez warstw nie dostaje pola layers (stare pliki bez zmian)", () => {
    const s = storeDoc(parseDoc({ h: 100, k: 1, items: [{ t: "line", x1: 0, y1: 0, x2: 1, y2: 1 }] }));
    expect("layers" in s).toBe(false);
    expect(Object.keys(s.items[0])).not.toContain("l");
  });

  it("ukryta warstwa nie trafia na stronę ani do legendy", () => {
    const doc = parseDoc(raw);
    expect(visibleItems(doc).map((it) => it.t)).toEqual(["line", "axes", "line"]);
    expect(autoLegend(doc)).not.toContain("cons");
  });
});

describe("grupy", () => {
  const doc: RysDoc = parseDoc({ h: 100, k: 1, items: [
    { t: "line", x1: 0, y1: 0, x2: 1, y2: 0, g: "a" }, { t: "line", x1: 0, y1: 1, x2: 1, y2: 1, g: "a" }, { t: "line", x1: 0, y1: 2, x2: 1, y2: 2 },
  ] });
  const [a, b, c] = doc.items.map((it) => it.id);
  it("kliknięcie w element grupy zaznacza całą grupę", () => {
    expect(withGroups(doc, [a])).toEqual([a, b]);
    expect(withGroups(doc, [c])).toEqual([c]);
  });
  it("grupowanie i rozgrupowanie", () => {
    const g = group(doc, [b, c]);
    expect(g.items[1].g).toBe(g.items[2].g);
    expect(g.items[1].g).not.toBe("a");
    expect(ungroup(g, [b, c]).items.slice(1).every((it) => !it.g)).toBe(true);
  });
  it("kopia grupy to nowa grupa", () => {
    const copies = regroup(doc.items.slice(0, 2));
    expect(copies[0].g).toBe(copies[1].g);
    expect(copies[0].g).not.toBe("a");
    const d = duplicate(doc, [a, b]);
    expect(withGroups(d.doc, [a])).toEqual([a, b]); // oryginał nie łączy się z kopią
  });
});

describe("układ współrzędnych", () => {
  const ax = parseDoc({ h: 200, k: 1, items: [{ t: "axes", x: 50, y: 150, xn: 10, xp: 100, yn: 5, yp: 80, ts: 20, tv: 10 }] }).items[0] as Extract<Item, { t: "axes" }>;
  it("domyślne nazwy osi i granice", () => {
    expect([ax.xl, ax.yl]).toEqual(["X", "Y"]);
    expect(bbox(ax)).toEqual([40, 70, 150, 155]);
  });
  it("uchwyty zmieniają długość osi", () => {
    expect(handles(ax).map((h) => h.key)).toEqual(["xp", "yp", "xn", "yn"]);
    expect(moveHandle(ax, "xp", 200, 150)).toMatchObject({ xp: 150 });
    expect(moveHandle(ax, "yp", 50, 20)).toMatchObject({ yp: 130 });
  });
  it("przyciąga do początku i do opisanych podziałek", () => {
    const c = snapCache([ax]);
    expect(c.pts.some((p) => p.kind === "center" && p.p[0] === 50 && p.p[1] === 150)).toBe(true);
    expect(c.pts.some((p) => p.p[0] === 70 && p.p[1] === 150)).toBe(true);
  });
  it("skala zmienia długości i odstęp opisów", () => {
    expect(scaleItem(ax, [50, 150], 2)).toMatchObject({ x: 50, y: 150, xp: 200, yp: 160, ts: 40 });
  });
});
