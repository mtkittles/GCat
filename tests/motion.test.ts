import { afterEach, describe, expect, it, vi } from "vitest";
import { autoStartOk } from "@/components/simulator/motion";

/* Audyt Nauki #29, etap 3: demonstracje nie startują same przy „ogranicz ruch”,
   a w lekcjach (tryb „wide”) także na wąskim ekranie. */
const media = (reduce: boolean, narrow: boolean) =>
  vi.stubGlobal("window", {
    matchMedia: (q: string) => ({ matches: q.includes("reduced-motion") ? reduce : q.includes("max-width") ? narrow : false }),
  });

afterEach(() => vi.unstubAllGlobals());

describe("autoStartOk", () => {
  it("bez okna (render po stronie serwera) nie startuje", () => {
    expect(autoStartOk(true)).toBe(false);
  });
  it("autoplay=false nigdy nie startuje", () => {
    media(false, false);
    expect(autoStartOk(false)).toBe(false);
  });
  it("„ogranicz ruch” blokuje każdy tryb", () => {
    media(true, false);
    expect(autoStartOk(true)).toBe(false);
    expect(autoStartOk("wide")).toBe(false);
  });
  it("„wide”: szeroki ekran startuje, telefon nie", () => {
    media(false, false);
    expect(autoStartOk("wide")).toBe(true);
    media(false, true);
    expect(autoStartOk("wide")).toBe(false);
  });
  it("autoplay=true (strona główna) startuje także na telefonie", () => {
    media(false, true);
    expect(autoStartOk(true)).toBe(true);
  });
});
