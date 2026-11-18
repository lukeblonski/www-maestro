# Naprawa listy oczekujących po błędzie 502 z Resend — Implementation Plan

## Overview

Funkcja zapisu (`worker/index.ts`) na opublikowanej stronie odpowiada 502 i nie wysyła e-maila. Plan robi trzy rzeczy. Funkcja zapisuje w logach Cloudflare każdą odmowę Resend, bez klucza i adresów. Wywołania Resend dostają jawny nagłówek `User-Agent`, czyli poprawkę najbardziej prawdopodobnej przyczyny. Ponowny zapis istniejącego kontaktu kończy się sukcesem. Do tego dochodzi skrypt ścieżki na żywo `zapis-na-liste`. Przed scaleniem ustala on przyczynę z prawdziwej odpowiedzi Resend i sprawdza poprawkę na prawdziwym Resend.

## Current State Analysis

Według `research.md`:

- `wywolajResend` (`worker/index.ts:147-158`) robi tylko `POST` z nagłówkami `Authorization` i `Content-Type` i zwraca sam `boolean`. Nie czyta statusu ani treści odpowiedzi, nic nie loguje i nie wysyła `User-Agent`.
- Resend wymaga nagłówka `User-Agent`. Bez niego Cloudflare przed API Resend odpowiada 403, kod 1010, i nie jest to JSON Resend. workerd sam tego nagłówka nie dodaje (cloudflare/workerd#4711). To najbardziej prawdopodobna przyczyna 502 na `POST /contacts`. Druga kandydatka to klucz „Sending access”, który dostaje 401 `restricted_api_key`. Obie przyczyny to hipotezy z dokumentacji.
- Node `fetch` sam dodaje `User-Agent: node`. Lokalna instancja w Node nie odtworzy więc błędu 1010, a przyczynę pokaże tylko osobne żądanie bez tego nagłówka.
- `worker/wrangler.toml` nie ma `[observability]`.
- `CLAUDE.md` nie ma `## Sprawdzenie na żywo`. W repo nie ma skryptu ścieżki ani jego testu.
- Testy `tests/repo/funkcja-zapisu.spec.ts` oczekują, że poprawny zapis wywoła Resend dokładnie dwa razy (`:87-107` i liczby wywołań w testach limitów). Test „błąd Resend daje 5xx” (`:222-238`) odpowiada 200 `{id}` na każdy adres poza tym jednym, który ma zawieść.
- Kontrakt autopilota dla ścieżki na żywo opisuje `research.md` §4: polecenie bez powłoki w świeżym worktree bez `node_modules`, zmienne `PORT`, `NA_ZYWO_ADRES` i `NA_ZYWO_WYNIK`, ocena `live_verdict` i maskowanie tylko dokładnych wartości sekretów.

## Desired End State

- Każda odmowa Resend i każdy wyjątek sieci przy wywołaniu Resend zostawia dokładnie jeden wpis `console.error`. Wpis ma ścieżkę wywołania, status, `name` i `message` (przy wyjątku rodzaj błędu). Adresy e-mail są w nim zastąpione znacznikiem i nie ma w nim klucza. Wpisy trafiają do Workers Logs (`[observability] enabled = true`).
- Oba wywołania Resend mają nagłówek `User-Agent: maestro-waitlist/1.0`.
- Ponowny zapis istniejącego kontaktu daje e-mail do właściciela i 200 `{"ok":true}`.
- `node scripts/na-zywo.mjs` (linia `zapis-na-liste` w `## Sprawdzenie na żywo` w `CLAUDE.md`) robi kolejno:
  1. wysyła jedno żądanie diagnostyczne, jak funkcja w Workers (bez `User-Agent`);
  2. uruchamia funkcję na `127.0.0.1:$PORT` z prawdziwym kluczem i adresem właściciela;
  3. zapisuje się adresem właściciela;
  4. sprawdza kontakt i stan e-maila w Resend;
  5. zapisuje plik `$NA_ZYWO_WYNIK` według kontraktu autopilota.
- `npm run verify` przechodzi z nowymi testami N1–N3 i N6, a stare testy zostają bez zmian.

Sprawdzenie: `npm ci && npm run verify`. Wynik ścieżki na żywo ocenia skrypt autopilota w kroku `przygotowanie-wdrozenia`.

### Key Discoveries:

- `worker/index.ts:11-12`: plik nie importuje `cloudflare:workers`. Node v22.23.5 importuje go bez zależności (sprawdzone: `node -e 'import("./worker/index.ts")'` daje `LimitZapisow, default, kluczLimitu`, z ostrzeżeniem `MODULE_TYPELESS_PACKAGE_JSON` na stderr).
- `tests/repo/funkcja-zapisu.spec.ts:51-71`: `srodowisko()` z `LimitZapisow` na `Map` to wzór `env` dla skryptu.
- `tests/repo/zakres-przejecia.spec.ts:9-18`: `scripts/`, `tests/`, `worker/` i `CLAUDE.md` leżą poza `SCIEZKI`, a plan nie zmienia `package.json`, więc test „krok 16” zostaje bez zmian.
- `tsconfig.json:25-29`: `include` obejmuje tylko `**/*.ts(x)`. Pliki `.mjs`, których nie importuje żaden `.ts`, nie wchodzą do `typecheck`.
- `/home/fabryka/fabryka/scripts/autopilot.py:6205-6240` (`live_verdict`): `zablokowane` ma pierwszeństwo przed kodem wyjścia. `atrapy` musi być `[]`, `stan_koncowy` dosłownie jak w `context/foundation/start.md:71`, a `dowod` niepusty.
- `/home/fabryka/projekty/legit/scripts/na-zywo.mjs:115-167`: wzór `finish()` i czytania `## Dostępy`. W www-maestro ścieżki w `## Dostępy` są **bez** lewych apostrofów.

## Decyzje planu

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Jak ustalić przyczynę z prawdziwej odpowiedzi (N8), skoro Node dodaje `User-Agent` | Przed właściwym zapisem skrypt wysyła jedno żądanie diagnostyczne `POST /contacts` z adresem właściciela, kluczem i nagłówkami jak dziś w produkcji, bez `User-Agent`, przez `node:https` (który go nie dodaje), i zapisuje jego status, `name` i `message` w `dowod` i na wyjściu | Odtwarza wywołanie z Workers bez nowej zależności, a change.md każe nie dodawać narzędzia Cloudflare, gdy wystarcza Node (research, Decyzje 1) |
| Czy diagnostyka mieści się w zgodzie na dane | Tak. Diagnostyka wysyła ten sam adres właściciela do tej samej usługi w tym samym celu (kontakt w Resend) i nie wysyła żadnego e-maila | Zgoda „dane Resend (USA)” z 13:56 obejmuje kontakt i e-mail do właściciela przy sprawdzeniu na żywo, a człowiekowi powiedziano o jednym mailu na sprawdzenie i tak zostaje |
| Poprawka | Stały nagłówek `User-Agent: maestro-waitlist/1.0` w obu wywołaniach Resend | Resend wymaga go od wszystkich klientów, więc poprawka jest bezpieczna przy każdym wyniku diagnostyki i daje to samo żądanie w Node i w Workers (research, Decyzje 2) |
| Odpowiedź Resend na dodanie istniejącego kontaktu (N3, Open Question 1) | Wynik nie zależy od tej odpowiedzi. Gdy `POST /contacts` nie zwróci 2xx, funkcja pyta `GET /contacts/{encodeURIComponent(adres)}` i idzie dalej tylko przy 200 z polem `email` równym adresowi (bez rozróżniania wielkości liter). Atrapa N3 odpowiada 409 i 422 z nazwą „already exists”, a prawdziwą odpowiedź zapisze `dowod` ścieżki na żywo | Dokumentacja Resend tego nie opisuje, więc plan bierze najgorszy przypadek. Warunek pola `email` utrzymuje test „błąd Resend daje 5xx” bez zmian (N9) |
| Liczba wpisów logu przy N3 | Logowanie robi wywołujący, nie `wywolajResend`: jeden `console.error` z odpowiedzią `POST /contacts`, gdy kontaktu nie ma, a przy istniejącym kontakcie żadnego | N1 wymaga dokładnie jednego wpisu na odmowę, także gdy po niej idzie `GET` |
| Zastępowanie adresów w logu | Każdy ciąg wyglądający na adres e-mail (z `@` albo `%40`) zastępuje znacznik `<adres>`, a dokładna wartość klucza znacznik `<klucz>`. Treść, która nie jest JSON (strona 1010), trafia do logu jako pierwsze 300 znaków z pustymi znakami złożonymi do jednej spacji | Komunikat trybu testowego Resend zawiera adres konta, a odpowiedź 403/1010 nie jest JSON (research §1) |
| Czy adres z `owner-email` jest adresem konta Resend (Open Question 2) | Plan o to nie pyta. Odmowa 403 `validation_error` na `/emails` daje w skrypcie `zablokowane` z tym powodem, a sesja pyta wtedy człowieka przez obserwatora | Krok agenta nie czyta pliku, a change.md („Ograniczenia”) każe przy ustawieniu konta stanąć na sprawdzeniu na żywo |
| `atrapy` w skrypcie pod atrapą testu (Open Question 3) | Moduł atrapy ładowany przez `node --import` ustawia `globalThis.ATRAPY_NA_ZYWO = ["api.resend.com"]`, a skrypt zgłasza tę listę albo `[]`, gdy jej nie ma | Oznaczenie pochodzi z kodu atrapy, a nie ze zmiennej środowiska, więc prawdziwy przebieg nie ustawi go przypadkiem, a test sprawdza, że skrypt nie wpisuje `[]` na stałe |
| Czy `console.error` trafia do Workers Logs (Open Question 4) | Funkcja używa `console.error`, jak wymaga N1. Wpis w Workers Logs potwierdzi dopiero publikacja, a zapis obserwatora (N10) i tak ją sprawdza | Dokumentacja wymienia „errors” i `console.log`, a zmiana formy logu nie jest potrzebna, bo N1 nazywa `console.error` wprost |
| Skąd skrypt bierze pliki | `CLAUDE.md` i `context/foundation/start.md` z folderu roboczego (`process.cwd()`, czyli korzenia worktree autopilota). `worker/index.ts` importuje względem własnego położenia | Test uruchamia skrypt w katalogu tymczasowym z własnym `CLAUDE.md`, który wskazuje pliki z atrapowymi wartościami, więc nigdy nie czyta plików z `## Dostępy`. Prawdziwy przebieg nie potrzebuje zmiennej obejścia |
| Skąd identyfikator e-maila i powody odmów | Skrypt owija `globalThis.fetch` w swoim procesie. Przepuszcza każde żądanie funkcji do Resend bez zmian i zapisuje metodę, ścieżkę (adres jako `<adres>`), status, `name`, `message` i `id` z `POST /emails` | To nie atrapa, bo odpowiedzi idą bez zmian, a daje dokładny `id` i powód do `powod` (research §5, wariant a) |
| Mapowanie wyniku skryptu | `zablokowane`: odmowa Resend 401, 403 albo 429 z treścią JSON Resend (pole `name`), 400 z `message` o kluczu API oraz `last_event` `bounced` albo `failed`. `nie przeszło`: każda inna odpowiedź funkcji niż 200 `{"ok":true}`, 403 bez JSON (1010 mimo poprawki), brak kontaktu albo e-mail bez stanu `sent`/`delivered` po odpytywaniu | Odmowa za kluczem albo kontem to działanie człowieka w panelu, a reszta to błąd kodu, który sesja naprawia (research, Decyzje 4, `kawalek-intencja.md:14`) |
| Odpytywanie o stan e-maila | `GET /emails/{id}` od razu, potem co 3 s, łącznie do 90 s | Zaraz po wysłaniu `last_event` bywa `queued`, a limit autopilota to 1200 s |
| Zależności | Bez nowych zależności i bez zmian `package.json`: skrypt i atrapa używają tylko modułów wbudowanych Node | Świeży worktree autopilota nie ma `node_modules`, a „krok 16” porównuje `package.json` |
| D-013 w `limitations.md` | Część o ponownym zapisie zamknięta przez N3, część o dziennym limicie 100 e-maili zostaje | change.md: N3 zmienia D-013 tylko w części ponownego zapisu |

## What We're NOT Doing

- Zmian strony, formularza i komunikatów, `.github/workflows/pages.yml`, `## Wdrożenie` i `## Dostępy` w `CLAUDE.md`, sekretów repozytorium i `package.json`.
- Narzędzia Cloudflare (`wrangler`) w zależnościach projektu.
- Obejścia błędu przez pominięcie listy kontaktów. Zapis bez kontaktu nie jest sukcesem.
- Własnej domeny nadawcy, e-maila do odwiedzającego i obsługi dziennego limitu 100 e-maili (D-013 w tej części zostaje).
- Uruchamiania skryptu ścieżki przez kroki agenta. Uruchamia go tylko skrypt autopilota, a testy biegną na atrapie.

## Implementation Approach

Najpierw funkcja. Wynik wywołania Resend staje się obiektem ze statusem i treścią, wywołujący loguje odmowę jeden raz, a obie prośby dostają `User-Agent`. Po nieudanym `POST /contacts` idzie sprawdzenie istniejącego kontaktu. Do tego dochodzi `[observability]`. Potem skrypt ścieżki z atrapą ładowaną przez `--import` i testem bez sieci oraz linia w `CLAUDE.md`. Przyczynę z prawdziwej odpowiedzi daje dopiero przebieg skryptu w kroku autopilota `przygotowanie-wdrozenia`, który idzie po implementacji. Wpis przyczyny w raporcie kawałka (N8) i zapis obserwatora po publikacji (N10) robi sesja główna, nie implementacja.

## Critical Implementation Details

**Kolejność w skrypcie.** Żądanie diagnostyczne idzie przed zapisem przez funkcję. Gdy diagnostyka utworzy kontakt (czyli przyczyna to nie brak `User-Agent`), właściwy `POST /contacts` trafia na istniejący kontakt. Ten sam przebieg sprawdza wtedy na prawdziwym Resend ścieżkę N3, a `dowod` zapisuje jego odpowiedź. Drugi przebieg w kroku `merge` też trafia na istniejący kontakt.

**Sekrety na wyjściu.** Autopilot ukrywa tylko dokładne wartości. Skrypt sam przepuszcza każdy tekst, który wypisuje albo zapisuje (`dowod`, `powod`, linie stdout/stderr), przez funkcję, która zastępuje klucz, adres właściciela w każdej wielkości liter, jego postać z `%40` i każdy inny adres e-mail. Skrypt nigdy nie wypisuje adresu URL `GET /contacts/{email}`. Ostrzeżenie Node `MODULE_TYPELESS_PACKAGE_JSON` przy imporcie `worker/index.ts` nie przeszkadza.

**Atrapa dwóch dróg.** Moduł atrapy podmienia `globalThis.fetch` (dla `https://api.resend.com/`) i `request` w domyślnym eksporcie `node:https` (dla hosta `api.resend.com`), a potem wywołuje `syncBuiltinESMExports()`. Skrypt woła `https.request` przez domyślny import `node:https`. Każdy inny host poza `127.0.0.1` atrapa odrzuca błędem, więc test na pewno biegnie bez sieci.

## Phase 1: Funkcja zapisu — log odmów, User-Agent, istniejący kontakt, logi Cloudflare

**Criteria**: N1, N2, N3, N4, N9

### Overview

Funkcja loguje odmowy Resend bez sekretów i adresów, wysyła `User-Agent`, przyjmuje ponowny zapis istniejącego kontaktu, a Cloudflare przechowuje jej logi.

### Changes Required:

#### 1. Funkcja zapisu

**File**: `worker/index.ts`

**Intent**: Zamienić `wywolajResend` na wywołanie zwracające status i treść odpowiedzi, z jawnym `User-Agent`. Dodać sprawdzenie istniejącego kontaktu po nieudanym `POST /contacts` i jeden wpis `console.error` na każde niepowodzenie, w którym klucz i adresy zastępuje znacznik.

**Contract**:
- Stała `USER_AGENT = "maestro-waitlist/1.0"`. Nagłówki każdego wywołania Resend to `Authorization`, `Content-Type` (przy treści) i `User-Agent`.
- Wywołanie (np. `wywolajResend(metoda, sciezka, klucz, tresc?)`) zwraca wynik HTTP `{ status, ok, dane, tekst }` (treść JSON albo `null`, gdy to nie JSON) albo wyjątek sieci `{ blad: <nazwa błędu> }`. Samo nic nie loguje.
- Wpis logu powstaje w jednym miejscu, np. `zalogujOdmowe(sciezka, wynik, klucz)`, i ma postać `Resend odmówił: <ścieżka> <status> <name>: <message>` albo `Resend niedostępny: <ścieżka> <nazwa błędu>`. Ścieżka to `/contacts` albo `/emails`. Gdy treść nie jest JSON, zamiast `name: message` stoi pierwsze 300 znaków treści. Każdy adres e-mail (z `@` albo `%40`) zastępuje `<adres>`, a dokładny klucz `<klucz>`.
- Sekwencja:
  1. `POST /contacts`.
  2. Przy odpowiedzi HTTP innej niż 2xx: `GET /contacts/{encodeURIComponent(adres)}`. Kontakt istnieje tylko przy 200 i `dane.email` równym adresowi bez rozróżniania wielkości liter. Gdy go nie ma, jeden wpis z odpowiedzią `POST` i 502.
  3. Przy wyjątku sieci na `POST /contacts`: wpis i 502, bez `GET`.
  4. `POST /emails`, a przy niepowodzeniu wpis i 502.
  5. 200.
- Poprawny zapis nowego kontaktu dalej robi dokładnie dwa wywołania (`/contacts`, `/emails`). Komentarz w nagłówku pliku mówi o logu odmów i o istniejącym kontakcie.

#### 2. Logi Cloudflare

**File**: `worker/wrangler.toml`

**Intent**: Włączyć Workers Logs (plan Free), żeby wpisy `console.error` funkcji były do odczytania po awarii.

**Contract**: Sekcja `[observability]` z `enabled = true` i komentarzem, po co jest.

#### 3. Testy funkcji

**File**: `tests/repo/funkcja-zapisu.spec.ts`

**Intent**: Dodać nowe testy N1–N3 i test nagłówka `User-Agent`. Istniejące testy i ich oczekiwania zostają bez zmian (N9).

**Contract**: Nowe testy z przedrostkiem nazwy „funkcja zapisu — …”. Każdy podmienia `console.error` na czas testu, zbiera wpisy i przywraca oryginał w `finally`:
- N1: atrapa odpowiada 401 `{"statusCode":401,"name":"restricted_api_key","message":"… wlasciciel@example.com … anna@example.com …"}` osobno na `/contacts` (a na `GET` 404 `not_found`) i na `/emails`. Za każdym razem 502 i dokładnie jeden wpis, który zawiera ścieżkę, `401`, `restricted_api_key` i `<adres>`, a nie zawiera `klucz-atrapy`, `anna@example.com`, `wlasciciel@example.com` ani `anna%40example.com`. Do tego przypadek treści, która nie jest JSON (403 `error code: 1010`): jeden wpis z `/contacts` i `403`.
- N2: atrapa rzuca `TypeError` na `/contacts` i na `/emails`. Za każdym razem 502 i jeden wpis ze ścieżką i `TypeError`, bez klucza i adresów.
- N3: atrapa odpowiada na `POST /contacts` 409, a w drugim przebiegu 422, z `name`/`message` „already exists”. Na `GET /contacts/anna%40example.com` odpowiada 200 `{"object":"contact","id":"…","email":"Anna@Example.com"}`. Wynik to 200 `{"ok":true}`, wywołania `[POST /contacts, GET /contacts/anna%40example.com, POST /emails]`, e-mail do `wlasciciel@example.com` i zero wpisów `console.error`. Jeszcze jeden przypadek: `GET` zwraca inny `email`, co daje 502 i jeden wpis.
- `User-Agent`: poprawny zapis ma na obu wywołaniach `User-Agent` równy `maestro-waitlist/1.0`.
- Atrapa zapisuje metodę wywołania (`init.method`). Dopisanie pola do typu `Wywolanie` nie zmienia oczekiwań starych testów.

#### 4. Rejestr ograniczeń

**File**: `context/foundation/limitations.md`

**Intent**: D-013 zostawia tylko dzienny limit 100 e-maili Resend Free, bo część o ponownym zapisie zamyka N3.

**Contract**: Wpis D-013: tytuł, `Pytanie` i `Wybór` tylko o limicie dziennym, dopisek, że ponowny zapis rozwiązała zmiana naprawa-listy-oczekujacych (N3). `Status` dalej `obowiązuje`.

### Success Criteria:

#### Automated Verification:

- Testy funkcji przechodzą, w tym nowe testy N1–N3 i `User-Agent`: `npx playwright test -c playwright.bez-przegladarki.config.ts --project repo tests/repo/funkcja-zapisu.spec.ts`
- Stare testy z `tests/repo/funkcja-zapisu.spec.ts` mają te same oczekiwania co na `HEAD` przed fazą: `git diff` tego pliku dodaje nowe testy i pole metody atrapy, a nie zmienia ani nie usuwa linii `expect` starych testów: `! git diff -U0 main -- tests/repo/funkcja-zapisu.spec.ts | grep -E '^-\s*expect'`
- `worker/wrangler.toml` ma `[observability]` z `enabled = true`: `grep -A1 '^\[observability\]' worker/wrangler.toml`
- Pełne sprawdzenie przechodzi: `npm ci && npm run verify`

---

## Phase 2: Ścieżka na żywo `zapis-na-liste`

**Criteria**: N5, N6, N7, N8, N10

### Overview

Skrypt ścieżki uruchamia lokalnie funkcję z prawdziwym Resend, ustala przyczynę 502 żądaniem diagnostycznym i sprawdza zapis do stanu końcowego. Dochodzi do niego test na atrapie i linia w `CLAUDE.md`. Wyniki N7 i N8 daje przebieg tego skryptu w kroku autopilota `przygotowanie-wdrozenia`, a N10 zapis obserwatora po publikacji. Oba wpisuje do raportu kawałka sesja główna, więc ta faza ma tylko wiersze Automated. Raport kawałka to plik `raport.md` w folderze tej zmiany (po kroku `archiwum` w jej folderze w `context/archive/`). Sesja główna pisze go na końcu kawałka. Przyczynę 502 (ścieżka wywołania, status, `name` i `message`) bierze z linii skryptu w logu kroku `.autopilot-local/naprawa-listy-oczekujacych/*-przygotowanie-wdrozenia.log`, a do tego dopisuje poprawkę, która ją usuwa, i wynik N10. N7, N8 i N10 ocenia się po krokach `przygotowanie-wdrozenia` i `wynik-wdrozenia`, a nie w impl-review, które biegnie wcześniej (CHAIN, autopilot.py:444).

### Changes Required:

#### 1. Skrypt ścieżki

**File**: `scripts/na-zywo.mjs`

**Intent**: Jedno polecenie bez powłoki i bez zależności spoza Node. Czyta klucz Resend i adres właściciela z plików z `## Dostępy`, robi diagnostykę i właściwy zapis na lokalnej instancji funkcji, sprawdza Resend i zapisuje plik wyniku według kontraktu autopilota, bez sekretów na wyjściu.

**Contract**:
- Wejście: `PORT`, `NA_ZYWO_ADRES`, `NA_ZYWO_WYNIK` i `NA_ZYWO_SCIEZKA` (oczekiwane `zapis-na-liste`). Z `process.cwd()` skrypt czyta `CLAUDE.md`: `## Dostępy`, linie `- klucz API Resend: <ścieżka>` i `- adres e-mail właściciela: <ścieżka>`, ścieżka z lewymi apostrofami albo bez. Stamtąd czyta też `context/foundation/start.md` (`## Ścieżki na żywo`, linia `- zapis-na-liste:`, tekst po `stan końcowy: ` do ` · `). Funkcję importuje z `../worker/index.ts` względem pliku skryptu.
- Brak pliku, linii albo wartości daje `nie przeszło` z powodem bez treści pliku. `zablokowane` jest tylko dla odmowy Resend (`/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`), bo `zablokowane` pozwala scalić bez `przeszło` (autopilot.py:6513-6514).
- Kroki:
  1. Diagnostyka: `https.request` `POST https://api.resend.com/contacts`, tylko z `Authorization` i `Content-Type`, z treścią `{"email":<adres właściciela>}`. Wynik idzie do `dowod` i na stdout jako `diagnostyka (jak w Workers, bez User-Agent): POST /contacts <status> <name|początek treści>`.
  2. Owinięcie `globalThis.fetch` obserwatorem wywołań Resend: odpowiedź bez zmian, zapis klona.
  3. Serwer `node:http` na `127.0.0.1:$PORT`. Przekłada żądanie na `Request` i woła `funkcja.fetch(request, env)`. `env` ma klucz, adres właściciela i `LIMIT` z `LimitZapisow` na `Map`.
  4. `POST $NA_ZYWO_ADRES` z `Origin: https://lukeblonski.github.io` i treścią `{"email":<adres właściciela>,"website":""}`.
  5. `GET /contacts/{adres}` z `User-Agent`.
  6. `GET /emails/{id}` z `id` z obserwatora, do `last_event` `sent` albo `delivered` (co 3 s, do 90 s).
- Wyjście: plik `$NA_ZYWO_WYNIK` z polami `sciezka`, `adres` (`NA_ZYWO_ADRES`), `atrapy` (`globalThis.ATRAPY_NA_ZYWO` albo `[]`), `uslugi` (`["api.resend.com"]`), `stan_koncowy` (dosłownie ze `start.md`, tylko przy `przeszło`), `dowod`, `wynik` i `powod`.
- `dowod` ma diagnostykę, każde wywołanie funkcji do Resend (metoda, ścieżka, status, `name`), odpowiedź funkcji, stan kontaktu i `last_event`. `powod` przy odmowie Resend ma ścieżkę wywołania, status, `name` i `message`.
- Autopilot nie zachowuje `dowod`: plik wyniku znika z worktree (autopilot.py:6331-6333), a do stanu trafiają tylko `wynik` i `powod`. Skrypt wypisuje więc na stdout, przez `scrub()`, jedną linię na każde zaobserwowane wywołanie Resend (metoda, ścieżka bez adresu, status, `name`, `message`) i na końcu linię `wynik: <wynik> — <powod>`. Prawdziwa odpowiedź Resend zostaje w logu kroku `.autopilot-local/naprawa-listy-oczekujacych/<czas>-przygotowanie-wdrozenia.log` (przy ponownym przebiegu `…-merge.log`), także gdy odmawia wywołanie funkcji, a nie diagnostyka.
- Mapowanie wyniku jak w `## Decyzje planu`. Kod wyjścia 0 tylko przy `przeszło`. `finish()` wywołuje się jeden raz, zamyka serwer, a obsługa sygnałów i wyjątków zawsze zapisuje plik wyniku. Ogólny limit czasu skryptu to 10 min.
- Każdy wypisany i zapisany tekst przechodzi przez `scrub()`: klucz, adres właściciela w każdej wielkości liter i w postaci `%40` oraz każdy adres e-mail zastępuje znacznik.

#### 2. Atrapa Resend dla testu skryptu

**File**: `tests/repo/atrapa-resend.mjs`

**Intent**: Moduł ładowany przez `node --import` tylko w teście. Gra Resend dla `fetch` i dla `https.request`, oznacza się w `globalThis.ATRAPY_NA_ZYWO` i odrzuca każdy inny host niż `127.0.0.1`.

**Contract**: Scenariusz z `ATRAPA_RESEND_SCENARIUSZ`: `sukces` albo `klucz-tylko-wysylka`. Przy `sukces` jest:
- 403 `error code: 1010` (nie JSON) na żądanie bez `User-Agent`;
- 201 na `POST /contacts` z `User-Agent`;
- 200 z `email` na `GET /contacts/…`;
- `{id}` na `POST /emails`;
- `last_event: "delivered"` na `GET /emails/{id}`.

Przy `klucz-tylko-wysylka` każde `/contacts` dostaje 401 `restricted_api_key` z adresem właściciela w `message`. Każde wywołanie (metoda, ścieżka, czy był `User-Agent`) trafia jako linia JSON do pliku `ATRAPA_RESEND_ZAPIS`. Te zmienne czyta tylko atrapa, nie skrypt.

#### 3. Test skryptu bez sieci

**File**: `tests/repo/na-zywo.spec.ts`

**Intent**: Uruchomić skrypt jako proces potomny na atrapie i sprawdzić pola pliku wyniku oraz brak wartości sekretów na wyjściu (N6). Test nie czyta plików z `## Dostępy`.

**Contract**: Testy „skrypt na żywo — …”. Katalog tymczasowy ma:
- własny `CLAUDE.md` z `## Dostępy`, który wskazuje pliki tymczasowe z kluczem `klucz-atrapy-na-zywo` i adresem `Wlasciciel@Example.com`;
- kopię `context/foundation/start.md`.

Uruchomienie: `process.execPath --import <atrapa> <repo>/scripts/na-zywo.mjs`, z `cwd` w tym katalogu, wolnym `PORT`, `NA_ZYWO_ADRES=http://127.0.0.1:<port>`, `NA_ZYWO_WYNIK` i `NA_ZYWO_SCIEZKA`, z limitem czasu.

- Scenariusz `sukces`:
  - kod 0;
  - `wynik` `przeszło`;
  - `sciezka`, `adres`, `uslugi` z `api.resend.com`;
  - `atrapy` równe `["api.resend.com"]`;
  - `stan_koncowy` równy tekstowi ze `start.md`;
  - `dowod` z `diagnostyka` i `1010`;
  - zapis atrapy pokazuje pierwsze wywołanie bez `User-Agent`, a wywołania funkcji z nim.
- Scenariusz `klucz-tylko-wysylka`:
  - `wynik` `zablokowane`;
  - `powod` zawiera `/contacts`, `401`, `restricted_api_key` i `<adres>`;
  - stdout ma linię wywołania `/contacts` z `401` i `restricted_api_key` oraz końcową linię `wynik: zablokowane — …`.
- Brak dostępu: `CLAUDE.md` w katalogu tymczasowym bez linii klucza Resend daje `wynik` `nie przeszło` i kod wyjścia różny od 0.

W obu scenariuszach stdout, stderr i plik wyniku nie zawierają `klucz-atrapy-na-zywo` ani adresu właściciela w żadnej wielkości liter i w postaci `%40`.

#### 4. Linia ścieżki i opis sprawdzenia w `CLAUDE.md`

**File**: `CLAUDE.md`

**Intent**: Dodać sekcję, z której autopilot bierze polecenie ścieżki, i dopisać nowe testy do opisu `## Verify`. `## Dostępy` i `## Wdrożenie` zostają bez zmian.

**Contract**:
- Nowa sekcja `## Sprawdzenie na żywo` po `## Uruchomienie lokalne`. Ma linię `` - zapis-na-liste: `node scripts/na-zywo.mjs` `` (jedno polecenie, bez `|`, `&&` i przekierowań) i jedno zdanie, co skrypt robi i że uruchamia go tylko skrypt autopilota.
- `## Verify`: opis testów `repo` wymienia testy „skrypt na żywo — …” na atrapie Resend, bez sieci. „Last passing run” aktualizuje się po przejściu `npm run verify`.

### Success Criteria:

#### Automated Verification:

- Test skryptu na atrapie przechodzi: `npx playwright test -c playwright.bez-przegladarki.config.ts --project repo tests/repo/na-zywo.spec.ts`
- `CLAUDE.md` ma dokładnie jedną linię ścieżki z jednym poleceniem bez powłoki: `grep -n '^- zapis-na-liste: `node scripts/na-zywo.mjs`$' CLAUDE.md`
- Skrypt nie importuje nic spoza modułów wbudowanych Node i `../worker/index.ts`: `! grep -nE "(from|import\()\s*['\"]" scripts/na-zywo.mjs | grep -vE "['\"](node:[a-z_/]+|\.\./worker/index\.ts)['\"]"`
- `package.json` jest bez zmian: `git diff --exit-code main -- package.json package-lock.json`
- Pełne sprawdzenie przechodzi: `npm ci && npm run verify`

---

## Testing Strategy

### Unit Tests:

- Funkcja (faza 1):
  - jeden wpis logu na odmowę `/contacts` i `/emails`, także przy treści, która nie jest JSON;
  - zastępowanie adresów w `message` (także `%40`) i brak klucza;
  - wyjątek sieci;
  - istniejący kontakt przy 409 i 422 oraz przy `GET` z innym adresem;
  - `User-Agent` na obu wywołaniach;
  - stare testy L1–L11 bez zmian.

### Integration Tests:

- Skrypt ścieżki (faza 2) jako proces potomny:
  - serwer na `127.0.0.1:$PORT`;
  - diagnostyka bez `User-Agent` przez `node:https`;
  - zapis przez funkcję i odpytanie kontaktu i e-maila;
  - plik wyniku w kontrakcie `live_verdict`;
  - `zablokowane` przy odmowie klucza;
  - brak sekretów na wyjściu.
- Prawdziwy Resend sprawdza tylko autopilot (`przygotowanie-wdrozenia`, potem ewentualnie `merge`), a opublikowaną funkcję obserwator po publikacji (N10).

## Performance Considerations

Ścieżka sukcesu dalej robi dwa wywołania Resend. `GET /contacts` idzie tylko po nieudanym `POST`. Skrypt robi kilka sekwencyjnych żądań, daleko od limitu 10 żądań/s Resend. Jedno sprawdzenie wysyła jeden e-mail z dziennego limitu 100.

## Migration Notes

Bez migracji danych. Publikacja przez istniejący workflow czyta nowe `[observability]` z `worker/wrangler.toml`. Gdy sprawdzenie na żywo da `zablokowane` z powodu klucza, nowy klucz trafia do pliku z `## Dostępy`, a przy publikacji do sekretu poleceniem z `## Wdrożenie`, bez zmian w tym planie.

## References

- Research: `context/changes/naprawa-listy-oczekujacych/research.md`
- Kontrakt autopilota: `/home/fabryka/fabryka/scripts/autopilot.py:6205-6240`, `:6250-6333`, `:6009-6065`
- Reguły skryptu ścieżki: `/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`
- Wzór skryptu: `/home/fabryka/projekty/legit/scripts/na-zywo.mjs:115-167`
- Wzór `env` funkcji: `tests/repo/funkcja-zapisu.spec.ts:51-71`

## Plan Changes

> Append-only. One entry per departure from the plan, written in the same commit as the phase. See `references/progress-format.md`.

- **PC1 (Phase 1)**: Kryterium 1.1 biegnie jako `npx playwright test -c playwright.bez-przegladarki.config.ts --project=repo tests/repo/funkcja-zapisu.spec.ts` (`--project=repo` zamiast `--project repo`).
  - **Why**: w Playwright 1.65 `--project` przyjmuje wiele wartości, więc polecenie z planu bierze ścieżkę pliku za nazwę projektu i kończy się błędem `Project(s) "tests/repo/funkcja-zapisu.spec.ts" not found`, zanim uruchomi testy; `--project=repo` uruchamia ten sam plik w tym samym projekcie. To samo dotyczy kryterium 2.1 fazy 2.
  - **Criteria**: N1, N2, N3, N9
  - **Files**: none
- **PC2 (Phase 2)**: Kryterium 2.1 biegnie jako `npx playwright test -c playwright.bez-przegladarki.config.ts --project=repo tests/repo/na-zywo.spec.ts` (`--project=repo` zamiast `--project repo`), jak kryterium 1.1 w PC1.
  - **Why**: Playwright 1.65 bierze ścieżkę pliku po `--project repo` za drugą nazwę projektu i kończy się błędem `Project(s) "tests/repo/na-zywo.spec.ts" not found`, zanim uruchomi testy; `--project=repo` uruchamia ten sam plik w tym samym projekcie.
  - **Criteria**: N6
  - **Files**: none

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Funkcja zapisu — log odmów, User-Agent, istniejący kontakt, logi Cloudflare

#### Automated

- [x] 1.1 Testy funkcji przechodzą, w tym nowe testy N1–N3 i `User-Agent` — ac4712e
- [x] 1.2 Stare testy z `tests/repo/funkcja-zapisu.spec.ts` mają te same oczekiwania co przed fazą — ac4712e
- [x] 1.3 `worker/wrangler.toml` ma `[observability]` z `enabled = true` — ac4712e
- [x] 1.4 Pełne sprawdzenie przechodzi: `npm ci && npm run verify` — ac4712e

### Phase 2: Ścieżka na żywo `zapis-na-liste`

#### Automated

- [x] 2.1 Test skryptu na atrapie przechodzi
- [x] 2.2 `CLAUDE.md` ma dokładnie jedną linię ścieżki z jednym poleceniem bez powłoki
- [x] 2.3 Skrypt nie importuje nic spoza modułów wbudowanych Node i `../worker/index.ts`
- [x] 2.4 `package.json` jest bez zmian
- [x] 2.5 Pełne sprawdzenie przechodzi: `npm ci && npm run verify`
