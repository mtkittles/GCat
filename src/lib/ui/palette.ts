"use client";
import { useSyncExternalStore } from "react";

/* Stan palety poleceń (Ctrl+K) wspólny dla panelu bocznego, paska i doku — bez kontekstu Reacta. */
let open = false;
const subs = new Set<() => void>();

export function setPaletteOpen(v: boolean) { if (open !== v) { open = v; subs.forEach((s) => s()); } }
export const openPalette = () => setPaletteOpen(true);

export function usePaletteOpen() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => open, () => false);
}

/** Etykieta skrótu: ⌘K na Macu, Ctrl K gdzie indziej (po stronie serwera — Ctrl K). */
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export function useModKey() {
  return useSyncExternalStore(() => () => {}, () => (isMac() ? "⌘" : "Ctrl"), () => "Ctrl");
}

/** Pole edycyjne lub edytor (CodeMirror, TipTap) — tam skróty powłoki nie działają. */
export function isEditing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el || !el.closest) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest(".cm-editor, .ProseMirror, [contenteditable='true']");
}
