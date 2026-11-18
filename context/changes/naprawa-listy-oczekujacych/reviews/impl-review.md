<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Naprawa listy oczekujących po błędzie 502 z Resend

- **Plan**: context/changes/naprawa-listy-oczekujacych/plan.md
- **Scope**: Phases 1–2 of 2 (pełny plan, zakres `main...dc1ccb2`)
- **Date**: 2026-11-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 1 warning, 6 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Punkty przeglądu z polecenia

- Sekrety w CI: przechodzi. Gałąź nie dodaje ani nie zmienia plików w `.github/workflows/` (`git diff --name-only main...HEAD -- .github` jest pusty), a folder `context/changes/naprawa-listy-oczekujacych/chronione/` nie istnieje. Nie ma więc nowego użycia sekretów do sprawdzenia. `context/foundation/infrastructure.md` nie istnieje.
- Migracje bazy: przechodzi. Gałąź nie dodaje migracji. `worker/wrangler.toml` dopisuje tylko `[observability]`, a jedyna migracja `[[migrations]] tag = "v1"` (`new_sqlite_classes`) pochodzi z `main` i się nie zmienia.

## Polecenia faz

- 1.1 `npx playwright test -c playwright.bez-przegladarki.config.ts --project=repo tests/repo/funkcja-zapisu.spec.ts` (PC1) → exit 0, 14 passed
- 1.2 `! git diff -U0 main -- tests/repo/funkcja-zapisu.spec.ts | grep -E '^-\s*expect'` → exit 0
- 1.3 `grep -A1 '^\[observability\]' worker/wrangler.toml` → exit 0 (`enabled = true`)
- 1.4, 2.5 `npm ci && npm run verify` → exit 0, gitleaks „no leaks found”
- 2.1 `npx playwright test -c playwright.bez-przegladarki.config.ts --project=repo tests/repo/na-zywo.spec.ts` (PC2) → exit 0, 3 passed
- 2.2 `grep -n '^- zapis-na-liste: `node scripts/na-zywo.mjs`$' CLAUDE.md` → exit 0 (linia 32)
- 2.3 `! grep -nE "(from|import\()\s*['\"]" scripts/na-zywo.mjs | grep -vE …` → exit 0
- 2.4 `git diff --exit-code main -- package.json package-lock.json` → exit 0

## Kryteria

- N1: spełnione — `npm run verify` → exit 0; testy N1 w `tests/repo/funkcja-zapisu.spec.ts` (401 na `/contacts` i `/emails`, 403 1010 bez JSON) przechodzą; jedno miejsce logu `zalogujOdmowe` (`worker/index.ts:191-205`) z `ukryj`.
- N2: spełnione — `npm run verify` → exit 0; test `TypeError` na obu ścieżkach przechodzi; `wywolajResend` zwraca `{ blad: name }` (`worker/index.ts:178-180`).
- N3: spełnione — `npm run verify` → exit 0; testy 409 i 422 z `GET /contacts/anna%40example.com` dają 200 `{"ok":true}` i e-mail do właściciela (`worker/index.ts:262`, `kontaktIstnieje`).
- N4: spełnione — `worker/wrangler.toml:20-21` `[observability]` / `enabled = true`.
- N5: spełnione — `CLAUDE.md:30-34` sekcja `## Sprawdzenie na żywo` z linią `` - zapis-na-liste: `node scripts/na-zywo.mjs` `` (jedno polecenie bez `|`, `&&` i przekierowań), skrypt `scripts/na-zywo.mjs` jest w repo.
- N6: spełnione — `scripts/na-zywo.mjs:236-253` czyta `## Dostępy` i `start.md`, `:316-344` serwer na `127.0.0.1:$PORT` bez atrapy, `:350-355` zapis z `Origin`, `:401-437` kontakt i stan e-maila, `:70-101` plik wyniku z ośmioma polami, `scrub()` na całym wyjściu (`:55-68`); test bez sieci `tests/repo/na-zywo.spec.ts` przechodzi (`npm run verify` → exit 0).
- N7: poza zakresem impl-review — plan (Phase 2, Overview) ocenia N7 po kroku autopilota `przygotowanie-wdrozenia`, który biegnie po tym przeglądzie; pola `na_zywo` jeszcze nie ma.
- N8: poza zakresem impl-review — przyczynę z logu `…-przygotowanie-wdrozenia.log` wpisuje do raportu kawałka sesja główna po tym kroku.
- N9: spełnione — `npm run verify` → exit 0; polecenie 1.2 → exit 0 (żadna linia `expect` starych testów nie zmieniona ani usunięta).
- N10: poza zakresem impl-review — zapis obserwatora po kroku `wynik-wdrozenia`.

## Findings

