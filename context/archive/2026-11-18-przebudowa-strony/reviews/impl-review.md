<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Przebudowa treści i układu strony Maestro

- **Plan**: context/changes/przebudowa-strony/plan.md
- **Scope**: Phase 1–3 of 3 (pełny plan), zakres `32b8fa6..c325df9`
- **Date**: 2026-11-19
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 0 warnings, 7 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Punkty przeglądu zlecone w wywołaniu

- **(1) Sekrety w CI**: przechodzi. Gałąź nie dodaje ani nie zmienia żadnego pliku w `.github/workflows/` ani w `context/changes/przebudowa-strony/chronione/.github/workflows/` (`git diff --name-only main..HEAD` bez trafień), a w kodzie nie ma nowego użycia sekretu. Uwagi brak.
- **(2) Migracje bazy**: przechodzi. Gałąź nie dodaje żadnej migracji bazy (projekt nie ma bazy; `git diff --name-only main..HEAD` bez plików migracji ani `.sql`). Bramki brak.

## Polecenia (Automated Verification)

- `printf … | sha256sum -c` (1.1) → exit 0, trzy pliki OK
- `grep -q "Host Grotesk Project Authors" … && grep -q "JetBrains Mono Project Authors" …` (1.2) → exit 0
- `npm ci && npm run verify` (1.3, 2.2) → exit 0, 21 passed, gitleaks „no leaks found” (w przebiegu P13)
- `npm run test:e2e -- --grep "krok ([1-9]|1[0-4])\b"` (2.1) → exit 0, 28 passed
- `! grep -rniE "dm sans|data-theme|maestro-theme|#163d31|#d5f680" app components lib public/icon.svg` (2.3) → exit 0
- `! grep -niE "dm sans|demo rozmowy|maestro-theme|botanical green|dark-paper|light and dark themes|plikami formularza" README.md VERIFICATION.md DESIGN.md CLAUDE.md` (3.1) → exit 0
- `npm run test:e2e && npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py przebudowa-strony --rules 6` (3.2, P13) → exit 0; kroki 1–14 28 passed na obu ekranach, krok 15 passed, verify 21 passed, „OK: przebudowa-strony: rules 6 passed”

## Kryteria

- P1: spełnione — `npm run test:e2e -- --grep "krok 1\b"` → exit 0, 2 passed (telefon-360, komputer-1280)
- P2: spełnione — `npm run test:e2e -- --grep "krok 2\b"` → exit 0, 2 passed
- P3: spełnione — `npm run test:e2e -- --grep "krok 3\b"` → exit 0, 2 passed
- P4: spełnione — `npm run test:e2e -- --grep "krok 4\b"` → exit 0, 2 passed
- P5: spełnione — `npm run test:e2e -- --grep "krok 5\b"` → exit 0, 2 passed
- P6: spełnione — `npm run test:e2e -- --grep "krok 6\b"` → exit 0, 2 passed
- P7: spełnione — `npm run test:e2e -- --grep "krok 7\b"` → exit 0, 2 passed
- P8: spełnione — `npm run test:e2e -- --grep "krok 8\b"` → exit 0, 2 passed
- P9: spełnione — `npm run test:e2e -- --grep "krok 9\b"` → exit 0, 2 passed
- P10: spełnione — `npm run test:e2e -- --grep "krok 10\b"` → exit 0, 2 passed
- P11: spełnione — `npm run test:e2e -- --grep "krok 12\b"` → exit 0, 2 passed
- P12: spełnione — `lib/content.ts:144` („Anyone who wants to build an app by chatting with AI”) i `lib/content.ts:169` („Optional monitoring and AI fixes on some plans, which you turn on and oversee”) poprawiają wiersze 1 i 6, które `research.md:246` uznał za nieprawdziwe; wiersze 2–5 (`lib/content.ts:149,154,159,164`) zostały w brzmieniu z makiety, które research uznał za prawdziwe (`research.md:47`, `:231-237`)
- P13: spełnione — pełne polecenie P13 → exit 0 (kroki 11, 13, 14 na obu ekranach, krok 15, verify, „rules 6 passed”)
- P14: spełnione — `app/page.tsx`, `app/globals.css`, `components/interactive.tsx` i `lib/content.ts` budują strukturę, CSS i treść z `makieta.html:12-332` słowo w słowo; różnice to tylko odstępstwa 1–6 z `plan.md:29-38` i PC1 (`plan.md:319`)

