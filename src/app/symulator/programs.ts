"use client";

/*
  Programy użytkownika przechowywane w przeglądarce. Pozwalają wrócić do pracy
  po odświeżeniu strony i trzymać kilka plików otwartych w zakładkach.
*/

export interface StoredProgram {
  id: string;
  name: string;
  src: string;
  mode: "mill" | "lathe";
  updated: number;
}

const KEY = "gcat:programy";
const ACTIVE = "gcat:programy:aktywny";

export function loadPrograms(): StoredProgram[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as StoredProgram[]) : [];
    return Array.isArray(list) ? list.filter((p) => p && typeof p.src === "string") : [];
  } catch { return []; }
}

export function savePrograms(list: StoredProgram[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20))); } catch {}
}

export function loadActiveId(): string | null {
  try { return localStorage.getItem(ACTIVE); } catch { return null; }
}

export function saveActiveId(id: string) {
  try { localStorage.setItem(ACTIVE, id); } catch {}
}

export const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
