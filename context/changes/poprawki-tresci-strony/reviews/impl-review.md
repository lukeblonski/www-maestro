<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Poprawki treści strony Maestro

- **Plan**: context/changes/poprawki-tresci-strony/plan.md
- **Scope**: Phases 1–2 of 2 (full plan)
- **Date**: 2026-11-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 4 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Punkty z prośby o przegląd

- (1) Sekrety w CI: gałąź (`git diff --name-only main...HEAD`) nie dodaje ani nie zmienia żadnego pliku w `.github/workflows/`, a folderu `context/changes/poprawki-tresci-strony/chronione/` nie ma. Żaden sekret nie trafia do nowego miejsca; `scripts/strona-na-zywo.mjs` nie czyta plików z `## Dostępy` (`atrapy: []`, `uslugi: []`). Przechodzi, bez uwagi.
- (2) Migracje bazy: gałąź nie dodaje migracji (strona statyczna bez bazy). Nie dotyczy, bez uwagi.

## Polecenia

- `npm run test:e2e -- --grep "krok (1|7)\b"` → exit 0 — 4 passed
- `npm run test:e2e -- --grep "krok 8\b"` → exit 0 — 2 passed
- `npm run test:e2e -- --grep "krok 9\b"` → exit 0 — 2 passed
- `npm run test:e2e` → exit 0 — 28 passed (telefon-360, komputer-1280), krok 15 passed
- `npm ci && npm run verify` → exit 0 — 21 passed, gitleaks: no leaks found
- `node --check scripts/strona-na-zywo.mjs` → exit 0
- `awk '/^## Sprawdzenie na żywo/{s=1;next} /^## /{s=0} s' CLAUDE.md | grep -cE '^- (teksty-sekcji|teksty-porownania|coming-soon|faq-strony): `node scripts/strona-na-zywo.mjs`$'` → 4
- stany końcowe (`grep -F` każdego tekstu po `stan końcowy: ` z czterech podpunktów `change.md` w skrypcie) → 4 × OK
- `npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py poprawki-tresci-strony --rules 6` → exit 0 — „OK: poprawki-tresci-strony: rules 6 passed”

## Kryteria

- P1: spełnione — `npm run test:e2e -- --grep "krok (1|7)\b"` exit 0 (4 passed); krok 1 sprawdza zdania dosłownie w swoich sekcjach i brak sześciu starych zdań (`tests/e2e/sekcje-i-uklad.spec.ts:21-96,161-166`).
- P2: spełnione — `npm run test:e2e -- --grep "krok 9\b"` exit 0 (2 passed); 11 pytań w kolejności i `p strong` z „We don’t charge you anything for Maestro.” (`tests/e2e/interakcje.spec.ts:210-226`).
- P3: spełnione — `npm run test:e2e -- --grep "krok 8\b"` exit 0 (2 passed).
- P4: spełnione — `npm run test:e2e` exit 0 (28 passed, krok 15 passed).
- P5: spełnione — `CLAUDE.md:36-39` ma cztery linie `node scripts/strona-na-zywo.mjs`; skrypt czyta `NA_ZYWO_ADRES` (`scripts/strona-na-zywo.mjs:313`, przed publikacją `:293`) i zapisuje wynik z `uslugi: []` (`:339`) do `NA_ZYWO_WYNIK`.
- P6: spełnione — `npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py poprawki-tresci-strony --rules 6` exit 0.
- P7: spełnione — `npm run test:e2e -- --grep "krok 7\b"` (w `krok (1|7)\b`) exit 0; `app/globals.css:88` bez `border-top`, `.cmp-row` z `border-bottom` bez zmian.
- P8: spełnione — `sha256sum makieta.html` = fb975a6d…ae24 jak w `makieta/akceptacja.md:2`; treść `lib/content.ts`, `strong` po spacji w tym samym `<p>` (`components/interactive.tsx:66-74`) i tabela bez górnej linii odpowiadają makiecie v2.

## Findings

