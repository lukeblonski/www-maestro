# Testy dzisiejszego zachowania strony — skrót planu

> Pełny plan: `context/changes/testy-zachowania-strony/plan.md`
> Research: `context/changes/testy-zachowania-strony/research.md`

## Co i po co

Strona Maestro nie ma testów, a każde scalenie na `main` ją publikuje, więc zepsucie demo, motywu, formularza albo układu na telefonie przeszłoby niezauważone. Zmiana dodaje testy dzisiejszego zachowania (kroki 1–16 scenariusza PRD), jedno polecenie wszystkich testów w README i polecenie sprawdzające dla Factory. Strona zostaje bez zmian.

## Punkt wyjścia

- Dziś są tylko skrypty `dev`, `build` i `typecheck`, a `## Verify` kończy się błędem „brak testów”.
- Kod strony da się testować bez zmian, przez kotwice, role i nazwy dostępne.
- Komputer fabryki nie ma przeglądarek. Ma za to Docker bez roota i obraz Playwright 1.65.0.

## Stan docelowy

- `npm test` uruchamia wszystkie testy i przy dzisiejszej stronie przechodzi.
- `npm run verify` sprawdza typy, porównanie kodu strony z `5e4dcac` i sekrety, bez Dockera.
- `npm run test:e2e` buduje stronę z prefiksem `/www-maestro`. Potem w kontenerze bez sieci uruchamia testy kroków 1–14 na 360 px i 1280 px, a na komputerze test „krok 15”.
- README i `CLAUDE.md` opisują oba polecenia i uruchomienie strony.

## Najważniejsze decyzje

| Decyzja | Wybór | Dlaczego | Źródło |
|---|---|---|---|
| Gdzie biegnie krok 15 | W `test:e2e`, na komputerze po kontenerze, ze zmienną pomijającą sam siebie | T17 zostaje (`verify` bez Dockera), a polecenie z README naprawdę przechodzi | Agent po zatrzymaniu planu; potwierdził człowiek 2026-11-18 (plan-review F3) |
| Narzędzie | `@playwright/test` 1.65.0, tylko Chromium, obraz kontenera tej samej wersji | Jedyna nowa zależność, zgodna z obrazem | Intencja |
| Dwie konfiguracje | Przeglądarka (z serwerem) i bez przeglądarki (projekty `repo` i `readme`) | `verify` nie może budować ani podawać strony | Research |
| Serwer strony | Własny serwer w Node pod `/www-maestro/`, 404 dla reszty | Bez zależności, realny sygnał dla zasobów pod prefiksem | Plan |
| Budowa | Na komputerze. Kontener dostaje `out/` i `node_modules`, `--network none` | W kontenerze nie trzeba sieci ani `npm ci` | Research |
| Teksty w testach | Role, nazwy, kotwice; potrzebny tekst importowany z `lib/content.ts` | Testy nie psują się przy zmianie treści (T20) | Plan |
| Pusty `--grep` | Kod 1, gdy argumenty nie wybierają żadnego testu | Literówka nie daje fałszywej zieleni | Plan |
| Wyniki Playwright | `node_modules/.cache/`, reporter `list` | Nie zmienia `.gitignore` | Research |
| `## Verify` | `npm ci && npm run verify` | Autopilot uruchamia je w świeżym worktree bez `node_modules` | Research |
| `next-env.d.ts` po `npm run dev` | Przywracany `git checkout`, nie commitowany | Inaczej trafiłby do commita i złamał T21 | Research |
| Plan testów | Wypełnione wzorce 6.1–6.5 i poprawione bramki | Następna zmiana testuje tak samo | Research |

## Zakres

**W zakresie:**
- `@playwright/test` w `package.json` i `package-lock.json`;
- dwie konfiguracje Playwright, `scripts/` (serwer i skrypt testów);
- `tests/` (kroki 1–16);
- README, sekcje `CLAUDE.md`, `test-plan.md`.

**Poza zakresem:**
- kod, treść i styl strony, `next.config.ts`, `tsconfig.json`, `.github/workflows/`, `.gitignore`;
- CI gałęzi, poprawka autopilota (uruchamianie `## Testy w CI` przy scaleniu);
- przypinanie wersji, linter, inne przeglądarki, axe-core.

## Podejście

Skrypt `test-e2e.sh` liczy testy wybrane argumentami. Jeśli są testy w przeglądarce, buduje stronę i uruchamia je w kontenerze, gdzie serwer statyczny i Chromium działają na loopbacku. Jeśli jest wybrany „krok 15”, uruchamia go na komputerze. Test „krok 15” uruchamia `npm test` z README (`verify`, a potem `test:e2e`), który pomija w środku sam „krok 15”. `verify` uruchamia typy, test „krok 16” przez `git` i gitleaks.

## Fazy w skrócie

| Faza | Co daje | Główne ryzyko |
|---|---|---|
| 1. Narzędzie i uruchomienie | Playwright, konfiguracje, serwer, skrypt, `verify`, krok 14 i 16, `## Verify` | Kolejność kluczy w `package.json`; `--list` a `webServer` |
| 2. Sekcje, układ, motyw, sieć, ruch, kontrast | Kroki 1–5 i 11–13 | Kontrast: element poniżej 4.5:1 na dzisiejszej stronie |
| 3. Interakcje | Kroki 6–10 | Zduplikowane nazwy i dwa `role=status` |
| 4. README, krok 15, dokumentacja | README, krok 15, `## Testy w CI`, `## Uruchomienie lokalne`, `test-plan.md` | Długi czas kroku 15 (całe `npm test`) |

**Warunki wstępne:** Docker bez roota i obraz `mcr.microsoft.com/playwright:v1.65.0-noble` na komputerze (są), gitleaks 8.30.1 (jest), dostęp do rejestru npm przy `npm install --package-lock-only`.
**Szacowany nakład:** 1–2 sesje implementacji, 4 fazy.

## Otwarte ryzyka i założenia

- Przeniesienie kroku 15 z `verify` do `test:e2e` zmienia pole Sprawdzenie w T15 i krok 4 scenariusza. Najpierw rozstrzygnął to agent, a 2026-11-18 potwierdził człowiek: „Dobra, akceptuję rekomendację, kontynuuj.” (plan-review F3).
- Autopilot przed scaleniem nie uruchamia testów w przeglądarce, tylko `## Verify`. W tej zmianie robią to wiersze Automated planu, a dla kolejnych zmian potrzebna jest poprawka Factory.
- Pary kolorów z motywu dają co najmniej 5.08:1. Jeśli jednak któryś element dzisiejszej strony będzie poniżej 4.5:1, kodu strony nie wolno zmienić, więc implementacja staje i zgłasza to, zamiast obniżać próg.
- Założenie: `--list` w Playwright 1.65.0 nie uruchamia `webServer`. W przeciwnym razie serwer startuje warunkowo (plan, „Critical Implementation Details”).

## Kryteria sukcesu (skrót)

- `npm test` z README przechodzi przy dzisiejszej stronie, a test nazwany krokiem scenariusza pada, gdy następna zmiana go zepsuje.
- `npm run verify` przechodzi bez Dockera, także w świeżym worktree.
- Kod strony, konfiguracja budowy i workflow publikacji są identyczne z `5e4dcac`.
