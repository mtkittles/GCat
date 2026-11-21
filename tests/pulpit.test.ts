import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { KORPUS, WALEK } from "@/content/heroDetale";
import { HOME_DEMO } from "@/content/homeDemo";
import { heroDetale } from "@/components/pulpit/heroData";
import { CATEGORIES } from "@/components/pulpit/CategoryMarquee";
import { dzialy } from "@/lib/technologia";

describe("strona startowa V3.1 — okno programu", () => {
  it("programy detali (Fanuc) przechodzą walidator bez uwag", () => {
    expect(validate(parseProgram(HOME_DEMO), "fanuc")).toEqual([]);
    expect(validate(parseProgram(KORPUS), "fanuc", { minX: 0, maxX: 90, minY: 0, maxY: 70, top: 0, bottom: -20 }, undefined, 5)).toEqual([]);
    expect(validate(parseProgram(WALEK, { diameterX: true }), "fanuc")).toEqual([]);
  });

  const D = heroDetale();

  it("trzy detale: płytka, wałek (toczenie), korpus; operacje i narzędzia opisane", () => {
    expect(D.map((d) => d.key)).toEqual(["plytka", "walek", "korpus"]);
    expect(D[1].mode).toBe("lathe");
    for (const d of D) {
      expect(d.segs.length).toBeGreaterThan(5);
      expect(d.ops.every((o) => o.name && o.tool)).toBe(true);
      // każda operacja ma ruch roboczy
      for (let k = 0; k < d.ops.length; k++) expect(d.segs.some((s) => s.op === k && s.kind !== "rapid"), `${d.key} op ${k}`).toBe(true);
    }
  });

  it("frezowanie: ślad o średnicy narzędzia, otwory z cyklu w punktach programu", () => {
    const p = D[0];
    expect(p.segs.filter((s) => s.cut).every((s) => s.dia === 10)).toBe(true);
    const holes = p.segs.filter((s) => s.hole).map((s) => s.hole!.slice(0, 2));
    expect(holes).toEqual(expect.arrayContaining([[12, 10], [68, 10], [68, 40], [12, 40]]));
    expect(p.segs.filter((s) => s.hole && s.op === 3).every((s) => s.hole![2] === 3)).toBe(true);
    const k = D[2];
    expect(k.segs.filter((s) => s.hole && s.op === 1)).toHaveLength(4);
  });

  it("toczenie: widok Z × promień, wykańczanie kończy na ⌀40 przy Z-55", () => {
    const w = D[1];
    const fin = w.segs.filter((s) => s.op === 1 && s.kind === "linear");
    expect(fin.some((s) => s.pts.some(([z, r]) => z === -55 && r === 20))).toBe(true);
    expect(w.segs.every((s) => s.pts.every(([, r]) => r >= 0 && r <= 50))).toBe(true);
  });

  it("kolor ruchu w kodzie z trybu modalnego (zapis Fanuc)", () => {
    const c = D[2].code;
    const at = (t: string) => c.find((l) => l.t.trim() === t)!.k;
    expect(at("Y45.")).toBe("linear");
    expect(at("G03 X58. Y51. R6.")).toBe("arc");
  });

  it("pas działów prowadzi do istniejących stron", () => {
    const tech = new Set(dzialy.map((d) => d.slug));
    for (const { href, label } of CATEGORIES) {
      if (!href) { expect(label).toBe("Pomiar i jakość"); continue; }
      const m = /^\/technologia\/(.+)$/.exec(href);
      if (m) expect(tech.has(m[1]), href).toBe(true);
      else expect(existsSync(`src/app${href}/page.tsx`), href).toBe(true);
    }
  });
});

describe("okno programu — pełne okręgi", () => {
  it("kieszeń ⌀30 płytki i wyspa korpusu rysują się jako pełne okręgi", () => {
    const D = heroDetale();
    const circle = (key: string, line: string) => {
      const d = D.find((x) => x.key === key)!;
      const i = d.code.findIndex((l) => l.t.trim().startsWith(line));
      const s = d.segs.find((g) => g.line === i)!;
      const [x0, y0] = s.pts[0], [x1, y1] = s.pts.at(-1)!;
      const far = Math.max(...s.pts.map(([x, y]) => Math.hypot(x - x0, y - y0)));
      return { closed: Math.hypot(x1 - x0, y1 - y0) < 1e-6, far, cut: s.cut && !s.hole };
    };
    expect(circle("plytka", "G02 I10")).toEqual({ closed: true, far: 20, cut: true });
    expect(circle("korpus", "G02 X58.")).toEqual({ closed: true, far: 26, cut: true });
  });
});

describe("korpus — kieszeń bez pozostawionego materiału", () => {
  it("każdy punkt kieszeni 64 × 44 R10 (poza wyspą ⌀16) jest w zasięgu freza ⌀10", () => {
    const k = heroDetale().find((d) => d.key === "korpus")!;
    const cuts = k.segs.filter((s) => s.cut && s.op === 0).flatMap((s) => s.pts.slice(1).map((p, i) => [s.pts[i], p] as const));
    const dist = (x: number, y: number) => Math.min(...cuts.map(([a, b]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L)) : 0;
      return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
    }));
    const inPocket = (x: number, y: number) => {
      const u = Math.abs(x - 45), v = Math.abs(y - 35);
      if (u > 32 || v > 22) return false;
      if (u > 22 && v > 12 && Math.hypot(u - 22, v - 12) > 9.95) return false; // naroża R10 (brzeg poza próbą)
      return Math.hypot(u, v) > 8; // wyspa ⌀16
    };
    const miss: string[] = [];
    for (let x = 13; x <= 77; x += 0.5) for (let y = 13; y <= 57; y += 0.5) if (inPocket(x, y) && dist(x, y) > 5 + 1e-6) miss.push(`${x},${y}`);
    expect(miss).toEqual([]);
  });
});
