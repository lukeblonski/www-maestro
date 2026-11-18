<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Testy dzisiejszego zachowania strony, README i polecenie testów

- **Plan**: context/changes/testy-zachowania-strony/plan.md
- **Mode**: Deep
- **Date**: 2026-11-18
- **Verdict**: REVISE
- **Findings**: 1 critical, 2 warnings, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | WARNING |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | FAIL |

## Grounding
Grounding: 14/14 paths ✓; 6/6 symbols ✓ (`5e4dcac` commit, `.header-actions > .button-small { display: none }` `app/globals.css:1627-1628`, `scroll-behavior: smooth` `app/globals.css:53`, gitleaks 8.30.1, image `mcr.microsoft.com/playwright:v1.65.0-noble`, first backtick span of `## Verify` read by `autopilot.py:1736-1742`); brief↔plan ✓. `validate_change.py --rules 4`: OK. Progress↔Phase: 4/4 phases, 31/31 bullets ✓. Pyramid boundaries: every phase within `- Granice:`.

## Findings

### F1 — Kryterium 1.4 uruchamia `verify` na `HEAD` sprzed commita fazy

- **Severity**: ❌ CRITICAL
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Success Criteria, wiersz 1.4
- **Detail**: Wiersz 1.4 to `git worktree add --detach /tmp/maestro-verify HEAD && (cd /tmp/maestro-verify && npm ci && npm run verify)`. `/10x-goal-implement` uruchamia polecenia z Automated w bramce (a), przed staging i przed commitem fazy (`10x-goal-implement/SKILL.md:164-181`, „commit-only-on-green”). W tej chwili `HEAD` to commit bez zmian Fazy 1, czyli bez skryptu `verify`, bez `@playwright/test` i bez testu „krok 16”. `npm run verify` w worktree kończy się więc błędem „Missing script: verify”. Bramka nie przejdzie przy żadnej próbie, a Faza 1 nie dostanie commita. Do tego pozostałość `/tmp/maestro-verify` po przerwanym przebiegu sprawia, że następne `git worktree add` też pada.
- **Fix**: W 1.4 zbudować worktree z bieżącego stanu repo, a nie z samego `HEAD`. Najpierw usunąć pozostałość (`git worktree remove --force /tmp/maestro-verify 2>/dev/null; rm -rf /tmp/maestro-verify`). Potem `git worktree add --detach /tmp/maestro-verify HEAD` i skopiować do niego zmienione oraz nowe, nieignorowane pliki: `git ls-files -mo --exclude-standard -z | xargs -0 cp --parents -t /tmp/maestro-verify`. Na końcu `cd /tmp/maestro-verify && npm ci && npm run verify`. Dalsza część polecenia (sprzątanie i `exit $s`) zostaje bez zmian.
  - Strength: Sprawdza dokładnie ten stan, który za chwilę trafi do commita, i dalej bez `node_modules` i `.next/`, tak jak bramka autopilota.
  - Tradeoff: Polecenie się wydłuża. Usuniętych plików nie odwzorowuje, ale plan niczego nie usuwa.
  - Confidence: HIGH — kolejność bramek jest wprost w `10x-goal-implement/SKILL.md:164-181`.
  - Blind spot: Działanie `cp --parents` z nazwami zawierającymi polskie litery, gdy `core.quotepath` dotyczy tylko wyjścia bez `-z`.
  - Intent: within
- **Decision**: AUTO-FIX (normalne używanie): Wiersz 1.4 robi worktree z `HEAD` sprzed commita fazy, w którym nie ma jeszcze skryptu `verify` ani testu „krok 16”, więc bramka Automated Fazy 1 pada przy każdej próbie i faza nigdy nie dostaje commita; poprawka zmienia tylko polecenie w planie, mieści się w intencji i nie dotyka żadnej bramki. · Option: Fix · commit e2d9c2d

### F2 — Tło do kontrastu ma uwzględniać sam element, nie tylko przodków

