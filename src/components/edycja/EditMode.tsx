"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { editStore, editTarget, panelUrl, type Kolekcja } from "@/lib/edycja";

export const useEditMode = () => useSyncExternalStore(editStore.subscribe, editStore.get, () => false);

const Pencil = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 16l.8-3.4L13.6 3.8a1.6 1.6 0 0 1 2.3 0l.3.3a1.6 1.6 0 0 1 0 2.3L7.4 15.2z" /><path d="M12.4 5l2.6 2.6" /></svg>
);

/** „Edytuj” przy jednym wpisie (hasło, rysunek). Widoczny tylko w trybie edycji. */
export function EditLink({ kolekcja, slug, label = "Edytuj" }: { kolekcja: Kolekcja; slug: string; label?: string }) {
  const on = useEditMode();
  if (!on) return null;
  return <a className="edit-link" href={panelUrl(kolekcja, slug)}><Pencil />{label}</a>;
}

/** Pasek trybu edycji: przy dolnej krawędzi każdej strony serwisu, tylko gdy tryb jest włączony. */
export function EditBar() {
  const on = useEditMode();
  const path = usePathname() ?? "/";
  if (!on || path.startsWith("/keystatic") || path.startsWith("/rysownik") || path.startsWith("/edytor")) return null;
  const target = editTarget(path);
  return (
    <aside className="edit-bar" aria-label="Tryb edycji">
      <span className="edit-bar-on">Tryb edycji</span>
      {target
        ? <a className="edit-bar-main" href={target.href}><Pencil />{target.label}</a>
        : <span className="edit-bar-note">{path === "/edycja" ? "włączony" : "tej strony nie ma jeszcze w panelu"}</span>}
      <Link href="/edytor" className="edit-bar-desk">Edytor</Link>
      <Link href="/rysownik" className="edit-bar-desk">Rysownik</Link>
      <Link href="/edycja">Pulpit</Link>
      <button type="button" onClick={() => editStore.set(false)} aria-label="Wyłącz tryb edycji" title="Wyłącz tryb edycji">×</button>
    </aside>
  );
}

/** Przełącznik na stronie /edycja. */
export function EditSwitch() {
  const on = useEditMode();
  return (
    <button type="button" role="switch" aria-checked={on} className="edit-switch" onClick={() => editStore.set(!on)}>
      <span className="edit-switch-track" aria-hidden><span /></span>
      <span>{on ? "Tryb edycji jest włączony w tej przeglądarce" : "Włącz tryb edycji w tej przeglądarce"}</span>
    </button>
  );
}
