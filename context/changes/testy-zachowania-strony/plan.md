# Testy dzisiejszego zachowania strony, README i polecenie testów — plan implementacji

## Overview

Strona Maestro nie ma testów, a każde scalenie na `main` ją publikuje. Ta zmiana dokłada Playwright 1.65.0. Testy kroków 1–14 scenariusza PRD biegną w przeglądarce, w kontenerze, na stronie zbudowanej z prefiksem `/www-maestro`, na ekranach 360 px i 1280 px. Do tego dochodzą dwa testy bez przeglądarki: krok 15 (README i jedno polecenie wszystkich testów) i krok 16 (kod strony bez zmian od `5e4dcac`). Zmiana dodaje też polecenie `verify` bez Dockera, sekcje `## Verify`, `## Testy w CI` i `## Uruchomienie lokalne` w `CLAUDE.md` oraz opis testów w README. Kod strony zostaje bajt w bajt taki jak dziś.

## Current State Analysis

- `package.json:5-9` ma tylko skrypty `dev`, `build` i `typecheck`. Wszystkie zależności mają `latest` (D-002), a realne wersje są w `package-lock.json`. Nie ma testów, konfiguracji testów ani skryptu `verify`. `## Verify` w `CLAUDE.md` kończy się kodem 1.
- Budowa `NEXT_PUBLIC_BASE_PATH=/www-maestro npm run build` daje `out/` w ok. 11 s. Fonty, ikona, style i skrypty dostają prefiks `/www-maestro/` (`next.config.ts:4`, `app/layout.tsx:8`, `app/globals.css:4,11`).
- Komputer fabryki nie ma przeglądarek Playwright ani ich bibliotek systemowych (`~/.cache/ms-playwright` nie istnieje). Ma za to Docker bez roota i obraz `mcr.microsoft.com/playwright:v1.65.0-noble` (Node 26, chromium-1254). Root w kontenerze to uid 1000 na hoście, więc pliki z kontenera należą do `fabryka`.
- Każdy krok 1–14 da się sprawdzić bez zmian kodu, przez kotwice, role, nazwy dostępne, `aria-pressed`, `disabled`, `aria-invalid`, `role=status`, natywne `details[open]` i wyliczone style. Mapa elementów jest w research.md, w części „Strona: czym test może trafić w każdy krok”.
- Autopilot dla przejętego projektu bramkuje przed scaleniem tylko `## Verify`, uruchamiane w świeżym worktree bez `node_modules` (`autopilot.py:5351-5445`, `5541-5544`). Polecenie `## Testy w CI` przy scaleniu nie biegnie. W tej zmianie testy w przeglądarce uruchamiają wiersze Automated tego planu.
- `tsconfig.json` obejmuje `**/*.ts`, więc testy i konfiguracje Playwright wchodzą do `npm run typecheck` i do sprawdzenia typów w `next build`. `tsconfig.json` ma zostać bez zmian (T16).
- Kontrast dzisiejszych par kolorów z `app/globals.css:16-48`, policzony z kolorów motywu: najsłabsze pary to `--muted` na `--accent-soft` (5.08:1, jasny) i `--muted` na `--soft` (5.26:1). Próg 4.5:1 jest więc dziś spełniony.

## Desired End State

- `npm test` (jedno polecenie wszystkich testów z README) uruchamia `npm run verify`, a potem `npm run test:e2e`, i przy dzisiejszej stronie kończy się kodem 0.
- `npm run verify` uruchamia typy, test „krok 16” i `gitleaks git --redact --no-banner .` i przechodzi bez Dockera. `## Verify` w `CLAUDE.md` to `` `npm ci && npm run verify` ``.
- `npm run test:e2e [-- <argumenty Playwright>]` działa tak:
  - buduje stronę z prefiksem na komputerze;
  - uruchamia testy kroków 1–14 w kontenerze bez sieci, w projektach `telefon-360` i `komputer-1280`;
  - potem na komputerze uruchamia test „krok 15”.
- Każdy krok scenariusza ma test o tytule „krok N — …”. Polecenie z pola Sprawdzenie każdego kryterium wybiera właśnie ten test i przechodzi.
- README i `CLAUDE.md` opisują uruchomienie strony i testów. `app/`, `components/`, `lib/`, `public/`, `pages.yml` i konfiguracja budowy są identyczne z `5e4dcac`.

Sprawdzenie: wiersze `## Progress` niżej. Każdy kończy się poleceniem z pola Sprawdzenie odpowiedniego kryterium.

### Key Discoveries:

- `npm install -D -E` sortuje klucze `package.json`. `package.json` edytuje się więc ręcznie, a plik zablokowanych wersji uzupełnia `npm install --package-lock-only --ignore-scripts` (research, część „Narzędzia”). Wtedy w pliku zablokowanych wersji przybywają tylko `@playwright/test`, `playwright` i `playwright-core`.
- `html { scroll-behavior: smooth }` (`app/globals.css:52-53`). Sprawdzenia „w widoku” czekają na stan przez `toBeInViewport`.
- Statyczny HTML ma zawsze etykietę „Switch to dark theme”, a poprawia ją dopiero `useEffect` (`components/interactive.tsx:24-27`). Przy ciemnym starcie test czeka na właściwą etykietę przed kliknięciem.
- Na stronie są dwa elementy `role=status`: `#example-panel` i `#waitlist-status`. Zapytania trzeba zawężać do sekcji. Linki „Back to top” i „Join the first release” powtarzają się, więc zawęża się je do `banner`, `contentinfo` albo sekcji.
- CTA w nagłówku jest w DOM, a przy ≤700 px ma `display: none` (`app/globals.css:1627-1628`). Na 360 px test sprawdza więc `toBeHidden()`.
- Roadmapa to `div.roadmap` z własnym h2 wewnątrz `#first-release` (`app/page.tsx:277`). Kolejność z kroku 1 sprawdza się po kolejności elementów w dokumencie, nie po liczbie `section`.
- Playwright uruchamia przeglądarkę dopiero przy fixture `page` albo `browser`. Testy kroków 15–16 bez `page` biegną więc na komputerze. `webServer` startuje jednak przy każdym uruchomieniu swojej konfiguracji, dlatego testy bez przeglądarki mają osobną konfigurację.

## Decyzje planu

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Gdzie biegnie test „krok 15” | W `npm run test:e2e`, na komputerze, po testach w kontenerze. Polecenie testów z README uruchamia ze zmienną `MAESTRO_POMIN_KROK_15=1`, która pomija sam test | Wariant (a) rozstrzygnięty przez agenta po zatrzymaniu kroku planu (`change.md`, `## Pytania do człowieka` i `## Zatrzymania autopilota`). Zachowuje T17 i to, że polecenie z README naprawdę przechodzi. Zmianę kryterium T15 i kroku 4 scenariusza potwierdził człowiek 2026-11-18 („Dobra, akceptuję rekomendację, kontynuuj.”, plan-review F3) |
| Podział konfiguracji Playwright | `playwright.config.ts` (przeglądarka, `webServer`, `tests/e2e/`) i `playwright.bez-przegladarki.config.ts` (bez `webServer`, projekty `repo` → `tests/repo/` i `readme` → `tests/readme/`) | `verify` nie może budować ani podawać strony, a krok 15 i krok 16 biegną w różnych poleceniach (research, „Uruchomienie Playwright bez przeglądarki”) |
| Serwer strony w testach | Własny `scripts/serwer-statyczny.mjs` w Node, bez zależności. Podaje `out/` tylko pod `/www-maestro/`, a resztę kończy kodem 404 | Bez nowej zależności, a ścieżka bez prefiksu daje 404, więc T14 ma realny sygnał |
| Gdzie budować stronę | Na komputerze (Node 22 z mise), przed kontenerem. Kontener dostaje gotowe `out/` i `node_modules` z komputera i biegnie z `--network none` | W kontenerze nie trzeba `npm ci` ani sieci, a każde żądanie na zewnątrz i tak by padło (research, „Wnioski o architekturze”) |
| Ekrany | Projekt `telefon-360` (`devices['Pixel 5']` z oknem 360×740) i `komputer-1280` (`devices['Desktop Chrome']` z oknem 1280×800), tylko Chromium | Intencja: 360 px i 1280 px, tylko Chromium. Nazwy nie zawierają „krok <cyfra>”, więc `--grep` ich nie łapie |
| Wyniki Playwright | `outputDir` w `node_modules/.cache/playwright-wyniki`, reporter `list`, bez raportu HTML | Nie dotyka `.gitignore` (rozstrzygnięte w `change.md`, krok plan) |
| Tytuły testów | `krok N — <opis>` z półpauzą po numerze, jeden test na krok i projekt; nazwy plików bez ciągu „krok <cyfra>” | `--grep "krok 1\b"` wtedy nie łapie „krok 10”–„krok 16” (research, „`--grep`”) |
| Teksty w oczekiwaniach | Role, nazwy dostępne i kotwice. Gdy test potrzebuje tekstu, importuje go z `lib/content.ts`, a nie przepisuje | T20. Import nie kopiuje zdań, a zmiana treści nie psuje testu |
| `--grep`, który nie wybiera żadnego testu | Skrypt `test-e2e.sh` liczy testy przez `--list` w obu konfiguracjach. Przy zerze w obu kończy się kodem 1, a konfigurację z zerem testów pomija (bez budowy i bez kontenera) | Literówka w numerze kroku nie da fałszywie zielonego wyniku, a `--grep "krok 15\b"` nie buduje strony dwa razy |
| Docker wyłączony albo brak programu | `test-e2e.sh` uruchamia go przez `systemctl --user start docker` i czeka do 30 s; przy braku `docker` kończy się jasnym komunikatem | Wzór z `dziennik-wagi/scripts/kontener-e2e.sh` |
| Nazwa kontenera | `<nazwa folderu repo>-e2e`, `--rm`; gdy kontener o tej nazwie działa, skrypt kończy się komunikatem | Reguła o zasobach lokalnych z `kawalek-intencja.md:14`. Dwa przebiegi naraz się wykluczają |
| Tryb CI | Gdy jest zmienna `CI`: `npx playwright install --with-deps chromium`, budowa i testy wprost, bez kontenera | T18 i reguła `## Testy w CI` dla aplikacji z ekranami |
| Polecenie `## Verify` | `` `npm ci && npm run verify` `` | `## Verify` biegnie w świeżym worktree bez `node_modules` (research, ustalenie 3) |
| `next-env.d.ts` po `npm run dev` | Krok, który uruchamia `npm run dev`, przywraca plik przez `git checkout -- next-env.d.ts`; plan go nie commituje | Rozstrzygnięte w `change.md`, krok plan |
| Wzorce w `context/foundation/test-plan.md` | Wypełnić 6.1–6.5 i poprawić dwa wiersze bramek, które dziś mówią, że testy w przeglądarce są w `## Verify` | Plan testów ma opisywać to, co zmiana dostarcza (research, „Kontekst historyczny”); następna zmiana uruchamia testy tak samo |

