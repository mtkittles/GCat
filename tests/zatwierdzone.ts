/*
  Zatwierdzone różnice renderu MDX względem dzisiejszego rich() (decyzje właściciela: 5.10.2026 i 6.10.2026).
  Dziś rich() pokazuje w tych miejscach surową składnię; MDX renderuje to, co autor miał na myśli.
  Testy zamieniają w starym HTML `old` na `new` i wymagają pełnej równości — każda inna różnica = błąd.
*/
export interface Approved { where: string; old: string; new: string }

const term = (k: string) => `<span class="term-wrap"><button type="button" class="term" aria-expanded="false">${k}</button></span>`;

export const ZATWIERDZONE: Approved[] = [
  { where: "g01 — link do kalkulatora", old: "w [kalkulatorze](/kalkulator).", new: 'w <a href="/kalkulator">kalkulatorze</a>.' },
  { where: "g68-g69 — `ROT RPL=30` w pogrubieniu", old: "<strong>`ROT RPL=30`</strong>", new: '<strong><code class="inline-code">ROT RPL=30</code></strong>' },
  { where: "g68-g69 — `AROT RPL=30` w pogrubieniu", old: "<strong>`AROT RPL=30`</strong>", new: '<strong><code class="inline-code">AROT RPL=30</code></strong>' },
  { where: "g84 — `CYCLE84` w pogrubieniu", old: "<strong>`CYCLE84`</strong>", new: '<strong><code class="inline-code">CYCLE84</code></strong>' },
  { where: "g84 — `CYCLE840` w pogrubieniu", old: "<strong>`CYCLE840`</strong>", new: '<strong><code class="inline-code">CYCLE840</code></strong>' },
  // marker [[…]] wewnątrz **…** — dziś widać „[[G17]]” z nawiasami, MDX pokazuje dymek (zatwierdzone 6.10.2026; jedyne 5 takich miejsc w treści)
  { where: "g01 — [[G90]] w pogrubieniu", old: "<strong>Zapomniany powrót do [[G90]]</strong>", new: `<strong>Zapomniany powrót do ${term("G90")}</strong>` },
  { where: "g02/g03 — [[G17]] w pogrubieniu", old: "<strong>[[G17]]</strong>", new: `<strong>${term("G17")}</strong>` },
  { where: "g02/g03 — [[G18]] w pogrubieniu", old: "<strong>[[G18]]</strong>", new: `<strong>${term("G18")}</strong>` },
  { where: "g02/g03 — [[G19]] w pogrubieniu", old: "<strong>[[G19]]</strong>", new: `<strong>${term("G19")}</strong>` },
  { where: "g02/g03 — [[G41]] i [[G42]] w pogrubieniu", old: "<strong>Włączenie [[G41]] lub [[G42]] w bloku z łukiem</strong>", new: `<strong>Włączenie ${term("G41")} lub ${term("G42")} w bloku z łukiem</strong>` },
];

/** `kod` w pogrubieniu: dziś <strong>`X`</strong> (widać backticki), w MDX <strong><code class="inline-code">X</code></strong>. */
const boldCode = (where: string, old: string): Approved => ({
  where, old, new: old.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>'),
});

/*
  DO ZATWIERDZENIA (krok 4, czeka na decyzję właściciela — NIE są zatwierdzone):
  ta sama kategoria co zatwierdzone ROT RPL=30 i CYCLE84 (`kod` w **…**), ale w listach innych kart —
  ujawnione dopiero porównaniem całego buildu (wcześniejszy test obejmował tylko akapity).
*/
export const DO_ZATWIERDZENIA: Approved[] = [
  boldCode("g00 — `G90 G28 Z0` / `G91 G28 Z0` w pogrubieniu", "<strong>`G90 G28 Z0` zamiast `G91 G28 Z0`.</strong>"),
  boldCode("g04 — `G04 P1` w pogrubieniu (1)", "<strong>`G04 P1` na Fanucu to jedna milisekunda</strong>"),
  boldCode("g04 — `G04 P1` / `P1000` w pogrubieniu", "<strong>`G04 P1` zamiast `P1000`.</strong>"),
  boldCode("g04 — `G04 X1` w pogrubieniu", "<strong>`G04 X1` bez kropki na Fanucu.</strong>"),
  boldCode("g04 — `G04 P0.5` w pogrubieniu", "<strong>`G04 P0.5` na Fanucu.</strong>"),
  boldCode("g90-g91 — `G90 G28 Z0.` w pogrubieniu", "<strong>`G90 G28 Z0.`</strong>"),
];

/** Stary HTML z naniesionymi zmianami: zatwierdzonymi (used) i czekającymi na decyzję (pending). */
export function applyApproved(html: string): { html: string; used: string[]; pending: string[] } {
  const used: string[] = [], pending: string[] = [];
  for (const a of ZATWIERDZONE) if (html.includes(a.old)) { html = html.split(a.old).join(a.new); used.push(a.where); }
  for (const a of DO_ZATWIERDZENIA) if (html.includes(a.old)) { html = html.split(a.old).join(a.new); pending.push(a.where); }
  return { html, used, pending };
}

/** id z useId() (aria-controls) zależy od kolejności renderu — pomijany w porównaniach. */
export const normIds = (s: string) => s.replace(/ aria-controls="[^"]*"/g, "");
