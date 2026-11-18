<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Testy dzisiejszego zachowania strony, README i polecenie testów

- **Plan**: context/changes/testy-zachowania-strony/plan.md
- **Scope**: Phases 1–4 of 4 (pełny plan; zakres `main...89a2675`)
- **Date**: 2026-11-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 6 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | WARNING |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Punkty przeglądu z polecenia

- **(1) Sekrety w CI: przechodzi.** `git diff --name-only main...HEAD` nie zawiera żadnego pliku w `.github/workflows/`, a folder `context/changes/testy-zachowania-strony/chronione/` nie istnieje. Zmiana nie dodaje żadnego użycia sekretu; pole „narzędzia z sekretami” w `## Wdrożenie` jest puste, a `context/foundation/infrastructure.md` nie istnieje. Skan diffu pod kątem tokenów i kluczy nic nie znalazł, `gitleaks` → „no leaks found”.
- **(2) Migracje bazy: nie dotyczy.** Projekt to statyczna strona bez bazy danych; gałąź nie dodaje żadnej migracji (`git diff --name-only main...HEAD | grep -iE 'migra|\.sql|prisma|drizzle'` → brak trafień).

## Kryteria

- T1: spełnione — `npm run test:e2e -- --grep "krok 1\b"` → exit 0, 2 passed (telefon-360, komputer-1280)
- T2: spełnione — `npm run test:e2e -- --grep "krok 2\b"` → exit 0, 2 passed
- T3: spełnione — `npm run test:e2e -- --grep "krok 3\b"` → exit 0, 2 passed
- T4: spełnione — `npm run test:e2e -- --grep "krok 4\b"` → exit 0, 2 passed
- T5: spełnione — `npm run test:e2e -- --grep "krok 5\b"` → exit 0, 2 passed
- T6: spełnione — `npm run test:e2e -- --grep "krok 6\b"` → exit 0, 2 passed
- T7: spełnione — `npm run test:e2e -- --grep "krok 7\b"` → exit 0, 2 passed
- T8: spełnione — `npm run test:e2e -- --grep "krok 8\b"` → exit 0, 2 passed
- T9: spełnione — `npm run test:e2e -- --grep "krok 9\b"` → exit 0, 2 passed
- T10: spełnione — `npm run test:e2e -- --grep "krok 10\b"` → exit 0, 2 passed
- T11: spełnione — `npm run test:e2e -- --grep "krok 11\b"` → exit 0, 2 passed
- T12: spełnione — `npm run test:e2e -- --grep "krok 12\b"` → exit 0, 2 passed
- T13: spełnione — `npm run test:e2e -- --grep "krok 13\b"` → exit 0, 2 passed; selektor `h1, h2, h3, p, button:not([disabled])` z kontraktu planu (`tests/e2e/motyw-siec-dostepnosc.spec.ts:166`), luka w pokryciu linków wyglądających jak przyciski — F2
- T14: spełnione — `npm run test:e2e -- --grep "krok 14\b"` → exit 0, 2 passed
- T15: spełnione — `npm run test:e2e -- --grep "krok 15\b"` → exit 0; zagnieżdżone `npm test`: 1 passed (krok 16), 28 passed (kroki 1–14 × 2), 1 skipped (krok 15 w środku), zewnętrzny krok 15: 1 passed
- T16: spełnione — `npm run verify` → exit 0, „krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac” passed; dodatkowo `git diff --quiet 5e4dcac -- app components lib public .github/workflows/pages.yml next.config.ts tsconfig.json postcss.config.mjs` → exit 0
- T17: spełnione — `npm run verify` → exit 0 (tsc, krok 16, gitleaks „no leaks found”), bez Dockera; w świeżym worktree (wiersz 1.4 planu) → exit 0
- T18: spełnione — `CLAUDE.md:15-25` ma `## Testy w CI` (`npm run test:e2e`, obraz `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble`, Docker bez roota, CI po `npx playwright install --with-deps chromium`) i `## Uruchomienie lokalne` (`npm run dev`, `PORT`, tylko `127.0.0.1`); `README.md:5-16` ma `npm run dev` z tym samym opisem; `PORT=3199 npm run dev` → `ss -ltn`: tylko `127.0.0.1:3199`, exit 0; `next-env.d.ts` przywrócony
- T19: spełnione — `node -e "…" && npm ci --dry-run` → exit 0; `@playwright/test` = `1.65.0` w `devDependencies`
- T20: spełnione — `! grep -rn waitForTimeout tests/` → exit 0; odczyt testów: oczekiwania na kotwicach, rolach i nazwach dostępnych, teksty importowane z `lib/content.ts` (brak skopiowanych zdań)
- T21: spełnione — `python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py testy-zachowania-strony --rules 6` → `OK: rules 6 passed`

