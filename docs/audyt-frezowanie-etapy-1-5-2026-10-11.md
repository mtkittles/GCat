# Audyt działu Nauka — frezowanie, etapy 1–5

Data: 11 października 2026 r. Strona: https://gcat-alpha.vercel.app/nauka/frezowanie. Wersja widoczna w stopce i użyta do odczytu źródeł: **9447bdc**, pełny commit `9447bdc4a0130431a2dbb603c91671a0d9f881f4`.

Raport obejmuje treść, język techniczny, logikę ćwiczeń, geometrię schematów i układ lekcji. Jest dokumentem do zaplanowania zmian; nie wprowadza poprawek w aplikacji.

## 1. Zakres i sposób sprawdzenia

„Etapy 1–5” interpretuję zgodnie z numeracją aktualnego planu na stronie. To **20 z 33 lekcji**, czyli około 61% ścieżki. Nie jest to zestaw modułów F1–F5.

| Etap na stronie | Moduł | Lekcje objęte audytem |
|---|---|---|
| 1 | Podstawy | FP.1–FP.3 |
| 2 | F0 — Maszyna | F0.1–F0.3 |
| 3 | F1 — Struktura programu | F1.1–F1.5 |
| 4 | F2 — Wrzeciono i narzędzie | F2.1–F2.4 |
| 5 | F3 — Ruchy | F3.1–F3.5 |

Przeczytałem komplet aktualnych treści tych 20 lekcji: teorię, rozwiązania przykładów, polecenia, podpowiedzi, wzorce i pytania. Sprawdziłem stronę w przeglądarce na komputerze, w ciemnym motywie, przy oknie około 1363 × 936 px. Obejrzałem główne rysunki przykładów F0, F2 i F3 oraz schematy nowych Podstaw. Rysunki F1 były objęte wcześniejszym pilotażem; aktualny tekst wszystkich pięciu lekcji F1 jest identyczny z tekstem pilotażu. Ponadto przeanalizowałem źródła SVG modułów Podstawy, F0, F2 i F3, mapowanie diagramów oraz kod sprawdzania zadań i quizów.

Wizualna ocena nie oznacza obejrzenia każdego dodatkowego diagramu w każdym rozmiarze ekranu. Część uwag do pomocniczych rysunków wynika z analizy SVG. Ten raport **nie potwierdza czytelności wszystkich 20 lekcji na telefonie i w jasnym motywie**. Aktualny commit zawiera osobny raport dostępności `docs/przeglad-dostepnosci.md` i poprawki kontrastu; nie przedstawiam ich pomiarów jako swoich. Automatyczny pomiar kontrastu nie rozstrzyga czytelności napisów wewnątrz SVG.

Trzy nowe błędne rozwiązania sprawdziłem bezpośrednio przyciskiem „Sprawdź program”: F2.1, F3.1 i F3.5. Wszystkie dostały „Zaliczone”. Trzy wcześniejsze kontrprzykłady F1 pozostają istotne, ponieważ treść ich warunków nie została zmieniona. Rozróżniam te obserwacje od ryzyk wywnioskowanych wyłącznie z kodu walidatora. Nie przeprowadzałem prób na obrabiarce.

Zakładka Kody, toczenie i etapy 6–10 są poza zakresem. Wspólne diagramy i porównania sterowań oceniam tylko wtedy, gdy występują w audytowanych lekcjach.

### Znaczenie priorytetów

- **P1 — poprawić najpierw:** treść może uczyć błędnej zasady, przykład jest sprzeczny z geometrią lub zadanie zalicza niespełnienie istotnego warunku.
- **P2 — poprawić podczas redakcji modułu:** nieprecyzyjny termin, brak założeń, słabe polecenie albo istotna trudność interpretacji rysunku.
- **P3 — dopracowanie:** czytelność, skrócenie, układ, dodatkowa pomoc.
- **Do weryfikacji:** zależność od konkretnej maszyny, sterowania, narzędzia lub nieodnalezionej instrukcji. To nie jest rozstrzygnięty błąd.

## 2. Najważniejsze ustalenia

Podstawowa struktura kursu jest dobra: cel → wyjaśnienie → przykład → własna próba → pułapki → sprawdzenie. Obliczenia współrzędnych, obrotów, posuwu i większość geometrii łuków są poprawne. Strona ma już potrzebny moduł Podstawy; wcześniejszy pomysł dopisania wstępu o maszynie, narzędziu i zamocowaniu został w dużej części zrealizowany.

Największe problemy dotyczą powiązania **opisu z rzeczywistym stanem obróbki** i **zaliczenia z celem zadania**. Część tekstu brzmi sztucznie, ponieważ zastępuje warunki techniczne kategorycznym skutkiem: coś „zawsze”, „nigdy”, „tylko” powoduje konkretną awarię. Nie ma podstaw do przypisywania autorstwa AI na podstawie stylu. Można natomiast wskazać zdania nienaturalne, zbyt potoczne lub technicznie nadmiernie pewne.

| Priorytet | Ustalenie | Gdzie | Co zmienić |
|---|---|---|---|
| P1 | Tor frezu Ø10 na X−5 jest styczny do krawędzi X0; przy półfabrykacie 80 × 50 brak określonej warstwy do zebrania | F2.3, F3.2, wspólne zadania konturowe | Rozróżnić półfabrykat, kontur gotowy i tor osi narzędzia; pokazać naddatek |
| P1 | Zaliczenie nie gwarantuje wykonania nauczanej czynności we właściwym miejscu lub stanie | F1.3–F1.5, F2.1, F3.1, F3.5 | Sprawdzać stan i kolejność bloków, nie samą obecność słów |
| P1 | „G500 = zero maszyny” jest nadmiernym uproszczeniem | F0.3 | Uwzględnić pozostałe aktywne układy/transformacje i konfigurację SINUMERIK |
| P1 | Nagłówek nie ustawia trybu ruchu, a przykład uruchamia ruch Z przez G43 przed jawnym G00 | F1.5 oraz powtarzane starty | Ujawnić tryb ruchu przy pierwszym pozycjonowaniu; określić warunki początkowe |
| P1 | Pytanie o „wejście w materiał” wskazuje ruch Z wykonywany poza płytką | F3.2 | Zmienić pytanie albo położenie XY przykładu |
| P1 | Chłodzenie stopów niklu opisane zbyt bezwarunkowo | F2.4 | Rozróżnić m.in. węglik i ceramikę do HRSA; odwołać się do producenta narzędzia |
| P2 | Podstawy mieszają model dydaktyczny z ogólną zasadą konstrukcji/sterowania | FP.1–FP.3, F0 | Wyraźnie opisać przyjętą frezarkę, bazę długości i granice uproszczeń |
| P2 | Kilka napisów i wymiarów nie prowadzi wzroku do mierzonego elementu | F0, F1.4, F3.3–F3.4 | Dodać linie pomocnicze, osie, jednostki i odsunąć etykiety |
| P3 | Nadmiar powtarzalnych sekcji i metadanych wydłuża lekcje | szczególnie Podstawy | Usunąć puste „Program detalu”, skrócić powtórzenia, porównania przenieść do rozwijanych bloków |

**Nie zgłaszam jako błędu:** zewnętrzny obieg konturu zgodnie z ruchem wskazówek zegara przy M03. Dla pokazanego przypadku jest to frezowanie współbieżne. W przeglądzie trzeba rozróżniać posuw narzędzia względem przedmiotu i przeciwny ruch przedmiotu względem narzędzia. Nie zgłaszam też rzekomego problemu separatora `|` w quizach — komponent rzeczywiście obsługuje ten separator.

## 3. Przegląd rozdział po rozdziale

### FP.1 — Obrabiarka i ruchy

**Zachować:** przedstawienie wrzeciona, stołu, narzędzia i przedmiotu; wyjaśnienie ruchu względnego; pokaz różnych realizacji tych samych współrzędnych. Jest to właściwy początek kursu. Rysunek frezarki jest czytelniejszy dydaktycznie od dekoracyjnej fotografii.

**Merytoryka i język — P2:** ogólne stwierdzenie, że ruch główny w obróbce skrawaniem jest obrotowy, wymaga zawężenia do frezowania. W struganiu i dłutowaniu ruch główny jest liniowy. Proponowany zapis: **„We frezowaniu ruch główny stanowi obrót freza, a ruch posuwowy zmienia położenie narzędzia względem przedmiotu.”** Podstawa: Kuryjański, s. 51–54 [S1].

