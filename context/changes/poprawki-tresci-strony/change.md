---
change_id: poprawki-tresci-strony
title: Poprawki treści strony Maestro według listy człowieka
status: new
created: 2026-11-22
updated: 2026-11-22
archived_at: null
---

## Notes

**Problem.** Strona zapowiedzi Maestro po przebudowie (S-04) nie mówi odwiedzającemu kilku rzeczy, które właściciel uważa za wartość Maestro: że Maestro ma wbudowane zabezpieczenia, że każda zmiana jest sprawdzana, czy nie psuje tego, co już działa, że po premierze właściciel produktu dostaje wiadomość o każdej naprawie, co trzeba mieć na start, czy Maestro przejmie istniejący produkt, jak Maestro działa w środku i że za samo Maestro się nie płaci. Część zdań jest też zbyt techniczna albo za słaba (np. „Your server. Always on.”, „In plain language, with a recommendation”, etykieta „Flat learning curve”). Właściciel podał listę poprawek 2026-11-22 i zaakceptował teksty razem z PRD v4 i pozycją S-05: „Akceptuję (Recommended)”.

**Oczekiwany efekt.**
- „Your partner”, punkt „It remembers.”: tekst kończy się „…Its entire memory is stored on your server, so nothing gets lost between sessions.”
- „You decide”: punkt „Every question comes with a recommendation.” kończy się „…tells you which answer it recommends and why, so you can make informed decisions.”; nowy, czwarty punkt „Guardrails built in.” z tekstem „Maestro works inside built-in safeguards. It keeps away from your passwords and keys, never changes files you protect, and never bends a test just to make a change pass.” i linią pod spodem „Setting your own guardrails coming soon”.
- „From build to deploy”: nowy, czwarty punkt „What works keeps working.” z tekstem „Before any change reaches your users, Maestro checks that the main things your product already does still work, the way your users use them.”
- „After launch” (zostaje „Coming soon”): „It looks after your product.” – „Maestro keeps watching your product and, when something goes wrong, proactively fixes it, and lets you know every time it does.”; „It helps your product grow.” – „Maestro helps you shape a product strategy, gathers feedback from your users and your tools, and implements changes, improvements and new features, while asking as little of your time as possible.”
- „On your terms”: „You never touch the code.” – „You don’t need to know what a PR, a merge, a ticket, an API, a skill or an md file is. All you need is the will to create!”; tytuł „Maestro is always on.” zamiast „Your server. Always on.”, a jego tekst zaczyna się „Maestro runs 24/7 on a separate server, so it has no access to the data on your computer.”, dalej bez zmian; „No new app to learn.” – „You talk to Maestro in the Claude app on your computer or phone. Not another clunky drag-and-drop tool or cluttered interface.”; „Your own subscription.” – „Maestro runs the official Claude Code on your own server, signed in with your own Claude plan. No extra AI fees: Maestro only uses what your Claude subscription already includes.” Linie „Codex and others coming soon” i „Codex and OpenCode coming soon” zostają.
- Porównanie: etykieta „Why Maestro” zamiast „Flat learning curve”; nagłówek, zdanie wstępu i kolumny bez zmian; wiersze (kreatory | Maestro): „Made for” – bez zmian | „Anyone who has an idea for a product but doesn’t want to deal with the build details”; „What you need to know” – „How to prompt, maintain and grow” | „The thing you want to build. Maestro helps you with the rest”; „Who steers the build” – bez zmian | „Maestro. You decide what your product does”; „How it talks to you” – „Prompt, answer, prompt” | „Like a partner who remembers everything you agreed, discussed and decided, in plain language without technical jargon”; „After launch” (zostaje „Coming soon”) – „Optional monitoring and AI fixes on some plans, which you need to oversee on your own” | „Fixes issues and helps your product grow. You approve its decisions and add your input when you want”. Nad wierszem nagłówka tabeli („Prompt-to-app builders” / Maestro) nie ma czarnej linii oddzielającej (uwaga człowieka w makiecie: „usun ta czrna linie oddzielajaca”); linie między wierszami zostają. Czego nie będzie: czarnej linii nad tabelą porównania na telefonie i komputerze; słowa „deploy” w kolumnie kreatorów, bo typowe kreatory aplikacji z promptu publikują aplikację jednym przyciskiem; „and how it looks” w wierszu „Who steers the build”.
- FAQ: 11 pytań w kolejności: „Do I need to know how to code?”, „What do I need to start?” (nowe: „The Claude app, an active Claude subscription and a server. The installer guides you through setting up the server.”), „What will it cost?”, „When can I start?”, „Does Maestro do anything without asking me?”, „Where are my data, code and project history?”, „Can Maestro work on a product I already have?” (nowe: „Yes. Maestro can take over an existing project: it learns how your product works, protects what already works with checks, and then keeps building with you.”), „What’s under the hood?” (nowe: „Maestro is the official Claude Code running on your own server. Behind it, a set of steps turns what you agree on into a written plan, builds it with AI agents, reviews and tests every change, and deploys it. Maestro is the one you talk to: it keeps your project’s memory, asks you only what needs your decision, and explains everything in plain language.”), „What happens if I stop using Maestro?”, „Will it tell me whether my idea is worth building?”, „Does the first release maintain my application automatically?”. Odpowiedź „What will it cost?” to dzisiejszy tekst, a po nim pogrubione (element `strong`) zdanie „We don’t charge you anything for Maestro.”

