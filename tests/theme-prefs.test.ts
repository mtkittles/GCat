// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PREFS_SCRIPT, THEME_COLOR, setTheme, setSidebarCollapsed } from "../src/lib/ui/prefs";
import { switchTheme, toggleTheme } from "../src/lib/ui/themeSwitch";

const d = () => document.documentElement;
const flush = () => new Promise((r) => setTimeout(r, 0)); // MutationObserver → mikrozadanie
const meta = () => document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

// Każde boot() uruchamia skrypt od nowa — obserwatory z poprzednich testów odłączamy.
const observers: MutationObserver[] = [];
const MO = globalThis.MutationObserver;
globalThis.MutationObserver = class extends MO {
  constructor(cb: MutationCallback) { super(cb); observers.push(this); }
};

/** Stan jak po wczytaniu strony: <html data-theme="dark"> z layoutu, potem skrypt PREFS_SCRIPT. */
function boot() {
  observers.splice(0).forEach((o) => o.disconnect());
  for (const a of [...d().attributes]) d().removeAttributeNode(a);
  d().setAttribute("data-theme", "dark");
  document.head.innerHTML = "";
  delete window.__gcatPrefs;
  new Function(PREFS_SCRIPT)();
}

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("PREFS_SCRIPT — start i strażnik atrybutów", () => {
  it("bez zapisu: ciemny, meta theme-color ciemna", () => {
    boot();
    expect(d().dataset.theme).toBe("dark");
    expect(meta()).toBe(THEME_COLOR.dark);
  });

  it("zapisany jasny motyw wchodzi przed malowaniem razem z kolorem paska", () => {
    localStorage.setItem("theme", "light");
    boot();
    expect(d().dataset.theme).toBe("light");
    expect(meta()).toBe(THEME_COLOR.light);
  });

  it("gdy React odbuduje <html> (usuwa atrybuty, wstawia data-theme=dark), wybór wraca", async () => {
    localStorage.setItem("theme", "light");
    localStorage.setItem("gcat:sound", "1");
    boot();
    for (const a of [...d().attributes]) d().removeAttributeNode(a);
    d().setAttribute("data-theme", "dark");
    await flush();
    expect(d().dataset.theme).toBe("light");
    expect(d().dataset.sound).toBe("1");
    expect(d().dataset.sb).toMatch(/^[ce]$/);
  });

  it("zmiana motywu przyciskiem nie jest cofana, także gdy zapis w localStorage się nie uda", async () => {
    boot();
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("pełny"); });
    setTheme("light");
    await flush();
    expect(d().dataset.theme).toBe("light");
    expect(meta()).toBe(THEME_COLOR.light);
    spy.mockRestore();
  });

  it("panel boczny: wybór zostaje, zapis trafia do localStorage", async () => {
    boot();
    setSidebarCollapsed(false);
    await flush();
    expect(d().dataset.sb).toBe("e");
    expect(localStorage.getItem("gcat:sb")).toBe("e");
  });
});

describe("toggleTheme / switchTheme", () => {
  it("jedno stuknięcie przełącza raz — drugie wywołanie w ciągu 400 ms jest pomijane", async () => {
    boot();
    toggleTheme();
    toggleTheme();
    await flush();
    expect(d().dataset.theme).toBe("light");
  });

  it("kolejne stuknięcie po przerwie przełącza z powrotem (czyta motyw z <html>)", async () => {
    boot();
    const now = vi.spyOn(performance, "now");
    now.mockReturnValue(10_000);
    toggleTheme();
    now.mockReturnValue(10_600);
    toggleTheme();
    await flush();
    expect(d().dataset.theme).toBe("dark");
    now.mockRestore();
  });

  it("WebKit (Safari, iPhone): bez View Transitions, zmiana od razu", () => {
    boot();
    const vt = vi.fn();
    Object.assign(document, { startViewTransition: vt });
    const vendor = vi.spyOn(navigator, "vendor", "get").mockReturnValue("Apple Computer, Inc.");
    switchTheme("light");
    expect(vt).not.toHaveBeenCalled();
    expect(d().dataset.theme).toBe("light");
    vendor.mockRestore();
    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });
});
