# Prawdziwa lista oczekujących z powiadomieniem właściciela — plan implementacji

## Overview

Formularz `#waitlist` przestaje być podglądem: poprawny adres idzie jednym żądaniem `POST` do małej funkcji w Cloudflare Workers, która dodaje go do kontaktów Resend i wysyła właścicielowi e-mail. Strona pokazuje stany z zaakceptowanej makiety (błąd, „Joining…”, zapisano, zapis nie przeszedł), a znaczniki TODO i zdanie „Form preview only…” znikają. Funkcję publikuje nowy job w workflow publikacji, przygotowany w `chronione/` i wpisywany przez autopilota po przeglądzie kodu.

## Current State Analysis

Za `research.md` (commit `a7e6d61`):

- `WaitlistForm` (`components/interactive.tsx:278-335`) ma stany `idle | invalid | preview`, waliduje przez `validity.valid` i woła adapter `submitWaitlist` z `lib/waitlist.ts:7-11`, który zawsze zwraca `{ status: "preview" }` bez żądania. Pole jest niekontrolowane (`ref`), więc wpisany adres zostaje sam.
- Teksty są w `lib/content.ts:396-412` (`demoNote`, `success`, `error`, `todos`), style w `app/globals.css:1381-1408` i `1962-1981` (`.form-note`, `.form-status`, `.invalid`, `.todo-notes`).
- Funkcji zapisu nie ma: brak `worker/`, `wrangler.toml` i testów funkcji.
- `npm run verify` (`package.json:10`) to typy, projekt `repo` bez przeglądarki („krok 16”) i dwa przebiegi `gitleaks`; nie buduje strony.
- „krok 16” (`tests/repo/zakres-przejecia.spec.ts:11-20`) zamraża `app`, `components`, `lib`, `public`, `.github/workflows/pages.yml` i konfigurację budowy na `5e4dcac`, bez wyjątków.
- `krok 10` (`tests/e2e/interakcje.spec.ts:144-184`) i `krok 13` (`tests/e2e/motyw-siec-dostepnosc.spec.ts:154-184`) wymagają dziś komunikatu podglądu i zera żądań. `krok 11` (`:46-61`) pilnuje L5 i zostaje bez zmian.
- `scripts/test-e2e.sh:37` buduje stronę bez adresu funkcji; kontener biegnie z `--network none`, więc atrapa przez `page.route` to jedyna droga.
- `.github/workflows/pages.yml`: job `build` → `deploy` („Deploy to GitHub Pages”), `permissions: {}`, bez sekretów.

## Desired End State

- Poprawny adres w formularzu daje jedno `POST` pod adres z `NEXT_PUBLIC_WAITLIST_URL` (treść `text/plain` z JSON `{ email, website }`), przycisk w czasie wysyłki ma tekst „Joining…” i jest nieaktywny, potem `#waitlist-status` pokazuje komunikat sukcesu albo niepowodzenia z makiety; adres zostaje w polu.
- `worker/` ma funkcję zapisu z kontrolą `Origin`, polem-pułapką, ścisłym limitem 5 zapisów na minutę z jednego IP (Durable Object) i dwoma wywołaniami Resend; testy funkcji biegną w `npm run verify` na atrapie `fetch`.
- `npm run verify` buduje stronę z adresem atrapy i sprawdza, że `out/` nie zawiera `api.resend.com` ani `RESEND_API_KEY`.
- „krok 16” pozwala na różnice tylko w pięciu plikach tej zmiany, wymienionych z nazwy.
- `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml` publikuje funkcję `cloudflare/wrangler-action`, przekazuje adres funkcji do budowy i dalej publikuje stronę krokiem „Deploy to GitHub Pages”.
- README opisuje zapis, a `CLAUDE.md` `## Verify` opisuje nowe `verify`.

Weryfikacja: `npm ci && npm run verify && npm run test:e2e && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py lista-oczekujacych --rules 6`.

### Key Discoveries:

- Wrangler bez `account_id` i bez `CLOUDFLARE_ACCOUNT_ID` sam wybiera konto, gdy token widzi jedno konto, a przy kilku kontach w trybie bez rozmowy kończy się błędem (`packages/wrangler/src/user/user.ts`, `getOrSelectAccountId`, sprawdzone 2026-11-18 na `main` workers-sdk).
- Reguła sekretów autopilota (`<fabryka>/scripts/autopilot.py:5853`, `ci_secret_problems`) przyjmuje sekret tylko w `jobs.<job>.steps[].env|with.<nazwa>` kroku z `uses: cloudflare/wrangler-action@…`; klucz `with: secrets: |` też się w niej mieści.
- Playwright sam odpowiada na preflight CORS przechwyconych żądań (`research.md`), więc strona wysyła proste żądanie CORS (treść jako napis, bez własnych nagłówków), które w prawdziwej przeglądarce nie ma preflightu.
- `tsconfig.json` (zamrożony) obejmuje `**/*.ts`, więc kod `worker/` sprawdza `typecheck` i `next build`; typy wiązań Cloudflare trzeba zdefiniować lokalnie, bo nowa zależność wywróciłaby „krok 16”.
- Hook `protect_paths.py` chroni `.github/workflows/**` od korzenia repo, więc zapis do `chronione/.github/workflows/pages.yml` przechodzi; katalog o nazwie `secrets` byłby zablokowany.
- Kontrast: `#8a2a1f` na `#e8f1df` (jasny) = 7.43:1; `#ffb4a8` na `#2c422f` (ciemny) = 6.41:1 (policzone wzorem z `krok 13`).
- Najnowszy `wrangler` w npm: 4.164.0 (`npm view wrangler version`, 2026-11-18).

## Decyzje planu

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Limit z jednego IP (Open Question 1) | Durable Object z SQLite (`LimitZapisow`), okno 60 s, najwyżej 5 zapisów | Źródło potwierdza Durable Objects na planie Free i ścisły licznik, a dostępności przybliżonego wiązania `ratelimits` na Free nie potwierdzono, więc najgorszy przypadek wyklucza wiązanie. |
| Identyfikator konta Cloudflare (Open Question 2) | bez `accountId` i bez zmiany `## Wdrożenie` | Kod wranglera wybiera jedyne konto z tokenu bez rozmowy, a nowe konto Cloudflare na planie darmowym ma jedno konto; porażka zostawia starą stronę i widzi ją krok `wynik-wdrozenia`. |
| Ponowny zapis tego samego adresu (Open Question 3) | kolejność: kontakt, potem e-mail; każdy błąd Resend kończy zapis kodem 502 | Dokumentacja Resend nie mówi, co zwraca duplikat, więc według najgorszego przypadku powtórny zapis może pokazać niepowodzenie, a L11 i tak wymaga 5xx przy błędzie Resend; ograniczenie trafia do rejestru. |
| Dzienny limit 100 e-maili Resend Free (Open Question 4) | błąd wysyłki e-maila też daje 502 (zgodnie z L11), zapis w rejestrze ograniczeń | Zmiana L11 trafiłaby na bramkę 1, a ruch przed premierą jest daleko od 100 zapisów dziennie. |
| Świeży `out/` dla L12 (Open Question 5) | `verify` buduje stronę (`npm run build` z tymi samymi zmiennymi co `test-e2e.sh`) przed testami `repo` | Budowa nie potrzebuje Dockera ani usług, a test na starym albo brakującym `out/` niczego by nie dowodził. |
| Format żądania (Open Question 6) | `fetch(url, { method: "POST", body: JSON.stringify({ email, website }) })` bez nagłówków (typ `text/plain`) | To proste żądanie CORS bez preflightu, więc test w przeglądarce sprawdza to samo, co zrobi prawdziwa przeglądarka, a adres jest w treści dosłownie (L1). |
| Kolor niepowodzenia (Open Question 7) | `--danger: #8a2a1f` w jasnym, `#ffb4a8` w ciemnym | Jasny pochodzi z makiety (7.43:1), ciemny daje 6.41:1 na `--accent-soft`. |
| Miejsce testów funkcji i testu `out/` | `tests/repo/` (projekt `repo`) | `verify` już uruchamia ten projekt, więc nie trzeba zmieniać konfiguracji Playwright ani listy projektów. |
| Nazwa zmiennej adresu funkcji | `NEXT_PUBLIC_WAITLIST_URL` | Next wpisuje `NEXT_PUBLIC_*` przy budowie, a `next.config.ts` jest zamrożony. |
| Adres atrapy w testach | `https://zapis.atrapa.invalid/` | Domena `.invalid` nigdy nie istnieje, więc żądanie bez `page.route` zawsze się nie uda. |
| Nazwa funkcji | `maestro-waitlist` w `worker/wrangler.toml` | Daje adres `maestro-waitlist.<subdomena>.workers.dev` bez nazwy właściciela. |
| Wersja wranglera | `wranglerVersion: "4.164.0"` w kroku akcji | D-002 opisuje ryzyko wersji „najnowszych”, a akcja bez wersji instaluje domyślną. |
| Linter (D-003) | nie w tej zmianie | Formularz nie dostaje hooków z zależnościami (tylko `useState` i `useRef`), a linter to nowe zależności, które wywróciłyby „krok 16”. |