Przy konstrukcji z ruchomą kolumną pisać „w pokazanym modelu”, ponieważ nie każdy taki typ obrabiarki ma identyczny podział osi między zespoły. „Ten sam program” na różnych maszynach należy zastąpić przez „ten sam tor opisany współrzędnymi”: zgodność kinematyki nie gwarantuje zgodności M-kodów, wymiany narzędzia, korekcji i procedur startowych.

**Zadania — P2:** przykład `G01 X60` powinien być oznaczony jako fragment z podaną pozycją początkową, G90 i jednostkami. Jeśli służy wyłącznie nauce współrzędnych, nie przedstawiać go jako samodzielnego programu do wykonania. Przy „odczycie pozycji” dopisać, że chodzi o wybrany ekran współrzędnych przedmiotu, a nie dowolny ekran MACHINE/RELATIVE.

**Rysunki i układ — P3:** zachować model frezarki i kierunki ruchu. Obszerny blok o tokarce zwinąć jako „Porównanie z toczeniem”; obecnie przerywa podstawowy tok nauki frezowania. Dobrym dodatkiem będzie sterowany pokaz „ruch stołu / ruch względny narzędzia”, z możliwością zatrzymania, zamiast zapętlonego GIF-a.

### FP.2 — Zespół narzędziowy

**Zachować:** rozróżnienie narzędzia, oprawki, długości i wysięgu oraz uwagę, że kolizję może spowodować cały zespół. Ta pomoc już istnieje — nie trzeba tworzyć drugiego wstępu o tym samym. Obliczenie 92,5 + 10 = 102,5 jest poprawne w przyjętym modelu.

**Merytoryka — P2:** „czoło wrzeciona N” nie powinno być uniwersalną definicją dowolnej fizycznej powierzchni wrzeciona. Potrzebna jest **przyjęta płaszczyzna odniesienia długości zespołu narzędziowego**, zgodna z daną maszyną i metodą pomiaru. Relację `N = Z punktu programowanego + L` podpisać „uproszczony model: dodatnia długość L, ta sama baza współrzędnych”. Nie wolno automatycznie utożsamić otrzymanego N z odczytem Z maszynowym bez uwzględnienia przesunięcia bazy.

**Język — P2:** dla płaskiego frezu „czubek” jest zbyt potoczny i niejednoznaczny. Proponuję: **„Punkt programowany leży na osi freza, w płaszczyźnie jego czoła.”** Dla wiertła można mówić o wierzchołku. „Nóż tokarski — oprawka z płytką” oznaczyć jako przykład noża składanego, a nie definicję wszystkich noży.

Rozróżnić **nawiercanie/punktowanie otworu** od wykonywania **nakiełka pod kieł**. Nazwa „nawiertak” nie uzasadnia dowolnego zamiennego użycia narzędzi do tych operacji. Dobór kąta narzędzia do punktowania i wiertła wymaga zaleceń producenta; nie dodawać ogólnej zasady „90° do każdego wiertła”.

**Rysunek — P2:** zaznaczyć płaszczyznę odniesienia, punkt programowany i początek wysięgu. Dodać cienkie linie pomocnicze do L i wysięgu oraz jednoznaczny wymiar średnicy. Geometria obecnego rozróżnienia L/wysięg jest użyteczna; wymaga doprecyzowania odniesienia, nie wymiany całej grafiki.

**Ćwiczenie do dodania — P3:** ten sam tor i dwa zespoły o różnych wysięgach; uczeń wskazuje, czy oprawka ominie szczękę. Pokazać też, dlaczego niepotrzebnie duży wysięg pogarsza sztywność. To naturalne rozwinięcie istniejącej uwagi o kolizji, nie nowy osobny moduł.

### FP.3 — Ustawienie przedmiotu

**Zachować:** zadanie z wysokością szczęk. Rachunek jest poprawny: 20 − 14 = 6 mm, góra szczęk znajduje się na Z−6, czoło freza na Z−5 jest w modelu 1 mm wyżej, a Z−8 schodzi 2 mm poniżej góry szczęk.

**Merytoryka — P2:** to wynik dla przedstawionej geometrii, a nie zalecenie „1 mm wystarcza” dla dowolnego zamocowania. Warunek powinien uwzględniać także oprawkę, długość części roboczej, rzeczywisty kształt szczęk i wymagany zapas. Zdanie „frez nie dotyka imadła” zawęzić do pokazanego modelu i danych.

Dopisać krótkie rozróżnienie **ustalenie, podparcie, zamocowanie**. Sam docisk nie wyjaśnia, dlaczego przedmiot nie obraca się ani nie unosi podczas skrawania. Wystarczą trzy zdania i schemat podkładek; nie potrzeba wykładu o całej teorii bazowania.

**Rysunek — P2, analiza SVG:** materiał i dolna płyta mają widoczną przerwę, a podparcie nie jest pokazane. Dorysować podkładki albo napisać „podparcie pominięto — schemat wysokości”. Podpisać widok XZ. „Lewy górny narożnik” w przekroju nie musi być sprzeczny z „lewym dolnym narożnikiem” w rzucie XY, ale bez nazw rzutów początkujący może potraktować to jako dwie różne bazy.

**Zadanie i układ — P2:** trzy kroki porządkowania powinny być opisane jako fragment przygotowania, nie kompletna procedura gotowości maszyny. Zachować kontrolę kolejności. Usunąć pustą sekcję „Program detalu”, jeśli nie zawiera programu.

### F0.1 — Układ współrzędnych

**Zachować:** osie typowej pionowej frezarki, regułę prawej dłoni, porównanie zera w narożniku i na środku, wyjaśnienie ruchu stołu. W przykładzie otwór X60 Y20 na płytce 80 × 50 jest umieszczony prawidłowo. Znaki Z na pokazanym pełnym materiale są logiczne.

**Język — P2:** zamiast nazywać X/Y/Z „odległościami od zera”, pisać **„współrzędne mierzone względem zera, z uwzględnieniem znaku”**. Odległość jako wielkość geometryczna nie jest ujemna. Oznaczenia na rysunku, np. X60, nie muszą mieć kropki; rzeczywisty kod w bloku powinien być konsekwentny z późniejszą lekcją o interpretacji zapisu bez kropki.

**Zadanie — P2:** dojście w trenerze do X40 Y20 Z−5 jest dobrym sprawdzianem położenia. Polecenie „zejdź w materiał” może jednak sugerować ręczne zagłębianie narzędzia bez ustalonej technologii. Zmienić na **„Ustaw punkt programowany w podanym położeniu. To ćwiczenie współrzędnych; nie symulacja poprawnej operacji skrawania.”**

**Rysunki — P2/P3:** w rzucie płytki dodać jednostkę „mm” oraz linie pomocnicze łączące wymiary 60 i 20 z osią otworu. Zachować widok Z i przykład błędu znaku. „Z−20 = kolizja” odnosi się do pokazanego materiału/uchwytu; samo ujemne Z nie oznacza kolizji w dowolnym programie. Regułę dłoni można umieścić w rozwijanej pomocy, aby trzy duże schematy nie odsuwały pierwszego zadania zbyt daleko.

### F0.2 — Punkty zerowe

**Zachować:** rozróżnienie M, R, W i bazy narzędzia. Rachunki −260 − (−320) = 60 oraz −240 − (−260) = 20 są poprawne. Rysunek łańcucha w osi X ma prawidłowe kierunki wektorów i czytelne położenia M/W/T.

**Merytoryka — P2:** zależność „pozycja maszynowa = przesunięcie + program” podpisać jako uproszczony model X/Y, bez dodatkowych transformacji. W osi Z dochodzą m.in. korekcja długości i przyjęta płaszczyzna odniesienia. „Program zna tylko W” jest za mocne, ponieważ istnieją polecenia w układzie maszyny i przejazdy do punktu referencyjnego.

Procedurę bazowania uzależnić od instrukcji maszyny. Układ z absolutnym pomiarem położenia nie musi wymagać klasycznego bazowania po każdym włączeniu, jeżeli odniesienie pozostaje ważne. Nie utożsamiać punktu referencyjnego z krańcem zakresu osi. Zamiast „krańcówki lub liniały” użyć „czujnik bazowania i/lub znacznik referencyjny układu pomiarowego — zależnie od konstrukcji”.

Zdanie o niesumowaniu tolerancji po wyborze W jest nieuzasadnioną gwarancją. Proponuję: **„Baza zgodna z wymiarowaniem ułatwia odczyt współrzędnych i ogranicza przeliczenia. Dobór baz technologicznych oraz łańcuch wymiarowy wymagają osobnej oceny.”**

