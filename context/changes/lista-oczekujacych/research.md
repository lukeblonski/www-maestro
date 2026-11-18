---
date: 2026-11-18T12:33:00+00:00
researcher: Claude (krok research autopilota)
git_commit: a7e6d61908aa9403619a95980c2d77af82cc334e
branch: lista-oczekujacych
repository: lukeblonski/www-maestro
topic: "Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji L1–L17 z context/changes/lista-oczekujacych/change.md?"
tags: [research, codebase, waitlist, cloudflare-workers, resend, github-actions, playwright, krok-16]
status: complete
last_updated: 2026-11-18
last_updated_by: Claude (krok research autopilota)
---

# Research: co jest, a czego brakuje dla prawdziwej listy oczekujących (S-02)

**Date**: 2026-11-18T12:33:00+00:00
**Researcher**: Claude (krok research autopilota)
**Git Commit**: a7e6d61908aa9403619a95980c2d77af82cc334e
**Branch**: lista-oczekujacych (niewysłana na origin, więc bez permalinków)
**Repository**: lukeblonski/www-maestro

## Research Question

Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji L1–L17 z `context/changes/lista-oczekujacych/change.md`?

## Summary

Formularz na stronie jest gotowy jako punkt podłączenia, ale niczego nie wysyła. `WaitlistForm` sprawdza adres przez `validity.valid` i woła adapter `submitWaitlist` z `lib/waitlist.ts`, który zawsze zwraca `{ status: "preview" }`. Stany `idle | invalid | preview` trzeba zamienić na stany z makiety: przed wpisaniem, błąd, wysyłanie („Joining…”, przycisk nieaktywny), zapisano i zapis nie przeszedł. Teksty w `lib/content.ts` (`demoNote`, `success`, `error`, `todos`) trzeba wymienić na teksty z makiety.

Funkcji zapisu nie ma wcale. W repo nie ma katalogu `worker/`, `wrangler.toml` ani testów funkcji. Polecenie `verify` uruchamia tylko typy, test „krok 16” i `gitleaks`. Kryteria L7–L12 wymagają nowych testów bez przeglądarki w `npm run verify`, na atrapie `fetch` do Resend. Testy `krok 10` i `krok 13` dziś wymagają, żeby formularz nie wysłał żadnego żądania i pokazał komunikat podglądu, więc trzeba je przepisać. Budowa w testach (`scripts/test-e2e.sh`) nie podaje adresu funkcji.

Test „krok 16” zamraża `app/`, `components/`, `lib/` i `.github/workflows/pages.yml` na stanie z `5e4dcac`. Bez wymienionych z nazwy wyjątków każda zmiana formularza go wywróci. Nowy workflow kawałek przygotowuje w `chronione/`, a wpisuje go dopiero autopilot w kroku `przygotowanie-wdrozenia`, po przeglądzie kodu. Ten krok ma już zgodę (`zgoda: plik .github/workflows/pages.yml`) i sprawdza miejsce sekretów osobnym skryptem (`ci_secret_problems`).

Fakty o usługach sprawdziłem w źródłach 2026-11-18 (szczegóły niżej). Najważniejsze dla planu:

- Resend ma już globalne kontakty: `POST /contacts` przyjmuje samo `email`, bez `audience_id`.
- `onboarding@resend.dev` wysyła tylko na adres konta. Na inny adres Resend odpowiada 403.
- Plan darmowy Resend to 100 e-maili na dzień. Przy jednym powiadomieniu na zapis 101. zapis danego dnia dostanie od Resend 429, a odwiedzający zobaczy komunikat niepowodzenia.
- Wiązanie limitu w Cloudflare (`ratelimits`) liczy w przybliżeniu i osobno w każdej lokalizacji. W pobranych stronach nie znalazłem, czy działa na planie darmowym. Ścisły limit daje Durable Object z SQLite, który według źródła działa na planie Free.
- `cloudflare/wrangler-action@v4` (v4.1.3) ma wejście `secrets` i wyjście `deployment-url`.
- Dokumentacja Cloudflare każe dodać `CLOUDFLARE_ACCOUNT_ID`, którego `## Wdrożenie` nie ma. Zmienna jest opcjonalna, ale tego, że wrangler sam wybierze konto z tokenu, nie sprawdziłem.
- Playwright sam odpowiada na zapytania wstępne CORS (preflight) przechwyconych żądań. Test w przeglądarce nie wykryje więc zepsutej odpowiedzi funkcji na `OPTIONS`.

## Stan względem kryteriów

