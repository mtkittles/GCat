import { ViewTransition } from "react";

/*
  Remontowany przy każdej nawigacji (Next nadaje szablonowi nowy klucz). Przejście między stronami
  przez View Transitions API: stara treść znika szybko, nowa wchodzi płynnie — powłoka (panel boczny,
  pasek, dok) stoi w miejscu, animuje się tylko obszar treści. Bez obsługi API w przeglądarce — zwykła podmiana.
  CSS: tactile.css, sekcja 11.
*/
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className="page-vt">{children}</div>
    </ViewTransition>
  );
}