**Scenariusz człowieka.**
1. Osoba z pomysłem otwiera stronę z udostępnionego linku na telefonie albo komputerze i przewija pięć sekcji; w „You decide” czyta o wbudowanych zabezpieczeniach z zapowiedzią ich ustawiania, w „From build to deploy” o tym, że każda zmiana jest sprawdzana, w „After launch” o wiadomości po każdej naprawie, a w „On your terms” „Maestro is always on.” i „No extra AI fees”.
   - Sprawdzenie: teksty-sekcji · stan końcowy: opublikowana strona pod adresem z ## Wdrożenie podaje teksty pięciu sekcji z Oczekiwanego efektu, w tym „Guardrails built in.”, „Setting your own guardrails coming soon”, „What works keeps working.”, „lets you know every time it does” i „Maestro is always on.”, i nie podaje już „Your server. Always on.” · sprzątanie: nic nie tworzy
7. W porównaniu pod etykietą „Why Maestro” czyta sześć wierszy z nowymi zdaniami, bez czarnej linii nad nagłówkiem tabeli; na telefonie jako bloki, bez przewijania w bok.
   - Sprawdzenie: teksty-porownania · stan końcowy: opublikowana strona podaje etykietę „Why Maestro” i sześć wierszy porównania z Oczekiwanego efektu, a nie podaje „Flat learning curve” · sprzątanie: nic nie tworzy
8. Przy „After launch” w sekcjach i w porównaniu nadal widzi „Coming soon”.
   - Sprawdzenie: coming-soon · stan końcowy: opublikowana strona podaje „Coming soon” przy sekcji „After launch”, przy wierszu porównania „After launch” i w pytaniu FAQ o utrzymanie · sprzątanie: nic nie tworzy
9. Otwiera pytania FAQ, które ją niepokoją: co trzeba mieć na start, ile to kosztuje (i widzi pogrubione „We don’t charge you anything for Maestro.”), czy Maestro przejmie jej istniejący produkt, jak Maestro działa w środku; każde pytanie otwiera się i zamyka.
   - Sprawdzenie: faq-strony · stan końcowy: opublikowana strona podaje 11 pytań FAQ w kolejności z Oczekiwanego efektu, z trzema nowymi odpowiedziami, a odpowiedź „What will it cost?” ma zdanie „We don’t charge you anything for Maestro.” w elemencie strong · sprzątanie: nic nie tworzy

**Kogo dotyczy.** Odwiedzający stronę zapowiedzi (osoby nietechniczne z pomysłem) i właściciel strony, którego słowa strona publicznie obiecuje.

