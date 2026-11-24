# Poprawki treści strony Maestro — plan

## Overview

Strona zapowiedzi dostaje teksty z listy właściciela (pięć sekcji, porównanie, FAQ z 11 pytaniami), jedno pogrubione zdanie w odpowiedzi o koszcie i tabelę porównania bez czarnej linii nad nagłówkiem, jak w zaakceptowanej makiecie v2. Testy kroków 1, 7, 8 i 9 pilnują nowych zdań dosłownie. Cztery sprawdzenia na żywo z kroków scenariusza dostają w `CLAUDE.md` polecenie, które czyta zbudowaną (przed scaleniem) albo opublikowaną (po publikacji) stronę.

Ścieżka krótka: `**Ryzyko.** Niskie.` w `change.md`.

## Decyzje planu

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Jak pogrubić zdanie o koszcie | Osobne pole (np. `emphasis`) w pozycji FAQ w `lib/content.ts`; komponent `FAQ` w `components/interactive.tsx` wyświetla je po spacji, w tym samym `<p>`, w elemencie `strong` | Tak pokazuje makieta (`<p>… <strong>We don’t charge you anything for Maestro.</strong></p>`), a treść zostaje zwykłym tekstem, bez HTML w `content.ts`. |
| Linia „Setting your own guardrails coming soon” | Istniejące pole `next` punktu „Guardrails built in.” | Ten sam wzór co „Codex and others coming soon”, bez zmiany `app/page.tsx`. |
| Czarna linia nad tabelą | Usunięcie samej deklaracji `border-top` z reguły `.cmp` w `app/globals.css` | Makieta ma `.cmp` tylko z `margin-top`; linie między wierszami (`.cmp-row`, `border-bottom`) zostają. |
| Skąd testy biorą oczekiwane zdania | Nowe zdania z Oczekiwanego efektu i usunięte stare zdania wpisane w testach kroków 1, 7, 8, 9 dosłownie, a nie czytane z `lib/content.ts` | Test, który porównuje stronę z `content.ts`, nie sprawdzi P1 („dosłownie”); wzór `KOLEJNOSC_KOTWIC` w `tests/e2e/sekcje-i-uklad.spec.ts`. |
| Test „krok 16” | Lista wyjątków bez zmian, bo już obejmuje `lib/content.ts`, `components/interactive.tsx` i `app/globals.css`; zmienia się tylko komentarz, który nazywa też tę zmianę | `scripts/`, `tests/` i `CLAUDE.md` są poza ścieżkami testu, więc nowe wyjątki nie są potrzebne. |
| Polecenie sprawdzeń na żywo | Jeden skrypt `scripts/strona-na-zywo.mjs` bez zależności dla czterech nazw; nazwę bierze z `NA_ZYWO_SCIEZKA`, a w `CLAUDE.md` każda z czterech linii ma to samo polecenie `node scripts/strona-na-zywo.mjs` | Reguła Factory: jedno polecenie na nazwę, bez powłoki; wzór to istniejący `scripts/na-zywo.mjs` i przykładowe sprawdzenie strony statycznej Factory (`scripts/fixtures/prawdziwy-przebieg/strona/repo/sprawdzenie.py`). |
| Budowa przed publikacją | `npm ci` (gdy nie ma `node_modules`), `npm run build` z `NEXT_PUBLIC_BASE_PATH=/www-maestro` i `NEXT_TELEMETRY_DISABLED=1`, bez `NEXT_PUBLIC_WAITLIST_URL`, potem `scripts/serwer-statyczny.mjs` z `E2E_PORT=$PORT` | Teksty strony nie zależą od adresu funkcji zapisu, a jej prawdziwy adres powstaje dopiero w workflow; sprawdzenia nie używają formularza, więc to nie jest atrapa i ustawienia to `docelowe`. |
| Czekanie na publikację | Bez znacznika wersji: skrypt pobiera stronę z parametrem omijającym pamięć podręczną co kilkanaście sekund, aż ma wszystkie teksty swojego sprawdzenia, najwyżej 15 minut (limit autopilota to 1200 s) | Plik wersji zmieniłby `public/` i workflow, czyli wyszedłby poza zakres i krok 16. |
| Stan końcowy w pliku wyniku | Cztery stałe w skrypcie, przepisane znak w znak z pól `stan końcowy:` podpunktów scenariusza w `change.md` | Autopilot porównuje `stan_koncowy` dosłownie, a po archiwum `change.md` jest pod inną ścieżką, więc skrypt go nie czyta. |
| Test skryptu | Bez nowego testu repo; plan sprawdza składnię (`node --check`) i linie w `CLAUDE.md` | Ograniczenia wymieniają tylko testy kroków 1, 7, 8, 9 i 16, a według reguł Factory polecenie sprawdzenia uruchamia tylko skrypt autopilota (przed scaleniem na zbudowanej stronie, po publikacji na adresie z `## Wdrożenie`), nigdy kroki agenta. |

