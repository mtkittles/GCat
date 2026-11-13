import { describe, expect, it } from "vitest";
import { readSimLink, SIM_LINK_MAX, simHref } from "@/lib/simLink";

/* Program w adresie symulatora (paczka Z b): zapis i odczyt muszą dać ten sam program. */
const q = (href: string) => href.slice(href.indexOf("?"));

describe("simLink", () => {
  it("zapis → odczyt: program, tryb, półfabrykat, dialekt, nazwa (polskie znaki i komentarze)", () => {
    const p = { src: "G21 G90 G94 G17\n(ŁUK — ĆWICZENIE)\nG00 X0. Y0.\nM30", mode: "lathe" as const,
      stock: { x: 60, y: 40, z: 20, ox: 0, oy: 20, oz: 20 }, dialect: "sinumerik" as const, name: "G40 G41 G42 — przykład" };
    const href = simHref(p);
    expect(href).toMatch(/^\/symulator\?kod=[A-Za-z0-9_-]+$/);
    expect(readSimLink(q(href))).toEqual(p);
  });
  it("dialekt fanuc i brak półfabrykatu nie trafiają do adresu", () => {
    const href = simHref({ src: "G00 X0.", mode: "mill", dialect: "fanuc" });
    expect(readSimLink(q(href))).toEqual({ src: "G00 X0.", mode: "mill" });
  });
  it("adres bez parametru albo z uszkodzonymi danymi → null", () => {
    expect(readSimLink("")).toBeNull();
    expect(readSimLink("?kod=@@@")).toBeNull();
    expect(readSimLink("?kod=" + btoa('{"src":"G00","mode":"wiertarka"}'))).toBeNull();
    expect(readSimLink("?kod=" + btoa(JSON.stringify({ src: "x".repeat(SIM_LINK_MAX + 1), mode: "mill" })))).toBeNull();
  });
  it("półfabrykat z niepełnymi polami jest pomijany", () => {
    const raw = btoa(JSON.stringify({ src: "G00 X0.", mode: "mill", stock: { x: 10, y: "a" } })).replace(/=+$/, "");
    expect(readSimLink("?kod=" + raw)).toEqual({ src: "G00 X0.", mode: "mill" });
  });
});
