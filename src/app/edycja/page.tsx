import type { Metadata } from "next";
import Link from "next/link";
import { EditLink, EditSwitch } from "@/components/edycja/EditMode";
import Rys from "@/components/rys/Rys";
import { rysunki } from "@/components/rys/registry";
import { glossary } from "@/lib/content";
import { panelUrl } from "@/lib/edycja";
import { gcodes } from "@/lib/gcodes";

export const metadata: Metadata = {
  title: "Tryb edycji — GCat",
  description: "Pulpit redakcji: panel treści, rysownik i przyciski „Edytuj” na stronach serwisu.",
  robots: { index: false, follow: false },
};

export default function EdycjaPage() {
  const used = (slug: string) => glossary.filter((g) => g.rysunek === slug).map((g) => g.term);
  return (
    <div className="edit-page">
      <header className="edit-head">
        <h1>Tryb edycji</h1>
        <p>Stąd poprawisz teksty serwisu i narysujesz własne rysunki. Każda zmiana trafia do repozytorium jako osobna propozycja (PR) i pojawia się na stronie po scaleniu.</p>
        <EditSwitch />
        <p className="edit-fine">Włączony tryb pokazuje pasek „Edytuj” na dole stron i ołówek przy hasłach. Zapis wymaga zalogowania w panelu przez GitHub.</p>
      </header>

      <section aria-labelledby="ed-co">
        <h2 id="ed-co">Co edytujesz i gdzie</h2>
        <div className="edit-tiles">
          <article className="edit-tile">
            <h3>Karty kodów <small>{gcodes.length}</small></h3>
            <p>Opis kodu, składnia, artykuł z przykładami, typowe błędy, źródła. Na stronie karty kliknij „Edytuj tę kartę”.</p>
            <a className="btn ghost" href={panelUrl("kody")}>Otwórz karty w panelu</a>
          </article>
          <article className="edit-tile">
            <h3>Słownik <small>{glossary.length}</small></h3>
            <p>Definicja, nazwy zamienne, wzory z przykładem, rysunek, źródła. W słowniku przy każdym haśle jest ołówek.</p>
            <a className="btn ghost" href={panelUrl("slownik")}>Otwórz hasła w panelu</a>
          </article>
          <article className="edit-tile is-main">
            <h3>Rysunki <small>{rysunki.length}</small></h3>
            <p>Własne rysunki w stylu serwisu: linie, łuki, wymiary, siatki, opisy. Gotowy rysunek wstawiasz do karty albo hasła.</p>
            <div className="edit-tile-acts">
              <a className="btn" href={panelUrl("rysunki", "create")}>Nowy rysunek</a>
              <Link className="btn ghost" href="/rysownik">Brudnopis</Link>
            </div>
          </article>
        </div>
        <p className="edit-fine">Lekcje Nauki, zadania i gotowe programy są jeszcze zapisane w kodzie strony. Przeniesienie ich do panelu to następna paczka.</p>
      </section>

      <section aria-labelledby="ed-jak">
        <h2 id="ed-jak">Od poprawki do strony</h2>
        <ol className="edit-steps">
          <li><b>Wejdź na stronę, którą chcesz poprawić,</b> i kliknij „Edytuj” na pasku u dołu. Otworzy się dokładnie ten wpis.</li>
          <li><b>Popraw tekst albo otwórz rysownik</b> z pola „Rysunek”. Po „Gotowe” rysunek wraca do wpisu.</li>
          <li><b>Zapisz na gałęzi <code>tresci/…</code>.</b> Na gałęzi <code>main</code> zapis jest zablokowany, więc panel poprosi o nową gałąź i założy PR.</li>
          <li><b>Scal PR na GitHubie.</b> Vercel zbuduje stronę i zmiana jest widoczna po kilku minutach. Przed scaleniem obejrzysz ją na podglądzie gałęzi.</li>
        </ol>
      </section>

      <section aria-labelledby="ed-rys">
        <h2 id="ed-rys">Rysunki z rysownika</h2>
        {rysunki.length === 0 ? <p className="edit-fine">Nie ma jeszcze żadnego rysunku. Zacznij od „Nowy rysunek”.</p> : (
          <div className="edit-figs">
            {rysunki.map((r) => (
              <article key={r.slug} id={`rys-${r.slug}`} className="edit-fig">
                <Rys fig={r} />
                <p className="edit-fig-meta">
                  <code>{r.slug}</code>
                  <span>{used(r.slug).length ? `w słowniku: ${used(r.slug).join(", ")}` : "wstaw do karty blokiem „Rysunek z rysownika” albo wybierz w haśle słownika"}</span>
                  <EditLink kolekcja="rysunki" slug={r.slug} label="Edytuj rysunek" />
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