**SINUMERIK — P2:** nie utożsamiać wszystkich sposobów pomijania przesunięć z jednym „pełnym układem maszynowym”. G53, G153 i SUPA mają różny zakres tłumienia przesunięć [S5, rozdz. 13.10].

**Rysunki i ćwiczenia — P2:** na rysunku punktów charakterystycznych podkreślić, że przedstawiono jeden przykład położenia M i R. Na rysunku baz A/B dodać linie do osi otworu i nazwy widoków. Ćwiczenia obliczeniowe mają sens; warto dołożyć jeden przykład z dodatnią składową przesunięcia, aby uczeń nie zapamiętał „maszynowe zawsze ujemne”.

### F0.3 — Przesunięcia G54–G59

**Zachować:** rachunek dla styku od strony ujemnej: −325 + 5 = −320 oraz −265 + 5 = −260. Wyjaśnienie znaków jest poprawne. Porównanie dwóch zamocowań pod G54/G55 dobrze pokazuje po co istnieją rejestry.

**Merytoryka — P1/P2:** opis pomiaru rozdzielić na ręczny czujnik krawędzi i sondę pomiarową z cyklem. Automatyczny cykl może już uwzględniać skalibrowany promień końcówki; ponowne dodanie promienia byłoby błędem. Przykład zostawić jako **„model ręcznego pomiaru cylindryczną końcówką Ø10”**, z warunkami konkretnego przyrządu.

**P1:** G500 nie jest bezwarunkowym wyborem zera maszyny. Wyłącza wskazane przesunięcie nastawne, lecz znaczenie pozostałych układów i danych zależy od konfiguracji. Zmienić opis i odpowiedź quizu; wersja uproszczona może pozostać tylko przy jawnym założeniu, że pozostałe odpowiednie przesunięcia/transformacje są zerowe lub nieaktywne [S5, rozdz. 9.1].

Przy przełączaniu G54/G55 dodać zdanie o przejeździe z bezpiecznej wysokości dla całego zespołu i obu zamocowań. Identyczny tor względem W nie gwarantuje identycznych warunków kolizyjnych na stole.

**Zadanie — P2:** jeśli narzędzie ćwiczenia pozwala jedynie obliczyć i wpisać przesunięcie, cel „zmierzysz na maszynie” zmienić na „obliczysz i dobierzesz przesunięcie na podstawie podanego pomiaru”. Z pominięciem Z w tabeli nie ma problemu na tym etapie, jeżeli wyraźnie napisano, że kolejne przykłady korzystają z wcześniej ustalonego Z0 i długości narzędzia.

**Rysunki — P2:** przy styku od przodu dodać wymiar r = 5 w Y i strzałki +X/+Y. Przy dwóch detalach podpisać „widok z góry; układ przykładowy”. Nie trzeba przedstawiać go jako skalowanego rysunku całego stołu.

### F1.1 — Blok, słowo, adres

**Zachować:** rozbiór bloku i przypisanie adresów do funkcji. Kolejność czytania słów jest dobrym pierwszym ćwiczeniem.

**Merytoryka i język — P2:** „blok = jedno polecenie” zamienić na **„blok jest jednostką programu; może zawierać kilka słów opisujących ruch i inne funkcje”**. S oznacza zadaną prędkość obrotową w omawianym trybie, F — zadaną prędkość posuwu w G94. Unikać opisu sugerującego, że sterowanie zawsze wykonuje wszystkie funkcje ściśle po kolei tak, jak czytelnik czyta znaki.

Interpretację wymiaru bez kropki powiązać z parametrem 3401#0 DPI i rozdzielczością przyrostu wejściowego. Przykład „1000 razy” jest właściwy dla określonego przypadku 0,001 mm, nie każdej konfiguracji [S3, s. 200].

**Rysunki — P2:** ujednolicić zapis rzeczywistych bloków w anatomii programu, np. `N40 G01 X60. Y20. F300 M08`. Oznaczenia punktów mogą nadal mieć formę X60 Y20. W przykładzie odczytu bloku środek frezu Ø10 na X−5 jest styczny do X0 — dodać rozróżnienie styku i skrawania naddatku. Pokaz programu powinien korzystać z jawnie opisanego półfabrykatu; domyślnie wyznaczony obszar symulatora nie może udawać rysunku wykonawczego.

**Zadania — P3:** zachować rozpoznawanie adresów, dodać jeden przypadek wyjaśnienia skutku, np. co zmienia zamiana X i Y dla niesymetrycznego punktu.

### F1.2 — Modalność

**Zachować:** wyjaśnienie dziedziczenia stanów, tabelę grup, obserwowanie stanu programu i istniejący StateExplorer. Ta interaktywna pomoc już realizuje dobry pomysł dydaktyczny.

**Merytoryka — P2:** rozdzielić grupy modalnych G-kodów od zapamiętanych wartości F/S. Uwaga „dokładnie jeden kod z grupy” nie opisuje całej grupy 00 z funkcjami jednorazowymi. Zachować informację o zależności stanu po resecie od konfiguracji.

**Nie jest błędem dla przyjętego FANUC 0i-F:** gdy w bloku występuje więcej niż jeden G-kod tej samej grupy, używany jest ostatni z nich. Potwierdza to podręcznik [S3, s. 69]; nie zastępować tej informacji ogólną regułą „zawsze alarm”.

**Język i rysunek — P2/P3:** zamiast „choć jej nie ma” przy dziedziczonym G00 pisać „mimo że kod G00 nie został ponownie zapisany”. Numerki kroków pokazu powiązać z numerami bloków albo nazwać je „krokami”, aby nie sugerowały nieistniejących linii. Na torze XZ podać położenie początkowe i stałe Y. Geometria pokazanej sekwencji jest poprawna.

**Zadanie — P3:** dołożyć pytanie o aktywny stan przed ruchem, a nie wyłącznie wskazywanie kodu; nie tworzyć drugiego eksploratora tego samego stanu.

### F1.3 — G90 i G91

**Zachować:** poprawnie obliczone punkty konturu i porównanie zapisu absolutnego/przyrostowego. Dobry materiał do nauki bez zmiany geometrii przykładu.

**Merytoryka i język — P2:** G91 opisuje **przyrosty współrzędnych ze znakiem**, nie zawsze „odległości”. Błędne X w G90 może oddziaływać na następny blok zawierający wyłącznie Y: X pozostaje błędne do ponownego jawnego zadania tej osi. Zdanie, że błąd „psuje jeden punkt”, zamienić na **„błędna współrzędna wpływa na tor do chwili, gdy dana oś otrzyma nowe poprawne położenie”**.

Zalecenie G90 dla wymiarów tolerowanych przedstawić jako czytelną praktykę programowania i kontroli, nie gwarancję większej dokładności obrabiarki.

**Zadanie — P1:** wcześniejszy test zaliczył program wykonujący wymagany kontur w G90, gdy G91 występowało tylko przed ponownym G90. Kontrola obecności G91 nie potwierdza wykonania ćwiczenia przyrostowego. Sprawdzać aktywne G91 w wymaganych blokach albo uczciwie zmienić cel na dowolny poprawny tor.

**Rysunki — P3:** zachować porównanie torów; przy każdym kolejnym punkcie pokaz powinien wyświetlać „poprzednie położenie + przyrost = nowe położenie”. To lepsza pomoc niż kolejna statyczna lista liczb.

### F1.4 — Jednostki i płaszczyzny

**Zachować:** przeliczenia 1,5 cala = 38,1 mm, 0,75 cala = 19,05 mm i 0,1 cala = 2,54 mm; orientacje G17 XY, G18 ZX i G19 YZ. Nie ma podstaw do odwracania kolejności osi w schemacie G18.

**Merytoryka — P2:** domyślna płaszczyzna po uruchomieniu/resecie zależy od konfiguracji; „frezarka startuje G17” powinno mieć warunek zgodny z wcześniejszą lekcją [S3, s. 69]. Opis przełączania jednostek i wartości rejestrów rozdzielić według sterowania. Haas Workbook opisuje Setting 9 i sprawdzanie zgodności G20/G21; nie jest to identyczna procedura dla wszystkich FANUC [S4, s. 44].

**Zadanie — P1:** przy konwersji G20 → G21 trzeba przeliczyć również posuw minutowy. **6 in/min = 152,4 mm/min**. Pozostawienie F6 w wersji metrycznej zostało zaliczone w pilotażu. W rozwiązaniu F150 może być świadomym zaokrągleniem, lecz trzeba to nazwać; nie przedstawiać 150 jako dokładnego przeliczenia.

