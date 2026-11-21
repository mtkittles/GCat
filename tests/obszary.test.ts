import { describe, expect, it } from "vitest";
import { bento, isObszar, isOn, obszarOf, OBSZAR, OBSZARY, onTrail, treeOf, type TechData } from "@/lib/obszary";
import { PREFS_SCRIPT } from "@/lib/ui/prefs";
import { rpm } from "@/components/obszary/previews";
import { dzialy, publicArts } from "@/lib/technologia";

const tech: TechData = {
  dzialy: dzialy.map(({ slug, title, icon }) => ({ slug, title, icon })),
  arts: publicArts.map(({ dzial, slug, title, order }) => ({ dzial, slug, title, order })),
};

describe("obszary nauki (V3.0b)", () => {
  it("trzy obszary, Pomiar i jakość zapowiedziany bez adresu", () => {
    expect(OBSZARY).toEqual(["cnc", "tech", "pomiar"]);
    expect(OBSZAR.pomiar.soon).toBe(true);
    expect(OBSZAR.pomiar.href).toBeNull();
    expect(isObszar("tech")).toBe(true);
    expect(isObszar("x")).toBe(false);
  });

  it("obszar strony po prefiksie adresu; strony wspólne bez obszaru", () => {
    expect(obszarOf("/nauka/frezowanie/f1-1")).toBe("cnc");
    expect(obszarOf("/kody/g00")).toBe("cnc");
    expect(obszarOf("/technologia/narzedzia/frez-trzpieniowy-walcowy")).toBe("tech");
    expect(obszarOf("/technologiax")).toBeNull();
    expect(obszarOf("/kalkulator")).toBeNull();
    expect(obszarOf("/")).toBeNull();
  });

  it("drzewo Technologii: przegląd + wszystkie działy z artykułami jako dziećmi", () => {
    const t = treeOf("tech", tech);
    expect(t[0]).toMatchObject({ href: "/technologia", exact: true });
    expect(t.slice(1).map((n) => n.href)).toEqual(dzialy.map((d) => `/technologia/${d.slug}`));
    const narz = t.find((n) => n.href === "/technologia/narzedzia")!;
    expect(narz.n).toBe(narz.children?.length);
    expect(narz.children?.[0].href).toBe("/technologia/narzedzia/frez-trzpieniowy-walcowy");
  });

  it("aktywny węzeł i ścieżka; „Przegląd” tylko przy dokładnym adresie", () => {
    const t = treeOf("tech", tech);
    const path = "/technologia/narzedzia/frez-trzpieniowy-walcowy";
    expect(isOn(path, t[0])).toBe(false);
    expect(isOn("/technologia", t[0])).toBe(true);
    const narz = t.find((n) => n.href === "/technologia/narzedzia")!;
    expect(onTrail(path, narz)).toBe(true);
    expect(onTrail(path, t.find((n) => n.href === "/technologia/obliczenia")!)).toBe(false);
  });

  it("drzewo CNC: Nauka z frezowaniem i toczeniem; Pomiar — same zapowiedzi", () => {
    const c = treeOf("cnc", tech);
    expect(c[0].children?.map((n) => n.href)).toEqual(["/nauka/frezowanie", "/nauka/toczenie"]);
    expect(treeOf("pomiar", tech).every((n) => n.href === null)).toBe(true);
  });

  it("bento: dział big jako kafel 4 × 2, dwa obok, rzędy po trzy, reszta pasem", () => {
    const spans = bento(dzialy).map((x) => `${x.item.slug}:${x.span}`);
    expect(spans[0]).toBe("narzedzia:hero");
    expect(bento(dzialy).filter((x) => x.span === "hero")).toHaveLength(1);
    const ids = (n: number, big = -1) => Array.from({ length: n }, (_, i) => ({ big: i === big }));
    expect(bento(ids(7, 0)).map((x) => x.span)).toEqual(["hero", "c2", "c2", "c2", "c2", "c2", "c6"]);
    expect(bento(ids(5, 2)).map((x) => x.span)).toEqual(["hero", "c2", "c2", "c3", "c3"]);
    expect(bento(ids(4)).map((x) => x.span)).toEqual(["c2", "c2", "c2", "c6"]);
  });

  it("wybór obszaru zapamiętany i ustawiany przed malowaniem", () => {
    expect(PREFS_SCRIPT).toContain('g("gcat:obszar")');
    expect(PREFS_SCRIPT).toContain('"data-obszar"');
  });

  it("podgląd obliczeń: n = 1000·Vc/(π·D)", () => {
    expect(rpm(150, 10)).toBe(4775);
    expect(rpm(150, 6)).toBe(7958);
  });
});
