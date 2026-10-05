import { describe, expect, it } from "vitest";
import type { Program } from "@/lib/parser";
import { defaultSetup, makeTool, type Setup } from "@/components/simulator/setup";
import type { PartSeg } from "@/components/simulator/multiaxis";
import { allChunks, voxCarve, voxChunkMesh, voxInit, voxMeta, voxVolume } from "@/components/simulator/voxel";

const box = { x0: -20, x1: 20, y0: -10, y1: 10, top: 0, bottom: -10, origin: { x: 0, y: 0, z: 0 } };
const prog = { lines: [{ state: { tool: 1 } }] } as unknown as Program;
const setup: Setup = { ...defaultSetup("mill"), tools: { 1: { ...makeTool("endmill"), d: 6, len: 25 } } };
const seg = (from: [number, number, number], to: [number, number, number], axis: [number, number, number]): PartSeg => ({
  kind: "linear", line: 0,
  from: { x: from[0], y: from[1], z: from[2] }, to: { x: to[0], y: to[1], z: to[2] },
  tax: { from: { x: axis[0], y: axis[1], z: axis[2] }, to: { x: axis[0], y: axis[1], z: axis[2] } },
});
const run = (segs: PartSeg[]) => {
  const m = voxMeta(box, 300_000), f = voxInit(m, box);
  const v0 = voxVolume(f, m);
  const lengths = segs.map((s) => Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y, s.to.z - s.from.z));
  const dirty = new Set<number>();
  voxCarve(f, m, segs, lengths, prog, setup, 0, lengths.reduce((a, b) => a + b, 0), dirty);
  return { m, f, removed: v0 - voxVolume(f, m), dirty };
};

describe("ubytek objętościowy (5 osi)", () => {
  it("półfabrykat 40×20×10 ma właściwą objętość", () => {
    const m = voxMeta(box, 300_000);
    expect(voxVolume(voxInit(m, box), m)).toBeGreaterThan(8000 * 0.93);
    expect(voxVolume(voxInit(m, box), m)).toBeLessThan(8000 * 1.07);
  });

  it("rowek z góry: frez Ø6 pionowo, głębokość 2 → ok. 40·6·2 mm³", () => {
    const { removed, dirty } = run([seg([-30, 0, -2], [30, 0, -2], [0, 0, 1])]);
    expect(removed).toBeGreaterThan(480 * 0.8);
    expect(removed).toBeLessThan(480 * 1.25);
    expect(dirty.size).toBeGreaterThan(0);
  });

  it("rowek z boku: oś narzędzia poziomo (−Y), 2 mm w głąb ściany → ta sama objętość", () => {
    const { removed } = run([seg([-30, -8, -5], [30, -8, -5], [0, -1, 0])]);
    expect(removed).toBeGreaterThan(480 * 0.8);
    expect(removed).toBeLessThan(480 * 1.25);
  });

  it("siatka powierzchni powstaje i ma normalne jednostkowe", () => {
    const { m, f } = run([seg([-30, 0, -2], [30, 0, -2], [0, 0, 1])]);
    let tris = 0;
    for (const k of allChunks(m)) {
      const g = voxChunkMesh(f, m, k);
      if (!g) continue;
      tris += g.idx.length / 3;
      for (let i = 0; i < g.nrm.length; i += 3) expect(Math.hypot(g.nrm[i], g.nrm[i + 1], g.nrm[i + 2])).toBeCloseTo(1, 3);
    }
    expect(tris).toBeGreaterThan(1000);
  });
});