**Rysunek — P2:** wymiary 38,1 i 19,05 doprowadzić liniami pomocniczymi do środka otworu. Rozsunąć napis z przeliczeniem i linię wymiarową, dodać osie otworu oraz jednostkę mm. Obecne wartości są poprawne; słabsze jest ich wizualne przypisanie.

**Dydaktyka — P3:** skoro polecenie podaje już wszystkie przeliczone wymiary, jest to ćwiczenie użycia danych, nie samodzielnego przeliczania. Zachować je jako próbę prowadzoną, a w quizie dać nowy wymiar.

### F1.5 — Blok startowy i koniec

**Merytoryka — P1:** opis ochrony przez G21 ma odwrócony kierunek pomyłki. Dla programu pisanego w mm zagrożeniem jest odczyt wymiarów jako calowych. Proponuję: **„G21 ustawia jednostki metryczne zgodnie z założeniami tego programu.”**

Nagłówek nie ustawia „wszystkiego, co zostało po poprzednim programie”: lista nie obejmuje m.in. każdego możliwego przesunięcia lokalnego, obrotu czy skalowania. Nie trzeba wpisywać wszystkich funkcji do każdego przykładu — trzeba ograniczyć deklarację do przyjętego profilu.

**P1:** w przykładzie `G43 H1 Z50.` występuje przed jawnym wyborem G00. Właściwy tryb ruchu powinien być określony przy pierwszym ruchu, np. `G00 G43 H1 Z50.` w przyjętym modelu i przy sprawdzonych danych. Sama dopisana linia nie stanowi uniwersalnej procedury bezpiecznej wymiany narzędzia na każdej maszynie.

**P2:** wyjaśnienie G80 doprecyzować: nieopisany modalnie ruch XY przy aktywnym cyklu może uruchomić kolejny otwór, ale jawne G00/G01 z grupy 01 kasuje aktywny cykl wiercenia w omawianym FANUC [S3, s. 69]. Nie pisać, że każdy pierwszy przejazd XY, także z G00, musi wiercić.

M06 przed nagłówkiem nie jest ogólnym błędem: Haas Workbook pokazuje taką kolejność [S4, s. 42]. Quiz powinien pytać o **kolejność przyjętą w tym kursie**. M30 i zachowanie po resecie mają zależności konfiguracyjne; przewinięcie określa m.in. parametr 3404#4 [S3, s. 201]. Pominięcie D w SINUMERIK nie zawsze jest równoznaczne z D0; odsyłać do ustawień konkretnej maszyny.

**Język — P2:** „wymiary wracają absolutne” → „program przywraca tryb G90”. „Zmienia się tylko obróbka” → „szkielet jest podobny; narzędzie, H, baza i wysokości dobierane są do operacji”.

**Zadanie — P1:** dopisanie wymaganych słów po obróbce dostało „Zaliczone” w pilotażu. Sprawdzać stan przed pierwszym wymaganym ruchem, a nie obecność nagłówka gdziekolwiek w pliku.

**Rysunek — P3:** szkielet programu jest dobrą mapą. Oznaczyć uproszczenia i powiązać kroki z odpowiadającymi blokami, aby mapa nie udawała kompletnej procedury ustawienia maszyny.

### F2.1 — Wymiana narzędzia

**Zachować:** rozróżnienie wyboru T i wykonania wymiany przez M06 oraz pokaz przygotowania kolejnego narzędzia. Oś czasu jest czytelna.

**Merytoryka — P2:** wykonanie wymiany zależy od konstruktora obrabiarki i logiki maszyny; nie musi być realizowane „makrem”. T nie jest zawsze numerem fizycznej kieszeni magazynu, a preselekt nie działa jednakowo na wszystkich magazynach. Wprowadzić krótkie rozróżnienie **numer narzędzia / kieszeń / rejestr długości H**. W profilu kursu wywołanie T nie zastępuje aktywacji odpowiedniej korekcji długości.

**P2:** w układance `G00 Z5.` nie powinno być uniwersalnym odjazdem przed wymianą narzędzia. Zastąpić opisem „przejazd do pozycji wymaganej przez procedurę wymiany” albo podać geometrię i założenie, że M06 wykonuje dalszy ruch zgodnie z instrukcją maszyny. Rysunek czasu podpisać „schemat kolejności, nie pełny program skrawania”: po pierwszym M06 nie pokazuje wszystkich czynności koniecznych do rozpoczęcia frezowania.

**Do weryfikacji:** zestawienie narzędzia 90° do punktowania z wiertłem VHM o kącie 140°. Potrzebna jest konkretna rekomendacja producenta oraz opis, czy chodzi o punktowanie, fazę czy nakiełek. Nie rozstrzygam doboru wyłącznie na podstawie nazw narzędzi.

**Zadanie — P1, potwierdzone na stronie:** program bez drugiego M06, z T2, H2 i S1800, został zaliczony. Pierwsze M06 z T1 zaspokaja kontrolę samej obecności kodu. Sprawdzać, czy przy drugiej operacji faktycznie wymieniono narzędzie na T2 i aktywowano właściwe dane; osobno kontrolować wymaganą kolejność zatrzymania wrzeciona.

**Rysunek — P3:** zachować cztery kroki osi czasu. Dodać wyróżnienie „T2 przygotowuje / M06 wymienia” oraz warunek obsługi preselektu. Nie jest potrzebny realistyczny GIF magazynu, dopóki nie wybrano konkretnej konstrukcji.

### F2.2 — Obroty S, M03/M04/M05

**Zachować:** wzór `n = 1000·vc/(π·D)` i przykłady. D10, vc80 daje około 2546 obr/min; przy vc300 około 9549 obr/min. Limit 8000 obr/min obniża vc dla D10 do około 251 m/min. Pozostałe sprawdzone rachunki: D8/vc100 ≈ 3979, D12/vc90 ≈ 2387 obr/min [S1, s. 53].

**Język — P2:** używać „prędkość obrotowa n” i „prędkość skrawania vc”; „obroty” zostawić jako pomocnicze potoczne określenie. „Narzędzie pęka po chwili” zastąpić opisem ryzyka i jego warunków. Stwierdzenie, że pozostawione obroty frezu są „ponad trzy razy za wolne” dla wiertła, wymaga wspólnego docelowego vc; różne narzędzia mogą mieć różne zalecenia.

**Merytoryka — P2:** G97 jako domyślnego kodu każdej frezarki nie należy deklarować bez profilu sterowania. W tym kursie wystarczy „S jest zadawane w obr/min”; lista G-kodów zwykłej frezarki Haas różni się od listy VMT [S6]. Limit wynika nie tylko z wrzeciona, ale też z zespołu narzędziowego i warunków operacji. W obliczeniu podać, że przyjęte 8000 obr/min jest dopuszczalne także dla zastosowanej oprawki/narzędzia.

**Zadanie — P2, wniosek z kodu:** obecność S2500 i M03 gdziekolwiek w programie nie potwierdza, że taki stan obowiązuje podczas wymaganej operacji. Powiązać kontrolę z aktywnym stanem przed skrawaniem. Nie przedstawiam tego jako osobnego wykonanego testu przeglądarkowego.

**Rysunki — P3:** słupki prędkości i linia limitu są logiczne. Dodać jednostkę obr/min przy skali. W schemacie vc wyraźnie podpisać, czy pokazano obracający się frez, czy model koła; dla frezowania chodzi o prędkość ostrza względem przedmiotu.

### F2.3 — Posuw F i G94

**Zachować:** `vf = fz·z·n`; .04·4·2500 = 400 mm/min, .05·3·3000 = 450 mm/min oraz 600/(4·3000) = .05 mm/ostrze są poprawne [S1, s. 54]. Obecny walidator potrafi sprawdzać aktywny posuw dla ruchów — nie należy projektować tego od zera.

**Merytoryka — P1:** przy frezie Ø10 i torze osi X−5 skrajny punkt obwodu znajduje się na X0. Przy zdefiniowanej płytce od X0 do X80 jest to styk, a nie określone skrawanie warstwy materiału. `ProgramTask` przekazuje do symulatora półfabrykat 80 × 50 × 20. Proponowana geometria dydaktyczna: kontur gotowy 80 × 50, półfabrykat od X−2 do X82 i od Y−2 do Y52, czyli 2 mm naddatku na bok. Pokazać oba obrysy i wskazać, które współrzędne definiują W. Sprawdzić także dojścia, łuki i zamocowanie po zmianie modelu.

