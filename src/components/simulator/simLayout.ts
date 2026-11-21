"use client";
import { useSyncExternalStore } from "react";
import { normalizeView, VIEW_MATERIAL, type PathView } from "./pathView";

/*
  Ustawienia układu symulatora: widok, panel „Stan sterowania” (miejsce, róg, zwinięcie), tryb Skupienie,
  podziałka w 3D, śledzenie linii w konsoli, lista opisów linii.
  Zapis w przeglądarce, odporny na brak dostępu do pamięci.
*/

export type SimView = "2d" | "3d" | "split";
export type PanelPlace = "right" | "over";
export type PanelCorner = "tl" | "tr" | "bl" | "br";
/** hud — panel „Stan sterowania” włączony (przycisk Nauka, klawisz P); panel — z prawej albo na podglądzie (róg, zwinięty);
    focus — tryb Skupienie: sam podgląd i pulpit, bez kolumny programu */
export interface SimLayout { view: SimView; hud: boolean; panel: PanelPlace; corner: PanelCorner; panelMin: boolean; focus: boolean; ticks: boolean; follow: boolean; lines: boolean; learn: boolean; zero: boolean; /** klik w linię programu ustawia symulację na tej linii */ jump: boolean; /** warstwy podglądu: tryb Tor/Materiał, zakres toru, G00, kolory */ pv: PathView }

const KEY = "gcat:sim:layout";
export const DEFAULT_LAYOUT: SimLayout = { view: "2d", hud: true, panel: "right", corner: "tl", panelMin: false, focus: false, ticks: false, follow: true, lines: false, learn: false, zero: true, jump: false, pv: VIEW_MATERIAL };
let mem: SimLayout = DEFAULT_LAYOUT, loaded = false;
const subs = new Set<() => void>();

function load(): SimLayout {
  if (loaded) return mem;
  loaded = true;
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || "{}"); mem = {
      ...DEFAULT_LAYOUT, ...v, pv: normalizeView(v?.pv),
      panel: v?.panel === "over" ? "over" : "right",
      corner: ["tl", "tr", "bl", "br"].includes(v?.corner) ? v.corner : "tl",
    }; } catch { mem = DEFAULT_LAYOUT; }
  return mem;
}

export function setLayout(patch: Partial<SimLayout>) {
  mem = { ...load(), ...patch };
  try { window.localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* bez zapisu */ }
  subs.forEach((f) => f());
}

export function useSimLayout(): SimLayout {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, load, () => DEFAULT_LAYOUT);
}
