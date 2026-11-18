---
change_id: testy-zachowania-strony
title: Testy dzisiejszego zachowania strony, README i polecenie testów
status: plan_reviewed
created: 2026-11-18
updated: 2026-11-18
archived_at: null
---

## Notes

**Problem.** Strona Maestro (jednostronicowa zapowiedź na GitHub Pages) nie ma żadnych testów automatycznych, a każde wypchnięcie na `main` od razu ją publikuje. Właściciel chce zmieniać stronę przed premierą 30.11.2026; każda zmiana treści albo interakcji może po cichu zepsuć demo rozmowy, przykład w 8 krokach, motyw, formularz-demo albo układ na telefonie, a dziś nikt tego nie zauważy przed publikacją. Polecenie z `## Verify` w `CLAUDE.md` kończy się komunikatem o braku testów, więc Factory nie ma czym sprawdzić żadnej następnej zmiany.

**Oczekiwany efekt.**
- Właściciel i Factory uruchamiają jednym poleceniem testy, które na stronie zbudowanej tak jak do publikacji (prefiks `/www-maestro`), na ekranie telefonu (360 px) i komputera (1280 px), potwierdzają dzisiejsze zachowanie strony — kroki 1–16 scenariusza pierwszej wersji z PRD.
- README opisuje uruchomienie strony i testów.
- Polecenie z `## Verify` w `CLAUDE.md` przestaje kończyć się komunikatem o braku testów i uruchamia testy projektu bez przeglądarki; testy w przeglądarce idą poleceniem z nowej sekcji `## Testy w CI`. Czego nie będzie: polecenie sprawdzające samo nie uruchomi przeglądarki, bo wymaga ona Dockera; testy w przeglądarce biegną osobnym poleceniem przed scaleniem.
- Strona odwiedzającego wygląda i działa dokładnie tak jak dziś.

**Scenariusz człowieka.**
1. Właściciel (albo krok Factory) otwiera README w repo i znajduje polecenie uruchomienia strony i jedno polecenie wszystkich testów.
2. Uruchamia polecenie testów; testy budują stronę z prefiksem `/www-maestro` i otwierają ją w przeglądarce na ekranie telefonu i komputera.
3. Testy przechodzą kroki 1–14 scenariusza PRD: kolejność sekcji i brak błędów w konsoli, linki wewnętrzne, brak poziomego przewijania i przewijana tabela, nagłówek bez nawigacji, motyw według systemu i zapamiętany, demo rozmowy, 8 kroków przykładu, podgląd aplikacji obiadowej, FAQ, formularz-demo bez wysyłki, brak żądań poza adres strony, ograniczony ruch, kontrast, zasoby pod prefiksem.
4. Polecenie testów w przeglądarce po testach w kontenerze uruchamia na komputerze test kroku 15: README ma oba polecenia, a polecenie testów z README przechodzi. Test bez przeglądarki w poleceniu sprawdzającym potwierdza krok 16: kod strony, konfiguracja budowy i workflow publikacji są takie jak w commicie właściciela `5e4dcac`.
5. Właściciel widzi wynik: wszystko zielone przy dzisiejszej stronie; gdy następna zmiana coś zepsuje, test nazwany krokiem scenariusza pada przed scaleniem.

**Kogo dotyczy.** Właściciel strony Maestro i kroki Factory, które sprawdzają każdą następną zmianę strony; odwiedzający nie widzą różnicy.