### F1 — `npm ci` i budowa w skrypcie sprawdzeń bez limitu czasu

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/strona-na-zywo.mjs:269-274
- **Detail**: `uruchom()` woła `spawnSync` dla `npm ci` i `npm run build` bez `timeout`. Gdy instalacja albo budowa zawiśnie, autopilot zabija skrypt po 1200 s i nie ma pliku wyniku, więc powód porażki to tylko „brak pliku wyniku” zamiast nazwy kroku, który zawisł. Wynik nie jest fałszywie pozytywny. `scripts/na-zywo.mjs:36,108` ma ogólny limit czasu.
- **Fix**: Przekazać `timeout` do `spawnSync` (np. 8 min dla `npm ci`, 6 min dla budowy), żeby istniejący `throw` zapisał „nie przeszło” z powodem.
- **Decision**: AUTO-LIMIT (przypadek szczególny): `npm ci` albo budowa zawiesza się tylko w rzadkim przypadku i wtedy autopilot i tak kończy krok porażką („brak pliku wyniku”), więc brakuje tylko nazwy kroku, który zawisł, a werdykt nie jest fałszywie pozytywny; zmiana nie ma „Chroni przed”, więc przyjmuję model „przypadkowy błąd agenta, nie celowe obejście”. · D-023

### F2 — VERIFICATION.md opisuje stare kroki 7, 8, 9 i 16

- **Severity**: 👁 OBSERVATION
- **Dimension**: Scope Discipline
- **Location**: VERIFICATION.md:11-13,18
- **Detail**: LEFTOVER tej zmiany: „Step 9 — the FAQ has the 8 questions in order”, a strona i test kroku 9 mają teraz 11 pytań; krok 7 nie wspomina braku górnej linii tabeli, krok 8 wiersza porównania i linii o zabezpieczeniach, krok 16 wymienia tylko zmiany lista-oczekujacych i przebudowa-strony. Plik nie jest w planie ani w Ograniczeniach `change.md`.
- **Fix**: Uaktualnić linie kroków 7, 8, 9 i 16 w `VERIFICATION.md` do tego, co sprawdzają testy (wpis PC w `## Plan Changes`).
- **Decision**: AUTO-SKIP (styl): razem z niczym, bo dotyczy innego miejsca; `VERIFICATION.md` to opis z nieaktualnymi liniami kroków 7, 8, 9 i 16, a testy i strona działają poprawnie; poprawka wychodzi też poza pliki z Ograniczeń `change.md`.

### F3 — Obsługa błędów skryptu słabsza niż w scripts/na-zywo.mjs

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/strona-na-zywo.mjs:284-309, 328-331
- **Detail**: (a) `catch` w pętli przed publikacją łapie też błędy `sprawdz(...)`, więc błąd parsera wraca jako „strona nie odpowiedziała”; (b) proces serwera z `spawn` nie ma słuchacza `error`; (c) `serwer.kill()` nie czeka na koniec procesu, choć plan mówi „serwer zatrzymany przed zapisem wyniku”; (d) `zapisz()` bez try/catch. Bez wpływu na werdykt w zwykłym przebiegu, bo autopilot zabija grupę procesów po kroku.
- **Fix**: Wywołać `sprawdz` poza `try` chroniącym `pobierz`, dodać `serwer.on("error", …)` i poczekać na `exit` serwera (z krótkim limitem) przed powrotem.
- **Decision**: AUTO-LIMIT (przypadek szczególny): razem z F1: to te same ścieżki błędu skryptu w `przedPublikacja`/`zapisz`, czyli zły powód przy błędzie parsera, brak słuchacza `error`, brak czekania na koniec serwera i `zapisz` bez try/catch; w zwykłym przebiegu werdykt się nie zmienia, bo autopilot zabija grupę procesów po kroku. · D-023

### F4 — Sprawdzenie coming-soon po publikacji przechodzi też na starej stronie

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/strona-na-zywo.mjs:211-227, 312-326
- **Detail**: Wszystkie trzy „Coming soon” były już na stronie S-04, więc `coming-soon` po publikacji przechodzi przy pierwszym odczycie, zanim nowa wersja jest online. Stan końcowy jest prawdziwy w obu przypadkach, a pozostałe trzy sprawdzenia czekają na nowe teksty.
- **Fix**: Dodać do `comingSoon` jeden nowy tekst tej zmiany (np. „Why Maestro”) jako znak, że czyta nową wersję.
- **Decision**: AUTO-LIMIT (przypadek szczególny): wczesny odczyt starej strony daje prawdziwy stan końcowy („Coming soon” jest w obu wersjach), a fałszywe „przeszło” wymagałoby nowej wersji bez „Coming soon”, której pilnuje test kroku 8 przed scaleniem; tego ataku nie ma w „Chroni przed”, bo zmiana go nie opisuje. · D-024