## What We're NOT Doing

- Informacji o prywatności i administratorze danych (D-001 zostaje otwarte).
- Własnej domeny nadawcy, e-maila do odwiedzającego, double opt-in, wypisywania się.
- Testów, lintera i skanu zależności w workflow publikacji (D-004).
- Instalacji wranglera albo `@cloudflare/workers-types` w projekcie; wranglera instaluje akcja w CI.
- Odpowiedzi funkcji na `OPTIONS`: strona wysyła proste żądanie CORS bez preflightu.
- Zmian w `app/page.tsx`, `next.config.ts`, `tsconfig.json` i reszcie strony poza formularzem.
- Wpisania `.github/workflows/pages.yml` w repo i `gh secret set`: robi to autopilot w kroku `przygotowanie-wdrozenia`.
- Połączeń z prawdziwym Resend albo Cloudflare w testach i krokach agenta.

## Implementation Approach

Najpierw funkcja zapisu z testami, bo jest poza ścieżkami „krok 16” i nie zmienia strony. Potem w jednej fazie formularz, teksty, style, wyjątki „krok 16”, test `out/` i przepisane testy w przeglądarce. Muszą być w jednym commicie, bo każdy z tych plików osobno wywraca `verify` albo `test:e2e`. Potem workflow w `chronione/`, na końcu README, `CLAUDE.md`, rejestr ograniczeń i pełne sprawdzenie.

## Critical Implementation Details

- **Kolejność sprawdzeń w funkcji.** Metoda `POST` (inaczej 405), `Origin` równy `https://lukeblonski.github.io` (inaczej 403, bez Resend), treść JSON (inaczej 400), pole-pułapka niepuste → 200 sukces bez Resend, format adresu (inaczej 400), limit IP (inaczej 429), dopiero potem `POST /contacts` i `POST /emails`. Wszystkie odpowiedzi dla dozwolonego `Origin` mają `Access-Control-Allow-Origin: https://lukeblonski.github.io` i `Vary: Origin`; strona traktuje każdą odpowiedź poza 2xx jako niepowodzenie.
- **Worker bez importu `cloudflare:workers`.** Node w testach nie rozwiąże tego modułu, więc klasa Durable Object jest zwykłą klasą z `constructor(state, env)` i metodą `fetch`, a handler woła `env.LIMIT.get(env.LIMIT.idFromName(klucz)).fetch("https://limit/")` (klucz limitu w Phase 1 §1).
- **Atrapa w przeglądarce musi oddać `Access-Control-Allow-Origin`.** Bez tego nagłówka Chromium odrzuci odpowiedź z innego originu i test sukcesu zobaczy niepowodzenie.
- **Pole-pułapka nie może dać poziomego przewijania** (`krok 3`): ukrycie wzorem „visually hidden” z `clip`, a nie przesunięciem poza ekran; `tabIndex={-1}`, `autoComplete="off"`, opakowanie z `aria-hidden="true"`.

## Phase 1: Funkcja zapisu

**Criteria**: L7, L8, L9, L10, L11, L12

### Overview

Funkcja w Cloudflare Workers z testami bez przeglądarki na atrapie Resend, w `npm run verify`.

### Changes Required:

#### 1. Kod funkcji

**File**: `worker/index.ts`

**Intent**: Handler zapisu i klasa licznika zapisów z jednego IP. Odbiorca e-maila pochodzi tylko z `env.OWNER_EMAIL`, bez adresu w kodzie i bez wartości domyślnej (L12).