| Kryterium | Co jest | Czego brakuje |
|---|---|---|
| L1 jedno `POST` z adresem, komunikat sukcesu | formularz z walidacją i `#waitlist-status` z `aria-live` (`components/interactive.tsx:278-335`) | wysyłka w `lib/waitlist.ts`, adres funkcji przy budowie, stan „zapisano”, tekst sukcesu z makiety, przepisany `krok 10` z atrapą (`page.route`) |
| L2 błąd albo brak odpowiedzi → komunikat, adres zostaje | pole niekontrolowane (`ref`), więc wartość zostaje sama | stan „nie przeszło”, tekst z makiety, styl `.failed`, `krok 10` z atrapą błędu i z przerwanym żądaniem |
| L3 pusty i bez „@” → błąd, `aria-invalid`, bez żądania | działa dziś (`interactive.tsx:283-287`, `krok 10` kroki 1–2) | tekst błędu z makiety; asercja „zero żądań” tylko dla tych dwóch wysyłek |
| L4 bez TODO i „Form preview only” | teksty są w `lib/content.ts:403-411`, renderowane w `interactive.tsx:313-332` | usunięcie `demoNote` i `todos` oraz `aria-describedby="waitlist-note …"` (`interactive.tsx:305`); asercja w `krok 10` |
| L5 przeglądanie bez obcych żądań | `krok 11` (`tests/e2e/motyw-siec-dostepnosc.spec.ts:46-61`) | nic, o ile strona nie łączy się z funkcją przed wysłaniem (bez `preconnect` i `fetch` przy ładowaniu) |
| L6 kontrast sukcesu i niepowodzenia | `krok 13` mierzy `#waitlist-status` po błędzie i po „podglądzie” (`motyw-siec-dostepnosc.spec.ts:154-184`) | `krok 13` z atrapą sukcesu i błędu; kolor niepowodzenia w motywie ciemnym (makieta ma `--danger` tylko dla jasnego) |
| L7–L11 funkcja zapisu | nic | `worker/` (kod, `wrangler.toml`), testy bez przeglądarki z atrapą Resend w `npm run verify` |
| L12 `out/` bez `api.resend.com` i nazwy klucza; brak sekretów w repo | `gitleaks` w `verify` | test na `out/`; `verify` dziś nie buduje strony, więc `out/` może nie istnieć albo być stary |
| L13 `krok 16` z wyjątkami | test `tests/repo/zakres-przejecia.spec.ts:10-55` | lista plików tej zmiany wymienionych z nazwy jako dozwolone różnice |
| L14 workflow w `chronione/` | dzisiejszy `pages.yml` (job `build` → `deploy`) | `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml` z jobem publikacji funkcji |
| L15 README o zapisie | sekcja „Podłączenie listy oczekujących” opisuje demonstrację (`README.md:63-75`) | nowy opis: funkcja, Resend, katalog kodu, publikacja, nazwy sekretów |
| L16 `verify`, `test:e2e`, pliki z planu | oba polecenia działają (S-01) | plan musi wymienić każdy plik, bo reguła 6 `validate_change.py` porównuje commity z planem |
| L17 ekrany jak makieta | makieta `makieta/makieta.html` (sha256 zgodny z `akceptacja.md`) | stany, teksty i style z makiety w `WaitlistForm`, `lib/content.ts`, `app/globals.css` |

## Detailed Findings

### Formularz na stronie

- `WaitlistForm` (`components/interactive.tsx:278-335`):
  - stan `useState<"idle" | "invalid" | "preview">` (l. 279);
  - walidacja przez `email.current?.validity.valid` przy `type="email"`, `required`, `noValidate` (l. 283, 292, 299-303). Pusty adres i adres bez „@” dają `invalid`, ustawiają fokus i niczego nie wysyłają;
  - wywołanie adaptera `await submitWaitlist(email.current.value.trim())` (l. 288), bez obsługi wyjątku i bez stanu „wysyłanie”;
  - przycisk bez `disabled` i z jednym tekstem `c.waitlist.button` (l. 308-311);
  - `aria-describedby="waitlist-note waitlist-status"` (l. 305). `waitlist-note` to akapit z `demoNote` (l. 313-315), który ma zniknąć;
  - `#waitlist-status` ma `role="status"` i `aria-live="polite"`, a klasa to `form-status ${status}` (l. 316-327);
  - `todo-notes` renderuje `c.waitlist.todos` (l. 328-332);
  - `onChange` przywraca `idle` (l. 306). Makieta też czyści komunikat przy pisaniu (`makieta.html:161`).
- Adapter `lib/waitlist.ts:7-11` zwraca `{ status: "preview" }` i nie wysyła żądania. Jego komentarz każe przy zmianie poprawić też komunikaty w `lib/content.ts`.
- Teksty `content.waitlist` (`lib/content.ts:396-412`): `demoNote`, `success` („Preview complete…”), `error` („…to preview the form.”), `todos` (dwa TODO). `ui.loading: "Checking…"` (l. 429) nie jest nigdzie używane.
- Style (`app/globals.css:1381-1408`): `.form-note`, `.form-status` (kolor `var(--green)`), `.form-status.invalid` (kolor `var(--ink)`, 600), `input[aria-invalid="true"]` (obrys), `.todo-notes`, wersja na telefon w l. 1962-1981. Nie ma `.failed`, `.success` ani stylu przycisku `disabled` poza `button:disabled { cursor: default }` (l. 82).
- Sekcja `#waitlist` w `app/page.tsx:339-348` nie wymaga zmian: tytuł i opis zostają.