## What We're NOT Doing

- Hero, tytuł karty, stopka, formularz, komunikaty zapisu, `worker/` i workflow publikacji zostają bez zmian.
- Żadnych nowych sekcji, obrazów, kotwic ani zmian układu poza górną ramką `.cmp`.
- Nie budujemy ustawiania zabezpieczeń, monitoringu, napraw po premierze ani powiadomień, tylko je zapowiadamy.
- Nie dodajemy pliku wersji do strony ani nowego testu repo dla skryptu sprawdzeń.
- Kroki agenta nie uruchamiają `scripts/strona-na-zywo.mjs` ani `scripts/na-zywo.mjs`.

## Phase 1: Teksty, pogrubienie, tabela i testy kroków

**Criteria**: P1, P2, P3, P4, P7, P8

### Overview

Nowe teksty w pliku treści, pogrubione zdanie w FAQ i tabela bez górnej ramki, jak w makiecie v2, plus testy kroków 1, 7, 8 i 9 na tych zdaniach.

### Changes Required:

#### 1. Treść strony

**File**: `lib/content.ts`

**Intent**: Wpisać wszystkie zdania z Oczekiwanego efektu `change.md` dosłownie, z typograficznym apostrofem ’ tak jak w `change.md`: „It remembers.”; w „You decide” nowe zakończenie punktu o rekomendacji i czwarty punkt „Guardrails built in.” z linią `next`; w „From build to deploy” czwarty punkt „What works keeps working.”; dwa punkty „After launch”; cztery punkty „On your terms” z tytułem „Maestro is always on.”; etykieta porównania „Why Maestro” i nowe komórki sześciu wierszy; FAQ z 11 pytaniami w kolejności z `change.md` i polem pogrubienia przy „What will it cost?”. Nazwa produktu dalej z `PRODUCT_NAME`, a komentarz na górze pliku wskazuje makietę tej zmiany.

**Contract**: Typ pozycji FAQ dostaje opcjonalne pole pogrubionego zdania. Liczba sekcji, kotwice, kolumny porównania (2) i wiersze (6) bez zmian, „After launch” z `soon: true` w sekcji i w wierszu porównania.

#### 2. Pogrubione zdanie w FAQ

**File**: `components/interactive.tsx`

**Intent**: Komponent `FAQ` wyświetla pogrubione zdanie pozycji po odpowiedzi, po spacji, w tym samym akapicie, w elemencie `strong`.

**Contract**: Każda odpowiedź to dalej jeden `<p>` w `<details>`; pozycje bez pola wyglądają jak dziś.

#### 3. Tabela porównania bez górnej linii

**File**: `app/globals.css`

**Intent**: Usunąć `border-top` z reguły `.cmp`, na telefonie i komputerze, zgodnie z uwagą człowieka w makiecie.

**Contract**: Reguła `.cmp` zachowuje `margin-top`; reguły `.cmp-row` z `border-bottom` bez zmian.

#### 4. Testy kroków 1, 7, 8, 9 i 16

**File**: `tests/e2e/sekcje-i-uklad.spec.ts`, `tests/e2e/interakcje.spec.ts`, `tests/repo/zakres-przejecia.spec.ts`

