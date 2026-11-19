---
change_id: przebudowa-strony
title: Przebudowa treści i układu strony Maestro
status: planned
created: 2026-11-18
updated: 2026-11-19
archived_at: null
---

## Notes

**Problem.** Strona zapowiedzi Maestro ma 13 sekcji i za dużo treści, a odbiorca, osoba nietechniczna z pomysłem, ma z niej zrozumieć wartość Maestro i zapisać się na listę oczekujących. Właściciel (2026-11-18): hasło „Build the right product, the right way. Autonomously.” sugeruje, że to użytkownik sam buduje automatycznie, a „to nie jest idea maestro”; grafika w hero „pokazuje tylko zwykły chat”; sekcje problemu, pierwszego wydania, roadmapy i „dla kogo” nic nie wnoszą; przykład w 8 krokach przeczy obietnicy pracy bez człowieka; data wydania i wizja 2027 to „bzdety niepotrzebne z punktu widzenia odbiorcy”. Pierwszą makietę tej zmiany (6 sekcji z kaflami) właściciel odrzucił: „Ta strona wygląda jak jakieś gówno”. Wzorem ekranów jest makieta zaprojektowana przez Maestro z rozpiski właściciela i przez niego przyjęta: `context/changes/przebudowa-strony/makieta/makieta.html` (sha256 f81e9dc0b7c23c095b277a859534c07cc0bfcf5c133a6d7e9cee9a1db91191ce, przyjęta przez człowieka 2026-11-18: „Akceptuję tak, jak jest”).

**Oczekiwany efekt.**
- Nagłówek strony: logo i przycisk „Join the first release” do zapisu na końcu strony. Czego nie będzie: przełącznika motywu.
- Hero na cały ekran (`#top`): „Everyone can build their moonshot.”, nagłówek „You bring the idea. Maestro builds it.”, zdanie „Your partner in building the right product, the right way. You agree on what to build. Maestro takes care of the rest.”, przyciski „Join the first release” (do `#waitlist`) i „See how it’s different” (do `#why`), na dole grafika z cienkich linii (plik obrazu z makiety). Czego nie będzie: pola e-mail, znaczników, grafiki z rozmową i krokami, daty wydania, wizji 2027.
- Blok pięciu sekcji (`#how-it-works`) ze spisem po lewej, który przykleja się przy przewijaniu i wyróżnia sekcję, której górna krawędź minęła 35% wysokości okna; poniżej 980 px szerokości spisu nie ma. Sekcje w kolejności: „Your partner” (`#observer`, zdanie wstępu i 5 punktów), „You decide” (`#control`, 3 punkty), „From build to deploy” (`#deploy`, w spisie „Build to deploy”, 3 punkty), „After launch” (`#after-launch`, oznaczenie „Coming soon”, 2 punkty, jedyna sekcja z tłem), „On your terms” (`#ownership`, 4 punkty, dwa z linią „Codex and others coming soon” i „Codex and OpenCode coming soon”). Treść nagłówków i punktów dokładnie jak w makiecie. Czego nie będzie: kafli, ikon ani rysunków w sekcjach.
- Porównanie (`#why`): etykieta „Flat learning curve”, nagłówek „A different approach to building.”, zdanie „Writing code is solved. Solving problems is not.”, dwie kolumny („Prompt-to-app builders” i Maestro), 6 wierszy jak w makiecie; poniżej 640 px wiersze stają się blokami. Czego nie będzie: kolumn „AI coding agents” i „Agent platforms for engineering teams”, nazw cudzych produktów, przypisu pod tabelą, podświetlania kolumny Maestro.
- FAQ (`#faq`): 8 pytań jak w makiecie, nagłówek po lewej, lista po prawej; każde pytanie otwiera się i zamyka. Czego nie będzie: pytania „How long does it take to start a project?” i zdania „Maestro pricing is to be announced.”.
- Koniec strony (`#waitlist`, w nim `#first-release`): „What will your moonshot be?”, formularz zapisu (jedyny na stronie) z dzisiejszymi komunikatami i dzisiejszą funkcją zapisu, duży napis „maestro”, stopka z „Everyone can build their moonshot.” i „Back to top”.
- Wygląd jak w makiecie: tylko jasny motyw, biel z błękitno-szarymi akcentami, fonty Host Grotesk i JetBrains Mono podawane z adresu strony. Ruch: tylko płynne przewijanie i przejścia w spisie; przy ograniczonym ruchu ich nie ma.
- Tytuł karty: „Maestro — You bring the idea. Maestro builds it.”.

