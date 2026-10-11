import { describe, expect, it } from "vitest";
import { gcodes } from "@/lib/gcodes";
import { sources } from "@/content/nauka/sources";

/* Źródła kart kodów odwołują się do rejestru src/content/nauka/sources.ts — jak w lekcjach. */
describe("źródła kart kodów", () => {
  it("każde id źródła istnieje w rejestrze, a opis „co potwierdza” nie jest pusty", () => {
    const bad = gcodes.flatMap((g) => (g.sources ?? []).filter((s) => !sources[s.id] || !s.where.trim()).map((s) => `${g.slug}: ${s.id}`));
    expect(bad).toEqual([]);
  });
  it("karty ★ mają źródła", () => {
    expect(gcodes.filter((g) => g.star && !g.sources?.length).map((g) => g.slug)).toEqual([]);
  });
});