**Intent**: 
- Krok 1: tytuły i teksty nowych i zmienionych punktów pięciu sekcji wpisane dosłownie są na stronie, w swojej sekcji (np. `#control` ma „Guardrails built in.”). Lista usuniętych tekstów dostaje sześć starych zdań z P1.
- Krok 7: etykieta „Why Maestro” w `#why` i sześć par komórek (kreatory | Maestro) wpisanych dosłownie. Wyliczona górna ramka tabeli (`[role="table"]` w `#why`) ma szerokość 0, a dolne linie wierszy danych zostają większe od 0, w obu projektach (360 px i 1280 px).
- Krok 8: dotychczasowe sprawdzenia, a do tego „Coming soon” w wierszu porównania „After launch” i „Setting your own guardrails coming soon” w punkcie „Guardrails built in.” w `#control`.
- Krok 9: 11 pytań w kolejności z `change.md` wpisanych dosłownie (nazwa testu mówi o 11 pytaniach), każde otwiera się i zamyka, trzy nowe odpowiedzi dosłownie, a odpowiedź „What will it cost?” ma `strong` z dokładnym zdaniem „We don’t charge you anything for Maestro.”.
- Krok 16: tylko komentarz nazywa zmianę poprawki-tresci-strony przy plikach, które już są wyjątkami.

**Contract**: Nazwy testów zaczynają się dalej od „krok N —”, więc `--grep "krok 9\b"` wybiera ten sam test.

### Success Criteria:

#### Automated Verification:

- Teksty sekcji i porównania oraz linia tabeli: `npm run test:e2e -- --grep "krok (1|7)\b"`
- „Coming soon” i zapowiedź zabezpieczeń: `npm run test:e2e -- --grep "krok 8\b"`
- FAQ z 11 pytaniami i pogrubieniem: `npm run test:e2e -- --grep "krok 9\b"`
- Wszystkie kroki scenariusza strony: `npm run test:e2e`
- Polecenie sprawdzające z testem „krok 16”: `npm ci && npm run verify`

---

## Phase 2: Sprawdzenia na żywo czterech kroków

**Criteria**: P5, P6

### Overview

Skrypt, który czyta stronę i zapisuje plik wyniku dla `teksty-sekcji`, `teksty-porownania`, `coming-soon` i `faq-strony`, oraz cztery linie w `## Sprawdzenie na żywo` w `CLAUDE.md`.

### Changes Required:

#### 1. Skrypt sprawdzeń strony

**File**: `scripts/strona-na-zywo.mjs`

**Intent**: Bez powłoki i bez zależności: w miejscu `przed-publikacja` (i `galaz-glowna`) instaluje zależności, gdy ich brak, buduje stronę z prefiksem `/www-maestro`, podaje `out/` przez `scripts/serwer-statyczny.mjs` na `127.0.0.1:$PORT` i czyta `$NA_ZYWO_ADRES/www-maestro/`. W miejscu `po-publikacji` niczego nie instaluje ani nie uruchamia, tylko czyta `$NA_ZYWO_ADRES` i czeka, aż strona ma teksty swojego sprawdzenia (Decyzje planu). Sprawdza zwykły HTML odpowiedzi, bez przeglądarki: tekst bez znaczników i komentarzy React `<!-- -->`, z rozkodowanymi encjami. Pogrubienie sprawdza w samym HTML odpowiedzi o koszcie. Serwer zatrzymuje przed zapisem wyniku.
- `teksty-sekcji`: zdania pięciu sekcji z Oczekiwanego efektu (co najmniej te wymienione w stanie końcowym) są, „Your server. Always on.” nie ma.
- `teksty-porownania`: „Why Maestro” i sześć wierszy porównania są, „Flat learning curve” nie ma.
- `coming-soon`: „Coming soon” w sekcji `after-launch`, w wierszu porównania „After launch” i w odpowiedzi FAQ o utrzymanie.
- `faq-strony`: 11 pytań `summary` w kolejności, trzy nowe odpowiedzi, a w odpowiedzi „What will it cost?” `strong` z „We don’t charge you anything for Maestro.”.