**Scenariusz człowieka.**
1. Osoba z pomysłem otwiera stronę z udostępnionego linku na telefonie albo komputerze i na pierwszym ekranie czyta „You bring the idea. Maestro builds it.” i zdanie o partnerze.
2. Klika „Join the first release” i strona przewija się do formularza na końcu; albo klika „See how it’s different” i przewija się do porównania.
3. Gdy chce wiedzieć więcej, przewija pięć sekcji; na komputerze spis po lewej pokazuje, w której sekcji jest, a kliknięcie pozycji spisu przenosi do sekcji.
4. W porównaniu widzi, czym Maestro różni się od kreatorów aplikacji z promptu; na telefonie czyta wiersze jako bloki, bez przewijania w bok.
5. Otwiera pytania FAQ, które ją niepokoją (koszt, kiedy start, czy Maestro robi coś bez pytania).
6. Na końcu strony wpisuje e-mail i klika „Join the first release”; widzi ten sam komunikat co dziś, a właściciel dostaje e-mail jak dziś.

**Kogo dotyczy.** Odwiedzający stronę zapowiedzi (osoby nietechniczne z pomysłem) i właściciel strony, który dostaje e-maile o zapisach.

**Ograniczenia.**
- Ekrany jak w przyjętej makiecie; treść po angielsku w `lib/content.ts`, nazwa produktu w jednej stałej `PRODUCT_NAME`.
- Brak analityki i usług zewnętrznych poza istniejącym punktem zapisu; fonty i obraz hero z adresu strony (makieta bierze fonty z Google Fonts tylko dlatego, że podgląd na claude.ai nie pozwala inaczej).
- Ten sam adres i ta sama publikacja (`.github/workflows/pages.yml` bez zmian); funkcja zapisu w `worker/` bez zmian, formularz wysyła to samo żądanie co dziś.
- Kotwice z udostępnionych linków działają: `#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist` istnieją; nowe `#control`, `#deploy`, `#after-launch`.
- Bez poziomego przewijania dokumentu od 360 px; kontrast tekstu co najmniej 4.5:1; komunikaty formularza ogłaszane czytnikom ekranu.
- O Claude strona pisze jak dziś („the Claude app”, „your own Claude plan”, „the official Claude Code”); „Codex” i „OpenCode” tylko jako „coming soon”.

**Czego nie robimy.**
- Nie zmieniamy hasła Maestro poza stroną (piramida i opis produktu zostają); właściciel: „Hasło zmieniamy na stronie. Skupiamy się na razie na stronie.”
- Bez ciemnego motywu i bez przełącznika motywu; klucz `maestro-theme` przestaje być czytany, więc osoba, która wybrała kiedyś ciemny motyw, zobaczy jasny.
- Bez nazw cudzych produktów w porównaniu.
- Nie zmieniamy funkcji zapisu ani komunikatów formularza.
- Bez informacji o prywatności (D-001, jak w S-02); bez tłumaczenia strony i zmiany nazwy produktu.
- Bez obietnicy „Maestro sprawdza całość, Ty niczego nie sprawdzasz”.

