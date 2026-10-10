import { describe, expect, it } from "vitest";
import { partFeatures } from "@/content/nauka/partstate";
import { buildup } from "@/content/nauka/buildup";
import { orderOf, type Track } from "@/lib/course";

/* Rysunek stanu detalu musi iść w parze z programem narastającym:
   każdy element pojawia się w lekcji, która dopisuje do programu jakąś linię. */
describe("stan detalu przewodniego", () => {
  for (const track of ["frezowanie", "toczenie"] as Track[]) {
    it(`${track}: lekcje elementów istnieją, idą po kolei i mają linie w programie`, () => {
      const feats = partFeatures[track];
      const at = feats.map((f) => orderOf(track, f.since));
      expect(at.every((i) => i >= 0)).toBe(true);
      expect([...at].sort((a, b) => a - b)).toEqual(at);
      for (const f of feats) expect(buildup[track].lines.some((l) => l.since === f.since)).toBe(true);
    });
  }
});