**Contract**: Wejście to `NA_ZYWO_SCIEZKA`, `NA_ZYWO_MIEJSCE`, `NA_ZYWO_ADRES`, `NA_ZYWO_WYNIK` i `PORT` (tylko przed publikacją). Plik wyniku JSON ma pola `sciezka` (nazwa sprawdzenia), `miejsce` (wartość `NA_ZYWO_MIEJSCE`), `adres` (`NA_ZYWO_ADRES`), `ustawienia: "docelowe"`, `atrapy: []`, `uslugi: []`, `stan_koncowy` (stała równa znak w znak polu `stan końcowy:` podpunktu tego kroku w `change.md`), `dowod` (niepusty: adres i znalezione fragmenty), `sprzatanie: {"usuniete": [], "wynik": "nic nie tworzy"}`, `wynik` (`przeszło` albo `nie przeszło`) i `powod`. Kod wyjścia 0 tylko przy `przeszło`. Nieznana nazwa sprawdzenia albo nieznane miejsce daje `nie przeszło` z powodem. Skrypt nie czyta plików z `## Dostępy`.

#### 2. Linie sprawdzeń w CLAUDE.md

**File**: `CLAUDE.md`

**Intent**: W `## Sprawdzenie na żywo` dopisać linie `- teksty-sekcji: `node scripts/strona-na-zywo.mjs``, tak samo dla `teksty-porownania`, `coming-soon` i `faq-strony`, oraz jeden akapit, co robi skrypt w każdym miejscu. Linia `zapis-na-liste` i jej akapit zostają.

**Contract**: Sekcja `## Sprawdzenie na żywo` ma pięć linii `- <nazwa>: `<polecenie>``. Reszta `CLAUDE.md` (w tym `## Dostępy` i `## Wdrożenie`) bez zmian.

### Success Criteria:

#### Automated Verification:

- Składnia skryptu: `node --check scripts/strona-na-zywo.mjs`
- Cztery linie z poleceniem w sekcji: `awk '/^## Sprawdzenie na żywo/{s=1;next} /^## /{s=0} s' CLAUDE.md | grep -cE '^- (teksty-sekcji|teksty-porownania|coming-soon|faq-strony): `node scripts/strona-na-zywo.mjs`$'` zwraca 4
- Stany końcowe w skrypcie równe tym z `change.md`: każdy tekst po `stan końcowy: ` (do ` · `) z czterech podpunktów scenariusza w `context/changes/poprawki-tresci-strony/change.md` jest dosłownie w `scripts/strona-na-zywo.mjs` (`grep -F`)
- Polecenie sprawdzające i zakres zmiany: `npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py poprawki-tresci-strony --rules 6`

## Plan Changes

> Append-only. One entry per departure from the plan, written in the same commit as the phase. See `references/progress-format.md`.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Teksty, pogrubienie, tabela i testy kroków

#### Automated

- [x] 1.1 Teksty sekcji i porównania oraz linia tabeli: `npm run test:e2e -- --grep "krok (1|7)\b"` — 040c200
- [x] 1.2 „Coming soon” i zapowiedź zabezpieczeń: `npm run test:e2e -- --grep "krok 8\b"` — 040c200
- [x] 1.3 FAQ z 11 pytaniami i pogrubieniem: `npm run test:e2e -- --grep "krok 9\b"` — 040c200
- [x] 1.4 Wszystkie kroki scenariusza strony: `npm run test:e2e` — 040c200
- [x] 1.5 Polecenie sprawdzające z testem „krok 16”: `npm ci && npm run verify` — 040c200

### Phase 2: Sprawdzenia na żywo czterech kroków

#### Automated

- [x] 2.1 Składnia skryptu: `node --check scripts/strona-na-zywo.mjs`
- [x] 2.2 Cztery linie z poleceniem w sekcji ## Sprawdzenie na żywo w CLAUDE.md
- [x] 2.3 Stany końcowe w skrypcie równe tym z change.md
- [x] 2.4 Polecenie sprawdzające i zakres zmiany: `npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py poprawki-tresci-strony --rules 6`