**Contract**:
- `export default { fetch(request: Request, env: Env): Promise<Response> }` z `Env = { RESEND_API_KEY: string; OWNER_EMAIL: string; LIMIT: PrzestrzenLimitu }`. Typy `PrzestrzenLimitu` (`idFromName`, `get` → obiekt z `fetch`) i stanu obiektu (`storage.get`/`storage.put`) są zdefiniowane lokalnie.
- `export class LimitZapisow` z `fetch()`: znaczniki czasu z ostatnich 60 s w `storage`. Przy 5 lub więcej zwraca 429 i nie dopisuje znacznika, inaczej dopisuje i zwraca 200.
- Kolejność sprawdzeń z „Critical Implementation Details”. Treść żądania to JSON `{ email: string, website?: string }` przeczytany z `request.text()`. Adres: przycięty, najwyżej 254 znaki, wzorzec `^[^\s@]+@[^\s@]+\.[^\s@]+$` (własna kopia w funkcji, bo funkcja nie importuje kodu strony; ten sam wzorzec sprawdza formularz, Phase 2 §1 i §3). IP z `CF-Connecting-IP`.
- Klucz limitu: dla adresu IPv6 (zawiera `:`) pierwsze cztery grupy adresu (sieć `/64`), dla IPv4 pełny adres, a przy braku nagłówka `CF-Connecting-IP` klucz `"brak-ip"` (wspólny licznik). Handler woła `env.LIMIT.get(env.LIMIT.idFromName(klucz)).fetch("https://limit/")` (pełny adres, bez niego wywołanie obiektu pada).
- Resend: `POST https://api.resend.com/contacts` z `{ email }`, potem `POST https://api.resend.com/emails` z `{ from: "Maestro waitlist <onboarding@resend.dev>", to: [env.OWNER_EMAIL], subject: "New sign-up on the Maestro waiting list", text: "Email: <adres>" }`. Oba mają `Authorization: Bearer ${env.RESEND_API_KEY}` i `Content-Type: application/json`. Odpowiedź poza 2xx albo wyjątek `fetch` daje 502. Brak `RESEND_API_KEY` albo `OWNER_EMAIL` daje 500 bez wywołania Resend.
- Odpowiedzi to JSON `{ ok: true }` albo `{ ok: false }`.

#### 2. Konfiguracja funkcji

**File**: `worker/wrangler.toml`

**Intent**: Nazwa, punkt wejścia i wiązanie Durable Object dla publikacji z CI.

**Contract**: `name = "maestro-waitlist"`, `main = "index.ts"`, `compatibility_date = "2026-11-01"`, `workers_dev = true`, `[[durable_objects.bindings]] name = "LIMIT", class_name = "LimitZapisow"`, `[[migrations]] tag = "v1", new_sqlite_classes = ["LimitZapisow"]`. Bez `account_id`, bez sekretów i bez adresu właściciela.

#### 3. Testy funkcji

**File**: `tests/repo/funkcja-zapisu.spec.ts`

**Intent**: L7–L11 bez sieci. Test importuje handler i klasę z `worker/index.ts` przez `import … from "../../worker/index"` bez rozszerzenia (z `.ts` zamrożony `tsconfig.json` daje w `tsc --noEmit` błąd TS5097) i podmienia `globalThis.fetch` na atrapę, która zapisuje wywołania `api.resend.com` i oddaje ustawioną odpowiedź (po teście przywraca oryginał). `env` ma atrapę `LIMIT` z prawdziwą klasą `LimitZapisow` na `Map` jako `storage`, `RESEND_API_KEY: "klucz-atrapy"` i `OWNER_EMAIL: "wlasciciel@example.com"`.

**Contract**: tytuły zaczynają się od „funkcja zapisu — …”. Przypadki:
- poprawne żądanie z `Origin` strony daje 200, nagłówek CORS strony, wywołanie `/contacts` z adresem i `/emails` z `to` równym `OWNER_EMAIL` i adresem w treści (L7);
- inny `Origin`, brak `Origin` i adres bez poprawnego formatu dają odmowę (4xx), zero wywołań Resend (L8);
- wypełnione `website` daje 200, zero wywołań (L9);
- 6 zapisów z jednego `CF-Connecting-IP` daje pięć razy 200 i szósty 429, przy czym szósty bez wywołań Resend (L10);
- 6 zapisów z sześciu różnych adresów IPv6 tej samej sieci `/64` (np. `2001:db8:1:2::1` … `2001:db8:1:2::6`) daje szósty 429 bez wywołań Resend (L10);
- odpowiedź 500 atrapy dla `/contacts` i osobno dla `/emails` oraz wyjątek `fetch` dają 5xx (L11).

Wartości atrap mają niską entropię, żeby `gitleaks` i `block_secrets.py` ich nie brały za klucz.

### Success Criteria:

#### Automated Verification:

- Testy funkcji przechodzą: `npx playwright test -c playwright.bez-przegladarki.config.ts --project repo --grep "funkcja zapisu"`
- Pełne sprawdzenie przechodzi: `npm ci && npm run verify`
- W `worker/` nie ma adresu e-mail poza nadawcą Resend: `! grep -rnE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}" worker/ | grep -v "onboarding@resend.dev"`

---

## Phase 2: Formularz na stronie

**Criteria**: L1, L2, L3, L4, L5, L6, L12, L13, L17

### Overview

Formularz wysyła zapis do funkcji, pokazuje stany z makiety, „krok 16” ma wyjątki z nazwy, `verify` buduje stronę i sprawdza `out/`, a testy w przeglądarce działają na atrapie funkcji.

### Changes Required:

#### 1. Adapter zapisu

**File**: `lib/waitlist.ts`

**Intent**: Prawdziwa wysyłka zamiast podglądu.

**Contract**: `export const WZORZEC_ADRESU = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` (ten sam wzorzec co w `worker/index.ts`; przeglądarka przy `type="email"` przyjmuje też adres bez kropki w domenie, np. `anna@gmail`, który funkcja odrzuca kodem 400). `submitWaitlist(email: string, website: string): Promise<{ status: "success" | "failed" }>`. Wysyła `fetch(process.env.NEXT_PUBLIC_WAITLIST_URL, { method: "POST", body: JSON.stringify({ email, website }) })` bez własnych nagłówków. Odpowiedź 2xx daje `success`, każda inna odpowiedź, wyjątek `fetch` i pusty adres funkcji dają `failed` (przy pustym adresie bez żądania). Komentarz pliku opisuje nowe działanie.

#### 2. Teksty

**File**: `lib/content.ts`

**Intent**: Teksty z makiety; znikają `demoNote` i `todos`.

**Contract**: `content.waitlist`:
- `error: "Enter a valid email address to join the waiting list."`;
- `success: "You're on the waiting list for the first release. Thank you!"`;
- nowe `failure: "Your sign-up didn't go through. Please try again."`;
- nowe `sending: "Joining…"`;
- usunięte `demoNote` i `todos`.

Reszta pliku bez zmian.

#### 3. Formularz

**File**: `components/interactive.tsx`

**Intent**: Stany z makiety w `WaitlistForm`; reszta pliku bez zmian.

**Contract**:
- Stan: `"idle" | "invalid" | "sending" | "success" | "failed"`.
- Wysyłka przy stanie `sending` nic nie robi. Walidacja jak dziś (`validity.valid`), a po niej przycięty adres musi spełniać `WZORZEC_ADRESU` z `lib/waitlist.ts`; inaczej stan `invalid`, fokus na polu i bez żądania. Potem `sending` i `await submitWaitlist(adres, pułapka)`.
- Przycisk w stanie `sending` ma `disabled` i tekst `c.waitlist.sending`, a w innych stanach `c.waitlist.button`.
- `onChange` pola przywraca `idle` tylko poza `sending`.
- `aria-describedby="waitlist-status"`.
- `#waitlist-status` jak dziś (`role="status"`, `aria-live="polite"`, klasa `form-status ${status}`) z tekstem `error` / `success` / `failure`, a przy `idle` i `sending` pusty.
- Bez akapitu `waitlist-note` i bez `todo-notes`.
- Pole-pułapka `name="website"` z etykietą, w opakowaniu z klasą `form-trap` i `aria-hidden="true"`, z `tabIndex={-1}` i `autoComplete="off"`.

#### 4. Style

**File**: `app/globals.css`

**Intent**: Style stanów z makiety i ukrycie pułapki, usunięcie martwych stylów.

**Contract**:
- `--danger: #8a2a1f` w motywie jasnym i `#ffb4a8` w ciemnym.
- `.form-status.success { color: var(--green); font-weight: 600 }`.
- `.form-status.failed { color: var(--danger); font-weight: 600 }`.
- `.form-row .button[disabled] { opacity: .7; cursor: progress }`.
- `.form-trap`: wzorzec „visually hidden” (`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap`).
- Usunięte `.form-note` i `.todo-notes` także w regułach na telefon.
- Bez zmian poza formularzem.

#### 5. Wyjątki „krok 16”

**File**: `tests/repo/zakres-przejecia.spec.ts`

**Intent**: Pliki tej zmiany wymienione z nazwy mogą się różnić od `5e4dcac`, ale nie muszą. `pages.yml` jest taki jak w bazie aż do kroku `przygotowanie-wdrozenia`.