**Decyzje z góry.**
- Wygląd projektuje Maestro, a Factory buduje stronę dokładnie według jego makiety. Źródło: człowiek — „Ty projektujesz (Recommended)”.
- Układ: hero na cały ekran, sekcje ze spisem po lewej jak na wskazanym przykładzie, porównanie tylko z kreatorami aplikacji z promptu, FAQ, koniec strony „What will your moonshot be?”, lekka stylistyka. Źródło: człowiek — rozpiska z 2026-11-18 i „karuzela ma dzialac tak jak na przykladzie”.
- Treść nagłówków, punktów, porównania i FAQ jak w makiecie po 21 komentarzach człowieka (m.in. sekcje „You decide” i „From build to deploy”, akapity o decyzji człowieka i „Autonomy whenever it makes sense”, usunięty przypis i „Maestro pricing is to be announced.”). Źródło: człowiek — komentarze na stronie makiety i „jest ok”.
- Grafika hero z Higgsfield. Źródło: człowiek — „przywroc to z higgsfield”.
- Spis wyróżnia sekcję, której górna krawędź minęła 35% okna. Źródło: człowiek — uwaga, że spis „za szybko przeskakuje” i „nie zawsze działa”.
- Fonty Host Grotesk i JetBrains Mono oraz biało-błękitnoszare kolory z makiety. Źródło: człowiek — „fonty i kolorystyke zachowaj z tego gowna ktore zrobiles” (o poprzedniej wersji makiety Maestro, która miała już te fonty i kolory). Wobec dzisiejszej strony znikają zielone kolory i font DM Sans.
- Opieka po starcie z oznaczeniem „Coming soon”; „Codex and others coming soon” i „Codex and OpenCode coming soon” na stronie; „Works 24/7” zostaje. Źródło: człowiek — „Punkt jeden i dwa zostaw coming soon.”, „Kodeks i inne wkrótce to decyzja o kierunku, więc powinno być napisane.”, „Zostaw działa 24/7.”
- „See it working first.” bez dopisku o warunku prywatnej sieci. Źródło: człowiek — „Akceptuję tak, jak jest” (rekomendacja dopisku odrzucona).
- Budowa dopiero na słowo człowieka „buduj”, osobną wiadomością. Źródło: człowiek — prośba z 2026-11-18 przez obserwatora.

**Kryteria akceptacji.**

- **P1.** Strona pokazuje hero, pięć sekcji, porównanie, FAQ i koniec strony w kolejności z „Oczekiwany efekt”, z ich nagłówkami i kotwicami, bez tekstów „30 November 2026”, „Our 2027 vision”, „Autonomously.”, „manual test”, „You bring the problem”, bez błędów w konsoli, a tytuł karty to „Maestro — You bring the idea. Maestro builds it.”, na 360 i 1280 px.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 1\b"`
- **P2.** Każdy link zaczynający się od `#` prowadzi do istniejącego elementu, oba przyciski „Join the first release” prowadzą do `#waitlist`, „See how it’s different” do `#why`, a `#how-it-works` i `#first-release` istnieją.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 2\b"`
- **P3.** Na 360 px szerokość dokumentu równa się szerokości okna, a porównanie nie ma treści szerszej niż jego obszar; na 1280 px porównanie ma dwie kolumny i 6 wierszy.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 3\b"`
- **P4.** Nagłówek strony ma logo i przycisk „Join the first release”, bez przełącznika motywu i bez innej nawigacji.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 4\b"`
- **P5.** Strona ma jeden, jasny motyw niezależnie od ustawienia systemu i niczego nie zapisuje w pamięci przeglądarki.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 5\b"`
- **P6.** Na 1280 px spis ma pięć pozycji, po przewinięciu do każdej sekcji wyróżniona jest jej pozycja, a kliknięcie pozycji przenosi do sekcji; na 360 px spisu nie widać.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 6\b"`
- **P7.** Porównanie ma kolumny „Prompt-to-app builders” i „Maestro” i 6 wierszy z makiety, bez przypisu, a tekst strony nie zawiera nazw „Lovable”, „Bolt”, „Replit”, „Cursor”, „Warp”, „HumanLayer”, „Devin”.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 7\b"`
- **P8.** Sekcja „After launch” i pytanie FAQ o utrzymanie mają widoczne „Coming soon” albo „coming soon”, a punkty aplikacji i subskrypcji mają linie „Codex and others coming soon” i „Codex and OpenCode coming soon”.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 8\b"`
- **P9.** FAQ ma 8 pytań z makiety i każde otwiera się po pierwszym kliknięciu i zamyka po drugim.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 9\b"`
- **P10.** Formularz na końcu strony przy pustym i błędnym adresie pokazuje komunikat błędu ogłaszany czytnikom ekranu bez żądania, a przy poprawnym wysyła jedno żądanie do punktu zapisu i pokazuje komunikat sukcesu albo niepowodzenia z `lib/content.ts`.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 10\b"`
- **P11.** Przy ograniczonym ruchu nie ma płynnego przewijania ani przejść.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 12\b"`
- **P12.** Zdania w kolumnie „Prompt-to-app builders” są zgodne z wnioskiem researchu tej zmiany o typowych produktach tej kategorii (typu Bolt, Lovable, Replit).
  - Sprawdzenie: weryfikator — porównuje wiersze porównania w `lib/content.ts` z sekcją o kategorii w `context/changes/przebudowa-strony/research.md`; prawdziwości zdania o cudzym produkcie nie rozstrzygnie polecenie.
