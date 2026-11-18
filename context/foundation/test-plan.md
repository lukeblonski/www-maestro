# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (§1–§5); cookbook patterns at the bottom (§6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see §8).
>
> Last updated: 2026-11-18

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost × signal.** The cheapest test that gives a real signal for the
   risk wins. Do not promote to e2e because e2e "feels safer." Do not put a
   vision model on top of a deterministic visual diff that already catches
   the regression.
2. **User concerns are first-class evidence.** Risks anchored in "the
   owner wants to change the page from today, before the 30 November 2026
   release, and a silent break would surface somewhere in the interactions,
   the layout on a phone or the published build" carry the same weight as
   PRD lines or hot-spot data.
3. **Risks are scenarios, not code locations.** This plan documents *what
   could fail* and *why we believe it's likely* — drawn from documents,
   interview, and codebase *signal* (churn, structure, test base). It does
   NOT claim to know which line owns the failure. That knowledge is
   produced by `/10x-research` during each rollout phase. If the plan and
   research disagree about where the failure lives, research is the
   ground truth.

Hot-spot scope used for likelihood weighting: `app/`, `components/`, `lib/` (excluded: `public/` static assets, `context/`, docs, `node_modules/`, `.next/`, `out/`).

Projektowe uzupełnienie zasad: strona jest statyczna, bez zaplecza i usług z zewnątrz, więc jedyną warstwą z prawdziwym sygnałem dla zachowania odwiedzającego jest przeglądarka na stronie zbudowanej jak do publikacji (prefiks `/www-maestro`), na 360 px i 1280 px (PRD, Scenariusz pierwszej wersji). Kroki o repo (README, brak zmian w kodzie strony) sprawdza test bez przeglądarki w tym samym narzędziu. Testy powstają w kawałkach roadmapy, nie w osobnych zmianach (D-304): każda przyszła zmiana strony dopisuje lub poprawia testy swojego zachowania w swoim kawałku.

## 2. Risk Map