- **Severity**: ⚠️ WARNING
- **Dimension**: Blind Spots
- **Location**: Phase 2 — Changes Required #2, `krok 13`
- **Detail**: Kontrakt mówi „tło z najbliższego przodka o nieprzezroczystym `background-color`”. Kilka mierzonych przycisków ma jednak własne nieprzezroczyste tło: `.button-primary` (limonkowe tło, tekst `#1e3c23`, `app/globals.css:196`, przycisk wysyłki `components/interactive.tsx:308`), `.reply-button` (`globals.css:483`), wybrany `.step-item.selected` (`globals.css:681`) i `.form-row .button` (`globals.css:1375`). To samo dotyczy `p.claude-note` z tłem `--soft` (`globals.css:1060`). Gdy implementujący czyta „przodka” dosłownie, ciemny albo jasny tekst przycisku zostaje porównany z tłem sekcji. Test pada wtedy na dzisiejszej stronie, a według plan-brief („implementacja staje i zgłasza”) mamy fałszywe zatrzymanie. Do tego `html` ma przezroczyste tło, a nieprzezroczyste ma dopiero `body` (`globals.css:59`).
- **Fix**: W kontrakcie `krok 13` zapisać: „tło z samego elementu albo jego najbliższego przodka (do `body` włącznie) o nieprzezroczystym `background-color`”. W planie dopisać też, że mierzone są przyciski z własnym tłem.
  - Strength: Usuwa niejednoznaczność, która daje fałszywie czerwony test na dzisiejszej stronie.
  - Tradeoff: Brak.
  - Confidence: HIGH — klasy z własnym tłem są wymienione z numerami linii.
  - Blind spot: Elementy z `opacity` < 1 w motywie bez ograniczenia ruchu. Pomiar idzie jednak przy `reducedMotion: 'reduce'`, który wyłącza animacje (`globals.css:2042-2047`).
  - Intent: within
- **Decision**: AUTO-FIX (normalne używanie): Mierzone w T13 przyciski (`.button-primary`, `.reply-button`, `.step-item.selected`, `.form-row .button`) i `p.claude-note` mają własne nieprzezroczyste tło, więc kontrakt „najbliższy przodek” czytany dosłownie da czerwony test już na dzisiejszej stronie i zatrzyma implementację bez powodu; dopisanie „sam element albo jego najbliższy przodek (do `body` włącznie)” mierzy prawdziwe tło pod tekstem, a to jest zamiar T13, więc kryterium się nie zmienia. · Option: Fix · commit e2d9c2d

### F3 — Potwierdzenie zmiany T15 przez człowieka nie czeka nigdzie w kolejce

- **Severity**: ⚠️ WARNING
- **Dimension**: End-State Alignment
- **Location**: Decyzje planu, wiersz „Gdzie biegnie test krok 15”; plan-brief, „Otwarte ryzyka i założenia”
- **Detail**: Plan mówi: „Zmiana kryterium T15 czeka na potwierdzenie człowieka”. Plan-brief mówi: „Rozstrzygnął to agent, a nie człowiek, choć zmiana kryterium to bramka 1. Człowiek powinien to potwierdzić przed implementacją”. Tymczasem w `change.md` pole Sprawdzenie T15 i krok 4 scenariusza są już przepisane, pytanie ma `rozstrzygnął: agent`, a sekcji `## Wymaga Twojej decyzji` nie ma. Autopilot przejdzie więc do `/10x-goal-implement` bez człowieka, a potwierdzenie, którego plan wymaga przed implementacją, się zgubi.
- **Fix**: Wpisać potwierdzenie wariantu (a) dla T15 do `## Wymaga Twojej decyzji`, żeby człowiek odpowiedział przed implementacją. W planie i plan-brief zamiast „czeka na potwierdzenie” odesłać do tego wpisu.
  - Strength: Zmiana kryterium akceptacji trafia do człowieka, tak jak wymaga tego bramka, na którą powołuje się sam plan.
  - Tradeoff: Implementacja czeka na odpowiedź człowieka.
  - Confidence: HIGH — `change.md:80`, `:116` i brak sekcji `## Wymaga Twojej decyzji`.
  - Blind spot: Czy reguła „Kiedy pytać człowieka” w ogóle pozwala agentowi zmienić pole Sprawdzenie kryterium bez pytania. Ocenia to triage.
  - Intent: within
- **Decision**: AUTO-ESCALATE (bramka 1): Przeniesienie sprawdzenia T15 z `npm run verify` do `npm run test:e2e -- --grep "krok 15\b"` i nowy krok 4 scenariusza zmieniają kryterium akceptacji i scenariusz w `change.md`, a rozstrzygnął to agent (`rozstrzygnął: agent`); każde wyjście z konfliktu T15 i T17 zmienia któreś kryterium, więc decyzję podejmuje człowiek przed implementacją. · Recommendation: A (wariant (a)), bo tylko on zachowuje oba cele z „Oczekiwany efekt” (jedno polecenie wszystkich testów, które naprawdę przechodzi, i `verify` bez Dockera).