- **P13.** Kroki 11, 13 i 14 przechodzą na nowej stronie (wszystkie żądania, także fonty i obraz hero, pod adresem strony; kontrast co najmniej 4.5:1; zasoby pod `/www-maestro`), test „krok 16” dopuszcza pliki tej zmiany, polecenie sprawdzające przechodzi, a zmienione są tylko pliki z planu.
  - Sprawdzenie: polecenie `npm run test:e2e && npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py przebudowa-strony --rules 6`

- **P14.** Ekrany jak w zaakceptowanej `context/changes/przebudowa-strony/makieta/makieta.html` (wersja z sumą z `akceptacja.md`).
  - Sprawdzenie: weryfikator — czyta kod zmienionych ekranów i sprawdza, że budują to, co pokazuje zaakceptowana makieta.

**Ryzyko.** Wysokie. Zmiana wszystkiego, co widzi odwiedzający, na publicznej stronie zapowiedzi, z decyzjami produktowymi (nowe hasło na stronie, zapowiedzi „Coming soon”, nowe obietnice o podglądzie i wdrożeniu), a scalenie od razu publikuje nową stronę.

**Zgodność z piramidą.**
- Po co: pozycja roadmapy S-04 (przebudowa-strony); cel strony z PRD v3: odbiorca rozumie wartość Maestro i zapisuje się na listę oczekujących przed pierwszym wydaniem.
- Zakłady: wzmacnia „Nie musisz znać PR, Node ani VPS” („You never touch the code.”), „Obserwator to Twój pomocnik z pamięcią” („It remembers.”), „Wszystko u użytkownika, bez naszego hostingu” i „Cały ślad zostaje u Ciebie” („Your server. Always on.”), „Nic bez Twojej wiedzy” (sekcja „You decide” i FAQ), „Pytamy tylko o to, co zobaczysz” („Autonomy whenever it makes sense.”, „Every question comes with a recommendation.”). Nie obiecuje „Nie sprawdzasz, czy działa”; „Najpierw sprawdzamy, czy warto budować” jest w FAQ jako „planned for a later release”.
- Granice:
  - Instalacja: nic
  - Pieniądze: nic
  - Dane: nic nowego; formularz idzie tą samą drogą co dziś
  - Terminal człowieka: nic
  - Nieodwracalne przed akceptacją: nic; scalenie publikuje stronę dopiero po akceptacji i słowie „buduj”
  - Tymczasowe na stałe: nic
  - Odrzucone prostsze warianty: (a) pierwsza makieta Factory (6 sekcji z kaflami) — odrzucona przez człowieka; (b) drugi formularz w hero — człowiek wybrał przyciski do zapisu na końcu strony