**Contract**:
- Stała `PLIKI_ZMIAN = ["components/interactive.tsx", "lib/waitlist.ts", "lib/content.ts", "app/globals.css", ".github/workflows/pages.yml"]` z komentarzem, że to pliki zmiany lista-oczekujacych.
- `git diff --quiet` i `git ls-files --others` dostają je jako `:(exclude)<plik>` po `SCIEZKI`.
- Tytuł testu bez zmian, bo cytuje go `CLAUDE.md`.

#### 6. Test zbudowanej strony

**File**: `tests/repo/zbudowana-strona.spec.ts`

**Intent**: L12 na świeżym `out/`.

**Contract**: test „zbudowana strona — bez adresu Resend i nazwy klucza”:
- czyta rekurencyjnie wszystkie pliki `out/` i pada, gdy katalogu nie ma;
- wymaga, żeby żaden nie zawierał `api.resend.com` ani `RESEND_API_KEY`;
- wymaga, żeby któryś zawierał adres atrapy `https://zapis.atrapa.invalid/`, co dowodzi, że `out/` pochodzi z budowy w `verify`.

#### 7. Polecenie `verify` i budowa w testach

**File**: `package.json`, `scripts/test-e2e.sh`

**Intent**: `verify` buduje stronę przed testami `repo`. Obie budowy mają adres atrapy funkcji.

**Contract**:
- W `package.json` zmienia się tylko wartość `scripts.verify`: `npm run typecheck && NEXT_PUBLIC_BASE_PATH=/www-maestro NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/ NEXT_TELEMETRY_DISABLED=1 npm run build && playwright test -c playwright.bez-przegladarki.config.ts --project repo && gitleaks …` (gitleaks bez zmian). „krok 16” pomija `scripts.verify`.
- `scripts/test-e2e.sh:37` dostaje `NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/` z komentarzem, że ten sam adres przechwytują testy (`tests/e2e/pomoc.ts`).

#### 8. Testy w przeglądarce

**File**: `tests/e2e/pomoc.ts`, `tests/e2e/interakcje.spec.ts`, `tests/e2e/motyw-siec-dostepnosc.spec.ts`

**Intent**: `krok 10` i `krok 13` na atrapie funkcji. `krok 11` bez zmian.

**Contract**:
- `pomoc.ts`:
  - `export const ADRES_FUNKCJI = "https://zapis.atrapa.invalid/"`;
  - pomocnik atrapy przez `page.route(ADRES_FUNKCJI…)`, który odpowiada 200 `{ ok: true }` albo 500, albo `route.abort()`, zawsze z `Access-Control-Allow-Origin: *`;
  - opcja wstrzymania odpowiedzi do zwolnienia przez test.
