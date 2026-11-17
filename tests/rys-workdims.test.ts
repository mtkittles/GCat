import { describe, expect, it } from "vitest";
import { wdimItem, workDims } from "@/components/rys/workdims";
import type { Item } from "@/lib/rys/model";

/* Rysownik RB5a: wymiary robocze na rysunku — wartości w mm (skala k) i zmiana wymiaru wpisaną liczbą. */

const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6);

describe("wymiary robocze", () => {
  it("linia: długość w mm i wydłużenie od początku", () => {
    const it0: Item = { id: "l", t: "line", k: "con", sw: "auto", arrow: "none", x1: 10, y1: 10, x2: 40, y2: 50 };
    const [d] = workDims([it0], 2, 1);
    expect(d.key).toBe("len");
    close(d.val, 25); // 50 jednostek / 2 jedn. na mm
    const [n] = d.apply!(40) as Extract<Item, { t: "line" }>[];
    close(Math.hypot(n.x2 - n.x1, n.y2 - n.y1), 80);
    expect([n.x1, n.y1]).toEqual([10, 10]);
    expect(d.apply!(0)).toBeNull();
  });

  it("prostokąt: szerokość i wysokość, okrąg: średnica", () => {
    const r: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "none", x: 0, y: 0, w: 80, h: 50, r: 0 };
    const ds = workDims([r], 1, 1);
    expect(ds.map((d) => [d.key, d.val])).toEqual([["w", 80], ["h", 50]]);
    expect((ds[0].apply!(100) as Extract<Item, { t: "rect" }>[])[0].w).toBe(100);
    const c: Item = { id: "c", t: "circle", k: "con", sw: "auto", fill: "none", cx: 0, cy: 0, r: 14 };
    const [d] = workDims([c], 1, 1);
    expect([d.key, d.pre, d.val]).toEqual(["d", "⌀", 28]);
    expect((d.apply!(36) as Extract<Item, { t: "circle" }>[])[0].r).toBe(18);
  });

  it("kilka elementów: wymiary ramki, zmiana skaluje względem narożnika", () => {
    const a: Item = { id: "a", t: "line", k: "con", sw: "auto", arrow: "none", x1: 0, y1: 0, x2: 40, y2: 0 };
    const b: Item = { id: "b", t: "line", k: "con", sw: "auto", arrow: "none", x1: 0, y1: 20, x2: 40, y2: 20 };
    const ds = workDims([a, b], 1, 1);
    const w = ds.find((d) => d.key === "gw")!, h = ds.find((d) => d.key === "gh")!;
    close(w.val, 40); close(h.val, 20);
    const out = w.apply!(80) as Extract<Item, { t: "line" }>[];
    const xs = out.flatMap((l) => [l.x1, l.x2]);
    close(Math.max(...xs) - Math.min(...xs), 80);
  });

  it("wstaw jako wymiar: liniowy po stronie wymiaru roboczego, okrąg → ⌀", () => {
    const st = { dimSize: 11, dimFont: "sans" as const };
    const r: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "none", x: 0, y: 0, w: 80, h: 50, r: 0 };
    const [w] = workDims([r], 1, 1);
    const d = wdimItem(w, st) as Extract<Item, { t: "dim" }>;
    expect(d).toMatchObject({ t: "dim", o: "a", x1: 0, y1: 0, x2: 80, y2: 0, label: "<>" });
    expect(d.off * (d.x2 - d.x1)).toBeLessThan(0); // nad górną krawędzią, jak wymiar roboczy
    const c: Item = { id: "c", t: "circle", k: "con", sw: "auto", fill: "none", cx: 5, cy: 6, r: 14 };
    expect(wdimItem(workDims([c], 1, 1)[0], st)).toMatchObject({ t: "dimr", d: true, cx: 5, cy: 6, r: 14 });
  });
});
