<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Przebudowa treści i układu strony Maestro

- **Plan**: context/changes/przebudowa-strony/plan.md
- **Mode**: Deep
- **Date**: 2026-11-19
- **Verdict**: SOUND
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding
Grounding: 13/13 paths ✓, 5/5 symbols ✓ (`poHydracji`, `PLIKI_ZMIAN`, `TYPY_ZASOBOW`, mapa MIME w `serwer-statyczny.mjs`, `zmierzKontrast`), brief↔plan ✓; R4 ✓ (`validate_change.py --rules 4` exit 0); Progress↔Phase ✓; brak `docs/reference/contract-surfaces.md`; brak `context/foundation/lessons.md`.

Potwierdzone w kodzie: `.chapter { min-height: calc(100svh - var(--nav)) }` i `scroll-margin-top` 84 px (`makieta.html:17,29,74`), spis ukryty poniżej 980 px (`makieta.html:138-141`); poza `--quiet` i placeholderem żadna para tekst/tło makiety nie spada poniżej 4.5:1 (najniższa: `.foot` `--slate-muted` na `--sky` 4.71:1); `url("../public/hero-lines.webp")` przechodzi przez webpack jak fonty (`next.config.ts` bez `assetPrefix` i reguł webpack); poza plikami z planu nic nie importuje usuwanych kluczy ani komponentów; `tsconfig.json` obejmuje `tests/**`.

## Findings

### F1 — Krok 12 sprawdza `transition-duration` na elemencie, który nie ma przejścia

- **Decision**: AUTO-FIX (normalne używanie): Kontrakt kroku 12 mierzy `transition-duration` na linku spisu, który sam nie ma przejścia, więc asercja przechodzi zawsze i nie sprawdza kryterium P11 dla osób z ograniczonym ruchem; trzeba mierzyć `::after` i `span` każdej pozycji spisu.
- **Severity**: ⚠️ WARNING
- **Dimension**: Blind Spots
- **Location**: Phase 2 — #7 Kroki 5, 11–13 (krok 12, P11)
- **Detail**: Kontrakt kroku 12 mówi „na 1280 px pozycje spisu mają `transition-duration` `0s`”. W makiecie same linki spisu nie mają przejścia; mają je ich części: `.index a::after { transition: width .25s }` (`makieta.html:68`) i `.index a span { transition: opacity .25s }` (`makieta.html:69`). `getComputedStyle(a).transitionDuration` daje `0s` także bez reguły ograniczonego ruchu, więc asercja przejdzie zawsze i nie wykryje, że przejścia w spisie zostały przy ograniczonym ruchu (P11).
- **Fix**: W kontrakcie kroku 12 mierzyć `transition-duration` tam, gdzie makieta ma przejścia: `getComputedStyle(a, "::after")` i `getComputedStyle(a.querySelector("span"))` dla każdej pozycji spisu, oba `0s` przy `reducedMotion: "reduce"`.
  - Strength: Asercja zaczyna wykrywać brak reguły `prefers-reduced-motion` dla spisu, czyli dokładnie to, co obiecuje P11.
  - Tradeoff: Test zależy od struktury linku spisu (`span` w środku), którą i tak buduje `ChapterIndex`.
  - Confidence: HIGH — przejścia są tylko na `::after` i `span` (`makieta.html:67-69`).
  - Blind spot: Gdy implementacja przeniesie przejście na inny element, test trzeba poprawić razem z nią.
  - Intent: within

### F2 — „Ostatni blok `body`” w Decyzjach planu nie da się spełnić w Next

- **Decision**: AUTO-FIX (normalne używanie): Tabela decyzji każe sprawdzać, że `#waitlist` to ostatni blok `body`, a w zbudowanej stronie po stopce stoją `script` i `next-route-announcer`, więc krok 1 napisany według tabeli nie przejdzie; brzmienie tabeli i kontraktu kroku 1 trzeba ujednolicić na „ostatni element `body` poza `script` i `next-route-announcer`” (decyzja o `<footer id="waitlist">` jest rozstrzygnięta przez agenta, więc nie trafia na bramkę 1).
- **Severity**: ⚠️ WARNING
- **Dimension**: Plan Completeness
- **Location**: Decyzje planu, wiersz „Element `#waitlist`” vs Phase 2 — #6 (krok 1)
- **Detail**: Tabela decyzji mówi „krok 1 sprawdza, że to ostatni blok `body` i stoi po `<main>`”, a kontrakt kroku 1 tylko „stoi w dokumencie po `main`”. W zbudowanej stronie po `<footer>` są trzy elementy `<script>` (dzisiejszy `out/index.html`), a po hydracji Next dokłada `next-route-announcer` (`node_modules/next/dist/client/components/app-router-announcer.js:32`). Test napisany według tabeli (`body.lastElementChild` to `#waitlist`) nie przejdzie.
- **Fix**: W tabeli decyzji zastąpić „ostatni blok `body`” brzmieniem „ostatni element `body` poza `script` i `next-route-announcer`”, i dopisać to samo do kontraktu kroku 1.
  - Strength: Usuwa sprzeczność tabela↔kontrakt i podaje sprawdzenie, które działa na zbudowanej stronie.
  - Tradeoff: Test zna nazwę elementu wewnętrznego Next.
  - Confidence: HIGH — kolejność dzieci `body` sprawdzona w dzisiejszym `out/index.html`.
  - Blind spot: Inne wersje Next mogą dokładać inne elementy na końcu `body`.
  - Intent: within

### F3 — Kontrakt `ChapterIndex` nie mówi o wyliczeniu pozycji przy montowaniu

- **Decision**: AUTO-FIX (normalne używanie): Scenariusz człowieka zaczyna się od otwarcia strony z udostępnionego linku, a kotwica `#ownership` jest w Ograniczeniach, więc na komputerze spis pokazywałby „Your partner” do pierwszego przewinięcia; do kontraktu `ChapterIndex` trzeba dopisać, że wylicza bieżącą pozycję raz przy montowaniu.
- **Severity**: 💡 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 2 — #3 Interakcje (kontrakt `ChapterIndex`)
- **Detail**: Makieta wywołuje `markChapter()` raz po podpięciu nasłuchu (`makieta.html:331`); kontrakt planu wymienia tylko nasłuch `scroll` i `resize`. Bez wyliczenia przy montowaniu strona otwarta z linku `#ownership` pokazuje w spisie „Your partner” aż do pierwszego przewinięcia.
- **Fix**: Dopisać do kontraktu `ChapterIndex`: „i wylicza bieżącą pozycję raz przy montowaniu”.