### Makieta (zaakceptowana, `makieta/makieta.html`, sha256 `61400a04…d87e` zgodny z `akceptacja.md`)

- Teksty (`makieta.html:98-102`):
  - błąd: „Enter a valid email address to join the waiting list.” (inny niż dzisiejszy `error`);
  - sukces: „You're on the waiting list for the first release. Thank you!”;
  - niepowodzenie: „Your sign-up didn't go through. Please try again.”;
  - przycisk w czasie wysyłki: „Joining…” i `disabled` (l. 122-123).
- Stany (l. 103-111): 1 start, 2 pusty, 3 bez „@”, 4 wysyłanie, 5 zapisano, 6 nie przeszło (adres zostaje w polu), 7 e-mail właściciela. Stan 7 nie jest ekranem strony: pokazuje e-mail od `Maestro waitlist <onboarding@resend.dev>` z tematem „New sign-up on the Maestro waiting list” i treścią „Email: <adres>” (l. 137-139).
- Style (l. 32-36):
  - `.button[disabled] { opacity: .7; cursor: progress }`;
  - `.status.failed { color: var(--danger); font-weight: 600 }` przy `--danger: #8a2a1f` (l. 11);
  - `.status.success { color: var(--green); font-weight: 600 }`.
  - Makieta nie ma motywu ciemnego, więc kolor niepowodzenia w ciemnym trzeba dobrać tak, żeby kontrast z `--accent-soft` (`#2c422f`, `app/globals.css:45`) wynosił co najmniej 4.5:1. Z mojego wyliczenia potrzebna jest luminancja tekstu około 0.38 lub wyższa. `#8a2a1f` na jasnym `#e8f1df` to około 7.6:1, więc w jasnym motywie przechodzi.
- Czego z makiety nie przenosić: układu kolumnowego do 900 px (`makieta.html:43-48`). Strona ma własny układ na telefonie (`app/globals.css:1962-1975`), a ograniczenia zmiany każą zostawić wygląd poza formularzem. Makieta nie pokazuje też pola-pułapki, bo odwiedzający go nie widzi.

### Testy w przeglądarce, które ta zmiana musi przepisać

- `krok 10` (`tests/e2e/interakcje.spec.ts:144-184`):
  - oczekuje komunikatu podglądu `w.success` po poprawnym adresie (l. 177);
  - oczekuje pustej listy żądań po trzech wysyłkach (l. 180-183);
  - używa `zapisuj(page)` z `tests/e2e/pomoc.ts:18-26`, który zbiera `request`, `response` i `requestfailed`.
  - L1–L4 wymagają tu atrapy funkcji przez `page.route` na adresie podanym przy budowie, dwóch przebiegów (sukces i błąd, plus żądanie przerwane przez `route.abort()`), asercji „dokładnie jedno `POST` z adresem w treści”, zachowania wartości pola i braku tekstów TODO i „Form preview only”.
- `krok 13` (`tests/e2e/motyw-siec-dostepnosc.spec.ts:154-184`): po poprawnym adresie oczekuje `c.waitlist.success` (l. 178-181) bez atrapy. W kontenerze `--network none` prawdziwe żądanie się nie uda, więc test bez `page.route` zobaczy komunikat niepowodzenia. L6 wymaga pomiaru po obu odpowiedziach atrapy.
- `krok 11` (`motyw-siec-dostepnosc.spec.ts:46-61`) zostaje bez zmian i pilnuje L5.
- `krok 1` i `krok 2` (`tests/e2e/sekcje-i-uklad.spec.ts:25, 96`) sprawdzają tylko kotwicę `#waitlist` i link CTA, więc zmiana ich nie rusza. `krok 3` sprawdza brak poziomego przewijania od 360 px, więc ukryte pole-pułapkę trzeba schować bez wychodzenia poza prawą krawędź (np. wzorem `clip`, a nie `left: 10000px`).
- Atrapa przechwyconego żądania musi oddać nagłówek `Access-Control-Allow-Origin`. Bez niego `fetch` w Chromium odrzuci odpowiedź z innego originu.
- **Preflight CORS**: Playwright przy włączonym przechwytywaniu sam odpowiada 204 na `OPTIONS` z `initiator.type === "preflight"` i odsyła nagłówki `Access-Control-Allow-*` z żądania (`node_modules/playwright-core/lib/coreBundle.js:37959-37977`). Jeśli strona wyśle `Content-Type: application/json`, prawdziwa przeglądarka najpierw zapyta funkcję `OPTIONS`, a test w przeglądarce tego nie sprawdzi. Prostsze rozwiązanie to tzw. proste żądanie CORS, bez preflightu: treść jako `text/plain` albo `application/x-www-form-urlencoded`, bez własnych nagłówków. Wtedy w prawdziwej przeglądarce też idzie jedno żądanie, zgodnie z L1. Jeśli plan zostanie przy JSON, odpowiedź na `OPTIONS` musi mieć własny test funkcji.