**Ograniczenia.**
- Kod strony zostaje bez zmian: `app/`, `components/`, `lib/`, `public/`, style i konfiguracja budowy (PRD ## Constraints & Compatibility, zgoda przejęcia).
- Workflow publikacji `.github/workflows/pages.yml` bez zmian; adres publikacji i prefiks `/www-maestro` zostają.
- Kotwice sekcji (`#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist`) i klucz `maestro-theme` zostają.
- Formularz zostaje demonstracją bez wysyłki; brak analityki i usług zewnętrznych.
- Repo dostaje tylko to, co przejęcie dokłada bez pytania: testy, skrypt testów i zależności testów w `package.json` i `package-lock.json` (dokładne wersje), opis w README, polecenia w `CLAUDE.md`.
- Testy w przeglądarce biegną lokalnie w obrazie `mcr.microsoft.com/playwright:v1.65.0-noble` przez Docker bez roota (już są na komputerze fabryki); wersja `@playwright/test` równa wersji obrazu.
- Testy biegną na plikach zbudowanych lokalnie, nigdy pod adresem z `## Wdrożenie`.

**Czego nie robimy.**
- Żadnych zmian treści, wyglądu ani interakcji strony (także znaczników TODO i formularza — to S-02).
- Bez testów i skanu zależności w workflow publikacji (D-004) i bez nowego workflow CI gałęzi w `.github/workflows/`.
- Bez przypinania wersji zależności strony i aktualizacji frameworka (D-002), bez lintera i formatowania (D-003).
- Bez pełnego audytu dostępności i testów innych przeglądarek niż Chromium.

**Decyzje z góry.**
- Testy w przeglądarce w Playwright 1.65.0 w obrazie kontenera na komputerze fabryki, na 360 px i 1280 px. Źródło: agent — `context/foundation/start.md`, pytania kroku technologia i przygotowanie-posiedzenia; `context/foundation/test-plan.md`.
- Porównanie kroku 16 obejmuje pliki budowy strony, a `package.json` tylko poza wpisami skryptu i zależności testów. Źródło: agent — `context/foundation/roadmap.md`, S-01 Unknowns.
- Po scaleniu na `main` strona publikuje się jak dziś, a Factory sprawdza wynik publikacji bez cofania. Źródło: człowiek — posiedzenie dostępów 2026-11-18, „Na reszte sie zgadzam. Kontynuj”.

**Kryteria akceptacji.**

- **T1.** Strona otwiera się bez błędów i ostrzeżeń w konsoli przeglądarki i pokazuje sekcje w dzisiejszej kolejności z kroku 1 scenariusza PRD (hero, `#why`, `#how-it-works`, `#observer`, zasady, `#ownership`, porównanie, `#first-release`, roadmapa, dla kogo / dla kogo nie, `#faq`, `#waitlist`, stopka z „Back to top”); oczekiwana kolejność pochodzi z PRD, nie z odczytu strony.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 1\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 1” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T2.** Każdy link zaczynający się od `#` ma istniejący cel, a kliknięcie przycisków hero przewija do `#waitlist` i `#how-it-works`.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 2\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 2” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T3.** Na 360 px szerokość dokumentu równa się szerokości okna, a obszar tabeli porównania jest szerszy w treści niż na ekranie i przewija się poziomo; na 1280 px dokument nie przewija się poziomo.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 3\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 3” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T4.** Na 1280 px nagłówek pokazuje logo, przełącznik motywu i przycisk CTA, a na 360 px logo i przełącznik bez przycisku CTA; na obu ekranach nagłówek nie ma nawigacji po sekcjach ani menu.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 4\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 4” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T5.** Bez zapisanego wyboru motyw strony odpowiada jasnemu i ciemnemu ustawieniu systemu; po przełączeniu i odświeżeniu motyw zostaje, a jedynym kluczem w pamięci przeglądarki jest `maestro-theme`.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 5\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 5” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T6.** Kliknięcie zatwierdzenia kierunku w demo rozmowy zmienia stan demo, a kliknięcie powtórki przywraca stan początkowy.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 6\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 6” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T7.** Każdy z 8 kroków przykładu daje się wybrać i pokazuje swój opis; na pierwszym kroku „poprzedni”, a na ósmym „następny” jest wyłączony albo nie zmienia kroku.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 7\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 7” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T8.** Pokazanie podglądu aplikacji obiadowej wyświetla wynik posiłku, a reset przywraca stan początkowy.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 8\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 8” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T9.** Każde pytanie FAQ po pierwszym kliknięciu pokazuje odpowiedź, a po drugim ją ukrywa.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 9\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 9” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T10.** Wysłanie formularza listy oczekujących pustego i z adresem bez „@” pokazuje komunikat błędu w obszarze ogłaszanym czytnikom ekranu i oznacza pole jako błędne; z poprawnym adresem pokazuje komunikat podglądu; przy żadnej z trzech wysyłek przeglądarka nie wykonuje żądania sieciowego.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 10\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 10” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T11.** Przy otwarciu strony i przewinięciu jej do końca każde żądanie przeglądarki idzie pod adres strony (brak analityki, usług śledzących i fontów z zewnątrz).
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 11\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 11” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T12.** Przy włączonym ograniczeniu ruchu wyliczony styl przewijania dokumentu nie jest płynny, a po przewinięciu żaden element nie ma trwającej animacji.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 12\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 12” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T13.** Nagłówki, akapity, przyciski i komunikaty formularza mają kontrast co najmniej 4.5:1 z wyliczonych kolorów tekstu i tła (tło z najbliższego nieprzezroczystego przodka) w motywie jasnym i ciemnym.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 13\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 13” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T14.** Pliki zbudowane z `NEXT_PUBLIC_BASE_PATH=/www-maestro` podane pod `/www-maestro/` otwierają stronę, a żadne żądanie fontu, ikony, stylu ani skryptu nie kończy się błędem.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 14\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`; test „krok 14” przechodzi w projekcie telefonu 360 px i komputera 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`)
- **T15.** `README.md` zawiera polecenie uruchomienia strony i jedno polecenie wszystkich testów, a polecenie testów z README uruchomione przez test kończy się kodem 0.
  - Sprawdzenie: polecenie `npm run test:e2e -- --grep "krok 15\b"` (polecenie z `## Testy w CI` w `CLAUDE.md`); po testach w kontenerze test „krok 15” biegnie na komputerze bez przeglądarki, czyta README, sprawdza oba polecenia i uruchamia polecenie testów z README ze zmienną środowiska, która w tym uruchomieniu pomija sam test „krok 15” (bez pętli), i sprawdza kod 0