## What We're NOT Doing

- Żadnych zmian w `app/`, `components/`, `lib/`, `public/`, stylach, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` ani `.github/workflows/`. Nie dochodzi też `data-testid`.
- Nie powstaje workflow CI gałęzi i nie dochodzą testy w `pages.yml` (D-004). Nie poprawiamy autopilota, żeby uruchamiał `## Testy w CI` przy scaleniu, bo to sprawa Factory spoza tego repo.
- Bez przypinania wersji zależności strony, aktualizacji frameworka, lintera i formatowania (D-002, D-003).
- Bez `.gitignore`, axe-core, porównań zrzutów, Firefoksa i WebKit.
- Testy nigdy nie otwierają adresu z `## Wdrożenie`.

## Implementation Approach

Faza 1 kładzie całe uruchomienie i sprawdza je na najprostszym teście (krok 14: zasoby pod prefiksem) oraz na teście bez przeglądarki (krok 16). Zielone `verify` i zielone `test:e2e` dowodzą wtedy, że budowa, serwer, kontener i oba projekty działają. Fazy 2 i 3 dokładają testy kroków 1–13 według wspólnego wzorca. Faza 4 dopisuje README, test „krok 15” i sekcje dokumentacji, a na końcu uruchamia `npm test` w całości.

## Critical Implementation Details

**Kolejność przy dodawaniu Playwright.**
1. Najpierw ręcznie dopisz `"@playwright/test": "1.65.0"` w `devDependencies` i trzy skrypty na końcu `scripts`.
2. Potem uruchom `npm install --package-lock-only --ignore-scripts`.
3. Na końcu `npm ci`.

`npm install -D` przestawiłby kolejność kluczy. Test „krok 16” porównuje `package.json` semantycznie, ale tekstowy diff też ma pokazać tylko te wpisy.

**`--list` i `webServer`.** `test-e2e.sh` liczy testy przez `npx playwright test -c <konfiguracja> --list --pass-with-no-tests "$@"` na komputerze. Implementujący sprawdza, że w 1.65.0 `--list` nie uruchamia `webServer`. Jeśli uruchamia, `webServer` w `playwright.config.ts` startuje tylko poza listowaniem, np. przez zmienną ustawianą przez skrypt na czas liczenia.

**Świeży worktree w wierszu 1.4 (plan-review F1).** Bramka (a) w `/10x-goal-implement` biegnie przed commitem fazy, więc samo `HEAD` nie ma jeszcze skryptu `verify`. Polecenie z wiersza 1.4 kopiuje do worktree zmienione i nowe, nieignorowane pliki (`git ls-files -mo --exclude-standard`), czyli sprawdza stan, który zaraz trafi do commita. Nadal nie ma tam `node_modules` ani `.next/`. Najpierw usuwa pozostałość po przerwanym przebiegu.

**Krok 15 ma długi czas.** Test uruchamia `npm test` w całości: typy, krok 16, gitleaks, budowę, kontener i kroki 1–14 w dwóch projektach. Dostaje `test.setTimeout` rzędu 20 minut. Wyjście dziecka idzie na `stdio: 'inherit'`, żeby było widać postęp.

## Phase 1: Narzędzie testów, uruchomienie i polecenie sprawdzające

**Criteria**: T14, T16, T17, T19

### Overview

Dodaje `@playwright/test` 1.65.0, dwie konfiguracje, serwer statyczny, skrypt testów w przeglądarce, skrypty `test`, `test:e2e` i `verify`, test „krok 14” i test „krok 16” oraz sekcję `## Verify`.

### Changes Required:

#### 1. Zależność i skrypty

**File**: `package.json`, `package-lock.json`

**Intent**: Dodać jedyną nową zależność testów z dokładną wersją i trzy skrypty, tak żeby `package.json` różnił się od `5e4dcac` tylko tymi wpisami.

**Contract**:
- `devDependencies["@playwright/test"] = "1.65.0"`, dopisane na końcu.
- `scripts.test = "npm run verify && npm run test:e2e"`.
- `scripts["test:e2e"] = "bash scripts/test-e2e.sh"`.
- `scripts.verify = "npm run typecheck && playwright test -c playwright.bez-przegladarki.config.ts --project repo && gitleaks git --redact --no-banner ."`.
- Pozostałe klucze i ich kolejność zostają bez zmian.
- W `package-lock.json` przybywają tylko `@playwright/test`, `playwright` i `playwright-core` w wersji 1.65.0.

#### 2. Konfiguracje Playwright

**File**: `playwright.config.ts`, `playwright.bez-przegladarki.config.ts`

