// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Świeży moduł (load() zapamiętuje stan) z zadanym zapisem w localStorage. */
async function fresh(stored?: unknown) {
  localStorage.clear();
  if (stored !== undefined) localStorage.setItem("gcat:sim:layout", JSON.stringify(stored));
  vi.resetModules();
  return import("../src/components/simulator/simLayout");
}
/** Bieżący układ przez subskrypcję (useSimLayout wymaga Reacta) — setLayout zapisuje pełny stan. */
const saved = () => JSON.parse(localStorage.getItem("gcat:sim:layout") || "{}");

describe("układ symulatora (V5c): panel, róg, Skupienie", () => {
  beforeEach(() => localStorage.clear());

  it("domyślnie panel z prawej, włączony, bez Skupienia", async () => {
    const m = await fresh();
    expect(m.DEFAULT_LAYOUT).toMatchObject({ hud: true, panel: "right", corner: "tl", panelMin: false, focus: false });
  });

  it("zły zapis miejsca i rogu wraca do domyślnych", async () => {
    const m = await fresh({ panel: "lewo", corner: "zz", hud: false });
    m.setLayout({}); // wymusza odczyt i zapis
    expect(saved()).toMatchObject({ panel: "right", corner: "tl", hud: false });
  });

  it("ustawienia panelu i Skupienia zapisują się w przeglądarce", async () => {
    const m = await fresh();
    m.setLayout({ panel: "over", corner: "br", panelMin: true, focus: true });
    expect(saved()).toMatchObject({ panel: "over", corner: "br", panelMin: true, focus: true });
  });

  it("stary zapis bez nowych pól dostaje wartości domyślne", async () => {
    const m = await fresh({ view: "3d", hud: true, learn: true });
    m.setLayout({});
    expect(saved()).toMatchObject({ view: "3d", panel: "right", corner: "tl", focus: false });
  });
});