Pozostałe polecenia planu: `npm run typecheck` → exit 0; `! npm run test:e2e -- --grep "krok 99\b"` → exit 0 (skrypt kończy się kodem 1 z komunikatem); `npm test` → exit 0; `git diff --quiet -- next-env.d.ts` → exit 0. Plan nie ma wierszy Manual.

## Findings

### F1 — `test:e2e` pada na argumentach Playwright innych niż `--grep`

- **Severity**: ⚠️ WARNING
- **Dimension**: Plan Adherence
- **Location**: scripts/test-e2e.sh:26
- **Detail**: Plan (Phase 1 #4) mówi, że skrypt „przekazuje dalej argumenty Playwright (`"$@"`)”. Liczenie testów README biegnie jako `policz -c playwright.bez-przegladarki.config.ts --project readme "$@"`, a `--project` w Playwright przyjmuje wiele wartości. Sprawdzone `--list`: `npm run test:e2e -- tests/e2e/zasoby.spec.ts` daje `Project(s) "tests/e2e/zasoby.spec.ts" not found`, a `npm run test:e2e -- --project telefon-360` daje `Project(s) "telefon-360" not found`; skrypt kończy się kodem 1 przed budową. `--grep`, którego używają kryteria i README, działa.
- **Fix**: W liczeniu README użyć `--project=readme` (ścieżka pliku przestaje być brana za nazwę projektu) i traktować błąd „Project(s) … not found” z tego liczenia jako zero testów README.
  - Strength: Sprawdzone `--list`: `--project=readme tests/e2e/zasoby.spec.ts` → `Total: 0 tests`, exit 0; zmiana w jednym miejscu skryptu, a inny błąd liczenia nadal kończy skrypt.
  - Tradeoff: Rozpoznawanie po treści komunikatu Playwright; inna wersja może zmienić jego brzmienie (wtedy wraca dzisiejsze zachowanie, nie fałszywa zieleń).
  - Confidence: HIGH — zachowanie obu form sprawdzone na 1.65.0.
  - Blind spot: Nie sprawdzono innych wieloargumentowych opcji użytkownika poza `--project`.
  - Intent: within
- **Decision**: AUTO-LIMIT (przypadek szczególny): Scenariusz, kryteria T1–T15 i `## Testy w CI` wybierają testy tylko przez `--grep`, który działa, a `context/foundation/test-plan.md` §6.1 już opisuje, że ścieżki plików jako argumenty nie działają, więc ścieżka pliku albo `--project` w `npm run test:e2e` to przypadek spoza zwykłej pracy i spoza „Chroni przed” (zmiana nie ma modelu zagrożenia, przyjęto przypadkowy błąd agenta). · D-008
  - Return when: zmiana dotyka `scripts/test-e2e.sh` albo wiersz Automated planu, `README.md` lub `## Testy w CI` w `CLAUDE.md` każe uruchomić `npm run test:e2e` ze ścieżką pliku testów albo z `--project`.

### F2 — Kontrast nie mierzy linków wyglądających jak przyciski

- **Severity**: ⚠️ WARNING
- **Dimension**: Plan Adherence
- **Location**: tests/e2e/motyw-siec-dostepnosc.spec.ts:166
- **Detail**: T13 obejmuje „przyciski”, a plan wymienia `.button-primary` jako przyciski mierzone na własnym tle. Selektor `h1, h2, h3, p, button:not([disabled])` nie łapie trzech widocznych przycisków-linków: `a.button.button-primary` w hero (`app/page.tsx:48`) i w roadmapie (`app/page.tsx:263`) oraz CTA nagłówka `a.button.button-ink` (`components/interactive.tsx:50`). Klasa `.button-ink` nie jest mierzona nigdzie, więc zmiana jej kolorów w następnej zmianie przejdzie test kroku 13.
- **Fix**: Dodać do selektora widoczne `a.button` (np. `h1, h2, h3, p, button:not([disabled]), a.button`), mierzone na ich własnym tle tak jak przyciski.
  - Strength: Zamyka lukę dokładnie dla elementów, które odwiedzający widzi jako przyciski; reszta testu bez zmian.
  - Tradeoff: Jeden selektor; test musi przejść na dzisiejszej stronie (CTA nagłówka jest ukryte na 360 px, więc liczy się tylko na 1280 px).
  - Confidence: MED — kontrast par `--button-ink` nie był liczony w planie; trzeba uruchomić krok 13.
  - Blind spot: Nie policzono z góry kontrastu `.button-ink` w obu motywach.
  - Intent: within
- **Decision**: AUTO-FIX (normalne używanie): T13 wymaga kontrastu co najmniej 4.5:1 dla przycisków, a plan wymienia `.button-primary` wśród mierzonych przycisków; selektor testu pomija jednak widoczne przyciski-linki `a.button` (hero, roadmapa, CTA nagłówka na 1280 px). Test kroku 13 nie dowodzi więc kryterium na dzisiejszej stronie. Poprawka dotyczy tylko testu i mieści się w intencji. · commit 1820ed4
  - Option: Fix

### F3 — Wpisy w `context/foundation/` nieaktualne po tej zmianie

- **Severity**: 👁 OBSERVATION
- **Dimension**: Scope Discipline
- **Location**: context/foundation/limitations.md (D-006); context/foundation/test-plan.md:78, 89, 93-94
- **Detail**: D-006 („`--grep "krok 16\b"` kończy się kodem 0 bez testu”) ma `Status: obowiązuje`, choć PC2 (commit 3ac9f7e) usunął ten problem — dziś skrypt liczy tylko projekt `readme` i kończy się kodem 1. W `test-plan.md` §3 wiersz 1 nadal mówi „jedno polecenie w README i w `## Verify`” ze statusem `not started`, a §4 „Test-base profile: `none`” i „none yet — see Phase 1” przy obu warstwach Playwright.
- **Fix**: Zmienić D-006 na `Status: zamknięte` z odwołaniem do PC2 (3ac9f7e), a w `test-plan.md` poprawić wiersz §3 (polecenia `npm test` / `## Testy w CI`, status) i profil oraz notatki §4.
- **Decision**: AUTO-SKIP (styl): Nieaktualny status D-006 w `limitations.md` i nieaktualne opisy w `test-plan.md` (§3 wiersz 1, profil i notatki §4) to sprawa opisu w dokumentach. Nie zmieniają one zachowania strony, testów ani poleceń zmiany.

### F4 — Serwer statyczny bez obsługi błędu strumienia pliku

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/serwer-statyczny.mjs:80
- **Detail**: `createReadStream(plik).pipe(odpowiedz)` nie ma nasłuchu `'error'`; plik usunięty między sprawdzeniem a otwarciem (np. budowa w trakcie testów) zabija proces serwera. Dziś `out/` nie zmienia się w trakcie przebiegu.
- **Fix**: Dodać `.on("error", () => odpowiedz.destroy())` do strumienia.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Serwer statyczny padłby tylko wtedy, gdy plik w `out/` zniknie między sprawdzeniem a otwarciem. Skrypt najpierw buduje stronę, a dopiero potem uruchamia testy, więc w zwykłym przebiegu `out/` się nie zmienia, a serwer słucha tylko lokalnie i nie dotyczy bezpieczeństwa. · D-009
  - Return when: zmiana dotyka `scripts/serwer-statyczny.mjs` albo `scripts/test-e2e.sh` tak, że budowa albo zapis do `out/` może biec w trakcie testów (np. budowa równoległa, tryb obserwowania).

### F5 — Krok 16 nie porównuje `package-lock.json`

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: tests/repo/zakres-przejecia.spec.ts:10-19
- **Detail**: Zależności strony mają `latest` (D-002), więc wersje budowy wyznacza `package-lock.json`, którego test nie obejmuje; podbicie `next` w pliku blokady przejdzie krok 16. T16 tego nie wymaga, a diff tej zmiany w pliku blokady to same dodania.
- **Fix**: Opcjonalnie sprawdzać, że `package-lock.json` różni się od `5e4dcac` tylko wpisami `@playwright/test`, `playwright` i `playwright-core`.
- **Decision**: AUTO-LIMIT (przypadek szczególny): T16 i decyzja z góry obejmują pliki budowy i `package.json`, nie `package-lock.json`, a diff tej zmiany w pliku blokady to same dodania pakietów testów. Podbicie wersji `next` w pliku blokady zdarzyłoby się dopiero w zmianie, która aktualizuje zależności strony, a D-002 wyklucza to z przejęcia. · D-010
  - Return when: zmiana dotyka `package-lock.json` poza wpisami `@playwright/test`, `playwright` i `playwright-core` albo uruchamia `npm install` lub `npm update` zależności strony (D-002).

### F6 — Błąd typów w testach zablokuje publikację strony

- **Severity**: 👁 OBSERVATION
- **Dimension**: Architecture
- **Location**: .github/workflows/pages.yml:36-42 (bez zmian) z `tsconfig.json` `include: **/*.ts`
- **Detail**: Workflow publikacji uruchamia `npm run typecheck`, który teraz sprawdza też `tests/**` i konfiguracje Playwright. Błąd typów w teście zatrzyma publikację strony; dziś `verify` sprawdza typy przed commitem, więc to się nie zdarza.
- **Fix**: Zostawić; odnotować w planie testów, że testy muszą przechodzić `typecheck`, bo blokują publikację.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Błąd typów w testach zatrzyma publikację tylko wtedy, gdy commit trafi na `main` bez `npm run verify`. Przy zwykłej pracy autopilot uruchamia `verify` z `typecheck` przed commitem i przed scaleniem, więc to przypadek z obszaru D-004. · D-011
  - Return when: zmiany zaczynają trafiać na `main` poza autopilotem albo zmiana dotyka `tsconfig.json` (`include`) lub `.github/workflows/pages.yml`.

### F7 — `gitleaks git` nie skanuje plików przed commitem

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: package.json (`scripts.verify`)
- **Detail**: `## Verify` mówi „przed każdym commitem”, a `gitleaks git` skanuje tylko zapisaną historię; sekret w plikach przygotowanych do commita wyjdzie dopiero przy następnym przebiegu. Wzorzec jak w `dziennik-wagi`; hooki zabezpieczeń agenta działają osobno.
- **Fix**: Opcjonalnie dopisać `gitleaks git --staged --redact --no-banner .` do `verify`.
- **Decision**: AUTO-FIX (bezpieczeństwo A): Zabezpieczyłem skan sekretów przed commitem, stosując dodatkowe wywołanie `gitleaks git --staged --redact --no-banner .` w skrypcie `verify` w `package.json`. Poprawka jest tania i tylko zaostrza: sprawdziłem, że gitleaks 8.30.1 na komputerze fabryki ma flagę `--staged`, i nie potrzeba nowej zależności. · commit 1820ed4
  - Option: Fix

### F8 — Brak śladu przy nieudanym teście w przeglądarce

- **Severity**: 👁 OBSERVATION
- **Dimension**: Pattern Consistency
- **Location**: playwright.config.ts
- **Detail**: Wzorzec `dziennik-wagi/playwright.config.ts` ma `trace: "retain-on-failure"`; tu go nie ma, więc test, który padnie w kontenerze, nie zostawia śladu do analizy. Nie wpływa na poprawność (a D-007 opisuje czyszczenie wspólnego `outputDir`).
- **Fix**: Dodać `use: { trace: "retain-on-failure" }`, gdy pierwszy niejasny błąd w kontenerze tego wymaga.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Brak śladu przy nieudanym teście utrudnia tylko szukanie przyczyny błędu w kontenerze i nie zmienia wyniku testów. Dziś wszystkie testy przechodzą, a dodanie śladu jest też warunkiem powrotu do D-007, więc nie warto go dokładać bez potrzeby. · D-012
  - Return when: test w przeglądarce pada w kontenerze z niejasną przyczyną albo zmiana dotyka `use` lub `outputDir` w `playwright.config.ts`.
