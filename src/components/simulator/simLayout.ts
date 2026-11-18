"use client";
import { useSyncExternalStore } from "react";
import { normalizeView, VIEW_MATERIAL, type PathView } from "./pathView";

/*
  Ustawienia układu symulatora (komputer): widok, tabelka na podglądzie,
  podziałka w 3D, śledzenie linii w konsoli, lista opisów linii.
  Zapis w przeglądarce, odporny na brak dostępu do pamięci.
*/

export type SimView = "2d" | "3d" | "split";
export interface SimLayout { view: SimView; hud: boolean; ticks: boolean; follow: boolean; lines: boolean; learn: boolean; zero: boolean; /** klik w linię programu ustawia symulację na tej linii */ jump: boolean; /** warstwy podglądu: tryb Tor/Materiał, zakres toru, G00, kolory */ pv: PathView }

const KEY = "gcat:sim:layout";
export const DEFAULT_LAYOUT: SimLayout = { view: "2d", hud: true, ticks: false, follow: true, lines: false, learn: false, zero: true, jump: false, pv: VIEW_MATERIAL };
let mem: SimLayout = DEFAULT_LAYOUT, loaded = false;
const subs = new Set<() => void>();

function load(): SimLayout {
  if (loaded) return mem;
  loaded = true;
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || "{}"); mem = { ...DEFAULT_LAYOUT, ...v, pv: normalizeView(v?.pv) }; } catch { mem = DEFAULT_LAYOUT; }
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
