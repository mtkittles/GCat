import type { ReactNode } from "react";
import StatusLed from "@/components/tactile/StatusLed";

/*
  Pusty stan w jednym stylu w całym serwisie: dioda „czuwanie”, krótki tytuł, podpowiedź i akcja.
  Używany tam, gdzie filtr albo wyszukiwanie nic nie zwraca (kody, słownik, szukaj, zadania, paleta).
*/
export default function EmptyState({ title, children, action, compact = false }: { title: string; children?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={`empty${compact ? " is-compact" : ""}`} role="status">
      <span className="empty-k"><StatusLed state="idle" pulse={false} />Brak wyników</span>
      <p className="empty-t">{title}</p>
      {children && <p className="empty-h">{children}</p>}
      {action && <div className="empty-a">{action}</div>}
    </div>
  );
}