- **T16.** Katalogi `app/`, `components/`, `lib/`, `public/`, `.github/workflows/pages.yml` i pliki konfiguracji budowy (`next.config.ts`, `tsconfig.json`, `postcss.config.mjs`) nie różnią się od commitu `5e4dcac`, a `package.json` różni się od niego tylko wpisami skryptów testów i zależności testów.
  - Sprawdzenie: polecenie `npm run verify` (polecenie z `## Verify` w `CLAUDE.md`); test bez przeglądarki „krok 16” porównuje te ścieżki z `5e4dcac` przez `git`
- **T17.** Polecenie z `## Verify` w `CLAUDE.md` (skrypt testów `verify` w `package.json`) nie kończy się już komunikatem o braku testów: uruchamia sprawdzenie typów, testy bez przeglądarki i skan sekretów programem `gitleaks`, który już jest na komputerze fabryki (bez nowej zależności), i przechodzi bez uruchomionych usług lokalnych (bez Dockera).
  - Sprawdzenie: polecenie `npm run verify` (polecenie z `## Verify` w `CLAUDE.md`) kończy się kodem 0
- **T18.** `CLAUDE.md` ma sekcję `## Testy w CI` z poleceniem testów w przeglądarce (lokalnie w obrazie `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` przez Docker bez roota, w CI po instalacji przeglądarki) i sekcję `## Uruchomienie lokalne` z poleceniem uruchomienia strony na porcie ze zmiennej `PORT`, tylko na `127.0.0.1`; to samo polecenie uruchomienia jest w `README.md`.
  - Sprawdzenie: weryfikator — czyta obie sekcje `CLAUDE.md` i README i uruchamia polecenie uruchomienia z `PORT=3199`, sprawdzając nasłuch tylko na `127.0.0.1:3199`; ocena opisu w dokumentach wymaga odczytu, nie samego kodu wyjścia
- **T19.** `@playwright/test` i każda nowa zależność testów są w `devDependencies` z dokładną wersją (bez `^`, `~` i `latest`) i w `package-lock.json`, a `npm ci` instaluje je z pliku zablokowanych wersji.
  - Sprawdzenie: polecenie `node -e "const d=require('./package.json').devDependencies;for(const k of ['@playwright/test'])if(!/^\d+\.\d+\.\d+$/.test(d[k]||''))process.exit(1)" && npm ci --dry-run`