### Uruchamianie testów i polecenie `verify`

- `package.json:10`: `verify` = `typecheck` + `playwright test -c playwright.bez-przegladarki.config.ts --project repo` + dwa przebiegi `gitleaks`. Nie buduje strony.
- `playwright.bez-przegladarki.config.ts:8-14` ma projekty `repo` (`tests/repo`) i `readme` (`tests/readme`). Testy funkcji (L7–L11) da się dodać jako trzeci projekt albo do `repo`. Node 22 ma globalne `Request`, `Response` i `fetch`, a runner Playwright sam transpiluje TS, więc handler funkcji można wołać wprost z atrapą `fetch` dla `api.resend.com`. Zmiana listy projektów w `verify` zmienia tylko wartość klucza `scripts.verify`, który test „krok 16” pomija (`zakres-przejecia.spec.ts:21-24`).
- L12 „test na `out/`” w `verify`: dziś `verify` nie ma budowy (CLAUDE.md `## Verify`: bez Dockera i usług). Plan musi rozstrzygnąć jedną z dróg:
  - test sam buduje stronę: dłużej, ale `out/` jest świeży;
  - `verify` dostaje budowę;
  - test czyta `out/` zbudowany przez `test:e2e` i pada, gdy `out/` nie ma. Wtedy `verify` po czystym `npm ci` nie przejdzie.
  - `out/` jest w `.gitignore` (`.gitignore:3`).
- `scripts/test-e2e.sh:37` buduje z `NEXT_PUBLIC_BASE_PATH=/www-maestro NEXT_TELEMETRY_DISABLED=1` i nie podaje adresu funkcji. Budowa testowa potrzebuje stałego adresu atrapy (np. `https://zapis.atrapa.invalid/`), który `page.route` przechwyci. Kontener biegnie z `--network none` (l. 73), więc atrapa przez `route` jest jedyną drogą.
- `NEXT_PUBLIC_*` Next wpisuje do kodu przy budowie. `next.config.ts` jest zamrożony przez „krok 16”, więc adres funkcji idzie wyłącznie przez zmienną środowiska czytaną w `lib/waitlist.ts`.
- `tsconfig.json` (zamrożony) ma `include: ["**/*.ts", …]`, `lib: ["dom", …]` i `strict`. Kod funkcji w `worker/` jest więc sprawdzany przez `typecheck`, a w workflow przez `npm run typecheck` i przez `next build`. Bez `@cloudflare/workers-types` typy wiązań (limit, Durable Object, `env`) trzeba zdefiniować lokalnie. Nowa zależność w `devDependencies` wywróciłaby „krok 16”, który porównuje `package.json` poza wpisami testów (`zakres-przejecia.spec.ts:44-54`). Rejestr D-010 przypomina też, że „krok 16” nie porównuje `package-lock.json`.
- Narzędzia `wrangler` nie trzeba instalować lokalnie. Instaluje je `wrangler-action` w CI, gdy go nie ma (README akcji: „If Wrangler is not installed, the action installs a default version”). Zgadza się to z granicą „Instalacja” w change.md.

### Test „krok 16” (L13)

- `tests/repo/zakres-przejecia.spec.ts:11-20` zamraża `app`, `components`, `lib`, `public`, `.github/workflows/pages.yml`, `next.config.ts`, `tsconfig.json` i `postcss.config.mjs` przez `git diff --quiet 5e4dcac`. Nowe nieśledzone pliki w tych ścieżkach też są błędem (l. 41-42).
- Pliki strony, które zmiana prawdopodobnie ruszy: `components/interactive.tsx`, `lib/waitlist.ts`, `lib/content.ts` i `app/globals.css` (style `.failed`, `.success`, przycisku `disabled` i pola-pułapki). Do tego `.github/workflows/pages.yml`, ale dopiero po wpisaniu przez autopilota.
- Wyjątek dla `pages.yml` musi pozwalać na różnicę, a nie jej wymagać. Do kroku `przygotowanie-wdrozenia` plik jest jak w `5e4dcac`, a po nim ma nową treść. Test biegnie w `verify` przed każdym commitem.
- Katalog `worker/` nie jest w `SCIEZKI`, więc nie potrzebuje wyjątku. `package.json` zmienia się tylko w `scripts.verify`, chyba że plan doda zależność.

### Workflow publikacji i pliki chronione (L14)

- Dzisiejszy `.github/workflows/pages.yml`:
  - `on: push: main` i `workflow_dispatch`, `permissions: {}`;
  - job `build`: `checkout`, `setup-node 22`, `configure-pages`, `npm ci`, `next typegen`, `typecheck`, `build`, `upload-pages-artifact`;
  - job `deploy` (`needs: build`) z krokiem „Deploy to GitHub Pages”.
