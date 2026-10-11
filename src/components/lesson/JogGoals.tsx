/*
  Cele ćwiczeń JOG (frezarka, tokarka, przesunięcia): bieżący cel na pomarańczowo z licznikiem,
  osiągnięty — na zielono z ✓. Zielony oznacza tylko wykonane (audyt wizualny #31, V06).
*/

export interface JogGoalItem { code: string; label: string }

export function JogTarget({ items, done, win }: { items: JogGoalItem[]; done: number; win: string }) {
  if (items.length === 0) return null;
  const g = items[done];
  if (!g) return <p className="jog-target is-done" aria-live="polite"><span className="jog-target-k">✓ {items.length}/{items.length}</span><span>{win}</span></p>;
  return (
    <p className="jog-target" aria-live="polite">
      <span className="jog-target-k">Cel {done + 1}/{items.length}</span>
      <code>{g.code}</code>
      <span>{g.label}</span>
    </p>
  );
}

export function JogList({ items, done }: { items: JogGoalItem[]; done: number }) {
  if (items.length === 0) return null;
  return (
    <ol className="jog-goals">
      {items.map((q, i) => (
        <li key={i} className={i < done ? "is-done" : i === done ? "is-now" : ""}>
          <span className="jog-goal-n" aria-hidden>{i < done ? "✓" : i + 1}</span>
          <code>{q.code}</code><span>{q.label}</span>
          {i < done && <span className="sr-only"> — osiągnięty</span>}
        </li>
      ))}
    </ol>
  );
}
