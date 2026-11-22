import { describe, expect, it } from "vitest";
import { inferTool } from "@/components/simulator/setup";

/* Narzędzie z komentarza przy wywołaniu T (V3.1a): fazowy, teowy/tarczowy, z promieniem naroża — bez zmian dla dotychczasowych opisów. */
describe("inferTool — frezy z artykułów Technologii", () => {
  it("frez fazowy i fazownik", () => {
    expect(inferTool("FREZ FAZOWY FI10 90ST", "mill")).toMatchObject({ kind: "chamfer", d: 10, angle: 90 });
    expect(inferTool("FAZOWNIK FI12 60ST", "mill")).toMatchObject({ kind: "chamfer", d: 12, angle: 60 });
  });
  it("frez teowy i tarczowy z szerokością", () => {
    expect(inferTool("FREZ TEOWY FI20 SZER6", "mill")).toMatchObject({ kind: "tslot", d: 20, len: 6 });
    expect(inferTool("FREZ TARCZOWY FI40", "mill")).toMatchObject({ kind: "tslot", d: 40 });
  });
  it("frez z promieniem naroża", () => {
    expect(inferTool("FREZ FI12 R1.5", "mill")).toMatchObject({ kind: "bullnose", d: 12, corner: 1.5 });
  });
  it("dotychczasowe opisy bez zmian", () => {
    expect(inferTool("FREZ FI10", "mill")).toMatchObject({ kind: "endmill", d: 10 });
    expect(inferTool("FREZ KULISTY FI6", "mill")).toMatchObject({ kind: "ballnose", d: 6 });
    expect(inferTool("GLOWICA FI63 5Z 45ST", "mill")).toMatchObject({ kind: "facemill", d: 63 });
    expect(inferTool("NAWIERTAK FI10 90ST", "mill")).toMatchObject({ kind: "spotdrill" });
    expect(inferTool("FREZ FI10, OSTRZE PRZEZ SRODEK", "mill")).toMatchObject({ kind: "endmill", d: 10 });
    expect(inferTool("FREZ FI12: T1, H1, D1", "mill")).toMatchObject({ kind: "endmill", d: 12 });
  });
});