**P2:** ruch Z przy X−20 pozostaje poza płytką. Nie uzasadniać F150 jako ochrony przed wejściem czołem w przedstawiony materiał tylko dlatego, że Z0 mogłoby być błędne. Pokaz modalności dwóch wartości F może pozostać, lecz uzasadnienie musi odpowiadać położeniu XY. Mniejszy F nie gwarantuje ochrony przed kolizją.

**P2:** fz jest posuwem na ostrze, h grubością warstwy skrawanej/wióra w przyjętym modelu. Nie są identyczne w całym obrocie; grubość zależy m.in. od kąta i zaangażowania promieniowego. Rysunek przesuniętych okręgów jest przydatnym uproszczeniem, lecz powinien być tak podpisany; nie przedstawia rzeczywistego toru trochoidalnego ostrza. Wzór opisać dla przyjętej liczby efektywnych ostrzy.

Zamiast „katalog podaje fz = .04” bez wskazanego narzędzia pisać „do przykładu przyjmujemy fz = .04”. Zbyt mały posuw **może** powodować tarcie; samo pomylenie liczby ostrzy nie dowodzi zejścia poniżej minimalnej grubości warstwy dla każdego narzędzia. Zastrzec też, że G95 nie jest uniwersalnym odpowiednikiem posuwu na obrót we wszystkich profilach tokarskich FANUC; system A ma inny zestaw kodów.

**Rysunki — P2:** na płytce dodać W, osie, Ø10 i bezpośredni podpis X−5. Rozdzielić kolor półfabrykatu, powierzchni gotowej i pasa naddatku. To ważniejsze niż animowanie samej zielonej linii.

**Pomoc do dodania — P2:** prosty przekrój ap i rzut ae obok obliczenia F. Można wykorzystać istniejący wspólny diagram po weryfikacji jego opisu. Dodać, że vc/fz z katalogu obowiązują dla określonego materiału, narzędzia i warunków; nie tworzyć „uniwersalnych” tabel bez tych danych.

### F2.4 — Chłodziwo M08/M09

**Zachować:** pokaz stanu chłodziwa w czasie i wyłączenie przed zakończeniem. Kontrola aktywnego stanu chłodziwa w zadaniu już istnieje. To mocniejsza kontrola niż samo szukanie M08 w tekście.

**Merytoryka — P1/P2:** „stopy tytanu i niklu wymagają chłodziwa” zawęzić do narzędzia i technologii. Frezowanie stopów żaroodpornych narzędziami ceramicznymi stanowi istotny wyjątek; producent zaleca pracę bez chłodziwa ze względu na szok cieplny [S7]. Kurs powinien uczyć wyboru według zaleceń dla konkretnego narzędzia.

M07, mgła i MQL nie są zamiennymi nazwami jednej uniwersalnej funkcji. Znaczenie M-kodu określa producent obrabiarki. MQL oznacza określoną metodę minimalnego smarowania, a nie każdą mgłę. Zmienić „detal nie rośnie” na **„ograniczenie wzrostu temperatury zmniejsza zmiany wymiarów; pomiar wymaga odpowiednich warunków”**. Chłodziwo nie usuwa rozszerzalności cieplnej.

**Język — P2:** usunąć uzasadnienie „wrzeciono nie stoi zalane, ostatnie obroty zrzucają ciecz”, jeśli nie wynika z instrukcji konkretnej maszyny. Sekwencję M09/M05 można pokazać jako przyjętą organizację końca operacji bez dorabiania uniwersalnego mechanizmu fizycznego. Zamiast pewnego „wypala” opisać możliwe przegrzewanie/ślady i ich warunki.

**Zadanie — P2:** jeśli wymaga chłodziwa przy każdym G01, również przejeździe w powietrzu, nazwać to warunkiem tego ćwiczenia. Nie utożsamiać każdej interpolacji roboczej z kontaktem ostrza z materiałem.

**Rysunek — P3:** belki wrzeciona i chłodziwa są poprawne; rozsunąć drobne etykiety M03/M08/najazd/Z5/M09/M05. Zachować oś czasu zamiast dodawać dekoracyjny film strumienia chłodziwa.

### F3.1 — G00, ruch szybki

**Zachować:** rozróżnienie ruchu szybkiego i roboczego oraz ostrzeżenie, że G00 nie zawsze daje prostoliniowy tor wypadkowy. Nie należy usuwać tego ostrzeżenia. Parametryzacja toru zależy od sterowania/maszyny.

**Merytoryka — P1/P2:** pierwszy blok `G00 X40. Y25. Z50.` również łączy osie. Potrzebne jest jawne założenie, że punkt początkowy i cały przejazd są już nad przeszkodami, albo inna sekwencja startu. Nie można jednocześnie uczyć „najpierw bezpieczny Z” i zostawiać nieopisanej początkowej wysokości.

„Bezpieczny na każdej maszynie” usunąć. Rozdzielenie ruchów nie zastępuje sprawdzenia pełnego zespołu, zamocowania, zakresów osi i właściwej korekcji.

**Quiz — P2:** odróżnić **odniesienie współrzędnej Z** od **warunku doboru bezpiecznej wysokości**. Wartość Z programuje się względem przyjętej bazy; minimalną wysokość przejazdu wyznacza najwyższa przeszkoda na trasie wraz z wymaganym zapasem. Pytanie „od czego liczysz wysokość” miesza te dwa znaczenia.

**Rysunki — P2:** czerwony tor w przykładzie docisku jest logiczny jako jeden możliwy tor, przy określonym sposobie pracy osi. Dodać osie X/Z i zastrzeżenie, że położenie załamania jest poglądowe. Zdanie „krótsza droga kończy się pierwsza” w pomocniczym diagramie G00 wymaga założenia porównywalnych prędkości osi; w rzeczywistości liczy się także ich prędkość i dynamika. Bezpieczny wariant rysunku musi pozostać związany z pokazaną geometrią.

W pomocniczym porównaniu przejazdu przez zacisk nie gwarantować „podobnego czasu” bez danych ruchu; istotą przykładu jest omijanie przeszkody.

**Zadanie — P1, potwierdzone na stronie:** błędny jednoczesny ruch XY/Z nie blokuje zaliczenia, jeśli później pojawi się poprawna para przejazdów. Kontrola ma obejmować cały wymagany dojazd, a nie znalezienie dowolnej poprawnej pary bloków.

### F3.2 — G01, interpolacja liniowa

**Zachować:** G01 prowadzi po prostej z zadanym posuwem wzdłuż toru; przykład składowych około 358 i 179 mm/min dla F400 oraz ΔX60/ΔY30 jest poprawny. Zewnętrzny obieg pokazanej płytki przy M03 jest współbieżny.

**Merytoryka — P1:** opis „obrobienia konturu” wymaga półfabrykatu z naddatkiem, jak w F2.3. Sam przejazd toru osi stycznego do gotowej płytki nie potwierdza usunięcia określonej objętości materiału.

**Quiz — P1:** blok `G01 Z-5.` przy X−20 nie wchodzi w materiał pokazanej płytki. Zmienić pytanie na **„Który blok ustawia narzędzie na głębokości Z−5?”** albo pokazać rzeczywiste wejście w materiał przy innych XY. Także ostrzeżenie o przeciążeniu freza przy wejściu czołowym musi odnosić się do zagłębienia w materiał, nie do ruchu w powietrzu.

**P2:** alarm przy pierwszym G01 bez F opisać przy założeniu, że nie ma wcześniej poprawnie zadanego aktywnego posuwu. „Nowy program” nie gwarantuje automatycznie braku zachowanej wartości F w każdej maszynie.

**Zadanie — P2, wniosek z warunków:** porównanie geometrii nie sprawdza wszystkich warunków technologicznych i kierunku przejścia. Jeżeli F150/F400 i obieg współbieżny są częścią celu, trzeba je kontrolować. Jeśli dopuszcza się równoważny tor, opisać granice tej równoważności.

**Rysunek — P2/P3:** kierunki i punkty są czytelne. Dodać półfabrykat, kontur gotowy oraz jeden frez w wybranym punkcie. Przydatna będzie krótka pomoc „kontur zewnętrzny / wewnętrzny” z obrotem i kierunkiem ruchu względnego, aby nie sprowadzić współbieżności do zapamiętania jednej strzałki.

### F3.3 — G02/G03, promień R