**Intent**: Pierwsza konfiguracja uruchamia testy kroków 1–14 na stronie podanej z `out/` pod prefiksem, na dwóch ekranach. Druga uruchamia testy bez przeglądarki i nie startuje serwera.

**Contract**:
- `playwright.config.ts`:
  - `testDir: 'tests/e2e'`, `outputDir: 'node_modules/.cache/playwright-wyniki'`, `reporter: 'list'`, `forbidOnly: !!process.env.CI`;
  - `baseURL` `http://127.0.0.1:${E2E_PORT ?? 3100}`;
  - projekty `telefon-360` i `komputer-1280` (patrz Decyzje planu);
  - `webServer` z `command: 'node scripts/serwer-statyczny.mjs'`, `url` `…/www-maestro/` i `reuseExistingServer: false`.
- `playwright.bez-przegladarki.config.ts`:
  - bez `webServer`, ten sam `outputDir` i reporter;
  - projekty `repo` (`testDir: 'tests/repo'`) i `readme` (`testDir: 'tests/readme'`).

#### 3. Serwer statyczny

**File**: `scripts/serwer-statyczny.mjs`

**Intent**: Podać zbudowane `out/` tak, jak robi to GitHub Pages pod `/www-maestro/`, bez nowej zależności.

**Contract**:
- Nasłuch tylko na `127.0.0.1:${E2E_PORT ?? 3100}`.
- `/www-maestro` przekierowuje na `/www-maestro/`. `/www-maestro/<ścieżka>` podaje `out/<ścieżka>`, a katalog podaje `index.html`.
- Typy MIME co najmniej dla html, css, js, svg, ttf, woff2, txt i json.
- Ścieżka poza `out/` (np. `..`) i każda ścieżka bez prefiksu kończy się kodem 404.
- Bez `out/index.html` serwer kończy się kodem 1 i komunikatem, że trzeba zbudować stronę z `NEXT_PUBLIC_BASE_PATH=/www-maestro`.

#### 4. Skrypt testów w przeglądarce

**File**: `scripts/test-e2e.sh`

**Intent**: Jedno polecenie, które lokalnie uruchamia testy kroków 1–14 w kontenerze, a potem test „krok 15” na komputerze. Przekazuje dalej argumenty Playwright (`"$@"`).

**Contract** (`set -euo pipefail`, katalog roboczy to korzeń repo):
1. Liczy testy wybrane przez `"$@"` w obu konfiguracjach (`--list`). Gdy w obu jest zero, kończy się kodem 1 i komunikatem.
2. Gdy konfiguracja przeglądarki ma testy, buduje stronę: `NEXT_PUBLIC_BASE_PATH=/www-maestro NEXT_TELEMETRY_DISABLED=1 npm run build`.
3. Uruchamia testy przeglądarki:
   - przy `CI`: `npx playwright install --with-deps chromium`, potem `npx playwright test -c playwright.config.ts --pass-with-no-tests "$@"` wprost;
   - lokalnie: sprawdza i w razie potrzeby uruchamia Dockera, potem `docker run --rm --name "<folder>-e2e" --network none --ipc=host -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v<wersja z require('@playwright/test/package.json').version>-noble npx playwright test -c playwright.config.ts --pass-with-no-tests "$@"`.
4. Gdy projekt `readme` ma testy, uruchamia na komputerze `npx playwright test -c playwright.bez-przegladarki.config.ts --project readme --pass-with-no-tests "$@"`.
5. Kod różny od 0 z którejkolwiek części kończy skrypt tym kodem.

#### 5. Wspólna pomoc testów i test „krok 14”

**File**: `tests/e2e/pomoc.ts`, `tests/e2e/zasoby.spec.ts`

**Intent**: `pomoc.ts` daje wspólne otwarcie strony pod `/www-maestro/` z zapisem błędów konsoli, `pageerror`, żądań i odpowiedzi. Fazy 2–3 użyją tego samego. `zasoby.spec.ts` sprawdza krok 14.

**Contract**: test `krok 14 — strona i zasoby pod prefiksem /www-maestro`:
- `page.goto('/www-maestro/')` zwraca 200, a h1 jest widoczny.
- Po `document.fonts.ready` są co najmniej jedna odpowiedź typu font, jedna stylesheet i jedna script. Każda ma status < 400 i ścieżkę pod `/www-maestro/`, bez `requestfailed`.
- `href` z `link[rel~=icon]` zaczyna się od `/www-maestro/`, a `page.request.get(href)` zwraca 200.
- `/` bez prefiksu zwraca 404.

#### 6. Test „krok 16”

**File**: `tests/repo/zakres-przejecia.spec.ts`

**Intent**: Bez przeglądarki potwierdzić, że kod strony, konfiguracja budowy i workflow publikacji są takie jak w `5e4dcac`, a `package.json` różni się tylko wpisami testów.

**Contract**: test `krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac`, bez fixture `page`:
- `git diff --quiet 5e4dcac -- app components lib public .github/workflows/pages.yml next.config.ts tsconfig.json postcss.config.mjs` kończy się kodem 0. Porównanie obejmuje drzewo robocze.
- `git ls-files --others --exclude-standard` dla tych ścieżek jest puste.
- JSON z `git show 5e4dcac:package.json` jest głęboko równy bieżącemu `package.json` bez `scripts.test`, `scripts["test:e2e"]`, `scripts.verify` i `devDependencies["@playwright/test"]`. Żadnego z tych kluczy nie było w `5e4dcac`.