- Hook `protect_paths.py` chroni `.github/workflows/**` (`.claude/guardrails.json:2-7`). Wzorzec ze „/” dopasowuje się od korzenia repo (`.claude/hooks/guardrails/guardlib.py:247-262`), więc zapis do `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml` nie jest blokowany. Wzorzec `**/secrets/**` zablokowałby katalog o nazwie `secrets`, więc kod i testy nie mogą mieć katalogu o tej nazwie.
- Krok `przygotowanie-wdrozenia` autopilota (`<fabryka>/scripts/autopilot.py:7166-7300`):
  - biegnie dopiero po `impl-review`;
  - wymaga, żeby pliki z `chronione/` były w commicie i miały zgodę `zgoda: plik <ścieżka>` w `## Zgody`. Jest ona w `change.md:126`;
  - sprawdza sekrety w każdym pliku `.github/workflows/` w wersji po wpisaniu;
  - wpisuje blob z commita i robi commit `chore: pliki chronione po zgodzie (lista-oczekujacych)`;
  - potem uruchamia polecenia `gh secret set` z `## Wdrożenie`.
- Reguła sekretów (`ci_secret_problems`, `autopilot.py:5853-5940`):
  - każde `${{ secrets.… }}` i każdy klucz `secrets:` musi stać dokładnie w `jobs.<job>.steps[].env|with.<nazwa>`;
  - krok musi mieć `uses:` z narzędziem z pola „narzędzia z sekretami”, czyli `cloudflare/wrangler-action`;
  - zakazane są tabulatory, kotwice YAML, sekret w `env:` joba albo całego workflow i sekret w innym kroku.
  - Wejście `with: secrets: |` akcji (lista nazw) mieści się w regule, bo stoi w `with:` kroku akcji. Wartości `RESEND_API_KEY` i `OWNER_EMAIL` muszą być w `env:` tego samego kroku.
- CI gałęzi: żaden plik `.github/workflows/` nie ma linii `# autopilot: ci-galezi`, więc `branch_ci_run` wpisze tylko `NO_BRANCH_CI` (`autopilot.py:7536-7552`). Nowy workflow publikuje się dopiero po scaleniu na `main`.
- Jak przekazać adres funkcji do budowy:
  - wyjście `deployment-url` akcji jako `outputs` joba publikacji funkcji;
  - w jobie `build` zmienna `NEXT_PUBLIC_…: ${{ needs.<job>.outputs.<nazwa> }}`. Adres funkcji nie jest sekretem, więc reguła go nie dotyczy;
  - `build` dostaje `needs: <job funkcji>`, a job `deploy` z krokiem „Deploy to GitHub Pages” zostaje bez zmian (`## Wdrożenie`: „krok wdrożenia: Deploy to GitHub Pages”).
  - Dobrze, żeby budowa padała, gdy adres jest pusty, np. krok `run: test -n "$…"` bez sekretów. Inaczej strona wyjdzie z formularzem, który zawsze pokaże niepowodzenie.
- Job funkcji potrzebuje `permissions: contents: read` (dla `checkout`), bo workflow ma `permissions: {}`.

### Funkcja zapisu (L7–L11): nie istnieje

Trzeba zbudować od zera (ścieżka np. `worker/`):

- handler `fetch(request, env)`;
- `Origin` równy `https://lukeblonski.github.io`, inaczej odmowa bez wywołania Resend (L8);
- walidacja adresu, inaczej odmowa (L8);
- pole-pułapka: wypełnione daje sukces bez Resend (L9);
- limit 5 zapisów na minutę z jednego IP (`CF-Connecting-IP`), szósty dostaje 429 bez Resend (L10);
- `POST https://api.resend.com/contacts` i `POST https://api.resend.com/emails` na `env.OWNER_EMAIL` z `Authorization: Bearer ${env.RESEND_API_KEY}` (L7);
- błąd Resend daje 5xx (L11);
- `Access-Control-Allow-Origin: https://lukeblonski.github.io` w odpowiedziach (L7).

Konfiguracja: `wrangler.toml` z `name` (adres `<name>.<subdomena>.workers.dev`), `main`, `compatibility_date` i wiązaniem limitu albo Durable Object.

Dane testowe: wartości atrap (klucz, adres) powinny wyglądać na zmyślone i mieć niską entropię, np. `klucz-atrapy`, `wlasciciel@example.com`. Inaczej `gitleaks` może je wziąć za klucz. Hook `block_secrets.py` szuka m.in. `sk-…` i `ghp_…` (`.claude/hooks/guardrails/block_secrets.py:40-44`).

L12 dla adresu właściciela: w kodzie funkcji odbiorca to tylko `env.OWNER_EMAIL`, bez adresu na sztywno i bez wartości domyślnej.

### Fakty o usługach (sprawdzone w źródłach 2026-11-18)