**Ograniczenia.**
- Zmienia się tylko treść w `lib/content.ts`, wyświetlenie jednego pogrubionego zdania w odpowiedzi FAQ, usunięcie górnej ramki tabeli porównania w `app/globals.css` (reguła `.cmp`), testy kroków 1, 7, 8, 9 i 16 oraz cztery linie `## Sprawdzenie na żywo` w `CLAUDE.md` z poleceniem, które czyta opublikowaną stronę (wymóg Factory: każdy krok scenariusza ma sprawdzenie na działającej aplikacji); poza tą ramką układ, wygląd, kotwice sekcji, spis sekcji, formularz zapisu z funkcją zapisu (`worker/`) i workflow publikacji zostają bez zmian.
- Nazwa produktu dalej z jednej stałej `PRODUCT_NAME`.
- FR-023: „After launch” i pytanie FAQ o utrzymanie mają widoczne „Coming soon”; strona nigdzie nie obiecuje, że właściciel niczego nie sprawdza.
- Porównanie nadal ma 2 kolumny i 6 wierszy, bez nazw cudzych produktów i bez przypisu (FR-022).
- Strona nie wysyła żadnego żądania poza swój adres (krok 11 bez zmian).

**Czego nie robimy.**
- Nie dodajemy ustawiania zabezpieczeń, monitoringu, napraw po premierze ani powiadomień w Maestro; strona tylko je zapowiada („coming soon”, sekcja z „Coming soon”). Czego nie będzie: odwiedzający nie dostanie żadnej z tych funkcji z tej zmiany.
- Nie zmieniamy hero, tytułu karty, stopki, formularza ani komunikatów zapisu.
- Nie dodajemy nowych sekcji ani obrazów.
- Nie zmieniamy cennika ani nie dodajemy strony cen; pogrubione zdanie o koszcie to jedyna zmiana w tej sprawie.

**Decyzje z góry.**
- Teksty z Oczekiwanego efektu, PRD v4 i pozycja S-05 po S-04, z poprawkami: „checks that… still work” zamiast obietnicy „żadna zmiana nie psuje”, „No extra AI fees” zamiast „żadnych dodatkowych kosztów”, „The installer guides you” zamiast pomocy Claude przy serwerze, w porównaniu zostaje „on some plans”. Źródło: człowiek — odpowiedź „Akceptuję (Recommended)” 2026-11-22 (roadmapa S-05, „Akceptacja tekstów”).
- Publiczna obietnica „We don’t charge you anything for Maestro.” pogrubiona w odpowiedzi o koszcie. Źródło: człowiek — ta sama odpowiedź, po przeczytaniu ryzyka obietnicy cenowej.
- W wierszu „What you need to know” kreatory mają „How to prompt, maintain and grow”, bez „deploy”: człowiek przyjął regułę, że „deploy” wejdzie tylko wtedy, gdy typowe kreatory wymagają wiedzy o publikacji, a typowe kreatory aplikacji z promptu publikują aplikację jednym przyciskiem. Czego nie będzie: zdania, że w kreatorach trzeba umieć publikować. Źródło: człowiek — reguła z punktu 6 przyjęta 2026-11-22; zastosował agent.

**Kryteria akceptacji.**

- **P1.** Plik treści strony ma wszystkie zdania z Oczekiwanego efektu dla pięciu sekcji, porównania i FAQ, dosłownie, a stare zdania, które zastępują („Your server. Always on.”, „Flat learning curve”, „Through prompts and a preview”, „In plain language, with a recommendation”, „on some plans, which you turn on and oversee”, „the will to build your next moonshot”), zniknęły ze zbudowanej strony.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok (1|7)\b"`
- **P2.** FAQ ma 11 pytań w kolejności z Oczekiwanego efektu, każde otwiera się i zamyka na telefonie (360 px) i komputerze (1280 px), a odpowiedź „What will it cost?” ma zdanie „We don’t charge you anything for Maestro.” w elemencie strong.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 9\b"`
- **P3.** „Coming soon” jest przy sekcji „After launch”, przy wierszu porównania „After launch” i w pytaniu FAQ o utrzymanie, a „Setting your own guardrails coming soon” jest pod punktem „Guardrails built in.”.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 8\b"`
- **P4.** Pozostałe kroki scenariusza strony przechodzą bez zmian (układ, linki, brak przewijania w bok, spis, formularz, brak żądań poza adres strony, ograniczony ruch, kontrast, prefiks `/www-maestro`, README).
  - Sprawdzenie: polecenie `npm run test:e2e`