### F4 — Zielone `typecheck` w świeżym worktree zależy od `skipLibCheck`

- **Severity**: 💬 OBSERVATION
- **Dimension**: Blind Spots
- **Location**: Current State Analysis; Phase 1, wiersz 1.4
- **Detail**: `next-env.d.ts` importuje `./.next/types/routes.d.ts` i `root-params.d.ts`, a w świeżym worktree tych plików nie ma. TypeScript 7.0.2 ma domyślnie `noUncheckedSideEffectImports`. `tsc --noEmit` przechodzi tylko dlatego, że `skipLibCheck: true` pomija pliki `.d.ts`. Z `--skipLibCheck false` dostajemy TS2882 w `next-env.d.ts:3-4`. Zamrożenie `tsconfig.json` przez T16 chroni to dziś, ale plan tej zależności nie zapisuje.
- **Fix**: Dopisać w Current State Analysis jedno zdanie o tej zależności, żeby nikt nie wyłączał `skipLibCheck` ani nie dodawał takich importów w testach.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Dziś `typecheck` przechodzi w świeżym worktree, a T16 zamraża `tsconfig.json`, więc błąd TS2882 wyszedłby tylko po wyłączeniu `skipLibCheck` albo po dopisaniu podobnych importów `.d.ts`; to przypadek wymyślony, którego nie ma w scenariuszu ani w „Chroni przed”. · Return when: zmiana dotyka `tsconfig.json` (zwłaszcza `skipLibCheck`) albo `next-env.d.ts`, albo testy dostają importy plików z `.next/types/`. · D-005

### F5 — Strażnik „zero testów” liczy projekt `repo`, którego `test:e2e` nie uruchamia

- **Severity**: 💬 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Changes Required #4, kroki 1 i 4
- **Detail**: Krok 1 liczy testy w całej konfiguracji `playwright.bez-przegladarki.config.ts`, razem z projektem `repo`. Krok 4 uruchamia jednak tylko `--project readme`. `npm run test:e2e -- --grep "krok 16\b"` kończy się więc kodem 0, choć nie uruchomił żadnego testu. To jest dokładnie ta fałszywa zieleń, przed którą strażnik ma chronić.
- **Fix**: W kroku 1 liczyć testy konfiguracji bez przeglądarki z `--project readme`.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Fałszywa zieleń wychodzi tylko wtedy, gdy ktoś uruchomi `npm run test:e2e` z `--grep`, który wybiera wyłącznie test projektu `repo` (np. „krok 16”); w `change.md` krok 16 sprawdza `npm run verify`, a kroki 1–15 mają testy w przeglądarce albo w projekcie `readme`, więc przy zwykłej pracy to się nie zdarza. · Return when: zmiana dodaje test w `tests/repo/` albo kryterium ze Sprawdzeniem `npm run test:e2e -- --grep` wybiera test projektu `repo`. · D-006

### F6 — Zagnieżdżone przebiegi Playwright czyszczą wspólny `outputDir`

- **Severity**: 💬 OBSERVATION
- **Dimension**: Blind Spots
- **Location**: Decyzje planu, „Wyniki Playwright”; Phase 4 — `krok 15`
- **Detail**: Obie konfiguracje mają ten sam `outputDir` (`node_modules/.cache/playwright-wyniki`), a Playwright 1.65.0 usuwa `outputDir` wybranych projektów na starcie przebiegu (`playwright/lib/runner/index.js:6680-6699`). W trakcie testu „krok 15” wewnętrzne `npm test` (projekt `repo` i przebieg w kontenerze) usuwa więc katalog przebiegu zewnętrznego, który dalej trwa. Test „krok 15” nie ma artefaktów, więc dziś to raczej nie szkodzi.
- **Fix**: Dać projektowi `readme` własny `outputDir`, np. `node_modules/.cache/playwright-wyniki-readme`.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Zagnieżdżony przebieg w teście „krok 15” czyści wspólny `outputDir`, ale zewnętrzny przebieg projektu `readme` nie zapisuje tam artefaktów, więc dziś nic się nie psuje; szkoda pojawiłaby się dopiero przy artefaktach, których plan nie przewiduje. · Return when: test „krok 15” albo projekt `readme` dostaje artefakty (`screenshot`, `trace`, `video`, pliki wyników) albo zmiana dotyka `outputDir` w `playwright.config.ts` lub `playwright.bez-przegladarki.config.ts`. · D-007