**Zachować:** geometrię przykładu. Dla naroża gotowego R10 i frezu Ø10 promień toru osi wynosi R15. Start (−5;40), koniec (10;55), środek (10;40) dają prawidłowy ćwierćokrąg G02. Pozostałe naroża są spójne. Rozróżnienie dodatniego/ujemnego R dla krótkiego/długiego łuku ma sens w przyjętym profilu.

**Merytoryka — P2:** dla tego konkretnego startu i końca cięciwa ma około 21,213 mm. Przy R10 średnica wynosi 20 mm, więc taki łuk jest geometrycznie niemożliwy. Zdanie „alarm albo inny środek” zastąpić **„dla tych punktów R10 nie daje rzeczywistego łuku; sterowanie powinno zgłosić błąd zgodnie ze swoją tolerancją/diagnostyką”**. Przy ogólnym warunku uwzględniać `2·|R|`.

**Zadanie — P2:** deklaracja „sprawdzany jest tor, nie zapis” jest szersza niż warunek wymagający G02. Równoważna geometria może być zapisana inaczej, a sama obecność G02 nie wymusza zastosowania R w wymaganym łuku. Wybrać cel: **nauka zapisu łuku przez R** albo **dowolne rozwiązanie zadanej geometrii**. Polecenie i walidator powinny mówić to samo.

**Rysunek — P2:** dodać grot do linii promienia R15, rzeczywiste oznaczenie R10 na powierzchni gotowej oraz Ø10 frezu. Podpis poza schematem nie zastępuje wskazania, którego łuku dotyczy R10. Wyraźnie odróżniać promień powierzchni od promienia toru.

### F3.4 — Łuki I/J

**Zachować:** `I15 J0` dla przejścia od (−5;40) do (10;55) i środka (10;40). Przykład od (20;20) do (40;40) z I20 J0 jest logiczny. Opis pełnego okręgu przez położenie środka jest właściwy dla profilu kursu [S3, rozdz. 4; S6].

**Język — P2:** I/J nazwać **„przyrostowymi składowymi wektora od punktu początkowego łuku do jego środka”**, nie po prostu „odległościami”. Mogą być ujemne. Regułę przyrostowego I/J niezależnego od G90 opisać dla przyjętego profilu; nie uogólniać na każde sterowanie i wszystkie dostępne tryby programowania środka.

**Merytoryka zadania — P2:** „rowek o promieniu 10” jest niejednoznaczny. Przy torze osi R10 i frezie Ø10 powstaje idealizowany rowek pierścieniowy o promieniu wewnętrznym 5 i zewnętrznym 15 mm. Proponuję: **„Wykonaj tor osi narzędzia będący okręgiem R10 o środku X40 Y25; w modelu frez Ø10 tworzy rowek o szerokości 10 mm.”** Nie przedstawiać go jako wyfrezowania całej kieszeni.

**Zadanie — P2, wniosek z kodu:** kontrola samego toru może zaliczyć rozwiązanie dwoma łukami R bez ćwiczonego I/J. Jeżeli celem są I/J, wymagać ich w blokach realizujących wskazany łuk. Pełne przykłady zaczynające od G49 i nieprzywracające korekcji długości potrzebują oznaczenia „model symulatora / fragment” albo kompletnego opisu danych narzędzia.

**Rysunek — P2, obserwacja wizualna:** w przykładzie I/J znacznik kroku 1 nachodzi na opis środka X10 Y40. Przesunąć znacznik albo tekst i dodać odnośnik. J0 poprawnie zapisano jako zerową składową; nie trzeba rysować sztucznej strzałki o długości zero. Dodać osobny schemat toru okręgu i rzeczywistego pasa rowka.

### F3.5 — G04, postój

**Zachować:** wyjaśnienie, że osie stoją, a wrzeciono i chłodziwo mogą pracować dalej; rozróżnienie X/P w profilu FANUC; rachunek czasu obrotów. Przy S1500 jeden obrót trwa .04 s, .12 s daje trzy obroty, .2 s pięć, a .5 s 12,5 obrotu.

**Merytoryka — P2:** „2–3 obroty wystarczą”, „dłuższy postój nie poprawia” i „na konturze G04 nie stosuje się” są zbyt kategoryczne. Dobór postoju zależy od operacji, narzędzia i wymagań powierzchni. Proponuję: **„W tym przykładzie wymagamy co najmniej trzech obrotów. Niepotrzebne wydłużanie postoju może zwiększać nagrzewanie i pozostawiać ślady.”** Zatrzymanie może pomagać w łamaniu wióra, ale nie gwarantuje tego w każdym materiale.

Tabela porównawcza nie powinna sugerować, że FANUC nigdy nie obsługuje postoju liczonego w obrotach. Parametr 3405#1 DWL określa zależność od trybu posuwu; kurs używający G94 może nadal konsekwentnie uczyć czasu w sekundach [S3, s. 201]. W SINUMERIK rozróżnienie G4 F / G4 S wynika z instrukcji [S5, rozdział „Dwell time”].

**Spójność zadania — P2:** przykład wyjaśnia .12 s i zaokrąglenie do .2 s, natomiast polecenie wymaga .5 s. To nie jest błąd rachunkowy, ale zmiana celu wymaga jednego zdania. Można ujednolicić ćwiczenie do .2 s albo wyjaśnić, że .5 s jest osobnym zadanym warunkiem, nie czasem trzech obrotów.

**Zadanie — P1, potwierdzone na stronie:** G04 X0.01 na Z5 przed nawiercaniem zostało zaliczone. Wymagany jest postój .5 s na Z−2, między dojściem do dna a wyjazdem. Sprawdzać czas, położenie i kolejność; sama obecność G04 nie wystarcza.

**Rysunki — P2/P3:** w teorii pierwszy duży schemat pokazuje toczenie rowka, mimo że lekcja dotyczy frezowania. Zastąpić go pokazem nawiercenia, a tokarkę przenieść do rozwijanego porównania. Wykres przykładu frezowania jest logiczny, a podpis już mówi, że czasy wejścia/wyjścia są poglądowe. Nie traktuję tych poglądowych długości jako błędu obliczenia czasu przejazdu; warto zachować to zastrzeżenie przy osi wykresu.

## 4. Zadania: co naprawdę jest sprawdzane

Aktualny `runTaskChecks` łączy kontrolę parsera, geometrii, obecności słów i wybranych stanów. To dobry punkt wyjścia. Problem nie polega na tym, że „symulator niczego nie sprawdza”, lecz na niedopasowaniu kilku kontroli do konkretnych celów lekcji.

| Kontrola | Co robi | Ograniczenie istotne dla kursu |
|---|---|---|
| `cut` | Porównuje próbki toru z torem wzorcowym, z tolerancją | Nie dowodzi właściwego narzędzia, czasu postoju, posuwu, kierunku ani kolejności powtarzanych przejazdów |
| `require` / `forbid` | Szuka wskazanych zapisów poza komentarzami | Obecność w dowolnym miejscu nie dowodzi aktywnego stanu podczas operacji |
| `approach` | Szuka pary ruchów spełniającej wzorzec dojazdu | Może znaleźć ją po wcześniejszym błędnym dojeździe |
| `feed` | Sprawdza aktywny F w wskazanych rodzajach ruchów | Warto ją wykorzystać tam, gdzie celem jest F; nie zastępować szukaniem tekstu |
| `coolant` | Sprawdza stan przy ruchach oraz wyłączenie | Warunki powinny odpowiadać poleceniu i rozróżniać ruch w powietrzu od skrawania |
| `end` | Sprawdza położenie końcowe | Sam poprawny koniec nie weryfikuje drogi dojścia |

Komunikat **„cały kontur obrobiony”** jest za mocny dla porównania torów osi. Dopóki nie weryfikuje się półfabrykatu, średnicy narzędzia i usuniętej objętości, proponuję **„pokryto cały wymagany tor”**. Obecna końcowa uwaga, że zaliczenie nie zastępuje sprawdzenia na konkretnej obrabiarce, jest dobra, lecz nie usuwa sprzeczności między poleceniem a warunkami.

Po poprawkach potrzebne są testy regresyjne rzeczywistych celów: błędny program z załącznika ma być odrzucany, poprawne rozwiązanie wzorcowe zaliczane, a dopuszczone równoważne rozwiązania nie powinny być przypadkowo odrzucane. Nie należy wymuszać identycznego tekstu programu, jeśli cel pozwala na równoważny zapis.

## 5. Układ, czcionki i pomoce wizualne

### Co pozostawić

