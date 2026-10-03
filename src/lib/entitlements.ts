/*
  Plany konta i funkcje, które od nich zależą. Jedno miejsce do bramkowania w UI.
  Do czasu uruchomienia płatności plan ustawia właściciel w tabeli profiles.
*/
export type Plan = "free" | "pro";

export type Feature = "sync" | "stats" | "certificate" | "multiaxis" | "exports" | "unlimitedPrograms" | "flashcards";

export const FEATURES: Record<Feature, { label: string; desc: string; plan: Plan; soon?: boolean }> = {
  sync: { label: "Postęp na koncie", desc: "Lekcje, testy, zadania i programy zapisane na koncie — na każdym urządzeniu.", plan: "free" },
  stats: { label: "Statystyki nauki", desc: "Zaliczenia, najlepsze wyniki testów, zadania, ostatnia aktywność.", plan: "free" },
  certificate: { label: "Certyfikat ścieżki", desc: "Po zaliczeniu wszystkich testów ścieżki — certyfikat do druku/PDF z numerem.", plan: "pro" },
  multiaxis: { label: "Symulator 4 i 5 osi", desc: "Oś obrotowa A, obróbka 3+2, kinematyka stołu.", plan: "pro", soon: true },
  exports: { label: "Eksport z symulatora", desc: "Tor jako SVG i wynik obróbki 3D jako STL (PNG podglądu jest bezpłatny).", plan: "pro" },
  unlimitedPrograms: { label: "Nielimitowane programy", desc: "Więcej niż 20 zapisanych programów w symulatorze.", plan: "pro", soon: true },
  flashcards: { label: "Fiszki z powtórkami", desc: "Karty kodów i słownik jako fiszki z powtórkami Leitnera (Free: 15 fiszek ze słownika).", plan: "pro" },
};

export const PLAN_LABEL: Record<Plan, string> = { free: "Free", pro: "Pro" };

export const can = (plan: Plan, feature: Feature) => FEATURES[feature].plan === "free" || plan === "pro";