- `krok 10` (tytuł zaczyna się od „krok 10 — ”):
  - brak tekstów „[TODO: Connect the waiting list”, „[TODO: Add the privacy notice” i „Form preview only” w `#waitlist` (L4);
  - pusty adres, adres bez „@” i adres bez kropki w domenie (`anna@gmail`) dają `w.error`, `aria-invalid="true"` i zero żądań przy tych wysyłkach (L3);
  - przy wstrzymanej atrapie przycisk ma nazwę `w.sending` i jest nieaktywny (L17);
  - po odpowiedzi sukcesu `#waitlist-status` ma `w.success` i jest dokładnie jedno `POST` pod `ADRES_FUNKCJI` z adresem w `postData()` (L1);
  - po odpowiedzi 500 i po przerwanym żądaniu jest `w.failure`, a pole ma dalej wpisany adres (L2).
- `krok 13`: po błędnej wysyłce, po odpowiedzi sukcesu atrapy i po odpowiedzi błędu mierzy kontrast `#waitlist-status` w obu motywach (L6).

### Success Criteria:

#### Automated Verification:

- Sprawdzenie z budową, testem `out/` i „krok 16” przechodzi: `npm ci && npm run verify`
- Formularz w przeglądarce: `npm run test:e2e -- --grep "krok 10\b"`
- Żądania przy przeglądaniu: `npm run test:e2e -- --grep "krok 11\b"`
- Kontrast komunikatów: `npm run test:e2e -- --grep "krok 13\b"`
- Brak poziomego przewijania z pułapką: `npm run test:e2e -- --grep "krok 3\b"`

---

## Phase 3: Workflow publikacji w `chronione/`

**Criteria**: L14

### Overview

Nowa wersja `.github/workflows/pages.yml` przygotowana dla autopilota: job publikacji funkcji przed budową strony.

### Changes Required:

#### 1. Przygotowany workflow

**File**: `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml`

**Intent**: Kopia dzisiejszego workflow z nowym jobem `worker` przed `build`. Strona nie wyjdzie bez działającej funkcji, a publikacja strony zostaje bez zmian.

**Contract**:
- Nowy job `worker`:
  - `runs-on: ubuntu-latest`, `permissions: contents: read`;
  - `outputs: url: ${{ steps.publish.outputs.deployment-url }}`;
  - kroki: `actions/checkout@v7` (`persist-credentials: false`) i krok „Publish sign-up function” (`id: publish`, `uses: cloudflare/wrangler-action@v4`).
  - `with:` tego kroku: `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`, `workingDirectory: worker`, `wranglerVersion: "4.164.0"` i `secrets: |` z liniami `RESEND_API_KEY` i `OWNER_EMAIL`.
  - `env:` tego kroku: `RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}` i `OWNER_EMAIL: ${{ secrets.OWNER_EMAIL }}`.
- Job `build`:
  - dostaje `needs: worker` i w `env:` joba `NEXT_PUBLIC_WAITLIST_URL: ${{ needs.worker.outputs.url }}`; to nie jest sekret;
  - przed „Export static site” dostaje krok „Check sign-up function address” z `run: test -n "$NEXT_PUBLIC_WAITLIST_URL"`.
- Job `deploy` i krok „Deploy to GitHub Pages” bez zmian.
- Sekrety tylko w `with:` i `env:` kroku `wrangler-action`. Bez tabulatorów i kotwic YAML.

### Success Criteria:

#### Automated Verification:

- Reguła sekretów autopilota nie zgłasza problemów: `python3 -c "import sys, pathlib; sys.path.insert(0, '/home/fabryka/fabryka/scripts'); import autopilot; p = autopilot.ci_secret_problems(pathlib.Path('context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml').read_text(), ['cloudflare/wrangler-action']); print(p); sys.exit(1 if p else 0)"`
- Plik ma joby `worker`, `build`, `deploy` i krok „Deploy to GitHub Pages”: `node -e "const t=require('fs').readFileSync('context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml','utf8'); for (const s of ['  worker:','  build:','  deploy:','needs: worker','Deploy to GitHub Pages','cloudflare/wrangler-action@v4']) if(!t.includes(s)) {console.error('brak: '+s); process.exit(1)}"`
- Wpisany workflow w repo jest dalej jak w `5e4dcac`: `git diff --quiet 5e4dcac -- .github/workflows/pages.yml`

---

## Phase 4: Dokumentacja i pełne sprawdzenie

**Criteria**: L15, L16

### Overview

README i `CLAUDE.md` opisują nowe działanie, rejestr ograniczeń dostaje znane ograniczenia, a całość przechodzi pełne sprawdzenie.

### Changes Required:

#### 1. README

**File**: `README.md`

**Intent**: Sekcja „Podłączenie listy oczekujących” zastąpiona opisem działania zapisu.

**Contract**:
- Zapis działa tak: formularz, funkcja w Cloudflare Workers, kontakty Resend i e-mail do właściciela.
- Kod funkcji jest w `worker/`, a adapter w `lib/waitlist.ts`.
- Publikację robi job `worker` w `.github/workflows/pages.yml` przed budową strony.
- Potrzebne sekrety repozytorium (tylko nazwy): `CLOUDFLARE_API_TOKEN`, `RESEND_API_KEY`, `OWNER_EMAIL`. Zmienna budowy to `NEXT_PUBLIC_WAITLIST_URL`.
- Lokalnie bez tej zmiennej formularz pokazuje niepowodzenie.
- Do „Gdzie wprowadzać zmiany” dochodzi `worker/`.
- `## Testy` dalej zaczyna blok kodu od `npm test` (krok 15) i wspomina testy funkcji i `out/` w `verify`.

#### 2. Opis `verify` w instrukcji projektu

**File**: `CLAUDE.md`

**Intent**: `## Verify` opisuje budowę z adresem atrapy, testy funkcji zapisu i test `out/`, a linie ostatniego przebiegu są z nowego przebiegu. `## Testy w CI` wspomina adres atrapy funkcji przy budowie. Sekcje `## Wdrożenie` i `## Dostępy` bez zmian.

**Contract**: tylko akapity `## Verify` i `## Testy w CI`.

#### 3. Rejestr ograniczeń

**File**: `context/foundation/limitations.md`

**Intent**: D-001 traci część „formularz niczego nie wysyła”, a zostaje brak informacji o prywatności. Nowy wpis z następnym wolnym numerem `D-<nnn>` (najwyższy z trzech plików rejestru plus jeden: `grep -hoE '^## D-[0-9]{3}' context/foundation/{decisions,limitations,decisions-archive}.md | sort | tail -1`) opisuje ponowny zapis tego samego adresu (możliwe niepowodzenie, bo zachowanie Resend jest niesprawdzone) i dzienny limit 100 e-maili Resend Free (101. zapis dnia dostaje niepowodzenie).

**Contract**: format wpisów jak D-005 (pola Pytanie, Wybór, Kto zdecydował: model (10x-plan), Podstawa, Kiedy wrócić, Źródło, Status, Zmiana).

### Success Criteria:

#### Automated Verification:

- README i polecenie testów: `npm run test:e2e -- --grep "krok 15\b"`
- Pełne sprawdzenie zmiany: `npm ci && npm run verify && npm run test:e2e && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py lista-oczekujacych --rules 6`

---

## Testing Strategy

### Unit Tests:

- Funkcja zapisu bez sieci (`tests/repo/funkcja-zapisu.spec.ts`): każda gałąź odmowy bez wywołania Resend, dwa wywołania Resend przy sukcesie, 5xx przy każdym błędzie Resend, prawdziwy licznik `LimitZapisow` na atrapie `storage`.
- `out/` bez `api.resend.com` i `RESEND_API_KEY`, z adresem atrapy (`tests/repo/zbudowana-strona.spec.ts`).

### Integration Tests:

- `krok 10`, `krok 13` w Chromium na 360 px i 1280 px z atrapą funkcji przez `page.route`; `krok 11` bez zmian pilnuje, że przeglądanie nie łączy się z funkcją.
- Prawdziwy zapis na Resend sprawdza dopiero publikacja po scaleniu (`## Ścieżki na żywo`: brak).

## Performance Considerations

`verify` buduje teraz stronę, co wydłuża je o czas `next build`. Funkcja to dwa wywołania Resend i jeden Durable Object na zapis, daleko poniżej 10 ms CPU i 100 000 żądań dziennie planu Free.

## Migration Notes

Pierwsza publikacja po scaleniu tworzy funkcję i migrację `v1` Durable Object. Gdy job `worker` padnie (np. token widzi więcej niż jedno konto), budowa i publikacja strony nie ruszą. Opublikowana zostaje wtedy stara strona, a krok `wynik-wdrozenia` zgłasza porażkę.

## References

- Research: `context/changes/lista-oczekujacych/research.md`
- Makieta: `context/changes/lista-oczekujacych/makieta/makieta.html` (sha256 w `makieta/akceptacja.md`)
- Formularz: `components/interactive.tsx:278-335`
- „krok 16”: `tests/repo/zakres-przejecia.spec.ts:10-55`
- Reguła sekretów: `<fabryka>/scripts/autopilot.py:5853`

## Plan Changes

> Append-only. One entry per departure from the plan, written in the same commit as the phase. See `references/progress-format.md`.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Funkcja zapisu

#### Automated

- [x] 1.1 Testy funkcji przechodzą — dc91a32
- [x] 1.2 Pełne sprawdzenie przechodzi — dc91a32
- [x] 1.3 W worker/ nie ma adresu e-mail poza nadawcą Resend — dc91a32

### Phase 2: Formularz na stronie

#### Automated

- [x] 2.1 Sprawdzenie z budową, testem out/ i krok 16 przechodzi — 45cef4d
- [x] 2.2 Formularz w przeglądarce — 45cef4d
- [x] 2.3 Żądania przy przeglądaniu — 45cef4d
- [x] 2.4 Kontrast komunikatów — 45cef4d
- [x] 2.5 Brak poziomego przewijania z pułapką — 45cef4d

### Phase 3: Workflow publikacji w chronione/

#### Automated

- [x] 3.1 Reguła sekretów autopilota nie zgłasza problemów
- [x] 3.2 Plik ma joby worker, build, deploy i krok Deploy to GitHub Pages
- [x] 3.3 Wpisany workflow w repo jest dalej jak w 5e4dcac

### Phase 4: Dokumentacja i pełne sprawdzenie

#### Automated

- [ ] 4.1 README i polecenie testów
- [ ] 4.2 Pełne sprawdzenie zmiany