### F1 — Sprawdzenie na żywo przechodzi, choć `POST /contacts` funkcji nie działa dla nowego adresu

- **Decision**: AUTO-FIX (normalne używanie): W kroku `merge`, który `change.md` przewiduje jako zwykły ponowny przebieg, kontakt właściciela już istnieje, więc skrypt nie sprawdza `POST /contacts` funkcji i daje `przeszło` także wtedy, gdy każdy nowy odwiedzający dostałby 502, a wtedy N7 nie świadczy o oczekiwanym efekcie; Fix A mieści się w intencji i nie zmienia funkcji, a Fix B zmienia decyzję planu i ryzykuje N3. Option: Fix A
- **Severity**: ⚠️ WARNING
- **Dimension**: Safety & Quality
- **Location**: scripts/na-zywo.mjs:400-408 (z worker/index.ts:262)
- **Detail**: Funkcja przyjmuje każdą odpowiedź `POST /contacts` inną niż 2xx, gdy `GET /contacts/{adres}` zwraca kontakt (`if (!kontakt.ok && !(await kontaktIstnieje(...)))`), zgodnie z decyzją planu. Skrypt zapisuje się zawsze adresem właściciela, a kontakt właściciela istnieje od drugiego przebiegu (planowany ponowny przebieg w kroku `merge`) albo od razu po diagnostyce, gdy diagnostyka go utworzy (plan, „Kolejność w skrypcie”). Skrypt sprawdza potem tylko, że kontakt istnieje (`jestKontakt`). Odpowiedź `POST /contacts` funkcji trafia tylko do linii stdout i nie wpływa na wynik. Gdy `POST /contacts` z funkcji pada z powodu, który nie dotyczy istniejącego kontaktu (np. 422 przy złej treści, 5xx), wynik to `przeszło` (N7), a każdy nowy odwiedzający dostaje 502.
- **Fix A ⭐ Recommended**: Skrypt przed diagnostyką pyta `GET /contacts/{właściciel}` (z `User-Agent`) i zapamiętuje, czy kontakt już był. Gdy go nie było, a diagnostyka nie dała 2xx, wymaga 2xx na `POST /contacts` funkcji (z `wywolania`); inaczej `nie przeszło` z tym wywołaniem w `powod`. Przy istniejącym kontakcie dopisuje do `dowod` status, `name` i `message` `POST /contacts` funkcji.
  - Strength: Zamyka przypadek z uwagi w skrypcie, bez zmiany decyzji planu o funkcji (N3), i zostawia sprawdzenie ponownego zapisu na prawdziwym Resend.
  - Tradeoff: Jedno wywołanie Resend więcej na przebieg i jeden nowy przypadek w teście na atrapie.
  - Confidence: MED — scenariusz `sukces` atrapy daje 1010 na diagnostykę i 201 na `POST /contacts` funkcji, więc test pokrywa gałąź „kontaktu nie było”.
  - Blind spot: Przebieg, w którym diagnostyka tworzy kontakt, dalej nie sprawdza `POST /contacts` nowego adresu z `User-Agent` (sprawdza go wtedy sama diagnostyka bez `User-Agent`).
  - Intent: within
- **Fix B**: Zawęzić zastępczą ścieżkę funkcji do odpowiedzi, które wyglądają na duplikat (409 albo `name`/`message` „already exists”).
  - Strength: Funkcja nie ukrywa innych błędów `POST /contacts` także w produkcji.
  - Tradeoff: Plan celowo nie zależy od tej odpowiedzi, bo dokumentacja Resend jej nie opisuje; zgadnięta forma może dać 502 przy ponownym zapisie.
  - Confidence: LOW — prawdziwej odpowiedzi Resend na duplikat jeszcze nie znamy.
  - Blind spot: Prawdziwa odpowiedź Resend na istniejący kontakt.
  - Intent: changes decyzja planu „Odpowiedź Resend na dodanie istniejącego kontaktu” i ryzykuje N3

### F2 — `zablokowane` obejmuje każdy 401/403/429 z JSON Resend