- **T20.** Testy w przeglądarce oczekują stanu widocznego dla odwiedzającego i nie czekają stałym czasem: kod testów nie ma `waitForTimeout`, a oczekiwania nie kopiują całych zdań treści z `lib/content.ts` tam, gdzie wystarcza nazwa dostępna albo kotwica.
  - Sprawdzenie: polecenie `! grep -rn waitForTimeout tests/` oraz weryfikator — czyta testy i sprawdza, że oczekiwania opierają się na kotwicach, rolach i nazwach dostępnych; ocena kruchości wymaga odczytu kodu
- **T21.** Zmiana dotyka tylko plików z planu.
  - Sprawdzenie: polecenie `python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py testy-zachowania-strony --rules 6`

**Ryzyko.** Wysokie. Zmiana dodaje nową zależność (`@playwright/test`) do pliku zależności projektu, a scalenie na `main` od razu uruchamia publikację strony.

**Zgodność z piramidą.**
- Po co: pozycja roadmapy S-01 testy-zachowania-strony (gwiazda przewodnia przejęcia, cel `quality`); PRD US-01, FR-001–FR-013.
- Zakłady: wzmacnia cel `quality` — zachowanie strony chronione, zanim ktokolwiek ją zmieni; wzmacnia guardrails PRD (kod strony bez zmian, brak usług zewnętrznych, formularz bez wysyłki), bo testy je sprawdzają; może złamać „Kod strony zostaje bez zmian”, gdy test wymagałby atrybutów w kodzie — dlatego testy używają tylko kotwic, ról i nazw dostępnych; wykluczenia PRD ## Non-Goals (treść, wygląd, publikacja, wersje, audyt dostępności) zostają poza zmianą.
- Granice:
  - Instalacja: paczka `@playwright/test` 1.65.0 w `devDependencies` repo (zależność projektu); obraz przeglądarki i Docker już są i były zaakceptowane
  - Pieniądze: nic (repozytorium publiczne, minuty GitHub Actions darmowe; testy lokalnie)
  - Dane: nic
  - Terminal człowieka: nic
  - Nieodwracalne przed akceptacją: nic; scalenie na `main` publikuje stronę, ale kod strony się nie zmienia
  - Tymczasowe na stałe: nic
  - Odrzucone prostsze warianty: (a) same testy bez przeglądarki (np. odczyt HTML z `out/`) — nie sprawdzą interakcji, motywu, układu na 360 px ani żądań sieci, a to główne ryzyka planu testów; (b) testy na serwerze deweloperskim bez prefiksu — zielony wynik nie mówiłby nic o stronie publikowanej pod `/www-maestro`.
- Najbliżej konfliktu: „Kod strony zostaje bez zmian w przejęciu” — test mógłby kusić dopisaniem `data-testid` w komponentach; przechodzi, bo kryterium T16 porównuje kod strony z `5e4dcac`, a testy opierają się na kotwicach i nazwach dostępnych.
- Niezależny przegląd: 3 konflikty; poprawione: (1) krok 15 PRD — test „krok 15” sam uruchamia polecenie testów z README i sprawdza kod 0 (zmienna środowiska pomija w nim sam siebie), zamiast oceny weryfikatora; (2) S-01 „polecenie z ## Verify uruchamia testy projektu” — zostaje rozdział: `## Verify` uruchamia testy bez przeglądarki, a testy kroków 1–14 idą poleceniem z `## Testy w CI`, które Factory uruchamia przed każdym scaleniem, bo reguła kawałka Factory wymaga, żeby polecenie sprawdzające przechodziło bez usług lokalnych (Dockera), a README ma jedno polecenie wszystkich testów; konflikt usunięty bez zmiany pozycji, bo pozycja dalej dostaje jedno polecenie wszystkich testów i ochronę przed scaleniem; (3) PRD „Co przejęcie dokłada bez pytania” — `verify` to skrypt testów w `package.json`, a skan sekretów używa zainstalowanego `gitleaks` bez nowej zależności (T17); do decyzji: nic

## Pytania do człowieka