- **P5.** `## Sprawdzenie na żywo` w `CLAUDE.md` ma linie `teksty-sekcji`, `teksty-porownania`, `coming-soon` i `faq-strony` z poleceniem, które czyta stronę pod adresem z `NA_ZYWO_ADRES` i zapisuje plik wyniku z pustą listą usług.
  - Sprawdzenie: weryfikator — czyta `CLAUDE.md` i skrypt sprawdzenia; wynik na opublikowanej stronie ocenia dopiero skrypt autopilota po publikacji, więc żadne polecenie przed scaleniem tego nie rozstrzyga.
- **P6.** Polecenie sprawdzające przechodzi, test „krok 16” dopuszcza pliki tej zmiany, a zmiana dotyka tylko plików z planu.
  - Sprawdzenie: polecenie `npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py poprawki-tresci-strony --rules 6`
- **P7.** Tabela porównania nie ma czarnej linii nad wierszem nagłówka: wyliczona górna ramka tabeli porównania ma szerokość 0 na telefonie (360 px) i komputerze (1280 px), a linie między wierszami zostają.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 7\b"`
- **P8.** Ekrany jak w zaakceptowanej makiecie `context/changes/poprawki-tresci-strony/makieta/makieta.html` (wersja z sumą fb975a6d048db8564b7e950b26bba3d29c88c50dbfcfae1bd2d18af4c536ae24 z `context/changes/poprawki-tresci-strony/makieta/akceptacja.md`).
  - Sprawdzenie: weryfikator — czyta kod zmienionych ekranów i sprawdza, że budują to, co pokazuje zaakceptowana makieta.

**Ryzyko.** Niskie. Zmiana zmienia tylko teksty statycznej strony, jedno pogrubienie i jedną linię w wyglądzie tabeli porównania, bez danych, logowania, płatności, nowych usług, zależności ani publicznego API; obietnicę cenową i zapowiedzi zaakceptował człowiek.

**Zgodność z piramidą.**
- Po co: pozycja roadmapy S-05 poprawki-tresci-strony (PRD v4, FR-009, FR-017, FR-022, FR-023); cel PRD: odwiedzający ma zrozumieć wartość Maestro i zapisać się na listę oczekujących.
- Zakłady: wzmacnia cel strony (wartość Maestro zrozumiała bez żargonu); trzyma FR-023 (zapowiedzi z „Coming soon”, właściciel produktu zatwierdza decyzje); trzyma ograniczenia PRD: brak usług zewnętrznych, kotwice, prefiks `/www-maestro`, jeden formularz; może złamać tylko wymóg prawdziwości zdań o kreatorach aplikacji z promptu (FR-022 i ryzyko S-04), dlatego zostaje „on some plans” i nie ma „deploy”.
- Granice:
  - Instalacja: nic
  - Pieniądze: nic
  - Dane: nic
  - Terminal człowieka: nic
  - Nieodwracalne przed akceptacją: nic; publikacja strony idzie po scaleniu, z `cofnięcie: brak`, a zdania da się poprawić następną zmianą
  - Tymczasowe na stałe: nic
  - Odrzucone prostsze warianty: (a) tylko zmiana tekstów bez pogrubienia — człowiek prosił o pogrubione zdanie; (b) dopisanie zdań bez zmiany testów kroków 1, 7, 8, 9 — testy kroków przestałyby pilnować treści, którą strona obiecuje
- Najbliżej konfliktu: FR-023 („strona nigdzie nie obiecuje, że właściciel niczego nie sprawdza”) — przechodzi, bo „After launch” zostaje z „Coming soon”, a wiersz porównania mówi „You approve its decisions”.
- Niezależny przegląd: 3 konflikty; poprawione: (1) zakres i „Na żywo” w roadmapie S-05 i w Ograniczeniach obejmują teraz cztery sprawdzenia na żywo, których Factory wymaga dla każdego kroku scenariusza; (2) PRD v4 i roadmapa S-05 wymieniają teraz też sekcję „Your partner” (punkt „It remembers.” był na liście człowieka); (3) FR-023 przy „proactively fixes it, and lets you know every time it does” — przechodzi bez zmiany słów człowieka: zdanie było na stronie od S-04, sekcja ma „Coming soon”, a wiersz porównania mówi „You approve its decisions”; do decyzji: nic

**Źródło.** Prośba człowieka z 2026-11-22 przez Maestro; gałąź `poprawki-tresci-strony`.

## Pytania do człowieka

