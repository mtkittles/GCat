/*
  Zatwierdzone różnice renderu MDX względem dzisiejszego rich() (decyzja właściciela, 5.10.2026).
  Dziś rich() pokazuje w tych miejscach surową składnię; MDX renderuje to, co autor miał na myśli.
  Testy zamieniają w starym HTML `old` na `new` i wymagają pełnej równości — każda inna różnica = błąd.
*/
export interface Approved { where: string; old: string; new: string }

export const ZATWIERDZONE: Approved[] = [
  { where: "g01 — link do kalkulatora", old: "w [kalkulatorze](/kalkulator).", new: 'w <a href="/kalkulator">kalkulatorze</a>.' },
  { where: "g68-g69 — `ROT RPL=30` w pogrubieniu", old: "<strong>`ROT RPL=30`</strong>", new: '<strong><code class="inline-code">ROT RPL=30</code></strong>' },
  { where: "g68-g69 — `AROT RPL=30` w pogrubieniu", old: "<strong>`AROT RPL=30`</strong>", new: '<strong><code class="inline-code">AROT RPL=30</code></strong>' },
  { where: "g84 — `CYCLE84` w pogrubieniu", old: "<strong>`CYCLE84`</strong>", new: '<strong><code class="inline-code">CYCLE84</code></strong>' },
  { where: "g84 — `CYCLE840` w pogrubieniu", old: "<strong>`CYCLE840`</strong>", new: '<strong><code class="inline-code">CYCLE840</code></strong>' },
];

const term = (k: string) => `<span class="term-wrap"><button type="button" class="term" aria-expanded="false">${k}</button></span>`;

/*
  DO ZATWIERDZENIA (pilot 7d, czeka na decyzję właściciela — NIE są zatwierdzone):
  marker [[…]] wewnątrz **…**. Dziś rich() nie przetwarza markerów w pogrubieniu i strona pokazuje
  dosłownie „[[G17]]” z nawiasami; MDX pokazuje dymek. W całej treści jest dokładnie 5 takich miejsc,
  wszystkie w kartach pilota (g01, g02, g03 — g02 i g03 ze wspólnego szablonu).
*/
export const DO_ZATWIERDZENIA: Approved[] = [
  { where: "g01 — [[G90]] w pogrubieniu", old: "<strong>Zapomniany powrót do [[G90]]</strong>", new: `<strong>Zapomniany powrót do ${term("G90")}</strong>` },
  { where: "g02/g03 — [[G17]] w pogrubieniu", old: "<strong>[[G17]]</strong>", new: `<strong>${term("G17")}</strong>` },
  { where: "g02/g03 — [[G18]] w pogrubieniu", old: "<strong>[[G18]]</strong>", new: `<strong>${term("G18")}</strong>` },
  { where: "g02/g03 — [[G19]] w pogrubieniu", old: "<strong>[[G19]]</strong>", new: `<strong>${term("G19")}</strong>` },
  { where: "g02/g03 — [[G41]] i [[G42]] w pogrubieniu", old: "<strong>Włączenie [[G41]] lub [[G42]] w bloku z łukiem</strong>", new: `<strong>Włączenie ${term("G41")} lub ${term("G42")} w bloku z łukiem</strong>` },
];

/** Stary HTML z naniesionymi zmianami (zatwierdzonymi i czekającymi na zatwierdzenie) + lista użytych. */
export function applyApproved(html: string): { html: string; used: string[]; pending: string[] } {
  const used: string[] = [], pending: string[] = [];
  for (const a of ZATWIERDZONE) if (html.includes(a.old)) { html = html.split(a.old).join(a.new); used.push(a.where); }
  for (const a of DO_ZATWIERDZENIA) if (html.includes(a.old)) { html = html.split(a.old).join(a.new); pending.push(a.where); }
  return { html, used, pending };
}

/** id z useId() (aria-controls) zależy od kolejności renderu — pomijany w porównaniach. */
export const normIds = (s: string) => s.replace(/ aria-controls="[^"]*"/g, "");