#### 7. `## Verify` w `CLAUDE.md`

**File**: `CLAUDE.md`

**Intent**: Zastąpić polecenie kończące się komunikatem o braku testów poleceniem sprawdzającym, według szablonu z `skills/guardrails/SKILL.md` (krok 5).

**Contract**:
- Pierwszy fragment w odwrotnych apostrofach w sekcji to `` `npm ci && npm run verify` ``.
- Potem jedno zdanie, co polecenie uruchamia (typy, test „krok 16”, gitleaks) i że nie potrzebuje Dockera.
- Linia „Last passing run (<data>):” z 2–3 liniami skopiowanymi dosłownie z prawdziwego przebiegu.
- Pierwsze dwa akapity pliku i `## Wdrożenie` zostają bez zmian.

### Success Criteria:

#### Automated Verification:

- Dokładna wersja i plik zablokowanych wersji: `node -e "const d=require('./package.json').devDependencies;for(const k of ['@playwright/test'])if(!/^\d+\.\d+\.\d+$/.test(d[k]||''))process.exit(1)" && npm ci --dry-run`
- Typy przechodzą z testami i konfiguracjami: `npm run typecheck`
- Polecenie sprawdzające przechodzi bez Dockera: `npm run verify`
- Polecenie z `## Verify` przechodzi w świeżym worktree: `git worktree remove --force /tmp/maestro-verify 2>/dev/null; rm -rf /tmp/maestro-verify; git worktree add --detach /tmp/maestro-verify HEAD && git ls-files -mo --exclude-standard -z | xargs -0 -r cp --parents -t /tmp/maestro-verify && (cd /tmp/maestro-verify && npm ci && npm run verify); s=$?; git worktree remove --force /tmp/maestro-verify; exit $s`
- Zasoby pod prefiksem na obu ekranach: `npm run test:e2e -- --grep "krok 14\b"`
- Argumenty bez żadnego testu kończą się błędem: `! npm run test:e2e -- --grep "krok 99\b"`
- Kod strony jak w `5e4dcac`: `git diff --quiet 5e4dcac -- app components lib public .github/workflows/pages.yml next.config.ts tsconfig.json postcss.config.mjs`

---

## Phase 2: Sekcje, linki, układ, motyw, sieć, ruch i kontrast

**Criteria**: T1, T2, T3, T4, T5, T11, T12, T13, T20

### Overview

Testy kroków 1–5 i 11–13, każdy w obu projektach, według wzorca z `tests/e2e/pomoc.ts`.

### Changes Required:

#### 1. Testy strony i układu

**File**: `tests/e2e/sekcje-i-uklad.spec.ts`, `tests/e2e/pomoc.ts`

**Intent**: Sprawdzić kolejność sekcji i brak błędów konsoli, linki `#`, brak poziomego przewijania i przewijaną tabelę oraz nagłówek.

**Contract**:
- `krok 1 — sekcje w kolejności z PRD i brak błędów w konsoli`:
  - oczekiwana lista jest wpisana w teście według PRD: `#top`, `#why`, `#how-it-works`, `#observer`, sekcja z h2 zasad, `#ownership`, sekcja z h2 porównania, `#first-release`, h2 roadmapy, sekcja dla kogo, `#faq`, `#waitlist`, `contentinfo` z linkiem „Back to top”;
  - sekcje bez id rozpoznaje po nazwie h2 z `lib/content.ts`;
  - każdy element istnieje dokładnie raz, a kolejne elementy następują po sobie w dokumencie (`compareDocumentPosition`);
  - po załadowaniu i `document.fonts.ready` lista komunikatów konsoli `error`/`warning` i `pageerror` jest pusta.
- `krok 2 — linki # prowadzą do istniejących sekcji`:
  - każdy `a[href^="#"]` ma cel `document.getElementById`;
  - kliknięcie w `#top` linku „Join the first release” daje `#waitlist` w widoku, a kliknięcie „See how it works” daje `#how-it-works` w widoku (`toBeInViewport`).
- `krok 3 — brak poziomego przewijania i przewijana tabela porównania`:
  - na obu ekranach `scrollWidth` dokumentu ≤ `clientWidth`;
  - na `telefon-360` obszar `getByRole('region', { name: <tytuł porównania> })` ma `scrollWidth > clientWidth`, a po ustawieniu `scrollLeft` jego `scrollLeft > 0`.
- `krok 4 — nagłówek bez nawigacji`:
  - w `banner` logo i przełącznik motywu są widoczne;
  - CTA jest widoczne na `komputer-1280` i `toBeHidden()` na `telefon-360`;
  - na stronie nie ma roli `navigation`, `menu` ani `menubar`, a w `banner` nie ma przycisku z `aria-haspopup`.

#### 2. Motyw, sieć, ograniczony ruch i kontrast

**File**: `tests/e2e/motyw-siec-dostepnosc.spec.ts`, `tests/e2e/pomoc.ts`

**Intent**: Sprawdzić motyw i jego zapis, brak żądań poza adres strony, regułę ograniczonego ruchu i kontrast w obu motywach.