- **Decision**: AUTO-FIX (normalne używanie): Jeden przebieg skryptu wysyła do Resend kilka wywołań szybko jedno po drugim (diagnostyka, `POST /contacts`, `GET /contacts`, `POST /emails`, odczyty skryptu), więc 429 `rate_limit_exceeded` może się zdarzyć przy zwykłym przebiegu (najgorszy przypadek z limitu Resend na sekundę, którego nie sprawdziłem w źródle), a dziś daje on `zablokowane`, które pozwala scalić bez `przeszło` i każe pytać człowieka o panel Resend wbrew „Ograniczeniom” `change.md`, gdzie `zablokowane` dotyczy tylko ustawienia konta. Option: Fix
- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/na-zywo.mjs:196-200
- **Detail**: `odmowaResend` daje `zablokowane` przy każdym 401, 403 albo 429 z polem `name`, zgodnie z tabelą planu. To obejmuje też 401 `missing_api_key` (np. gdy kod zgubi nagłówek `Authorization`) i 429 `rate_limit_exceeded` (chwilowe), które są błędem kodu albo przejściowe, a `zablokowane` pozwala scalić bez `przeszło`. `research.md:207` wymienia tylko `restricted_api_key`, nieważny klucz, 403 `validation_error` i 429 `daily_quota_exceeded`.
- **Fix**: Dodać listę dozwolonych `name` (`restricted_api_key`, `invalid_api_key`, `validation_error`, `daily_quota_exceeded`, `monthly_quota_exceeded`), a resztę traktować jako `nie przeszło`.

### F3 — `ukryj` w funkcji nie zastępuje dokładnych adresów, a pusty klucz psuje maskowanie

- **Decision**: AUTO-FIX (bezpieczeństwo A): Zabezpieczyłem adres odwiedzającego i adres właściciela w logach funkcji w Cloudflare, stosując dokładne zastępowanie obu adresów (bez rozróżniania wielkości liter, także w postaci `encodeURIComponent`) przed ogólnym wzorcem w `ukryj` i pomijanie podziału po kluczu, gdy klucz jest pusty. Option: Fix
- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: worker/index.ts:184-186
- **Detail**: `ukryj` opiera się tylko na ogólnym wzorcu `WZORZEC_ADRESU_W_TEKSCIE`. Formularz przyjmuje adresy, których wzorzec nie zastępuje w całości (np. `"anna"@ex.com`, `a(b)@ex.com`, `anna@[192.0.2.1]`, `x:anna@ex.com` → `x:<adres>`), więc adres odwiedzającego trafi do Workers Logs, gdy Resend powtórzy go w komunikacie. Do tego `tekst.split(klucz)` przy pustym `RESEND_API_KEY` (`""`) wstawia `<klucz>` między każdy znak, a wtedy wzorzec adresu nie trafia i adres zostaje czytelny. Oba przypadki są hipotetyczne: Resend rzadko powtarza adres, a sekret nie jest pusty.
- **Fix**: Przekazać `adres` i `env.OWNER_EMAIL` do `ukryj`, zastępować je dokładnie (bez rozróżniania wielkości liter, także w postaci `encodeURIComponent`) przed ogólnym wzorcem, jak `scrub()` w skrypcie, i pomijać `split`, gdy klucz jest pusty.

### F4 — Zajęty port wychodzi dopiero po prawdziwym wywołaniu Resend

- **Decision**: AUTO-LIMIT (przypadek szczególny): Zajęty `PORT` przy przebiegu autopilota to rzadki przypadek spoza scenariusza człowieka, a jego skutek to tylko jedno dodatkowe wywołanie diagnostyczne adresem właściciela w ramach udzielonej zgody; `change.md` nie ma „Chroni przed”, więc przyjąłem model „przypadkowy błąd agenta, nie celowe obejście”. Return when: log kroku `przygotowanie-wdrozenia` albo `merge` pokazuje `EADDRINUSE` na porcie skryptu `scripts/na-zywo.mjs`, albo zmiana dotyka sposobu, w jaki autopilot przydziela `PORT` sprawdzeniu na żywo.
- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: scripts/na-zywo.mjs:260, :341-344
- **Detail**: Diagnostyka `POST /contacts` idzie do prawdziwego Resend przed `serwer.listen`. Przy zajętym `PORT` przebieg kończy się `nie przeszło` dopiero po tym wywołaniu. Diagnostyka używa `node:https`, więc nie zależy od serwera.
- **Fix**: Uruchomić `serwer.listen` przed `diagnostyka()`.

### F5 — Nieużywane zmienne środowiska w teście skryptu

- **Decision**: AUTO-SKIP (styl): Nieużywane zmienne `NA_ZYWO` i `NA_ZYWO_POSREDNIK` w teście to pozostałość wzoru bez wpływu na wynik, a skrypt ani funkcja nie używają `console.debug` ani `console.trace`.

### F6 — D-013 „Kiedy wrócić” dalej wymienia ponowny zapis

- **Decision**: AUTO-SKIP (styl): Nieaktualny opis pola „Kiedy wrócić” w D-013 w `context/foundation/limitations.md` to sprawa opisu, która nie zmienia zachowania kodu.

### F7 — README nie wymienia nowych testów skryptu na żywo

- **Decision**: AUTO-SKIP (styl): README nie wymienia nowych testów skryptu na żywo, ale to tylko opis, a `CLAUDE.md` w `## Verify` już je wymienia.