- rodzaj: zakres · krok: akceptacja-prd · pytanie: akceptacja zmienionego PRD (wersja 4, FAQ z 11 pytaniami) i nowej pozycji S-05 po S-04, z proponowanymi tekstami i poprawkami z punktów 1 (sprawdzanie zmian zamiast „never breaks”), 4 („No extra AI fees” zamiast „żadnych dodatkowych kosztów”), 5 („The installer guides you” zamiast pomocy Claude przy serwerze) i 6 (w porównaniu zostaje „on some plans”, a „deploy” po stronie kreatorów tylko, gdy sprawdzenie typowych kreatorów przy budowie to potwierdzi); punkt 7 („We don’t charge you anything for Maestro.”, publiczna obietnica cenowa) przyjęty tą samą odpowiedzią po przeczytaniu ryzyka (odpowiedź człowieka: „Akceptuję (Recommended)”) · rekomendacja: akceptować PRD v4 i S-05 z poprawkami 1, 4, 5 i 6 · wybór: rekomendacja · rozstrzygnął: człowiek · granica: 20 pytaj mnie (akceptacja opisu produktu i pozycji roadmapy z prośby człowieka)
- rodzaj: zakres · krok: makieta · pytanie: akceptacja makiety context/changes/poprawki-tresci-strony/makieta/ (wersja 1, commit e0ca3fc) i intencji zmiany, z gotowymi odpowiedziami „Akceptuję (Recommended)”, „Uwagi”, „Uwagi wpisałem w komentarzach” (odpowiedź człowieka: „Uwagi wpisałem w komentarzach”; komentarz przy nagłówku tabeli porównania w #why: „usun ta czrna linie oddzielajaca”) · rekomendacja: akceptacja makiety i intencji · wybór: inny: uwaga do makiety, wprowadzona w wersji 2 (53dd4ca) · rozstrzygnął: człowiek · granica: 20 pytaj mnie (akceptacja makiety i intencji zmiany)
- rodzaj: zakres · krok: makieta · pytanie: akceptacja makiety context/changes/poprawki-tresci-strony/makieta/ i intencji zmiany: Opis: nowa wersja makiety (commit 53dd4ca, ścieżka /home/fabryka/projekty/www-maestro/context/changes/poprawki-tresci-strony/makieta/makieta.html); w makiecie usunięta czarna linia nad nagłówkiem tabeli porównania („Prompt-to-app builders / Maestro”), szare linie między wierszami zostają, nagłówek z ramką „Changed”; kolumna Maestro bez jasnoniebieskiego tła, wyrównana do obecnej strony (to nie jest nowa zmiana wyglądu); w intencji: Oczekiwany efekt bez czarnej linii z uwagą człowieka „usun ta czrna linie oddzielajaca”, zakres z jedną regułą w pliku stylów (górna ramka tabeli porównania), nowe kryterium P7 (brak linii na 360 px i 1280 px, test kroku 7), krok 7 scenariusza „bez czarnej linii nad nagłówkiem tabeli”, to samo zdanie w roadmapie S-05 i w PRD; reszta bez zmian: te same teksty, te same sprawdzenia na opublikowanej stronie i ta sama zgoda — po każdej publikacji Factory sprawdza stronę, a gdy sprawdzenie nie przejdzie, błędna wersja zostaje online do naprawy (cofnięcie: brak); intencja przechodzi sprawdzenie skryptem; Wymaga Twojej decyzji: nic nie czeka na Ciebie. Rekomendacja: „Akceptuję (Recommended)” — uwaga jest wprowadzona w makiecie i w intencji, a zmiana to dalej same teksty i jedna linia w wyglądzie, którą łatwo poprawić następną zmianą. Pytanie: czy akceptujesz nową wersję makiety i intencję zmiany poprawki-tresci-strony, razem ze sprawdzaniem strony po każdej publikacji i z tym, że błędna wersja zostanie online do naprawy? Odpowiedzi: „Akceptuję (Recommended)” albo uwagi własnymi słowami. (odpowiedź człowieka: „Akceptuję (Recommended)”) · rekomendacja: akceptacja ostatniej wersji makiety i intencji · wybór: rekomendacja · rozstrzygnął: człowiek · granica: 20 pytaj mnie (akceptacja makiety i intencji zmiany)