**Contract**:
- `krok 5 — motyw według systemu i zapamiętany po odświeżeniu`:
  - przy `colorScheme` light i dark `html[data-theme]` odpowiada ustawieniu systemu;
  - po przełączeniu, które czeka na właściwą etykietę przycisku, i po `reload` motyw zostaje;
  - `Object.keys(localStorage)` to dokładnie `['maestro-theme']`, a `sessionStorage` jest pusty.
- `krok 11 — wszystkie żądania idą pod adres strony`: żądania zapisywane od `goto`, potem przewinięcie do końca strony. Każdy URL ma origin `baseURL`, poza schematami `data:` i `blob:`.
- `krok 12 — ograniczony ruch bez płynnego przewijania i animacji`:
  - przy `reducedMotion: 'reduce'` `getComputedStyle(documentElement).scrollBehavior !== 'smooth'`;
  - po przewinięciu do końca `document.getAnimations()` nie ma elementu w stanie `running`.
- `krok 13 — kontrast co najmniej 4.5:1 w motywie jasnym i ciemnym`:
  - pomiar przy `reducedMotion: 'reduce'` dla obu `colorScheme`;
  - mierzone elementy: widoczne `h1, h2, h3, p, button:not([disabled])` oraz `#waitlist-status` po wysyłce błędnej i poprawnej;
  - kolor tekstu z wyliczonego `color`, z alfą zmieszaną z tłem; tło z samego elementu albo z jego najbliższego przodka (do `body` włącznie) o nieprzezroczystym `background-color`, a jego brak to błąd testu, nie domyślna biel (plan-review F2);
  - przyciski z własnym tłem mierzy się na tym tle: `.button-primary`, `.reply-button`, `.step-item.selected`, `.form-row .button`; to samo dotyczy `p.claude-note`. `html` ma przezroczyste tło, a nieprzezroczyste ma `body` (`app/globals.css:59`);
  - wzór WCAG 2 na luminancję względną;
  - komunikat błędu wymienia element i obie barwy.

### Success Criteria:

#### Automated Verification:

- Sekcje i konsola: `npm run test:e2e -- --grep "krok 1\b"`
- Linki wewnętrzne: `npm run test:e2e -- --grep "krok 2\b"`
- Przewijanie: `npm run test:e2e -- --grep "krok 3\b"`
- Nagłówek: `npm run test:e2e -- --grep "krok 4\b"`
- Motyw: `npm run test:e2e -- --grep "krok 5\b"`
- Żądania sieciowe: `npm run test:e2e -- --grep "krok 11\b"`
- Ograniczony ruch: `npm run test:e2e -- --grep "krok 12\b"`
- Kontrast: `npm run test:e2e -- --grep "krok 13\b"`
- Bez czekania stałym czasem: `! grep -rn waitForTimeout tests/`
- Typy: `npm run typecheck`

---

## Phase 3: Interakcje — demo rozmowy, 8 kroków, podgląd, FAQ i formularz

**Criteria**: T6, T7, T8, T9, T10, T20

### Overview

Testy kroków 6–10 według wzorca: stan początkowy → kliknięcie → stan widoczny dla odwiedzającego → granica.

### Changes Required:

#### 1. Testy interakcji

**File**: `tests/e2e/interakcje.spec.ts`, `tests/e2e/pomoc.ts`

**Intent**: Potwierdzić każdą dzisiejszą interakcję przez role, nazwy dostępne, `aria-pressed`, `disabled`, `aria-invalid`, `role=status` i `details[open]`.

**Contract**:
- `krok 6 — demo rozmowy: zatwierdzenie i powtórka`:
  - po kliknięciu przycisku zatwierdzenia kierunku (nazwa z `lib/content.ts`) przycisk znika, pojawia się przycisk powtórki, a status demo się zmienia;
  - po kliknięciu powtórki wraca przycisk zatwierdzenia i początkowy status.
- `krok 7 — każdy z 8 kroków przykładu i granice`:
  - w `getByRole('group', { name: 'Step' })` jest 8 przycisków;
  - kliknięcie każdego daje mu `aria-pressed="true"`, a `#example-panel` pokazuje h3 z tytułem tego kroku z `lib/content.ts`;
  - na kroku 1 „Previous step” jest `disabled`, na kroku 8 „Next step” jest `disabled`.
- `krok 8 — podgląd aplikacji obiadowej i reset`:
  - na kroku 3 kliknięcie „pokaż” daje niepusty `role=status` w `#example-panel` i przycisk resetu;
  - reset przywraca przycisk „pokaż” i pusty albo ukryty wynik.
- `krok 9 — każde pytanie FAQ otwiera się i zamyka`: dla każdego `#faq details` pierwsze kliknięcie `summary` daje `open` i widoczną odpowiedź, a drugie zdejmuje `open`.
- `krok 10 — formularz-demo: błędy, podgląd i brak żądań`:
  - zapis żądań zaczyna się po załadowaniu strony;
  - wysyłka pustego pola i adresu bez „@” daje `aria-invalid="true"` na polu `getByLabel('Email address')` i niepusty `#waitlist-status` (`role=status`, `aria-live`);
  - poprawny adres daje komunikat podglądu z `lib/content.ts` i pole bez `aria-invalid="true"`;
  - po trzech wysyłkach lista żądań jest pusta.

### Success Criteria:

#### Automated Verification:

- Demo rozmowy: `npm run test:e2e -- --grep "krok 6\b"`
- Osiem kroków: `npm run test:e2e -- --grep "krok 7\b"`
- Podgląd obiadu: `npm run test:e2e -- --grep "krok 8\b"`
- FAQ: `npm run test:e2e -- --grep "krok 9\b"`
- Formularz: `npm run test:e2e -- --grep "krok 10\b"`
- Bez czekania stałym czasem: `! grep -rn waitForTimeout tests/`
- Typy: `npm run typecheck`

---

## Phase 4: README, krok 15, sekcje `CLAUDE.md` i plan testów

**Criteria**: T15, T18, T21

### Overview

Opisuje uruchomienie strony i testów w README i `CLAUDE.md`, dodaje test „krok 15” i aktualizuje wzorce w planie testów. Na końcu uruchamia całe `npm test`.

### Changes Required:

#### 1. README

**File**: `README.md`

**Intent**: Właściciel znajduje polecenie uruchomienia strony i jedno polecenie wszystkich testów.

**Contract**:
- W `## Uruchomienie` zostaje `npm run dev`, z dopiskiem, że port bierze się z `PORT` (domyślnie 3000; zajęty port Next zamienia na następny wolny) i że serwer słucha tylko na `127.0.0.1`.
- Nowa sekcja `## Testy`: pierwsza linia pierwszego bloku kodu to `npm test`.
- Pod nią krótko: co robi `npm test`, `npm run verify` (bez Dockera), `npm run test:e2e` (Docker bez roota, obraz Playwright), wybór kroku przez `npm run test:e2e -- --grep "krok 6\b"`, oba ekrany i zbudowanie z prefiksem.
- Reszta README bez zmian.

#### 2. Test „krok 15”

**File**: `tests/readme/readme.spec.ts`

**Intent**: Potwierdzić krok 15 PRD: README ma oba polecenia, a polecenie wszystkich testów z README naprawdę przechodzi.

**Contract**: test `krok 15 — README ma polecenie uruchomienia i jedno polecenie wszystkich testów, które przechodzi`, bez fixture `page`:
- `test.skip(process.env.MAESTRO_POMIN_KROK_15 === '1')`.
- Czyta pierwsze polecenie w odwrotnych apostrofach z `## Uruchomienie lokalne` w `CLAUDE.md` i sprawdza, że README je zawiera.
- Bierze pierwszą linię pierwszego bloku kodu z `## Testy` w README i uruchamia ją przez `sh -c` w korzeniu repo, ze środowiskiem rodzica i `MAESTRO_POMIN_KROK_15=1`, z `stdio: 'inherit'`. Oczekuje kodu 0.
- `test.setTimeout` około 20 minut.

#### 3. Sekcje `CLAUDE.md`

**File**: `CLAUDE.md`

**Intent**: Dać Factory polecenie testów w przeglądarce i polecenie uruchomienia strony w formie, którą czytają `autopilot.py` i `podglad.py`.

**Contract**:
- `## Testy w CI`:
  - pierwsze polecenie to `` `npm run test:e2e` ``;
  - opis: testy kroków 1–14 w `tests/e2e/` na stronie zbudowanej z `/www-maestro`, projekty `telefon-360` i `komputer-1280`;
  - lokalnie w obrazie `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` przez Docker bez roota (skrypt sam go uruchamia), kontener `<folder>-e2e` z `--network none`; w CI (zmienna `CI`) po `npx playwright install --with-deps chromium`;
  - potem na komputerze test „krok 15”; polecenie sprawdzające tych testów nie uruchamia.
- `## Uruchomienie lokalne`:
  - pierwsze polecenie to `` `npm run dev` ``;
  - port z `PORT` (domyślnie 3000), tylko `127.0.0.1`, przykład `PORT=3001 npm run dev`;
  - uwaga, że `next dev` przepisuje `next-env.d.ts`, więc po nim `git checkout -- next-env.d.ts`.
- `## Verify` i `## Wdrożenie` bez zmian.

#### 4. Plan testów

**File**: `context/foundation/test-plan.md`

**Intent**: Plan testów opisuje to, co zmiana dostarczyła, żeby następna zmiana dopisywała testy według tych samych wzorców.

**Contract**:
- W `## 5. Quality Gates` wiersze testów w przeglądarce i bez przeglądarki wskazują właściwe polecenia: `npm run test:e2e` (`## Testy w CI`, uruchamiane w wierszach Automated planu) i `npm run verify`. Zostaje uwaga, że autopilot bramkuje przy scaleniu tylko `## Verify`.
- `### 6.1`–`### 6.5` zamiast „TBD” mają wzorce z faz 1–4: uruchomienie, test interakcji, sekcje i układ oraz pozostałe wzorce tej sekcji.

### Success Criteria:

#### Automated Verification:

- README i polecenie wszystkich testów: `npm run test:e2e -- --grep "krok 15\b"`
- Wszystkie testy jednym poleceniem z README: `npm test`
- Polecenie sprawdzające nadal przechodzi: `npm run verify`
- Polecenie uruchomienia słucha tylko na 127.0.0.1 z portem z `PORT`: `(PORT=3199 npm run dev >/tmp/maestro-dev.log 2>&1 & echo $! >/tmp/maestro-dev.pid); for i in $(seq 1 60); do ss -ltn | grep -q ':3199 ' && break; sleep 1; done; ss -ltn | grep ':3199 ' | grep -q '127.0.0.1:3199' && ! ss -ltn | grep ':3199 ' | grep -vq '127.0.0.1:3199'; s=$?; pkill -P "$(cat /tmp/maestro-dev.pid)"; kill "$(cat /tmp/maestro-dev.pid)" 2>/dev/null; git checkout -- next-env.d.ts; exit $s`
- `next-env.d.ts` niezmieniony: `git diff --quiet -- next-env.d.ts`
- Bez czekania stałym czasem: `! grep -rn waitForTimeout tests/`
- Zmiana dotyka tylko plików z planu: `python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py testy-zachowania-strony --rules 6`

---

## Testing Strategy

### Unit Tests:

- Brak testów jednostkowych. Strona nie ma logiki poza komponentami, a PRD chroni zachowanie widoczne dla odwiedzającego.

### Integration Tests:

- Kroki 1–14 w przeglądarce na stronie zbudowanej z prefiksem, w projektach `telefon-360` i `komputer-1280`.
- Krok 15 (README i `npm test` w całości) i krok 16 (porównanie z `5e4dcac` przez `git`) bez przeglądarki.
- Przypadki graniczne:
  - `--grep` bez trafienia kończy się błędem;
  - ścieżka bez prefiksu daje 404;
  - przy ciemnym starcie przełącznik motywu czeka na poprawioną etykietę;
  - zduplikowane nazwy linków są zawężone do obszaru;
  - kontrast pomija przyciski `disabled`.

## Performance Considerations

- Jeden przebieg `npm run test:e2e` to budowa (ok. 11 s), start kontenera i testy w dwóch projektach.
- `npm run test:e2e -- --grep "krok 15\b"` pomija budowę i kontener w części zewnętrznej, a w środku uruchamia całe `npm test`, czyli kilka minut.
- Limit `## Verify` w autopilocie (1800 s) nie dotyczy testów w przeglądarce. `verify` to typy, jeden test `git` i gitleaks.

## Migration Notes

Nie dotyczy: strona i dane się nie zmieniają. Cofnięcie zmiany to usunięcie dodanych plików i wpisów.

## References

- Research: `context/changes/testy-zachowania-strony/research.md`
- Wzór Playwright w kontenerze: `/home/fabryka/projekty/dziennik-wagi/scripts/test-e2e.sh`, `/home/fabryka/projekty/dziennik-wagi/scripts/kontener-e2e.sh`, `/home/fabryka/projekty/dziennik-wagi/playwright.config.ts`
- Szablon `## Verify`: `/home/fabryka/fabryka/skills/guardrails/SKILL.md` (krok 5)
- Scenariusz: `context/foundation/prd.md`, „Scenariusz pierwszej wersji”, kroki 1–16

## Plan Changes

> Append-only. One entry per departure from the plan, written in the same commit as the phase. See `references/progress-format.md`.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Narzędzie testów, uruchomienie i polecenie sprawdzające

#### Automated

- [ ] 1.1 Dokładna wersja i plik zablokowanych wersji
- [ ] 1.2 Typy przechodzą z testami i konfiguracjami
- [ ] 1.3 Polecenie sprawdzające przechodzi bez Dockera
- [ ] 1.4 Polecenie z `## Verify` przechodzi w świeżym worktree
- [ ] 1.5 Zasoby pod prefiksem na obu ekranach
- [ ] 1.6 Argumenty bez żadnego testu kończą się błędem
- [ ] 1.7 Kod strony jak w `5e4dcac`

### Phase 2: Sekcje, linki, układ, motyw, sieć, ruch i kontrast

#### Automated

- [ ] 2.1 Sekcje i konsola
- [ ] 2.2 Linki wewnętrzne
- [ ] 2.3 Przewijanie
- [ ] 2.4 Nagłówek
- [ ] 2.5 Motyw
- [ ] 2.6 Żądania sieciowe
- [ ] 2.7 Ograniczony ruch
- [ ] 2.8 Kontrast
- [ ] 2.9 Bez czekania stałym czasem
- [ ] 2.10 Typy

### Phase 3: Interakcje — demo rozmowy, 8 kroków, podgląd, FAQ i formularz

#### Automated

- [ ] 3.1 Demo rozmowy
- [ ] 3.2 Osiem kroków
- [ ] 3.3 Podgląd obiadu
- [ ] 3.4 FAQ
- [ ] 3.5 Formularz
- [ ] 3.6 Bez czekania stałym czasem
- [ ] 3.7 Typy

### Phase 4: README, krok 15, sekcje `CLAUDE.md` i plan testów

#### Automated

- [ ] 4.1 README i polecenie wszystkich testów
- [ ] 4.2 Wszystkie testy jednym poleceniem z README
- [ ] 4.3 Polecenie sprawdzające nadal przechodzi
- [ ] 4.4 Polecenie uruchomienia słucha tylko na 127.0.0.1 z portem z `PORT`
- [ ] 4.5 `next-env.d.ts` niezmieniony
- [ ] 4.6 Bez czekania stałym czasem
- [ ] 4.7 Zmiana dotyka tylko plików z planu