## Findings

### F1 — Krok 13 nie mierzy tekstów w `span` wewnątrz `p`

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: tests/e2e/motyw-siec-dostepnosc.spec.ts:206-207
- **Detail**: Selektor kontrastu mierzy kolor samego `p`, a nie spanów z własnym kolorem w środku: `.chapter-label span.mono` (akcent na `--sky-soft` w `#after-launch`, ok. 5.1:1), `.foot > span` (hasło w stopce na `--sky`, ok. 4.7:1, blisko progu) i etykiety `.who` na 360 px. Dziś spełniają próg, ale późniejsza zmiana koloru nie zostanie wykryta, a `DESIGN.md:123` i `VERIFICATION.md:17` mówią, że krok 13 mierzy każdą parę kolorów.
- **Fix**: Dopisać `span.mono, .foot span, .who` do `TEKSTY_STRONY` w kroku 13.
- **Decision**: AUTO-LIMIT (przypadek szczególny): `change.md` nie ma modelu zagrożenia, więc przyjąłem „przypadkowy błąd agenta, nie celowe obejście”. Spany w `p` (`.chapter-label span.mono` ok. 5.1:1, `.foot > span` ok. 4.7:1, `.who`) mają dziś kontrast co najmniej 4.5:1, więc ograniczenie „kontrast tekstu co najmniej 4.5:1” i P13 są spełnione, a luka w teście ujawni się dopiero przy późniejszej zmianie kolorów, nie przy normalnym używaniu strony. · D-018

### F2 — Krok 6 nie sprawdza wyliczenia spisu przy otwarciu z kotwicą

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: tests/e2e/interakcje.spec.ts:37
- **Detail**: Asercja „na starcie” oczekuje wyróżnienia pierwszej pozycji, którą renderuje już serwer. Wyliczenie przy montowaniu (`components/interactive.tsx:37`, poprawka F3 z przeglądu planu) nie jest sprawdzane; jego usunięcie zostawiłoby krok 6 zielony.
- **Fix**: Dodać w kroku 6 (1280 px) otwarcie `/www-maestro/#ownership`, `poHydracji` i oczekiwanie `aria-current="true"` na ostatniej pozycji spisu.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Wyliczenie pozycji spisu przy montowaniu jest w kodzie (`markChapter()` w `components/interactive.tsx`), więc strona otwarta z linku z kotwicą od razu wyróżnia właściwą sekcję. Brakujący test chroni tylko przed przyszłym usunięciem tego wywołania, a nie przed błędem, który zdarza się dziś. · D-019

### F3 — Ramka pola e-mail ma kontrast ok. 1.5:1

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: app/globals.css:120
- **Detail**: Ramka pola `#9fb0bf` na `--sky` ma ok. 1.5:1, a WCAG 1.4.11 wymaga 3:1 dla granicy kontrolki. Intencja wymaga 4.5:1 tylko dla tekstu, a etykieta i placeholder pozwalają rozpoznać pole. Kolor jest z przyjętej makiety.
- **Fix**: Przyciemnić linię pola do ok. `#6a7886` (odstępstwo od makiety, decyzja właściciela).
- **Decision**: AUTO-LIMIT (przypadek szczególny): Intencja wymaga 4.5:1 tylko dla tekstu, a etykieta i placeholder pozwalają rozpoznać pole. Kolor ramki pochodzi z makiety przyjętej przez człowieka („Akceptuję tak, jak jest”, kolory z makiety w „Decyzje z góry”), więc wymóg WCAG 1.4.11 dla granicy kontrolki jest poza kryteriami tej zmiany, a jego poprawka byłaby odstępstwem od decyzji człowieka. · D-020