The top failure scenarios this project must protect against, ordered by
risk = impact × likelihood. Risks are failure scenarios in user / business
terms, not test names. The Source column cites the *evidence that surfaced
this risk* — never a specific file as "where the failure lives" (that is
research's job, see §1 principle #3).

| # | Risk (failure scenario) | Impact | Likelihood | Source (evidence — not anchor) |
|---|-------------------------|--------|------------|--------------------------------|
| 1 | Zmiana treści albo interakcji po cichu psuje demo rozmowy (zatwierdzenie/powtórka), przykład w 8 krokach (granice poprzedni/następny), podgląd aplikacji obiadowej (pokaż/reset), FAQ albo komunikaty formularza-demo; scalenie od razu publikuje zepsutą stronę | High | High | PRD Problem Statement; PRD FR-006–FR-010; hot-spot dir `components/` — 3 commits/30d (interakcje zmieniane w 3 z 6 commitów); PRD Open Questions 3 (zmiana „dzisiaj”); interview Q1, Q3 |
| 2 | Edycja treści zmienia kolejność sekcji, usuwa albo przemianowuje kotwicę (`#why`, `#how-it-works`, `#waitlist`…) albo rozpycha stronę na telefonie (poziome przewijanie dokumentu, tabela bez własnego przewijania, CTA w nagłówku na 360 px) — udostępnione linki prowadzą donikąd | High | High | PRD FR-001–FR-004, Constraints (kotwice zostają); hot-spot dir `lib/` — 6 commits/30d (każdy commit); hot-spot dir `app/` — 3 commits/30d; interview Q2 |
| 3 | Strona zaczyna wysyłać dane albo wykonywać żądania poza swój adres: e-mail z formularza wychodzi do sieci lub trafia do pamięci przeglądarki, pojawia się analityka albo font z zewnątrz — bez informacji o prywatności i administratorze danych (abuse / PII leakage) | High | Medium | PRD Guardrails, Constraints (jedyny zapis to `maestro-theme`); limitations.md D-001 (podłączenie listy to spodziewana następna zmiana); README (opis podłączenia listy); interview Q1 |
| 4 | Strona zbudowana z prefiksem `/www-maestro` ładuje się bez stylów, fontów, ikony albo skryptów (błędy 404), choć lokalnie bez prefiksu działa | High | Medium | PRD krok 14 scenariusza, Wdrożenie dziś; limitations.md D-002 (wersje „latest”, ciche podbicie frameworka); hot-spot dir `app/` — 3 commits/30d; interview Q2 |
| 5 | Zmiana stylów obniża kontrast głównych par tekst/tło poniżej 4.5:1 w jednym z motywów albo ustawienie ograniczonego ruchu przestaje wyłączać animacje i płynne przewijanie | Medium | High | PRD Constraints (dostępność), kroki 12–13; hot-spot dir `app/` (style zmieniane w 4 z 6 commitów); VERIFICATION.md (sprawdzone dotąd tylko ręcznie) |
| 6 | Motyw przestaje iść za ustawieniem systemu bez zapisanego wyboru albo nie zostaje po odświeżeniu; zmiana klucza w pamięci przeglądarki kasuje wybór powracających odwiedzających | Medium | Medium | PRD FR-005, Constraints (klucz `maestro-theme` zostaje); hot-spot dir `app/` — 3 commits/30d |
| 7 | Przejęcie samo zmienia kod strony, konfigurację budowy albo workflow publikacji, albo polecenie testów z README nie uruchamia się — wbrew zgodzie właściciela na przejęcie | High | Low | PRD Guardrails, kroki 15–16 scenariusza; start.md ## Akceptacja (zgoda przejęcia: kod strony nie ruszany); roadmap S-01 Unknowns |

Abuse / security lens: strona nie ma logowania, płatności ani zaplecza; jedynym wejściem od odwiedzającego jest pole e-mail formularza-demo. Wiersz #3 pokrywa wyciek danych osobowych i żądania na zewnątrz. Nadużycie zasobów i autoryzacja nie mają powierzchni (brak zaplecza). Awaria GitHub Pages to High × Low dla obserwacji, nie dla testu — poza mapą.

### Risk Response Guidance

| Risk | What would prove protection | Must challenge | Context `/10x-research` must ground | Likely cheapest layer | Anti-pattern to avoid |
|------|-----------------------------|----------------|--------------------------------------|-----------------------|-----------------------|
| #1 | Odwiedzający na 360 px i 1280 px klika zatwierdzenie i powtórkę demo, przechodzi 8 kroków (pierwszy i ósmy nie dają wyjść poza zakres), pokazuje i resetuje podgląd, otwiera i zamyka każde FAQ — test pada, gdy którakolwiek interakcja przestaje zmieniać stan widoczny dla odwiedzającego | „Element jest widoczny” nie znaczy „interakcja działa”; „przycisk wyłączony” i „przycisk nic nie zmienia” to dwa różne sposoby granicy — test ma przyjąć oba, ale nie żaden inny | stan początkowy i końcowy każdej interakcji widoczny w DOM; dostępne nazwy przycisków; czy animacje opóźniają zmianę stanu; liczba kroków i pytań FAQ z treści strony | e2e (przeglądarka, strona zbudowana) | kopiowanie dokładnych zdań treści jako oczekiwań (każda zmiana tekstu = czerwony test); `waitForTimeout` zamiast czekania na stan |
| #2 | Kolejność sekcji z PRD kroku 1 i lista kotwic z PRD Constraints są oczekiwaniem testu; każdy link `#…` ma cel; na 360 px `scrollWidth` dokumentu = szerokość okna, a obszar tabeli porównania przewija się sam; CTA w nagłówku tylko na 1280 px | „Wszystkie linki mają cel” nie wystarcza, gdy kotwica zniknęła razem z linkiem — oczekiwana lista kotwic pochodzi z PRD, nie z odczytu strony | jak sekcje są oznaczone (identyfikatory, nagłówki); próg mobilny nagłówka; który element jest obszarem przewijania tabeli | e2e (dwa rozmiary ekranu) | odczytanie listy sekcji ze strony i porównanie jej z nią samą (problem wyroczni); zrzut całej strony jako jedyny dowód |
| #3 | Przy otwarciu, przewinięciu do końca i wysłaniu formularza (pusty, bez „@”, poprawny) każde żądanie idzie pod adres strony, wysłanie nie tworzy żadnego żądania, a w pamięci przeglądarki jest tylko `maestro-theme` | „Komunikat mówi, że nic nie wysłano” nie dowodzi, że nic nie wysłano — liczy się zapis żądań przeglądarki, nie tekst | jak formularz zapobiega domyślnej wysyłce; które zasoby strona ładuje leniwie przy przewijaniu; obszar ogłaszany czytnikom ekranu i oznaczenie błędnego pola | e2e z nasłuchem żądań i odczytem pamięci przeglądarki | sprawdzanie tylko komunikatu; blokowanie sieci bez zapisu żądań (żądanie na zewnątrz pada po cichu zamiast oblać test) |
| #4 | Pliki z budowy z `NEXT_PUBLIC_BASE_PATH=/www-maestro` podane pod `/www-maestro/` otwierają się, a żadne żądanie fontu, ikony, stylu ani skryptu nie kończy się błędem | Test na serwerze deweloperskim albo na budowie bez prefiksu daje zielony wynik, który nic nie mówi o publikacji | sposób podania `out/` pod ścieżką z prefiksem; zasoby, które strona pobiera; zachowanie bez końcowego ukośnika | e2e na zbudowanych plikach (wspólne dla wszystkich testów w przeglądarce) | testy na `next dev`; sprawdzanie samego kodu odpowiedzi strony głównej bez zasobów |
| #5 | Dla nagłówków, akapitów, przycisków i komunikatów formularza w obu motywach kontrast z wyliczonych kolorów ≥ 4.5:1; przy ograniczonym ruchu brak płynnego przewijania i trwających animacji po przewinięciu | Przezroczyste tło elementu nie jest tłem — kolor tła trzeba wziąć z najbliższego nieprzezroczystego przodka; próg 4.5:1 pochodzi z PRD, nie z obecnych wartości | które pary kolorów są „główne”; jak motyw jest ustawiany przed testem; jak strona wyłącza animacje | e2e z odczytem wyliczonych stylów (bez dodatkowej biblioteki) | wpisanie obecnych kolorów jako oczekiwań; zrzuty ekranu zamiast liczenia |
| #6 | Bez zapisanego wyboru motyw odpowiada jasnemu i ciemnemu ustawieniu systemu; po przełączeniu i odświeżeniu motyw zostaje, a jedyny klucz pamięci to `maestro-theme` | Przełączenie, które działa do odświeżenia, nie jest zapamiętaniem; brak migotania nie jest celem tego planu | gdzie strona zapisuje motyw i jak go odczytuje przed wyrenderowaniem; jak oznacza aktywny motyw w dokumencie | e2e z emulacją ustawienia systemu | sprawdzanie klasy po kliknięciu bez odświeżenia; wartość klucza skopiowana z kodu zamiast z PRD |
| #7 | Polecenie testów z README kończy się kodem 0, README zawiera polecenie uruchomienia strony i testów, a `app/`, `components/`, `lib/`, `public/`, workflow publikacji i pliki konfiguracji budowy nie różnią się od `5e4dcac` (plik zależności tylko o wpis skryptu i zależności testów) | „Testy przechodzą” nie dowodzi, że przejęcie nie ruszyło kodu — potrzebne porównanie z commitem właściciela | które pliki to „konfiguracja budowy”; jak porównać plik zależności poza dozwolonymi wpisami (roadmap S-01 Unknowns); czy test ma dostęp do historii gita w kontenerze | test bez przeglądarki w tym samym narzędziu | test wywołujący sam siebie w pętli (polecenie testów uruchamiające cały pakiet z tym testem); porównanie z ruchomym `HEAD` zamiast z `5e4dcac` |

## 3. Phased Rollout

Each row is a discrete rollout phase that will open its own change folder
via `/10x-new`. Status moves left-to-right through the values below; the
orchestrator updates Status as artifacts appear on disk.

Etapy pokrywają się z kawałkami roadmapy (D-304): folder zmiany otwiera kawałek roadmapy, nie osobna zmiana testów. Roadmapa przejęcia ma jeden kawałek, więc plan ma jeden etap; kolejność ochrony wewnątrz niego (wspólna budowa z prefiksem → #1 i #2 → #3 → #5 i #6 → #7) jest wskazówką dla podfaz `/10x-plan`.

| # | Phase name | Goal (one line) | Risks covered | Test types | Status | Change folder |
|---|------------|-----------------|----------------|------------|--------|---------------|
| 1 | Testy dzisiejszego zachowania strony (S-01) | Udowodnić, że interakcje, sekcje, kotwice, układ na telefonie, prywatność formularza, budowa z `/www-maestro`, kontrast, motyw i zakres przejęcia są chronione testem, który pada przy cichej regresji; jedno polecenie w README i w `## Verify` | #1, #2, #3, #4, #5, #6, #7 | e2e (Playwright, 360 px + 1280 px, strona zbudowana) + test bez przeglądarki (README, porównanie z `5e4dcac`) | not started | — (otwiera kawałek roadmapy `testy-zachowania-strony`) |

## 4. Stack

The classic test base for this project. AI-native tools (if any) carry a
`checked:` date so future readers can see which lines need re-verification.
Recommendations in this section must be grounded in local manifests/configs
plus the MCP/tools actually exposed in the current session. If a useful docs
or search MCP such as Context7 or Exa.ai is not available, say that instead
of assuming access.

Test-base profile: `none` — brak konfiguracji narzędzia testów, skryptu `test` i plików testów (health-check.md, Test Suite; odczyt 2026-11-18).

| Layer | Tool | Version | Notes |
|-------|------|---------|-------|
| e2e (przeglądarka) | `@playwright/test` w obrazie `mcr.microsoft.com/playwright:v1.65.0-noble` przez Docker bez roota | 1.65.0 (dokładna, zgodna z obrazem) | none yet — see Phase 1; jedyna nowa zależność testów; Chromium wystarcza (PRD Non-Goals: bez audytu przeglądarek) |
| test bez przeglądarki | ten sam `@playwright/test` (test bez strony) | 1.65.0 | none yet — see Phase 1; README i porównanie z `5e4dcac` bez drugiego narzędzia |
| typy | `tsc --noEmit` (`npm run typecheck`) | TypeScript 7.0.2 z pliku blokady | działa dziś |
| budowa | `next build --webpack` z `NEXT_PUBLIC_BASE_PATH=/www-maestro` | Next.js 16.4.6 z pliku blokady | działa dziś; daje `out/` dla testów w przeglądarce |
| środowisko | Node.js 22 i npm 10 z `mise.toml`; instalacja tylko `npm ci` | 22.23.5 / 10.9.10 | D-002: plik zależności ma „latest” |
| dostępność | liczenie kontrastu z wyliczonych stylów w Playwright | n/a | bez axe-core i bez porównań zrzutów — zbędna zależność wobec PRD kroków 12–13 |
| sekrety | gitleaks | 8.30.1 | zabezpieczenia projektu |

**Stack grounding tools (current session):**
- Docs: none — Context7 ani inny docs MCP nie są dostępne w tej sesji; wersję Playwright oparto na obrazie lokalnym i rejestrze npm (`npm view @playwright/test@1.65.0 version` → 1.65.0); checked: 2026-11-18
- Search: none — Exa.ai ani web search MCP nie są dostępne w tej sesji; checked: 2026-11-18
- Runtime/browser: none jako MCP — Playwright działa jako narzędzie testów w kontenerze (`docker run --rm --network none mcr.microsoft.com/playwright:v1.65.0-noble` → node v26.13.0, przeglądarki chromium-1254, firefox-1572, webkit-2388); checked: 2026-11-18
- Provider/platform: none — GitHub MCP niedostępny; workflow publikacji nie jest bramką testów (D-004); checked: 2026-11-18

## 5. Quality Gates

The full set of gates that must pass before a change reaches production.
"Required for §3 Phase <N>" means the gate is enforced once that rollout
phase lands; before that, the gate is `planned`.

| Gate | Where | Required? | Catches |
|------|-------|-----------|---------|
| typecheck (`npm run typecheck`) | local (autopilot) + workflow publikacji | required | błędy typów |
| budowa z prefiksem `/www-maestro` | local (autopilot) + workflow publikacji | required | zepsuta budowa statyczna |
| skan sekretów (gitleaks, hooki zabezpieczeń) | local (agent loop) | required | sekrety w repo |
| testy w przeglądarce 360 px + 1280 px na stronie zbudowanej (kroki 1–14) i test „krok 15” | local, kontener Playwright: `npm run test:e2e` (polecenie z `## Testy w CI`), uruchamiane w wierszach Automated planu zmiany (`npm run test:e2e -- --grep "krok N\b"`) | required after §3 Phase 1 | regresje #1–#6, #7 (README i `npm test`) |
| test bez przeglądarki „krok 16” (zakres przejęcia), typy i gitleaks | local (autopilot): `npm run verify` (polecenie z `## Verify`, `npm ci && npm run verify`), bez Dockera | required after §3 Phase 1 | #7 |

Autopilot przy scaleniu bramkuje tylko polecenie z `## Verify`; polecenie z `## Testy w CI` przy scaleniu nie biegnie, więc testy w przeglądarce uruchamiają wiersze Automated planu każdej zmiany strony. Brak bramki w CI: workflow publikacji zostaje bez testów (D-004 w `context/foundation/limitations.md`).

## 6. Cookbook Patterns

How to add new tests in this project. Each sub-section is filled in once
the relevant rollout phase ships; before that, the sub-section reads
"TBD — see §3 Phase <N>."

### 6.1 Uruchomienie testów

- Wszystkie testy: `npm test` (= `npm run verify && npm run test:e2e`), polecenie z README.
- `npm run verify` — typy, test „krok 16” (`playwright.bez-przegladarki.config.ts`, projekt `repo`, `tests/repo/`) i `gitleaks git --redact --no-banner .`; bez Dockera.
- `npm run test:e2e [-- <argumenty Playwright>]` (`scripts/test-e2e.sh`): liczy testy przez `--list`, przy zerze kończy się kodem 1; buduje stronę z `NEXT_PUBLIC_BASE_PATH=/www-maestro`; uruchamia `playwright.config.ts` (`tests/e2e/`, projekty `telefon-360` i `komputer-1280`) w kontenerze `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` z `--network none` (w CI wprost po `npx playwright install --with-deps chromium`); na koniec na komputerze projekt `readme` (`tests/readme/`, krok 15).
- Stronę podaje `scripts/serwer-statyczny.mjs` z `out/` tylko pod `/www-maestro/`; reszta ścieżek daje 404.
- Jeden krok: `npm run test:e2e -- --grep "krok 6\b"` (`\b`, żeby „krok 1” nie łapał „krok 10”–„krok 16”). Ścieżki plików jako argumenty nie działają — skrypt czyta je jako nazwy projektów; wybieraj przez `--grep`.
- Tytuł testu: `krok N — <opis>`, jeden test na krok scenariusza i projekt; nazwy plików bez ciągu „krok <cyfra>”. Wyniki w `node_modules/.cache/playwright-wyniki`, reporter `list`.
- Test bez przeglądarki nie używa fixture `page` i trafia do `tests/repo/` (biegnie w `verify`) albo `tests/readme/` (biegnie po testach w kontenerze).

### 6.2 Test interakcji na stronie zbudowanej (oba ekrany)

- Wzór: `tests/e2e/interakcje.spec.ts`. Otwarcie przez `otworzStrone(page)` z `tests/e2e/pomoc.ts`, potem `poHydracji(page)` przed pierwszym kliknięciem (bez niej kliknięcie nic nie robi, a wysyłka formularza przeładowuje stronę).
- Kolejność: stan początkowy → kliknięcie → stan widoczny dla odwiedzającego → granica (np. `disabled` na pierwszym i ósmym kroku).
- Elementy przez role i nazwy dostępne (`getByRole('group', { name: 'Step' })`), `aria-pressed`, `disabled`, `aria-invalid`, `role=status`, natywne `details[open]`; zapytania zawężone do sekcji, bo `role=status` i część linków powtarzają się na stronie.
- Tekst potrzebny w oczekiwaniu importuj z `lib/content.ts` (dokładne dopasowanie przez `dokladnie()`), nie przepisuj zdań. Czekaj na stan przez `expect(...)`, nigdy `waitForTimeout`.

### 6.3 Test sekcji, kotwic i układu na telefonie

- Wzór: `tests/e2e/sekcje-i-uklad.spec.ts`. Oczekiwana kolejność sekcji jest wpisana w teście według PRD (kotwice, a sekcje bez id po nazwie h2 z `lib/content.ts`); każdy element występuje raz, a kolejność sprawdza `compareDocumentPosition`.
- Każdy `a[href^="#"]` ma cel `document.getElementById`; przewinięcie po kliknięciu sprawdza `toBeInViewport` (strona ma `scroll-behavior: smooth`).
- Układ zależny od ekranu rozróżnia `testInfo.project.name`: na `telefon-360` CTA nagłówka `toBeHidden()`, a obszar tabeli porównania ma `scrollWidth > clientWidth`; na obu ekranach `scrollWidth` dokumentu ≤ `clientWidth`.

### 6.4 Test prywatności i żądań sieciowych

- Wzór: `krok 11` w `tests/e2e/motyw-siec-dostepnosc.spec.ts` i `krok 10` w `tests/e2e/interakcje.spec.ts`. `zapisuj(page)` zbiera żądania od pierwszego żądania; po `przewinDoKonca(page)` każdy URL ma origin `baseURL` (poza `data:` i `blob:`).
- Formularz: zapis żądań zaczyna się po załadowaniu strony, a po wysyłce pustej, bez „@” i poprawnej lista żądań jest pusta. Pamięć przeglądarki: `Object.keys(localStorage)` to dokładnie `['maestro-theme']`, `sessionStorage` pusty.
- Obowiązkowy dla każdej przyszłej zmiany formularza listy oczekujących (D-001): kontener biegnie z `--network none`, więc żądanie na zewnątrz pada — test ma je wykryć w zapisie, nie przez błąd sieci.

### 6.5 Test dostępności (kontrast, ograniczony ruch, komunikaty)

- Wzór: `krok 12` i `krok 13` w `tests/e2e/motyw-siec-dostepnosc.spec.ts`. Ograniczony ruch przez `page.emulateMedia({ reducedMotion: 'reduce' })`: wyliczony `scrollBehavior` nie jest `smooth`, a po przewinięciu `document.getAnimations()` nie ma animacji w stanie `running`.
- Kontrast liczony wzorem WCAG 2 z wyliczonych kolorów, w obu `colorScheme`, przy ograniczonym ruchu: kolor tekstu z alfą zmieszaną z tłem, tło z samego elementu albo najbliższego przodka (do `body`) o nieprzezroczystym `background-color`; brak tła to błąd testu. Przyciski `disabled` pomijane; komunikat błędu wymienia element i obie barwy.
- Komunikaty formularza sprawdza się po wysyłce błędnej i poprawnej, w `#waitlist-status` (`role=status`, `aria-live`).

### 6.6 Per-rollout-phase notes

(Po każdym etapie `/10x-goal-implement` dopisuje tu 2–3 linie o tym, czego etap nauczył.)

## 7. What We Deliberately Don't Test

Exclusions agreed during the rollout (Phase 2 interview, Q5). Future
contributors should respect these unless the underlying assumption changes.

- **Publikacja na prawdziwym adresie** — scenariusz sprawdza budowę z prefiksem i otwarcie tak zbudowanej strony; stan publicznego adresu nie zależy od kawałka. Re-evaluate if publikacja albo domena się zmienią (PRD Open Questions 1–2). (Source: Phase 2 interview Q5; start.md, krok prd.)
- **Pełny audyt dostępności, czytników ekranu i wielu przeglądarek** — testy sprawdzają tylko to, co sprawdzono ręcznie przed przejęciem, w Chromium. Re-evaluate if właściciel zamówi audyt. (Source: Phase 2 interview Q5; PRD Non-Goals.)
- **Dokładne brzmienie treści i zrzuty całej strony** — treść ma się zmieniać zwykłą drogą zmiany; test na zdania albo piksele blokowałby każdą zmianę tekstu. Re-evaluate if pojawi się tekst prawnie wymagany (np. informacja o prywatności z D-001). (Source: Phase 2 interview Q5; roadmap S-01 Risk.)
- **Workflow publikacji i plik konfiguracji hostingu innego narzędzia** — nie są zmieniane ani testowane w przejęciu (D-004; PRD Open Questions 1). Re-evaluate if zmiany na `main` zaczną trafiać poza autopilotem. (Source: Phase 2 interview Q5.)

## 8. Freshness Ledger

- Strategy (§1–§5) last reviewed: 2026-11-18
- Stack versions last verified: 2026-11-18
- AI-native tool references last verified: 2026-11-18

Refresh (`/10x-test-plan --refresh`) when:

- a new top-3 risk surfaces from the roadmap or archive,
- a recommended tool's `checked:` date is older than three months,
- the project's tech stack changes (new framework, new test runner),
- §7 negative-space no longer matches what the team believes.
