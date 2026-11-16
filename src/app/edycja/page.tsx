import type { Metadata } from "next";
import Link from "next/link";
import AdminGate from "@/components/edycja/AdminGate";
import { EditLink, EditSwitch } from "@/components/edycja/EditMode";
import Rys from "@/components/rys/Rys";
import { rysunki } from "@/components/rys/registry";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";

export const metadata: Metadata = {
  title: "Tryb edycji — GCat",
  description: "Pulpit redakcji: panel treści, rysownik i przyciski „Edytuj” na stronach serwisu.",
  robots: { index: false, follow: false },
};

export default function EdycjaPage() {
  const used = (slug: string) => glossary.filter((g) => g.rysunek === slug).map((g) => g.term);
  return (
    <AdminGate what="Tryb edycji">
    <div className="edit-page">
      <header className="edit-head">
        <h1>Tryb edycji</h1>
        <p>Stąd poprawisz teksty serwisu i narysujesz własne rysunki. Edytujesz na stronie, z podglądem i historią wersji; „Opublikuj” zapisuje zmianę w repozytorium i po 2–3 minutach jest na stronie.</p>
        <EditSwitch />
        <p className="edit-fine">Włączony tryb pokazuje pasek „Edytuj” na dole stron, ołówek przy hasłach i „Edytuj rysunek” pod rysunkami w kartach.</p>
      </header>

      <section aria-labelledby="ed-co">
        <h2 id="ed-co">Co edytujesz i gdzie</h2>
        <div className="edit-tiles">
          <article className="edit-tile">
            <h3>Karty kodów <small>{gcodes.length}</small></h3>
            <p>Opis kodu, składnia, artykuł z przykładami, typowe błędy, źródła. Na stronie karty kliknij „Edytuj tę kartę”.</p>
            <Link className="btn ghost" href="/edytor">Otwórz edytor</Link>
          </article>
          <article className="edit-tile">
            <h3>Słownik <small>{glossary.length}</small></h3>
            <p>Definicja, nazwy zamienne, wzory z przykładem, rysunek, źródła. W słowniku przy każdym haśle jest ołówek.</p>
            <Link className="btn ghost" href="/edytor#slownik">Hasła w edytorze</Link>
          </article>
          <article className="edit-tile is-main">
            <h3>Rysunki <small>{rysunki.length}</small></h3>
            <p>Własne rysunki w stylu serwisu: linie, łuki, wymiary, siatki, opisy. Rysujesz w edytorze karty albo hasła („Narysuj nowy”, „Przerysuj w rysowniku”) — rysunek publikuje się razem z treścią.</p>
            <div className="edit-tile-acts">
              <Link className="btn" href="/edytor">Do edytora</Link>
              <Link className="btn ghost" href="/rysownik">Brudnopis</Link>
            </div>
          </article>
        </div>
        <p className="edit-fine">Lekcje Nauki, zadania i gotowe programy są jeszcze zapisane w kodzie strony. Przeniesienie ich do panelu to następna paczka.</p>
      </section>

      <section aria-labelledby="ed-jak">
        <h2 id="ed-jak">Od poprawki do strony</h2>
        <ol className="edit-steps">
          <li><b>Wejdź na stronę, którą chcesz poprawić,</b> i kliknij „Edytuj tę kartę” na pasku u dołu (albo ołówek przy haśle, „Edytuj rysunek” pod rysunkiem).</li>
          <li><b>Popraw tekst w miejscu</b> — klik w dowolny fragment strony. Rysunki otwierają się w rysowniku nad edytorem, obrazy wgrywasz z komputera.</li>
          <li><b>Sprawdź „Podgląd”</b> (komputer, tablet, telefon) i zakładkę „Kontrola” — z błędami publikacja jest zablokowana, więc strona się nie rozsypie.</li>
          <li><b>Kliknij „Opublikuj”.</b> Zmiana idzie przez gałąź <code>tresci/…</code> i PR, scala się sama i po 2–3 minutach jest na stronie. Każdą wcześniejszą wersję przywrócisz z „Historii”.</li>
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
    </AdminGate>
  );
}