- Najbliżej konfliktu: hasło piramidy „Build the right product, the right way. Autonomously.” — na stronie zastępuje je „You bring the idea. Maestro builds it.” z decyzji właściciela, a zdanie pod nagłówkiem zachowuje „the right product, the right way”; piramida się nie zmienia.
- Niezależny przegląd: z poprzedniej wersji intencji 3 konflikty rozstrzygnięte przez człowieka 2026-11-18 (zakład „Nie sprawdzasz, czy działa”, hasło i wizja 2027, „Najpierw sprawdzamy, czy warto budować”); nowa wersja ich nie zmienia. Zdanie „See it working first.” zostaje w brzmieniu z makiety: człowiek przy akceptacji nie wybrał dopisku, że prywatny podgląd jest tylko u właściciela, który przyjął prywatną sieć („Akceptuję tak, jak jest”).

## Pytania do człowieka

- rodzaj: zakres · krok: makieta · pytanie: akceptacja makiety context/changes/przebudowa-strony/makieta/ i intencji zmiany: Strona www Maestro: akceptacja nowej strony według Twojej makiety (zmiana S-04 „przebudowa-strony”). Makieta: https://claude.ai/artifact/PM9ancLmcDFy1hTwL3gGJt Od Maestro: pod linkiem jest teraz plik z repozytorium Factory. Porównałem go z wersją, którą przyjąłeś: 69 ekranów na pięciu rozmiarach okna, wszystkie identyczne. Poniżej pytanie Factory, dosłownie. Opis: Przyjąłeś wygląd słowami „jest ok”. Wpisuję teraz zmianę do planu projektu jako „do zrobienia”. Ta akceptacja zatwierdza razem trzy rzeczy: makietę, opis zmiany i opis strony w planie projektu. Pod linkiem jest ta sama strona co wcześniej. Różnica jest jedna: fonty są teraz w samym pliku, a nie z Google, bo strona nie może korzystać z usług zewnętrznych. Po akceptacji nic się nie buduje, dopóki nie napiszesz „buduj”. Po budowie scalenie od razu publikuje nową stronę. Co będzie na stronie: • Na górze: logo i przycisk „Join the first release”. • Hero na cały ekran: – „Everyone can build their moonshot.” i nagłówek „You bring the idea. Maestro builds it.”; – zdanie o partnerze; – dwa przyciski: „Join the first release” prowadzi do zapisu na końcu strony, „See how it’s different” do porównania; – na dole grafika z Higgsfield. • Pięć sekcji ze spisem po lewej: „Your partner”, „You decide”, „From build to deploy”, „After launch” (z „Coming soon”), „On your terms”. Spis wyróżnia sekcję, w której jesteś, a jego kliknięcie przenosi do sekcji. Na telefonie spisu nie ma. Treść dokładnie jak w makiecie, z Twoimi 21 poprawkami. • Porównanie „A different approach to building.”: tylko Maestro i kreatory aplikacji z promptu, 6 wierszy, bez przypisu. Na telefonie wiersze są blokami. Zdania o kreatorach Factory sprawdzi w sieci przed budową i poprawi te, które okażą się nieprawdziwe. • FAQ: 8 pytań. • Koniec strony: „What will your moonshot be?” z jedynym formularzem zapisu, duży napis „maestro” i stopka. • Wygląd: biel z błękitnoszarymi akcentami, fonty Host Grotesk i JetBrains Mono, jak prosiłeś. • Tytuł karty przeglądarki: „Maestro — You bring the idea. Maestro builds it.” Czego nie będzie: • Ciemny motyw i przełącznik motywu. Strona jest tylko jasna. Kto wybrał kiedyś ciemny, zobaczy jasną. • Formularz w hero. Zapis jest tylko na końcu strony, przyciski do niego prowadzą. • Grafika z rozmową i krokami, kafle, ikony w sekcjach, podświetlanie tabeli. Co znika wobec dzisiejszej strony: • Sekcje: problem, przykład w 8 krokach z podglądem aplikacji obiadowej, „Less to manage…”, pierwsze wydanie z listą, roadmapa, „You know your world…”. • Teksty: data wydania, wizja 2027, hasło „…Autonomously.”, pytanie FAQ o czas startu, obietnice, że niczego nie musisz sprawdzać. • Wygląd: zielone kolory i font DM Sans. Bez zmian: zapis na listę (ta sama droga i te same komunikaty), adres strony, brak analityki. Nie ma nowych danych, wydatków ani dostępów. Ruch na stronie to tylko płynne przewijanie i przejścia w spisie. Przy wyłączonym ruchu w systemie strona stoi. Rekomendacja: akceptować, z jedną poprawką w punkcie „See it working first.”. Dziś brzmi: „As each part is finished, you can open a private preview and try your product before anyone else does.” Maestro rzeczywiście daje taki podgląd po każdej części, ale tylko gdy przy instalacji wybierzesz prywatną sieć dla swoich urządzeń. Bez niej podglądu nie ma. Proponuję dopisać ten warunek: „As each part is finished, you can open a private preview on your own devices and try your product before anyone else does. You choose whether to set this up.” Bez tej poprawki osoba, która nie wybierze prywatnej sieci, przeczyta obietnicę, której Maestro jej nie da. Pytanie: Czy akceptujesz nową stronę według makiety? Gotowe odpowiedzi: „Akceptuję, z dopiskiem o prywatnym podglądzie (Recommended)”, „Akceptuję tak, jak jest”, „Mam uwagi”, „Uwagi wpisałem w komentarzach”. (odpowiedź człowieka: „Akceptuję tak, jak jest”; w rozmowie także „przyjmuje”) · rekomendacja: akceptacja ostatniej wersji makiety i intencji, z dopiskiem o prywatnym podglądzie w „See it working first.” · wybór: inny: Akceptuję tak, jak jest (akceptacja bez dopisku) · rozstrzygnął: człowiek · granica: 20 pytaj mnie
- rodzaj: kryterium · krok: plan · pytanie: kolor --quiet z makiety (#9aa3ab, 2.56:1 na bieli) i placeholder #6b7a87 (2.90:1 na --sky) nie spełniają kontrastu 4.5:1 z intencji; przyciemnić czy zostawić jak w makiecie? · rekomendacja: przyciemnić --quiet do #646d76 i placeholder do #4d5964, krok 13 mierzy też span.q, pozycje spisu przy fokusie i placeholder, odstępstwo wpisane w plan dla weryfikatora P14 · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: zakres · krok: plan · pytanie: makieta podświetla kolumnę Maestro tłem --sky-soft, a intencja mówi „Czego nie będzie: … podświetlania kolumny Maestro”; którą wersję budować? · rekomendacja: bez tła komórek kolumny Maestro, jak w przyjętej intencji i pytaniu o akceptację; krok 7 sprawdza równe tło obu kolumn · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: kryterium · krok: plan · pytanie: research uznał wiersze 1 („Anyone who wants a quick prototype”) i 6 („Up to you”) kolumny kreatorów za wprowadzające w błąd; jakie brzmienie? · rekomendacja: „Anyone who wants to build an app by chatting with AI” i „Optional monitoring and AI fixes on some plans, which you turn on and oversee”, wiersze 2–5 bez zmian (P12, zapowiedź poprawki w pytaniu o akceptację) · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: plan · pytanie: #waitlist jako <footer> (makieta) czy <section> z wewnętrznym <footer>? · rekomendacja: <footer id="waitlist"> jak w makiecie, krok 1 przepisany na jedyny contentinfo po main · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: plan · pytanie: drobiazgi spoza makiety: zielona ikona karty, link pominięcia nawigacji, meta description, DESIGN.md, VERIFICATION.md, .impeccable/design.json, test-plan.md i stack-assessment.md · rekomendacja: ikona w kolorach #111111/#ffffff, link pominięcia zostaje, description ze zdania hero, aktualizacja DESIGN.md, VERIFICATION.md, README, CLAUDE.md (## Verify) i test-plan.md, bez zmian .impeccable/design.json i stack-assessment.md · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: plan · pytanie: zdania o kreatorach sprawdzone tylko w źródłach producentów, bez niezależnych recenzji; czy to wystarcza? · rekomendacja: przyjąć werdykty z dokumentacji producentów, a wiersze 1 i 6 poprawić według najgorszego przypadku · wybór: rekomendacja · rozstrzygnął: agent
