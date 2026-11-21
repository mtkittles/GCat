import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { HERO_SRC, heroLines } from "@/components/pulpit/heroProgram";
import { CATEGORIES } from "@/components/pulpit/CategoryMarquee";
import { dzialy } from "@/lib/technologia";

describe("pulpit V3.1", () => {
  it("program w animacji przechodzi walidator bez uwag", () => {
    const issues = validate(parseProgram(HERO_SRC), "fanuc", { minX: 0, maxX: 60, minY: 0, maxY: 50, top: 0, bottom: -20 }, undefined, 5);
    expect(issues).toEqual([]);
  });

  it("tor z parsera: linia na blok, łuk R10 jako krzywa, pozycja końcowa na Z50", () => {
    const L = heroLines();
    expect(L).toHaveLength(HERO_SRC.split("\n").length);
    const arc = L.find((l) => l.text.startsWith("G02"))!;
    expect(arc.kind).toBe("arc");
    expect(arc.pts.length).toBeGreaterThan(10);
    expect(arc.pts.at(-1)).toEqual([10, 50]);
    expect(L.find((l) => l.text.startsWith("G43"))!.kind).toBe("rapid");
    expect(L.find((l) => l.text === "Z5.")!.pts).toEqual([]); // sam ruch w Z
    expect(L.at(-2)!.pos).toEqual([-20, -10, 50]);
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
