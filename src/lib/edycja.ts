/*
  Tryb edycji (paczka RA): przełącznik w przeglądarce właściciela strony + adresy wpisów w panelu treści.
  Przełącznik tylko pokazuje przyciski „Edytuj”. Uprawnienia sprawdza panel (logowanie przez GitHub),
  więc włączenie trybu przez kogoś obcego nie daje mu nic poza linkiem do ekranu logowania.
*/
export const EDIT_KEY = "gcat:edycja";
const EVENT = "gcat:edycja";

export type Kolekcja = "kody" | "slownik" | "rysunki";
/** lokalnie panel pisze na dysk i nie ma gałęzi w adresie; na produkcji startuje od gałęzi main */
const BASE = process.env.NODE_ENV === "development" ? "/keystatic" : "/keystatic/branch/main";

export function panelUrl(kolekcja?: Kolekcja, slug?: string | "create"): string {
  if (!kolekcja) return BASE;
  if (!slug) return `${BASE}/collection/${kolekcja}`;
  return slug === "create" ? `${BASE}/collection/${kolekcja}/create` : `${BASE}/collection/${kolekcja}/item/${encodeURIComponent(slug)}`;
}

/** Strona serwisu → wpis w panelu, który ją tworzy. null = tej strony nie edytuje się jeszcze w panelu. */
export function editTarget(pathname: string): { href: string; label: string } | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  const kod = p.match(/^\/kody\/([^/]+)$/);
  if (kod) return { href: `/edytor/kody/${kod[1]}`, label: "Edytuj tę kartę" };
  if (p === "/kody") return { href: "/edytor", label: "Edytor treści" };
  if (p === "/slownik") return { href: "/edytor#slownik", label: "Hasła w edytorze" };
  return null;
}

export const editStore = {
  subscribe(cb: () => void) {
    window.addEventListener("storage", cb);
    window.addEventListener(EVENT, cb);
    return () => { window.removeEventListener("storage", cb); window.removeEventListener(EVENT, cb); };
  },
  get(): boolean { try { return localStorage.getItem(EDIT_KEY) === "1"; } catch { return false; } },
  set(on: boolean) {
    try { if (on) localStorage.setItem(EDIT_KEY, "1"); else localStorage.removeItem(EDIT_KEY); } catch { /* tryb prywatny: przełącznik działa do zamknięcia karty */ }
    window.dispatchEvent(new Event(EVENT));
  },
};
