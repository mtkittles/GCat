// Remontowany przy każdej nawigacji — daje płynne wejście treści przy zmianie zakładki.
// Czysty CSS (klasa page-enter), bez stanu.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