- Obecną rodzinę czcionek i hierarchię nagłówków. Tekst główny w sprawdzonym widoku ma około 17 px i interlinię około 29 px — czyta się go dobrze.
- Stałe rozróżnienie kolorów i typów linii G00/G01/łuków oraz legendę. Kolor uzupełnia typ linii i podpis, nie musi sam przenosić znaczenia.
- Nawigację po modułach, cel lekcji i przykład rozpisany na kroki.
- Interaktywne narzędzia już istniejące: ruch względny, modalność, współrzędne i edytor programu.
- Aktualne poprawki kontrastu. Nie powtarzać starej listy problemów kolorystycznych jako opisu stanu 9447bdc.

### Co zmienić

| Element | Obserwacja | Propozycja |
|---|---|---|
| Podpisy rysunków | Około 13 px; zawierają ważne założenia techniczne | Podnieść do 14–15 px, utrzymać czytelny kontrast i oddzielić założenia od bibliografii |
| Etykiety SVG | Przy zmniejszeniu całego schematu maleją razem z rysunkiem | Ustalić minimalną czytelność na telefonie; dodać powiększenie rysunku, nie tylko przewijanie strony |
| Duże schematy | Kilka kolejnych potrafi odsunąć zadanie o wiele ekranów | Jeden główny schemat; porównania i dodatkowe rzuty pod „Pokaż pomoc” |
| Podstawy — „Program detalu” | Pusta lub mało użyteczna sekcja przed nauką kodu | Ukryć pustą sekcję; ewentualnie dać krótki podgląd „Program pojawi się w F1” |
| Źródła | Powtarzalne metadane i niedokończone „strona do uzupełnienia” | Krótki odnośnik przy twierdzeniu + rozwijana bibliografia z wersją i rozdziałem |
| Dane przykładu | Założenia są rozrzucone między tekstem, figurą i kodem | Jedna mała ramka: maszyna, jednostki, W, materiał/półfabrykat, narzędzie, stan początkowy |
| Nagłówek z fotografią | Zdjęcie z iskrami przyciąga wzrok mocniej niż treść | Zmniejszyć dekorację albo użyć rzeczywistej reprezentatywnej fotografii; nie budować na niej modelu typowego frezowania |
| Wymiary | Poprawne liczby nie zawsze mają połączenie z mierzonym elementem | Linie pomocnicze, osie otworów, groty promieni, jednostki i nazwa rzutu |

Nie zalecam wymiany fontów przed poprawą opisów i rysunków. Największy zysk przyniesie usunięcie dwuznaczności, a nie nowa typografia.

### Gdzie dodać pomoc

| Miejsce | Pomoc | Dlaczego |
|---|---|---|
| FP.2 | Płaszczyzna odniesienia, L, wysięg, H; przykład oprawki przy szczęce | Oddziela punkt programowany od rzeczywistego gabarytu zespołu |
| FP.3 | Podkładki, ustalenie, docisk; Z0 i góra szczęk w jednym rzucie | Wyjaśnia geometrię zamocowania i pochodzenie ograniczeń |
| F0.2–F0.3 | Jeden przykład łączący W, przesunięcie i punkt programowany | Łączy rachunek rejestru z położeniem na stole |
| F1.3 | Przejście krokami: stan poprzedni + przyrost | Pokazuje propagację błędu osi, nie tylko wynik końcowy |
| F1.4 | Przeliczenie także F, obok wymiarów | Zapobiega utrwaleniu konwersji samych XYZ |
| F2.3/F3.2 | Półfabrykat, naddatek, detal gotowy i tor frezu | Rozwiązuje zasadniczy problem stycznego toru bez materiału do zebrania |
| F2.3 | ap/ae/fz oraz warunki użycia parametrów katalogowych | Łączy wzór na F z rzeczywistym zaangażowaniem freza |
| F3.1 | Sterowany pokaz całego dojazdu z uchwytem/oprawką | Wyjaśnia, dlaczego poprawny końcowy punkt nie wystarcza |
| F3.3–F3.4 | Klikane: punkt początkowy, koniec, środek, R/I/J | Oddziela geometrię powierzchni od geometrii toru osi |
| F3.5 | Postój na dnie z licznikiem czasu i obrotów | Łączy G04 z miejscem i zadanym czasem |

Preferuję schemat SVG i pokaz sterowany krokami, z pauzą i możliwością ponownego odtworzenia. GIF ma sens dla krótkiego ruchu mechanizmu, lecz gorzej służy odczytowi wymiarów i analizie stanu. Dokładnych rysunków technicznych nie zastępować generowanymi ilustracjami.

## 6. Jak zredagować język

| Obecny typ zapisu | Lepsza forma |
|---|---|
| „czubek freza” | „punkt programowany na osi freza, w płaszczyźnie czoła” |
| „odległość I/J” | „przyrostowa składowa wektora do środka łuku” |
| „obroty” jako wielkość we wzorze | „prędkość obrotowa n [obr/min]” |
| „detal nie rośnie” | „ograniczenie nagrzewania zmniejsza zmiany wymiarów” |
| „wymiary wracają absolutne” | „przywrócono programowanie absolutne G90” |
| „ten sam program działa na obu sterowaniach” | „tor ma te same współrzędne; zapis i funkcje maszyny wymagają dostosowania” |
| „sterowanie samo poprawi / narzędzie na pewno pęknie” | Konkretny warunek, możliwy skutek i działanie operatora |
| „katalog podaje” bez identyfikacji | „przyjmujemy do przykładu” albo identyfikacja narzędzia i zaleceń |
| „cały kontur obrobiony” po porównaniu linii | „pokryto wymagany tor osi narzędzia” |

Zasada redakcji: **co jest zadane → jaki stan obowiązuje → jaki ruch/efekt wynika → kiedy wniosek przestaje być prawdziwy**. Wystarczy zwykle jedno krótkie zastrzeżenie bez długiego akapitu ostrzegawczego. Potoczne zdanie jest dopuszczalne jako objaśnienie, gdy wcześniej podano poprawny termin.

## 7. Proponowana kolejność pracy

| Paczka | Zakres | Kryterium zakończenia |
|---|---|---|
| A — spójność techniczna | Półfabrykat/naddatek, G500, start/G43, pytanie o wejście w materiał, chłodzenie HRSA | Każda zmieniona zasada ma jawny profil i źródło; rysunek, opis i program używają tych samych danych |
| B — zaliczanie | Sześć kontrprzykładów; aktywne narzędzie, tryb, F, kolejność dojazdu i postój | Negatywne przypadki odrzucane, wzorce i dopuszczone warianty zaliczane |
| C — język 20 lekcji | Terminy, nadmierna pewność, niejasne podmioty, skróty | Bez zmiany znaczenia technicznego; ujednolicone n/vc/vf/fz/ap/ae |
| D — rysunki | Wymiary, osie, naddatek, płaszczyzna długości, nakładanie etykiet | Czytelne na komputerze; ręczny przegląd SVG także przy szerokości telefonu |
| E — układ | Puste sekcje, bibliografia, duże porównania, podpisy | Krótsza droga od celu do pierwszej próby, bez usunięcia potrzebnych założeń |

Podstawy według materiałów Haas należy **dopracować w istniejących FP.1–FP.3**, przede wszystkim w zakresie odniesienia długości, wysięgu, rzeczywistego zespołu narzędziowego i zamocowania. Nie ma obecnie powodu tworzyć kolejnego rozbudowanego wprowadzenia. ap/ae i naddatek najlepiej dołożyć tam, gdzie zaczyna się dobór posuwu i kontur, czyli F2.3/F3.2.

## 8. Materiały i granice odniesień

Odnośniki [S1]–[S7] identyfikują podstawę wskazanych uwag. Numery stron książek dotyczą numeracji drukowanej, chyba że zaznaczono inaczej. Materiały popularnonaukowe podane przez właściciela są punktem porównania sposobu tłumaczenia, nie rozstrzygającą instrukcją dla konkretnego sterowania.