**Resend**
- Kontakty: `POST https://api.resend.com/contacts` z treścią `{ "email": … }`, a `segments` i `topics` są opcjonalne. Odpowiedź to `{ "object": "contact", "id": … }`. Źródło: https://resend.com/docs/api-reference/contacts/create-contact.md. Kontakty są globalne dla zespołu, a „Audiences” zastąpiły „Segments” (https://resend.com/docs/dashboard/audiences/contacts.md). `audience_id` nie jest potrzebny, więc funkcja nie potrzebuje innej konfiguracji niż klucz i adres właściciela.
- Ponowny zapis tego samego adresu: dokumentacja nie mówi, co zwraca `POST /contacts` dla istniejącego kontaktu. Lista błędów (https://resend.com/docs/api-reference/errors.md) ma 409 tylko dla idempotencji, zablokowanego zasobu i Forge. **Niesprawdzone**, więc decyzja według najgorszego przypadku: duplikat może wrócić jako błąd 4xx. Wtedy odwiedzający, który zapisze się drugi raz, zobaczy „didn't go through”. Plan powinien rozstrzygnąć, czy błąd kontaktu kończy zapis (L11), czy funkcja mimo to wysyła powiadomienie.
- Wysyłka: `POST /emails` z `from`, `to`, `subject`, `text` albo `html`, opcjonalnie nagłówek `Idempotency-Key` (https://resend.com/docs/api-reference/emails/send-email.md). `onboarding@resend.dev` wysyła tylko na adres konta. Na inny adres Resend zwraca 403 „You can only send testing emails to your own email address” (https://resend.com/docs/knowledge-base/403-error-resend-dev-domain.md). Zgadza się to z ograniczeniem w change.md, pod warunkiem że `OWNER_EMAIL` to adres konta Resend.
- Plan darmowy (https://resend.com/docs/knowledge-base/account-quotas-and-limits.md):
  - 100 e-maili na dzień i 3000 na miesiąc; dzień liczy się w UTC;
  - po przekroczeniu Resend zwraca 429 `daily_quota_exceeded` albo `monthly_quota_exceeded` i nie ponawia wysyłki;
  - marketing: do 1000 kontaktów. Kontakty ponad limit da się dodać, ale bez wysyłki kampanii (https://resend.com/docs/api-reference/rate-limit.md, „Contact Quotas”);
  - limit zapytań: 10 na sekundę na zespół.
  - Skutek: przy jednym powiadomieniu na zapis 101. zapis danego dnia dostanie 5xx według L11. Adres może już być na liście kontaktów, jeśli funkcja dodaje kontakt przed e-mailem.

**Cloudflare Workers**
- Plan Free: 100 000 żądań na dzień i 10 ms CPU na żądanie (https://developers.cloudflare.com/workers/platform/limits/). Adres to `<nazwa workera>.<subdomena konta>.workers.dev` (https://developers.cloudflare.com/workers/configuration/routing/workers-dev/). Automatyczni klienci z domyślnym `User-Agent` bibliotek mogą dostać błąd 1010, co przeglądarek nie dotyczy.
- Wiązanie limitu `[[ratelimits]]` (`namespace_id`, `simple = { limit, period }`, `period` tylko 10 albo 60, wywołanie `env.X.limit({ key })` zwraca `{ success }`), według https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/:
  - „Rate limits are approximate and apply separately in each Cloudflare location. Requests can exceed your configured limit”;
  - ścisły limit wymaga Durable Objects.
  - **Niesprawdzone**: w pobranej stronie wiązania i w stronach cen i limitów nie znalazłem, czy wiązanie działa na planie darmowym. Najgorszy przypadek to brak wiązania na planie Free, więc publikacja funkcji padnie.
- Durable Objects na planie Free działają tylko z SQLite: 100 000 żądań i 13 000 GB-s na dzień (https://developers.cloudflare.com/durable-objects/platform/pricing/). To ścisła droga do L10 („najwyżej 5 na minutę”), potwierdzona na planie Free. Kosztuje klasę obiektu, `[[durable_objects.bindings]]` i `[[migrations]] new_sqlite_classes` w `wrangler.toml` oraz atrapę przestrzeni nazw w testach.
- Sekrety workera: `wrangler-action` wiąże je z wejścia `secrets` (nazwy w kolejnych liniach), a wartości bierze z `env:` kroku.

**cloudflare/wrangler-action**
- Najnowsze wydanie to `v4.1.3` (2026-09-24, GitHub API releases/latest). Akcja działa na `node24`.
- Wejścia: `apiToken`, `accountId`, `workingDirectory`, `wranglerVersion`, `secrets`, `vars`, `command` (domyślnie `deploy`), `packageManager`.
- Wyjścia: `deployment-url`, `command-output` i inne (https://github.com/cloudflare/wrangler-action/blob/main/action.yml).
- Bez `wranglerVersion`, gdy wranglera nie ma w projekcie, akcja instaluje wersję domyślną (README). Lepiej przypiąć `wranglerVersion`, bo D-002 opisuje ryzyko wersji „najnowszych”.
- Konto: dokumentacja Cloudflare dla GitHub Actions każe dodać sekrety `CLOUDFLARE_ACCOUNT_ID` i `CLOUDFLARE_API_TOKEN` i podaje przykład z `accountId` (https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/). Lista zmiennych wranglera opisuje `CLOUDFLARE_ACCOUNT_ID` jako opcjonalne (https://developers.cloudflare.com/workers/wrangler/system-environment-variables/).
  - `## Wdrożenie` w CLAUDE.md nie ma identyfikatora konta.
  - **Niesprawdzone**: czy wrangler bez `accountId` sam wybierze konto z tokenu z „Account API tokens”, ograniczonego do jednego konta. Najgorszy przypadek: job funkcji padnie, budowa i publikacja strony nie ruszą, opublikowana zostanie stara strona, a krok `wynik-wdrozenia` zobaczy porażkę.
  - Identyfikator konta nie jest sekretem i mógłby stać w `wrangler.toml`, ale agent go nie zna, a kroki nie czytają `## Dostępy`.

## Code References

- `components/interactive.tsx:278-335`: `WaitlistForm`, stany, walidacja, wywołanie adaptera, TODO i notatka
- `lib/waitlist.ts:1-11`: adapter-podgląd bez żądania
- `lib/content.ts:396-412`: teksty formularza (`demoNote`, `success`, `error`, `todos`)
- `lib/content.ts:429`: `ui.loading: "Checking…"`, nieużywane
- `app/globals.css:1381-1408`: style `.form-note`, `.form-status`, `.invalid`, `aria-invalid`, `.todo-notes`
- `app/globals.css:17-46`: kolory motywu jasnego i ciemnego (`--green`, `--ink`, `--accent-soft`)
- `app/page.tsx:339-348`: sekcja `#waitlist`
- `tests/e2e/interakcje.spec.ts:144-184`: `krok 10`, dziś „zero żądań” i komunikat podglądu
- `tests/e2e/motyw-siec-dostepnosc.spec.ts:46-61`: `krok 11`, żądania przy przeglądaniu (L5)
- `tests/e2e/motyw-siec-dostepnosc.spec.ts:154-184`: `krok 13`, kontrast `#waitlist-status`
- `tests/e2e/pomoc.ts:18-33`: `zapisuj` i `otworzStrone`
- `tests/repo/zakres-przejecia.spec.ts:10-55`: „krok 16”, `SCIEZKI`, `WPISY_TESTOW`
- `tests/readme/readme.spec.ts:39-61`: „krok 15”, README musi mieć polecenie uruchomienia i `## Testy` z `npm test`
- `scripts/test-e2e.sh:37,73`: budowa bez adresu funkcji, kontener `--network none`
- `playwright.bez-przegladarki.config.ts:8-14`: projekty `repo` i `readme`
- `package.json:10`: skrypt `verify`
- `.github/workflows/pages.yml`: jobs `build` → `deploy`, bez sekretów
- `.claude/guardrails.json:2-7` i `.claude/hooks/guardrails/guardlib.py:247-262`: ochrona `.github/workflows/**` dopasowywana od korzenia
- `<fabryka>/scripts/autopilot.py:5853-5940`: `ci_secret_problems`, reguła miejsca sekretów
- `<fabryka>/scripts/autopilot.py:7166-7300`: `prep_run`, wpisanie plików z `chronione/` i `gh secret set`
- `<fabryka>/scripts/autopilot.py:7536-7552`: `branch_ci_run`, bez znacznika `ci-galezi` nic nie robi
- `node_modules/playwright-core/lib/coreBundle.js:37959-37977`: samoczynna odpowiedź na preflight przy `page.route`
- `context/changes/lista-oczekujacych/makieta/makieta.html:32-36,98-111,137-139`: style, teksty i stany z makiety
- `README.md:63-75`: nieaktualna sekcja „Podłączenie listy oczekujących”

## Architecture Insights

- Strona zostaje statyczna (`output: "export"`). Jedyny kod z dostępem do sieci w czasie działania to `lib/waitlist.ts` w przeglądarce. Adres funkcji jest wpisany przy budowie przez `NEXT_PUBLIC_*`, a klucz i adres właściciela żyją tylko w sekretach workera (FR-016).
- Do kodu i treści strony prowadzą trzy punkty, każdy w jednym pliku: adapter w `lib/waitlist.ts`, wszystkie teksty w `lib/content.ts` (testy czytają z niego teksty, nie wpisują ich na sztywno) i style w `app/globals.css`. Konwencja testów S-01: nazwa „krok N — …”, elementy po rolach i nazwach dostępnych, teksty z `lib/content.ts`, wybór przez `--grep "krok N\b"`.
- Granica „kod strony jak w `5e4dcac`” to test, nie zwyczaj. Każdy plik strony ruszony przez zmianę musi być wymieniony z nazwy w „krok 16”.
- Pliki chronione idą dwiema drogami: agent pisze w `chronione/`, a autopilot po przeglądzie kodu przepisuje commitowany blob i sprawdza sekrety własnym parserem. Workflow musi więc spełniać ten heurystyczny parser: bez tabulatorów, kotwic YAML i sekretów poza `with:` i `env:` kroku `wrangler-action`.
- Testy funkcji nie potrzebują wranglera ani Miniflare. Handler zgodny z Fetch API da się uruchomić w Node 22 przez runner Playwright z podmienionym `fetch` i atrapą wiązania limitu. Dzięki temu L7–L11 mieszczą się w `verify` „bez usług lokalnych”.

## Historical Context (from prior changes)

- `context/archive/2026-11-18-testy-zachowania-strony/` (S-01) zbudowało całe narzędzie testów, „krok 15” i „krok 16” oraz polecenie `verify`. Jego decyzje są w rejestrze ograniczeń:
  - D-006: `test:e2e -- --grep "krok 16\b"` nie uruchamia testu `repo`. Krok 16 sprawdza tylko `verify`;
  - D-008: `test:e2e` przyjmuje tylko `--grep`;
  - D-010: „krok 16” nie porównuje `package-lock.json`;
  - D-011: błąd typów w testach blokuje publikację. „Kiedy wrócić: zmiana dotyka `.github/workflows/pages.yml`”, a ta zmiana go dotyka;
  - D-003: brak lintera. „Kiedy wrócić: pierwsza zmiana interakcji w `components/interactive.tsx`”, a ta zmiana nią jest;
  - D-004: publikacja bez testów w CI. Ta zmiana zmienia `pages.yml`, ale change.md wyklucza dodanie testów do workflow.
- `context/foundation/limitations.md` D-001: brak informacji o prywatności zostaje świadomie (decyzja człowieka). Ta zmiana zamyka tylko część „lista tylko jako podgląd”.
- `context/foundation/roadmap.md` S-02, niewiadoma „publikacja funkcji z komputera fabryki czy z workflow”. Rozstrzygnął ją change.md (job w `pages.yml`, zgoda człowieka 2026-11-18 12:25).
- `context/foundation/start.md` `## Sprawdzalność scenariusza`, krok 10: dziś „bez ścieżki na żywo”. `## Ścieżki na żywo`: brak. Prawdziwy zapis sprawdzi dopiero publikacja po scaleniu.

## Related Research

- `context/archive/2026-11-18-testy-zachowania-strony/research.md`: badanie przed S-01 (narzędzie testów, zakres przejęcia)

## Open Questions

1. **Limit z jednego IP: wiązanie `ratelimits` czy Durable Object?** Wiązanie jest prostsze, ale według źródła przybliżone i liczone w każdej lokalizacji. Jego dostępności na planie Free nie potwierdziłem. Durable Object z SQLite daje ścisły limit i według źródła działa na planie Free. Według najgorszego przypadku polecam Durable Object albo przyjęcie przybliżenia jako świadomej decyzji w planie.
2. **Identyfikator konta Cloudflare.** `## Wdrożenie` nie ma `CLOUDFLARE_ACCOUNT_ID`. Czy wrangler bez niego wybierze konto z tokenu, nie sprawdziłem. Najgorszy przypadek: pierwsza publikacja po scaleniu padnie w jobie funkcji, a strona zostanie w starej wersji. Dodanie identyfikatora oznacza nową zgodę na zmianę `## Wdrożenie` albo wpis w `wrangler.toml`, którego agent nie zna. To decyzja dla planu i ewentualnie pytanie do człowieka.
3. **Ponowny zapis tego samego adresu w Resend.** Dokumentacja nie mówi, co zwraca `POST /contacts` dla istniejącego kontaktu. Plan musi ustalić, czy błąd kontaktu kończy zapis kodem 5xx (L11), czy funkcja traktuje go jako zapisany, a także kolejność wywołań (kontakt, potem e-mail).
4. **Limit 100 e-maili na dzień w Resend Free.** Po 100 zapisach danego dnia powiadomienie dostanie 429. Zgodnie z L11 odwiedzający zobaczy niepowodzenie, choć adres mógł już trafić na listę kontaktów. Do zapisania jako znane ograniczenie albo do rozstrzygnięcia w planie (np. kontakt zapisany oznacza sukces, a błąd e-maila tylko w logu).
5. **L12 w `verify` bez budowy.** Plan musi wybrać, skąd test bierze świeży `out/`.
6. **Format treści żądania.** Proste żądanie CORS (`text/plain` albo form-urlencoded) bez preflightu zamiast JSON, bo Playwright ukrywa preflight w testach przeglądarki.
7. **Kolor niepowodzenia w motywie ciemnym.** Makieta podaje go tylko dla jasnego (`#8a2a1f`, około 7.6:1). Dla ciemnego trzeba dobrać wartość o kontraście co najmniej 4.5:1 na `#2c422f`.