### F4 — README nadal mówi o Tailwind CSS

- **Severity**: 👁 OBSERVATION
- **Dimension**: Scope Discipline
- **Location**: README.md:3
- **Detail**: LEFTOVER. „Jednostronicowa strona w Next.js i Tailwind CSS”, a ta zmiana usunęła `@import "tailwindcss"` z `app/globals.css`; zostały tylko nieużywane zależności i wtyczka PostCSS (celowo, decyzja planu).
- **Fix**: Zmienić zdanie na „Jednostronicowa strona w Next.js z własnym CSS w `app/globals.css`”.
- **Decision**: AUTO-SKIP (styl): To opis stosu w jednym zdaniu README. Tailwind nadal jest w zależnościach i we wtyczce PostCSS, a strona i testy działają bez względu na to zdanie.

### F5 — Mapa ryzyk w planie testów opisuje starą stronę

- **Severity**: 👁 OBSERVATION
- **Dimension**: Scope Discipline
- **Location**: context/foundation/test-plan.md:46-65, :155
- **Detail**: LEFTOVER. Tabela ryzyk i „Risk Response Guidance” w §2 opisują demo rozmowy, przykład w 8 krokach i podgląd aplikacji obiadowej (#1), CTA nagłówka tylko na 1280 px i tabelę przewijaną w bok (#2), `maestro-theme` jako jedyny zapis (#3, #6) i kontrast „w obu motywach” (#5). Następny `/10x-research` czyta je jako kontekst. W §6.4 (`:155`), w zdaniu poprawianym w tej zmianie, zostało „po wysyłce … poprawnej lista żądań jest pusta”, a krok 10 oczekuje jednego żądania do `ADRES_FUNKCJI`.
- **Fix**: Poprawić wiersze #1, #2, #3, #5, #6 tabeli ryzyk i ich wskazówki na nową stronę (spis, porównanie, FAQ, jeden jasny motyw, pusta pamięć przeglądarki) i zdanie w `:155` na „zero żądań przy błędnym adresie, jedno żądanie do `ADRES_FUNKCJI` przy poprawnym”.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Nieaktualna mapa ryzyk i zdanie w §6.4 o pustej liście żądań nie wpływają na odwiedzającego ani na kryteria P1–P14. Wprowadzą w błąd dopiero następny krok, który czyta `test-plan.md` jako kontekst. · D-021

### F6 — Spis liczy pozycje przy przewijaniu także poniżej 980 px

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: components/interactive.tsx:20-43
- **Detail**: Poniżej 980 px spis ma `display: none`, ale nasłuch przewijania dalej czyta 5 prostokątów sekcji na klatkę. Koszt jest pomijalny (jedno `requestAnimationFrame`, same odczyty).
- **Fix**: Pomijać wyliczenie, gdy `nav` nie ma pudełka (`offsetParent === null`).
- **Decision**: AUTO-LIMIT (przypadek szczególny): Poniżej 980 px nasłuch czyta 5 prostokątów sekcji w jednym `requestAnimationFrame` na klatkę, a sam recenzent ocenia ten koszt jako pomijalny. Spowolnienie przewijania na telefonie to przypadek hipotetyczny. · D-022

### F7 — Nieużywana klasa `.sr-only`

- **Severity**: 👁 OBSERVATION
- **Dimension**: Pattern Consistency
- **Location**: app/globals.css:25
- **Detail**: Klasa `.sr-only` z makiety nie jest używana przez żaden element strony.
- **Fix**: Usunąć regułę albo zostawić jako nieszkodliwą pozostałość makiety.
- **Decision**: AUTO-SKIP (styl): Nieużywana reguła `.sr-only` z makiety to pozostałość, która nie zmienia wyglądu ani zachowania strony.