- rodzaj: inne · krok: dostępy · pytanie: Opis: 1. Publikacja po scaleniu (S-01 i dalej). Gdy fabryka scali kawałek na main, strona publikuje się na https://lukeblonski.github.io/www-maestro/ tak jak dziś. Po każdym scaleniu fabryka sprawdzi, czy publikacja przeszła. Jeśli się nie uda, fabryka staje i pisze do Ciebie, ale niczego nie cofa. Pliku publikacji fabryka nie zmienia. W CLAUDE.md zapisze: workflow: pages.yml; krok wdrożenia: Deploy to GitHub Pages; narzędzia z sekretami: (brak); cofnięcie: brak; adres: https://lukeblonski.github.io/www-maestro/. 2. Konto Resend (S-02), urządzenie człowieka: zakładasz je na swój e-mail na https://resend.com/signup; w panelu (API Keys) tworzysz klucz; zapiszesz go jednym poleceniem w terminalu Hostingera; klucza nie wklejaj do rozmowy. 3. Konto Cloudflare (S-02), urządzenie człowieka: https://dash.cloudflare.com/sign-up, plan darmowy; token z szablonu „Edit Cloudflare Workers”; zapisujesz go tak samo; nie podłączaj repozytorium z GitHuba w panelu. 4. Dane i publiczny adres (S-02): adresy e-mail odwiedzających trafiają na listę kontaktów w Resend (dane w USA), funkcja Cloudflare działa na serwerach na całym świecie, publiczny adres <nazwa>.<twoja-subdomena>.workers.dev, zapisy tylko ze strony. 5. Klucze w usługach (S-02): fabryka sama prześle klucz Resend do ustawień funkcji w Cloudflare; wartość klucza nie przechodzi przez rozmowę; obie usługi w planie darmowym, bez karty; limit Resend 100 maili dziennie. Rekomendacja: zgodzić się na całość. S-01 rusza od razu, a konta z punktów 2–3 możesz założyć, kiedy będziesz gotów, byle przed S-02. Pytanie: Czy zgadzasz się na sprawdzanie publikacji z punktu 1 oraz na konta, dane, publiczny adres i przekazanie klucza z punktów 2–5? (odpowiedź człowieka: „Na reszte sie zgadzam. Kontynuj”; wcześniej dopytał o punkt 1, odpowiedział obserwator) · rekomendacja: zgoda na całość · wybór: rekomendacja · rozstrzygnął: człowiek · granica: 14 pytaj mnie (konta w usługach, sekrety) oraz 10 pytaj mnie (wysyłka danych do usług zewnętrznych)
- rodzaj: inne · krok: plan · pytanie: kto uruchamia testy w przeglądarce przed scaleniem, skoro autopilot dla przejętego projektu bramkuje tylko `## Verify`, a CI gałęzi nie ma (research, Otwarte pytania 1) · rekomendacja: wiersze Automated planu uruchamiają `npm run test:e2e -- --grep "krok N\b"`, więc krok implementacji i przeglądu tej zmiany uruchamia testy w przeglądarce; luka w autopilocie to osobna sprawa Factory, zgłoszona człowiekowi w pytaniu planu · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: plan · pytanie: gdzie Playwright zapisuje wyniki — katalog w ignorowanym `node_modules/.cache/` z reporterem `list` czy nowa linia `test-results/` w `.gitignore` (research, Otwarte pytania 3) · rekomendacja: `outputDir` w `node_modules/.cache/` i reporter `list` bez raportu HTML, bo nie dotyka `.gitignore` spoza plików zmiany · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: plan · pytanie: co z `next-env.d.ts`, który `npm run dev` przepisuje przy sprawdzaniu T18 (research, Otwarte pytania 4) · rekomendacja: plan nie commituje `next-env.d.ts`, a krok, który uruchamia `npm run dev`, przywraca go `git checkout -- next-env.d.ts` · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: kryterium · krok: plan · pytanie: Opis: T15 i T17 nie dają się spełnić naraz — T15 każe `npm run verify` uruchomić polecenie wszystkich testów z README, które obejmuje testy w przeglądarce idące tylko w Dockerze, a T17 i reguła fabryki wymagają, żeby `verify` przechodził bez Dockera. Rekomendacja: (a) test „krok 15” przechodzi z `npm run verify` do `npm run test:e2e`; po testach w kontenerze uruchamia na komputerze polecenie z README i sprawdza kod 0, pomijając sam siebie; zmienia się pole Sprawdzenie w T15 i krok 4 scenariusza; (b) `verify` uruchamia Dockera — łamie T17; (c) „krok 15” w `verify` tylko czyta README — nie dowodzi, że polecenie przechodzi. Pytanie: Czy zgadzasz się na wariant (a), czyli przeniesienie sprawdzenia T15 z `npm run verify` do `npm run test:e2e -- --grep "krok 15\b"` i poprawkę kroku 4 scenariusza, czy wybierasz (b) albo (c)? · rekomendacja: (a) · wybór: rekomendacja · rozstrzygnął: agent

