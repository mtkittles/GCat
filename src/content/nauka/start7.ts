/*
  Ścieżka startowa „7 dni do pierwszego programu”: plan dzienny z istniejących lekcji frezowania.
  Po tygodniu uczeń zna układ współrzędnych, strukturę programu, ruchy, korekcję długości i cykl wiercenia.
  Każda lekcja planu ma powtórki tylko z lekcji wcześniejszych w tym planie (sprawdza audit:nauka).
*/
export interface StartDay { day: number; title: string; goal: string; lessons: string[]; minutes: number }

export const START7: StartDay[] = [
  { day: 1, title: "Maszyna i zero detalu", goal: "Wiesz, gdzie jest X, Y, Z i skąd program liczy wymiary.", lessons: ["F0.1", "F0.2", "F0.3"], minutes: 38 },
  { day: 2, title: "Jak czytać program", goal: "Rozkładasz blok na słowa i wiesz, które działają dalej.", lessons: ["F1.1", "F1.2", "F1.3"], minutes: 38 },
  { day: 3, title: "Bezpieczny początek", goal: "Piszesz blok startowy i koniec programu, sprawdzając każdy potrzebny tryb.", lessons: ["F1.4", "F1.5", "F2.1"], minutes: 35 },
  { day: 4, title: "Wrzeciono, posuw, chłodziwo", goal: "Liczysz obroty i posuw z katalogu, nie zgadujesz.", lessons: ["F2.2", "F2.3", "F2.4"], minutes: 33 },
  { day: 5, title: "Ruchy: G00 i G01", goal: "Prowadzisz frez po prostokącie z właściwym wejściem w materiał.", lessons: ["F3.1", "F3.2"], minutes: 27 },
  { day: 6, title: "Łuki", goal: "Zaokrąglasz naroża przez R albo I/J i wiesz, kiedy który zapis.", lessons: ["F3.3", "F3.4", "F3.5"], minutes: 36 },
  { day: 7, title: "Długość narzędzia i pierwsze otwory", goal: "Włączasz korekcję długości G43, wiercisz cyklem G81 i wybierasz G98 albo G99 przed przejazdem nad dociskiem.", lessons: ["F4.1", "F5.1", "F5.4"], minutes: 40 },
];
