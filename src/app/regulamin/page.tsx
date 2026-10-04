import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Regulamin — GCat",
  description: "Zasady korzystania z serwisu edukacyjnego GCat: konto, plany Free i Pro, odpowiedzialność, reklamacje.",
};

export default function TermsPage() {
  return (
    <div className="grid gap-6 max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { label: "Regulamin" }]} />
      <div className="grid gap-2">
        <p className="hero-kicker">Informacje prawne</p>
        <h1 className="text-3xl font-bold">Regulamin serwisu GCat</h1>
        <p className="text-muted">Obowiązuje od: {LEGAL.effective}</p>
      </div>

      <article className="article grid gap-4">
        <h2>1. Postanowienia ogólne</h2>
        <ol>
          <li>Regulamin określa zasady korzystania z serwisu GCat — serwisu edukacyjnego o programowaniu obrabiarek CNC w G‑kodzie, dostępnego pod adresem tej strony.</li>
          <li>Usługodawcą jest: {LEGAL.admin}.</li>
          <li>Regulamin jest regulaminem w rozumieniu ustawy o świadczeniu usług drogą elektroniczną. Korzystając z serwisu, akceptujesz regulamin.</li>
        </ol>

        <h2>2. Usługi</h2>
        <ol>
          <li>Bez konta i bezpłatnie: lekcje, karty kodów, słownik, symulator, zadania, przykładowe programy i kalkulatory.</li>
          <li>Z kontem: zapis postępu nauki, wyników zadań i programów na koncie oraz ich synchronizacja między urządzeniami, statystyki nauki.</li>
          <li>Wymagania techniczne: aktualna przeglądarka internetowa z włączonym JavaScriptem i dostęp do internetu; do konta — adres e‑mail albo konto Google.</li>
        </ol>

        <h2>3. Konto</h2>
        <ol>
          <li>Konto zakładasz, logując się linkiem wysłanym na e‑mail albo przez Google. Umowa o prowadzenie konta zostaje zawarta z chwilą pierwszego logowania, na czas nieokreślony.</li>
          <li>Konto mogą założyć osoby, które ukończyły 16 lat. Osoby młodsze — za zgodą rodzica lub opiekuna.</li>
          <li>Możesz w każdej chwili rozwiązać umowę, usuwając konto przyciskiem „Usuń konto” na stronie <Link href="/konto">Konto</Link>. Usunięcie jest natychmiastowe i nieodwracalne.</li>
          <li>Usługodawca może zablokować lub usunąć konto, które jest używane niezgodnie z prawem albo z regulaminem, po wcześniejszym wezwaniu do zaprzestania naruszeń, chyba że naruszenie jest rażące.</li>
        </ol>

        <h2>4. Plany Free i Pro</h2>
        <ol>
          <li>Plan Free jest bezpłatny. Obejmuje wszystkie materiały edukacyjne, symulator i funkcje konta opisane jako Free na stronie <Link href="/konto/pro">Co daje Pro</Link>.</li>
          <li>Plan Pro dodaje funkcje opisane na tej samej stronie. Płatności za plan Pro nie są jeszcze uruchomione. Przed ich uruchomieniem regulamin zostanie uzupełniony o cenę, sposób płatności, czas trwania subskrypcji i prawo odstąpienia od umowy.</li>
        </ol>

        <h2>5. Charakter materiałów i odpowiedzialność</h2>
        <ol>
          <li><strong>GCat jest materiałem edukacyjnym.</strong> Programy, przykłady, wyniki symulatora i kalkulatorów służą nauce i nie są gotowymi programami produkcyjnymi.</li>
          <li><strong>Nie gwarantujemy, że program z serwisu zadziała poprawnie i bezpiecznie na konkretnej maszynie.</strong> Składnia, cykle i parametry różnią się między sterowaniami (Fanuc, Sinumerik, Heidenhain), modelami maszyn i ich konfiguracją. Symulator nie odtwarza kinematyki, uchwytów, kolizji ani limitów Twojej maszyny.</li>
          <li>Przed uruchomieniem programu na obrabiarce sprawdź go z dokumentacją producenta sterowania i maszyny, wykonaj symulację na sterowaniu, test „na sucho” i pierwszy przebieg z obniżonym posuwem. Za uruchomienie programu na maszynie odpowiada operator.</li>
          <li>Usługodawca nie odpowiada za szkody wynikające z użycia materiałów z serwisu na maszynie, w tym uszkodzenia narzędzi, przedmiotów i maszyn. Wyłączenie nie dotyczy szkód wyrządzonych umyślnie oraz odpowiedzialności, której wobec konsumentów nie można wyłączyć ani ograniczyć.</li>
          <li>Dokładamy starań, żeby serwis działał bez przerw, ale mogą zdarzyć się przerwy techniczne. Kopię swojego postępu możesz w każdej chwili pobrać na stronie konta.</li>
        </ol>

        <h2>6. Zasady korzystania</h2>
        <ol>
          <li>Nie wolno dostarczać treści bezprawnych, w tym w nazwach i treści zapisywanych programów.</li>
          <li>Nie wolno zakłócać działania serwisu ani próbować uzyskać dostępu do cudzych kont lub danych.</li>
          <li>Treści serwisu (teksty, rysunki, programy przykładowe) są chronione prawem autorskim. Możesz z nich korzystać do własnej nauki. Kopiowanie i publikowanie ich w całości lub dużych częściach wymaga zgody usługodawcy.</li>
        </ol>

        <h2>7. Reklamacje</h2>
        <ol>
          <li>Reklamacje dotyczące działania serwisu zgłaszaj na adres usługodawcy z punktu 1. Opisz problem i podaj adres e‑mail konta, jeśli dotyczy konta.</li>
          <li>Odpowiemy w ciągu 14 dni od otrzymania reklamacji.</li>
        </ol>

        <h2>8. Dane osobowe</h2>
        <p>Zasady przetwarzania danych opisuje <Link href="/polityka-prywatnosci">polityka prywatności</Link>.</p>

        <h2>9. Postanowienia końcowe</h2>
        <ol>
          <li>Regulamin może się zmienić, na przykład po uruchomieniu płatności. O zmianach poinformujemy na stronie co najmniej 7 dni przed ich wejściem w życie. Jeśli nie akceptujesz zmian, możesz usunąć konto.</li>
          <li>W sprawach nieuregulowanych stosuje się prawo polskie. Postanowienia regulaminu nie ograniczają praw konsumentów wynikających z bezwzględnie obowiązujących przepisów.</li>
        </ol>
      </article>
    </div>
  );
}