## Zgody

- czas: 2026-11-18 09:48 · kto: człowiek · zgoda: wdrożenie · czego dotyczy: kawałek: wszystkie, sekcja ## Wdrożenie w CLAUDE.md (workflow pages.yml, krok Deploy to GitHub Pages, bez narzędzi z sekretami, cofnięcie: brak, adres https://lukeblonski.github.io/www-maestro/); po każdym scaleniu na main fabryka sprawdza wynik publikacji i przy porażce staje bez cofania (posiedzenie dostępów, start.md) · odpowiedź: „Na reszte sie zgadzam. Kontynuj”

## Zatrzymania autopilota

- czas: 2026-11-18 10:00 · krok: plan · powód: odmowa uprawnień: Bash: sed -n '/^## Ścieżki/,/^## [^ŚP]/p' docs/zgoda-czlowieka.md | head -120; echo ----; grep -n "^## Płatne testy skilli" -A 30 docs/zgoda-czlowieka.md | head -40; echo ----; grep -n "^6\.\|^## " docs/zasady-budowy.md | head -40; brak pliku context/changes/testy-zachowania-stron… · zrobiono: pytanie planu o T15 spoza bramek rozstrzygnięte przez agenta: wariant (a); odmowa dotyczyła tylko odczytu nieistniejących plików docs/ w repo aplikacji · skutek: krok idzie od nowa z odpowiedzią
- czas: 2026-11-18 10:18 · krok: plan-review · powód: w ## Wymaga Twojej decyzji przybyły wpisy: - **context/changes/testy-zachowania-strony/reviews/plan-review.md F3 — Potwierdzenie zmiany T15 przez człowieka nie czeka nigdzie w kolejce**; Reguła: bramka 1 · zrobiono: — · skutek: —

## Decyzje triage

### context/changes/testy-zachowania-strony/reviews/plan-review.md

