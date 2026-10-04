import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Polityka prywatności — GCat",
  description: "Jakie dane przetwarza GCat, w jakim celu, komu je powierzamy i jakie masz prawa (RODO).",
};

export default function PrivacyPage() {
  return (
    <div className="grid gap-6 max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { label: "Polityka prywatności" }]} />
      <div className="grid gap-2">
        <p className="hero-kicker">Informacje prawne</p>
        <h1 className="text-3xl font-bold">Polityka prywatności</h1>
        <p className="text-muted">Obowiązuje od: {LEGAL.effective}</p>
      </div>

      <article className="article grid gap-4">
        <p>Ten dokument wyjaśnia, jakie dane osobowe przetwarza serwis GCat, po co, na jakiej podstawie i jakie prawa Ci przysługują zgodnie z RODO (rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).</p>
        <p><strong>Bez konta nie zbieramy żadnych danych osobowych.</strong> Lekcje, karty kodów, symulator, zadania i kalkulatory działają bez logowania, a Twój postęp zostaje wtedy tylko w Twojej przeglądarce.</p>

        <h2>1. Administrator danych</h2>
        <p>Administratorem danych osobowych jest: {LEGAL.admin}. We wszystkich sprawach dotyczących danych możesz pisać na podany adres.</p>

        <h2>2. Jakie dane przetwarzamy</h2>
        <p>Tylko gdy założysz konto i się zalogujesz:</p>
        <ul>
          <li><strong>Adres e‑mail</strong> — identyfikuje konto i służy do logowania linkiem.</li>
          <li><strong>Nazwa wyświetlana</strong> — przy logowaniu przez Google: imię i nazwisko z konta Google; przy logowaniu e‑mailem: część adresu przed znakiem @. Możesz ją zmienić.</li>
          <li><strong>Dane z konta Google</strong> przy logowaniu przez Google — identyfikator konta Google, imię i nazwisko oraz adres zdjęcia profilowego, przekazane przez Google w trakcie logowania. Nie mamy dostępu do Twojego hasła Google.</li>
          <li><strong>Postęp nauki</strong> — które lekcje otwierasz i kiedy, oznaczenia „przeczytana”, najlepsze wyniki testów.</li>
          <li><strong>Wyniki zadań</strong> — które zadania programistyczne zaliczyłeś.</li>
          <li><strong>Zapisane programy</strong> — programy z symulatora (nazwa, treść G‑kodu, tryb frezowanie/toczenie, data zmiany).</li>
          <li><strong>Plan konta</strong> — Free albo Pro.</li>
          <li><strong>Dane techniczne</strong> — adres IP, typ przeglądarki i czas żądania zapisywane w dziennikach serwera i usługi logowania, potrzebne do działania i bezpieczeństwa serwisu.</li>
        </ul>

        <h2>3. Cele i podstawy prawne</h2>
        <ul>
          <li><strong>Prowadzenie konta i synchronizacja postępu między urządzeniami</strong> — wykonanie umowy o świadczenie usługi drogą elektroniczną (art. 6 ust. 1 lit. b RODO), na zasadach z <Link href="/regulamin">regulaminu</Link>.</li>
          <li><strong>Bezpieczeństwo serwisu</strong>, w tym wykrywanie nadużyć i obsługa błędów — prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO).</li>
          <li><strong>Odpowiedzi na Twoje wiadomości i wnioski dotyczące danych</strong> — wypełnienie obowiązku prawnego (art. 6 ust. 1 lit. c RODO) oraz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).</li>
        </ul>
        <p>Podanie danych jest dobrowolne, ale bez adresu e‑mail nie da się założyć konta. Nie podejmujemy wobec Ciebie decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowania.</p>

        <h2>4. Komu powierzamy dane</h2>
        <p>Korzystamy z dostawców, którzy przetwarzają dane w naszym imieniu (podmioty przetwarzające) na podstawie umów powierzenia:</p>
        <ul>
          <li><strong>Supabase Inc.</strong> — baza danych i logowanie. Dane konta są przechowywane w regionie {LEGAL.supabaseRegion}.</li>
          <li><strong>Vercel Inc.</strong> — hosting strony i obsługa żądań, w tym dzienniki serwera.</li>
        </ul>
        <p><strong>Google Ireland Ltd.</strong> uczestniczy w logowaniu tylko wtedy, gdy wybierzesz „Zaloguj przez Google”. Google przetwarza wtedy dane jako odrębny administrator, na zasadach własnej polityki prywatności.</p>
        <p>Supabase i Vercel to firmy z USA. Jeśli dane trafiają poza Europejski Obszar Gospodarczy, odbywa się to na podstawie standardowych klauzul umownych zatwierdzonych przez Komisję Europejską lub decyzji o odpowiednim stopniu ochrony (EU‑US Data Privacy Framework), zgodnie z umowami tych dostawców.</p>
        <p>Nie sprzedajemy danych i nie udostępniamy ich nikomu w celach marketingowych.</p>

        <h2>5. Jak długo przechowujemy dane</h2>
        <ul>
          <li><strong>Dane konta</strong> (e‑mail, nazwa, postęp, wyniki, programy) — do czasu usunięcia konta. Konto usuniesz sam na stronie <Link href="/konto">Konto</Link> przyciskiem „Usuń konto”; dane znikają z bazy od razu.</li>
          <li><strong>Dzienniki techniczne</strong> — przez krótki okres określony przez dostawców (Supabase, Vercel), potrzebny do działania i bezpieczeństwa serwisu.</li>
          <li><strong>Korespondencja</strong> — przez czas potrzebny do załatwienia sprawy, a potem do upływu okresu przedawnienia ewentualnych roszczeń.</li>
        </ul>

        <h2>6. Twoje prawa</h2>
        <p>Masz prawo do:</p>
        <ul>
          <li><strong>dostępu</strong> do swoich danych i otrzymania ich kopii,</li>
          <li><strong>sprostowania</strong> danych nieprawidłowych,</li>
          <li><strong>usunięcia</strong> danych — najszybciej przyciskiem „Usuń konto” na stronie konta,</li>
          <li><strong>ograniczenia przetwarzania</strong>,</li>
          <li><strong>przenoszenia danych</strong> — na stronie konta pobierzesz swój postęp i programy jako plik JSON,</li>
          <li><strong>sprzeciwu</strong> wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
          <li><strong>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych</strong> (ul. Stawki 2, 00‑193 Warszawa, uodo.gov.pl), jeśli uważasz, że przetwarzamy dane niezgodnie z prawem.</li>
        </ul>
        <p>Pozostałe wnioski wyślij na adres administratora z punktu 1. Odpowiemy bez zbędnej zwłoki, najpóźniej w ciągu miesiąca.</p>

        <h2>7. Pamięć przeglądarki i ciasteczka</h2>
        <p>GCat <strong>nie używa ciasteczek reklamowych ani analitycznych</strong> i nie śledzi Cię między stronami. Nie ma tu reklam, pikseli śledzących ani narzędzi statystyk odwiedzin. Czcionki są serwowane z naszej domeny, bez zapytań do zewnętrznych serwerów.</p>
        <p>W pamięci przeglądarki (localStorage) zapisujemy tylko dane potrzebne do działania strony. Zostają na Twoim urządzeniu, dopóki ich nie usuniesz:</p>
        <ul>
          <li>postęp nauki, zaliczone zadania, zapisane programy i fiszki,</li>
          <li>ustawienia: motyw jasny/ciemny, układ symulatora, filtry listy kodów,</li>
          <li>po zalogowaniu — token sesji logowania (Supabase), żeby nie trzeba było logować się przy każdej wizycie.</li>
        </ul>
        <p>To przechowywanie jest niezbędne do świadczenia usługi, o którą prosisz, więc zgodnie z ustawą Prawo komunikacji elektronicznej nie wymaga osobnej zgody. Dane usuniesz, czyszcząc dane witryny w ustawieniach przeglądarki.</p>

        <h2>8. Zmiany polityki</h2>
        <p>Gdy zmienimy sposób przetwarzania danych, na przykład po uruchomieniu płatności za plan Pro, zaktualizujemy ten dokument i datę na górze strony. O istotnych zmianach poinformujemy zalogowanych użytkowników na stronie konta.</p>
      </article>
    </div>
  );
}