| ID | Materiał | Wykorzystany zakres |
|---|---|---|
| S1 | Ryszard Kuryjański, *Obróbka skrawaniem i obrabiarki*, Warszawa 2011, Politechnika Warszawska, ISBN 83-89703-72-6; dokument z materiałów projektu | S. 26–29: narzędzie; s. 51–54: ruchy i podstawowe parametry skrawania |
| S2 | B. Storch, *Podstawy obróbki skrawaniem*, dokument z materiałów projektu | S. 77–79, strony PDF 74–76: rodzaje frezowania, współbieżność/przeciwbieżność |
| S3 | FANUC Series 0i-MODEL F, *Handbook*, B-64607EN/01, październik 2016; dokument z materiałów projektu | S. 69: modalność/reset/cykl; s. 71–73: tabela G-kodów M; s. 79: formaty; s. 200–201: DPI, M30, DWL |
| S4 | Haas, *Mill Programming Workbook*, dokument z materiałów projektu | S. 42–44: przykład startu/końca i Setting 9; profil Haas należy odróżniać od FANUC |
| S5 | Siemens, *SINUMERIK 840D sl / 828D — Fundamentals Programming Manual*, 10/2015, SW 4.7 SP2, 6FC5398-1BP40-5BA3 | Rozdz. 9.1: G500; 13.10: G53/G153/SUPA; 8.12: FZ; rozdział „Dwell time”: G4 |
| S6 | Haas, aktualne instrukcje online frezarki i VMT | Lista kodów profilu; zasady I/J dla łuku/pełnego okręgu |
| S7 | Sandvik Coromant, materiały producenta o frezowaniu i ceramicznym frezowaniu HRSA | Dobór chłodzenia według narzędzia i operacji; wyjątek ceramiki |

Publiczne odnośniki:

- [Siemens — Fundamentals, 10/2015](https://cache.industry.siemens.com/dl/files/541/109481541/att_862938/v1/PGsl_1015_en_en-US.pdf).
- [Haas — Mill G-codes](https://www.haascnc.com/service/online-operator-s-manuals/mill-operator-s-manual/mill---g-codes.html).
- [Haas — VMT G-codes](https://www.haascnc.com/service/online-operator-s-manuals/vertical-mill-turn-operator-s-manual-supplement/vmt---g-codes.html).
- [Haas — publiczna wersja Mill Programming Workbook](https://www.haascnc.com/content/dam/haascnc/en/service/reference/programming-workbooks/mill---programming-workbook.pdf).
- [Sandvik Coromant — Milling application guide](https://www.sandvik.coromant.com/en-gb/milling-appl-guide).
- [Sandvik Coromant — Ceramic milling in super alloys](https://videos.sandvik.coromant.com/tips-film-ceramic-milling-in-super).
- [Guhring — katalog, zalecenia dotyczące punktowania](https://guhring.com/Catalogs/CatalogPDF/ad20905b-6a95-4c43-a5f8-f4e9dc45bfb6) — pomoc do dalszej weryfikacji konkretnego zestawu, nie rozstrzygnięcie jego poprawności w tym raporcie.
- Materiały wskazane przez właściciela: [CNCCookbook](https://www.cnccookbook.com/cnc-programming-g-code/) i [HowToMechatronics](https://howtomechatronics.com/tutorials/g-code-explained-list-of-most-important-g-code-commands/). Warto porównać krótkie wyjaśnienie funkcji z bezpośrednim schematem i przykładem; nie przenosić bez sprawdzenia ich uproszczeń do profilu FANUC/SINUMERIK.

Nie udało mi się jednoznacznie odnaleźć i odczytać wskazanego materiału Jemielniaka ani osobnego *Haas Basic Mill Operator Hand Out ver. C*. Nie przypisuję im potwierdzenia uwag. Pełny tekst ISO 841 również nie był podstawą samodzielnego rozstrzygania szczegółów normy. FANUC Handbook jest skróconą instrukcją, nie zastępuje pełnego podręcznika programowania i instrukcji producenta obrabiarki. Dobór narzędzia, procedura M06 i konkretne domyślne stany pozostają do sprawdzenia dla wybranej maszyny.

## 9. Załącznik — kontrprzykłady do regresji

Programy poniżej służą do sprawdzenia warunków zaliczenia w GCat. Nie są programami produkcyjnymi. Trzy pierwsze potwierdzono w aktualnej stronie; trzy następne pochodzą z pilotażu F1. Identyczność aktualnych treści F1 została sprawdzona w tym przeglądzie.

### R1 — F2.1: brak drugiej wymiany narzędzia

**Zaobserwowane:** „Zaliczone”. **Oczekiwane:** odrzucenie — przed drugą operacją nie występuje M06 z wybranym T2. Pierwsze M06 nie powinno spełniać warunku drugiej wymiany.

```gcode
O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G43 H1 Z50.
S2500 M03
M08
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G01 X-5. F400
G01 Y55.
G00 Z50.
M09
T2
G00 G43 H2 Z50.
S1800 M03
G00 X12. Y10.
G00 Z2.
G01 Z-3. F100
G00 Z50.
M05
M30
```

### R2 — F3.1: błędny dojazd, poprawna para dopisana później

**Zaobserwowane:** „Zaliczone”. **Oczekiwane:** odrzucenie niespełnienia sekwencji dojazdu. To nie jest potwierdzenie rzeczywistej kolizji przez model maszyny — uchwyt i jego pełna geometria nie są odtwarzane przez tę kontrolę.

```gcode
O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
S2500 M03
M08
G00 X40. Y25. Z50.
G00 X-20. Y10. Z5.
G00 Z50.
G00 X-19. Y10.
G00 X-20. Y10.
G00 Z5.
M09
M05
M30
```

### R3 — F3.5: postój w złym miejscu i za krótki

**Zaobserwowane:** „Zaliczone”. **Oczekiwane:** odrzucenie — wymagane .5 s na Z−2, wykonane .01 s na Z5.

```gcode
O1002 (NAWIERCENIE)
G21 G90 G94 G17
G40 G49 G80
G54
T2 M06
S1500 M03
M08
G00 X20. Y25. Z50.
G00 Z5.
G04 X0.01
G01 Z-2. F80
G00 Z5.
M09
M05
M30
```

### R4 — F1.3: G91 obecne, lecz kontur wykonany w G90

**Zaobserwowane w pilotażu:** „Zaliczone”. **Oczekiwane:** odrzucenie, jeśli celem jest wykonanie wskazanego konturu przyrostowo.

```gcode
O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G43 H1 Z50.
S2500 M03
M08
G00 X0. Y0.
G00 Z5.
G01 Z-3. F150
G91
G90
G01 X20. F400
Y30.
X50.
Y0.
G90
G00 Z50.
M09
M05
M30
```

### R5 — F1.4: współrzędne przeliczone, F nieprzeliczony

**Zaobserwowane w pilotażu:** „Zaliczone”. **Oczekiwane:** odrzucenie, jeśli celem jest przeliczenie programu z posuwem 6 in/min. Poprawny przeliczony posuw wynosi 152,4 mm/min; ewentualne F150 wymaga jawnie dopuszczonego zaokrąglenia.

```gcode
O1000
G21 G90 G94 G17
G40 G49 G80
G54
T2 M06
G43 H2 Z50.8
S1800 M03
G00 X38.1 Y19.05
G00 Z2.54
G01 Z-2.54 F6
G00 Z50.8
M05
M30
```

### R6 — F1.5: wymagany nagłówek po obróbce

**Zaobserwowane w pilotażu:** „Zaliczone”. **Oczekiwane:** odrzucenie — wymagany stan startowy nie został ustanowiony przed operacją. Stan domyślny symulatora nie może zastąpić wykonania polecenia.

```gcode
O1000
T1 M06
G43 H1 Z50.
S2500 M03
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G01 X-5. F400
G01 Y55.
G00 Z50.
G21 G90 G94 G17
G40 G49 G80
G54
M05
M30
```

## 10. Pliki powiązane z ustaleniami

Wersja odniesienia to 9447bdc, a nie starszy lokalny checkout.

- Treści: `src/content/nauka/podstawy.ts`, `f0-1.ts`–`f0-3.ts`, `f1-1.ts`–`f1-5.ts`, `f2-1.ts`–`f2-4.ts`, `f3-1.ts`–`f3-5.ts`.
- Schematy: `src/components/lesson/figs-p.tsx`, `figs-f0.tsx`, `figs-f1.tsx`, `figs-f2.tsx`, `figs-f3.tsx`; wspólne `src/components/figs2.tsx` i mapowanie `src/components/diagrams.tsx`.
- Zadania: `src/lib/taskCheck.ts`, `src/lib/checker.ts`, `src/components/lesson/ProgramTask.tsx`.
- Quiz: `src/components/lesson/Quiz.tsx`.
- Plan: `src/lib/course.ts`.

Raport wymaga po wdrożeniu ponownego sprawdzenia zmienionych lekcji i kontrprzykładów. Nie deklaruje wykonania lint/build/test aplikacji ani gotowości programu do uruchomienia na obrabiarce.