- F1 — Kryterium 1.4 uruchamia `verify` na `HEAD` sprzed commita fazy (CRITICAL, Phase 1 — Success Criteria, wiersz 1.4): AUTO-FIX (normalne używanie): Wiersz 1.4 robi worktree z `HEAD` sprzed commita fazy, w którym nie ma jeszcze skryptu `verify` ani testu „krok 16”, więc bramka Automated Fazy 1 pada przy każdej próbie i faza nigdy nie dostaje commita; poprawka zmienia tylko polecenie w planie, mieści się w intencji i nie dotyka żadnej bramki. · commit e2d9c2d
- F2 — Tło do kontrastu ma uwzględniać sam element, nie tylko przodków (WARNING, Phase 2 — Changes Required #2, `krok 13`): AUTO-FIX (normalne używanie): Mierzone w T13 przyciski i `p.claude-note` mają własne nieprzezroczyste tło, więc kontrakt „najbliższy przodek” czytany dosłownie da czerwony test już na dzisiejszej stronie i zatrzyma implementację bez powodu; dopisanie „sam element albo jego najbliższy przodek (do `body` włącznie)” mierzy prawdziwe tło pod tekstem, a to jest zamiar T13, więc kryterium się nie zmienia. · commit e2d9c2d
- F3 — Potwierdzenie zmiany T15 przez człowieka nie czeka nigdzie w kolejce (WARNING, Decyzje planu, wiersz „Gdzie biegnie test krok 15”; plan-brief, „Otwarte ryzyka i założenia”): AUTO-ESCALATE (bramka 1): Przeniesienie sprawdzenia T15 z `npm run verify` do `npm run test:e2e -- --grep "krok 15\b"` i nowy krok 4 scenariusza zmieniają kryterium akceptacji i scenariusz w `change.md`, a rozstrzygnął to agent (`rozstrzygnął: agent`); każde wyjście z konfliktu T15 i T17 zmienia któreś kryterium, więc decyzję podejmuje człowiek przed implementacją.
- F4 — Zielone `typecheck` w świeżym worktree zależy od `skipLibCheck` (OBSERVATION, Current State Analysis; Phase 1, wiersz 1.4): AUTO-LIMIT (przypadek szczególny): Dziś `typecheck` przechodzi w świeżym worktree, a T16 zamraża `tsconfig.json`, więc błąd TS2882 wyszedłby tylko po wyłączeniu `skipLibCheck` albo po dopisaniu podobnych importów `.d.ts`; to przypadek wymyślony, którego nie ma w scenariuszu ani w „Chroni przed”. · D-005
- F5 — Strażnik „zero testów” liczy projekt `repo`, którego `test:e2e` nie uruchamia (OBSERVATION, Phase 1 — Changes Required #4, kroki 1 i 4): AUTO-LIMIT (przypadek szczególny): Fałszywa zieleń wychodzi tylko wtedy, gdy ktoś uruchomi `npm run test:e2e` z `--grep`, który wybiera wyłącznie test projektu `repo` (np. „krok 16”); w `change.md` krok 16 sprawdza `npm run verify`, więc przy zwykłej pracy to się nie zdarza. · D-006
- F6 — Zagnieżdżone przebiegi Playwright czyszczą wspólny `outputDir` (OBSERVATION, Decyzje planu, „Wyniki Playwright”; Phase 4 — `krok 15`): AUTO-LIMIT (przypadek szczególny): Zagnieżdżony przebieg w teście „krok 15” czyści wspólny `outputDir`, ale zewnętrzny przebieg projektu `readme` nie zapisuje tam artefaktów, więc dziś nic się nie psuje; szkoda pojawiłaby się dopiero przy artefaktach, których plan nie przewiduje. · D-007

## Wymaga Twojej decyzji

- **context/changes/testy-zachowania-strony/reviews/plan-review.md F3 — Potwierdzenie zmiany T15 przez człowieka nie czeka nigdzie w kolejce** · Reguła: bramka 1
  - Opis: Jeden z ustalonych warunków odbioru brzmiał: „polecenie sprawdzające uruchamia polecenie wszystkich testów z README i sprawdza, że przechodzi”. Tego nie da się pogodzić z innym warunkiem: polecenie sprawdzające ma działać bez Dockera, a testy strony w przeglądarce potrzebują Dockera. Fabryka sama, bez Ciebie, przeniosła więc ten sprawdzian do polecenia testów w przeglądarce. Po testach strony na telefonie i komputerze uruchamia ono raz jeszcze całe polecenie z README i sprawdza, że kończy się sukcesem. W tym celu poprawiła warunek T15 i krok 4 scenariusza. Zmiana warunku odbioru należy do Ciebie, a bez Twojej odpowiedzi fabryka zaczęłaby budować na poprawionym warunku.
  - Rekomendacja: Zatwierdzić wariant (a), czyli sprawdzian README w poleceniu testów w przeglądarce. Tylko on daje naraz jedno polecenie wszystkich testów, które naprawdę przechodzi, i polecenie sprawdzające bez Dockera. Wariant (b), polecenie sprawdzające z Dockerem, łamie regułę fabryki. Wariant (c), samo czytanie README, nie dowodzi, że polecenie przechodzi.
  - Pytanie: Czy zatwierdzasz poprawiony warunek T15 i krok 4 scenariusza (wariant (a))? Gotowa odpowiedź: „Zatwierdzam wariant (a) dla T15.” Po niej fabryka buduje według obecnego planu. Wybór (b) albo (c) zmieni plan i warunek przed budową.
