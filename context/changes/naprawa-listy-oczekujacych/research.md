---
date: 2026-11-18T14:10:00+00:00
researcher: Claude (10x-research, krok autopilota)
git_commit: f266073a5844054bdb7264324000fa11a28929bd
branch: naprawa-listy-oczekujacych
repository: lukeblonski/www-maestro
topic: "Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria N1–N10 zmiany naprawa-listy-oczekujacych"
tags: [research, codebase, worker, resend, cloudflare-workers-logs, na-zywo, autopilot]
status: complete
last_updated: 2026-11-18
last_updated_by: Claude (10x-research, krok autopilota)
---

# Research: co jest, a czego brakuje dla naprawy listy oczekujących

**Date**: 2026-11-18T14:10:00+00:00
**Researcher**: Claude (10x-research, krok autopilota)
**Git Commit**: f266073a5844054bdb7264324000fa11a28929bd
**Branch**: naprawa-listy-oczekujacych (gałąź nie jest wypchnięta, więc odnośniki są lokalne, bez permalinków)
**Repository**: lukeblonski/www-maestro

## Research Question

Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji N1–N10 z `context/changes/naprawa-listy-oczekujacych/change.md`?

## Summary

**Co już jest.** Funkcja zapisu `worker/index.ts` działa według S-02 (Origin, pole-pułapka, limity 5/min, 10/dobę i 90/dobę w obiekcie `LimitZapisow`, potem `POST /contacts` i `POST /emails`). Testy `tests/repo/funkcja-zapisu.spec.ts` uruchamiają ją w samym Node, bez nowej zależności. Atrapą Resend jest podmieniony `globalThis.fetch`, a obiekt limitu działa na `Map`. Autopilot Factory ma gotowy mechanizm sprawdzenia na żywo. Uruchamia polecenie z `## Sprawdzenie na żywo` w `CLAUDE.md`, ocenia JSON z `$NA_ZYWO_WYNIK` i maskuje wartości z `## Dostępy`. Ścieżka `zapis-na-liste` z dosłownym stanem końcowym jest już w `context/foundation/start.md:71` i w roadmapie (`roadmap.md:111`).

**Czego brakuje.**
- Funkcja nie loguje odpowiedzi Resend. `wywolajResend` zwraca sam `boolean` (`worker/index.ts:147-158`).
- Nie wysyła nagłówka `User-Agent`.
- Nie odróżnia kontaktu, który już istnieje, od błędu.
- `worker/wrangler.toml` nie ma `[observability]`.
- `CLAUDE.md` nie ma sekcji `## Sprawdzenie na żywo`.
- W repo nie ma skryptu ścieżki ani testu tego skryptu na atrapie.
- Nie ma testów N1–N3.

**Najważniejsze ustalenie: najbardziej prawdopodobna przyczyna 502.** Dokumentacja Resend (pobrana 2026-11-18) mówi, że każde żądanie do API musi mieć nagłówek `User-Agent`, a bez niego dostaje 403 z kodem 1010, zanim trafi do API. Runtime Cloudflare Workers (workerd) sam tego nagłówka nie dodaje: zgłoszenie cloudflare/workerd#4711 jest otwarte, a opiekunowie piszą, że runtime świadomie go nie wstawia. `worker/index.ts:149-153` wysyła tylko `Authorization` i `Content-Type`. Pierwsze wywołanie (`POST /contacts`) dostaje więc 403 i funkcja odpowiada 502. Pasuje to do obserwacji: 502 i brak e-maila.

Druga kandydatka to klucz z uprawnieniem „Sending access”, który na `/contacts` dostaje 401 `restricted_api_key`. Ten błąd też daje 502 przed wysłaniem e-maila.

To nadal hipoteza z dokumentacji, nie dowód. Kryterium N8 wymaga przyczyny z prawdziwej odpowiedzi.

**Pułapka dla sprawdzenia na żywo.** Node sam dodaje `User-Agent: node`: sprawdzone lokalnie, Node v22.23.5, `fetch` na lokalny serwer. Lokalna instancja w Node nie odtworzy więc błędu 1010. Gdy przyczyną jest brak nagłówka, sprawdzenie na żywo w Node przejdzie także na kodzie bez poprawki, a log nie pokaże przyczyny, której wymaga N8. Plan musi zdecydować, jak ustalić przyczynę z prawdziwej odpowiedzi (patrz „Decyzje dla planu”).

**Ponowny zapis (N3).** Żadne oficjalne źródło Resend nie mówi, co zwraca `POST /contacts` dla istniejącego adresu (sprawdzone: dokumentacja, OpenAPI, SDK Node, changelog). Odporny wariant nie zależy od tej odpowiedzi. Gdy `POST /contacts` nie zwróci 2xx, funkcja pyta `GET /contacts/{email}` i traktuje 200 z tym samym `email` jako istniejący kontakt. Wtedy dzisiejszy test „błąd Resend daje 5xx” przechodzi bez zmian (szczegóły niżej).

## Detailed Findings

### 1. Funkcja zapisu (`worker/index.ts`): stan dziś

- `RESEND = "https://api.resend.com"` jest stałą (`worker/index.ts:25`), a nadawcą jest `onboarding@resend.dev` (`:26`).
- `wywolajResend(sciezka, klucz, tresc)` (`:147-158`) robi zawsze `POST` z nagłówkami `Authorization` i `Content-Type`. Zwraca `wynik.ok`, a wyjątek sieci daje `false`. Treści ani statusu odpowiedzi nie czyta i nic nie loguje. Brak nagłówka `User-Agent`.
- Kolejność wywołań to najpierw `/contacts` (`:199-200`), potem `/emails` (`:202-208`). Każde niepowodzenie daje `odpowiedz(502, false, cors)`.
- Komentarz w pliku (`:11-12`) mówi, że plik nie importuje `cloudflare:workers`, bo testy uruchamiają go w Node. Ta sama właściwość pozwala skryptowi ścieżki uruchomić funkcję bez narzędzia Cloudflare.
- Treść e-maila to `Email: ${adres}` (`:206`), a adres odbiorcy pochodzi z `env.OWNER_EMAIL` (`:204`).

**Czego brakuje dla N1, N2, N3 i dla poprawki:**
- Wpis `console.error` przy odmowie i przy wyjątku sieci. Ma zawierać ścieżkę (`/contacts` albo `/emails`), status oraz `name` i `message` z treści, z adresami e-mail zastąpionymi znacznikiem. Treść błędu Resend ma postać `{"statusCode","name","message"}`. Odpowiedź 403/1010 to strona Cloudflare, nie JSON Resend, więc parser musi znieść treść, która nie jest JSON. Komunikat trybu testowego Resend zawiera adres konta, co potwierdza dokumentacja. Zastępowanie adresów jest więc konieczne, nie ostrożnościowe.
- Jawny nagłówek `User-Agent` (np. `maestro-waitlist/1.0`). Ta poprawka nie zależy od runtime'u, więc w Node i w Workers żądanie jest takie samo.
- Obsługa istniejącego kontaktu (N3).

### 2. Testy funkcji (`tests/repo/funkcja-zapisu.spec.ts`) a N1–N3 i N9

- Atrapa Resend (`:17-33`) przechwytuje `globalThis.fetch`. Rzuca błąd dla adresów spoza `https://api.resend.com/` i zapisuje `url`, `tresc` (z `JSON.parse(init.body ?? "{}")`) oraz nagłówki. Domyślna odpowiedź to `Response.json({ id: "atrapa" })` (status 200).
- Test „poprawny zapis” (`:87-107`) oczekuje **dokładnie** dwóch wywołań, `[/contacts, /emails]`, oraz nagłówków `Authorization` i `Content-Type`. Dodatkowy `User-Agent` go nie łamie, bo test sprawdza tylko te dwa nagłówki. Dodatkowe wywołanie na ścieżce sukcesu by go złamało, więc sprawdzanie kontaktu (`GET`) może być tylko po nieudanym `POST /contacts`.
- Testy limitów liczą wywołania: 10, 20 i 180 (`:143`, `:157`, `:188`, `:199`). To też wymaga, żeby ścieżka sukcesu robiła dokładnie dwa wywołania.
- Test „błąd Resend daje 5xx” (`:222-238`) odpowiada 500 `{message:"atrapa błędu"}` tylko na dokładny adres `https://api.resend.com/contacts`. Na każdy inny adres, także `GET https://api.resend.com/contacts/anna%40example.com`, odpowiada 200 `{id:"atrapa"}`. Gdy funkcja po nieudanym `POST` uzna samo 200 z `GET` za istniejący kontakt, zapis przejdzie (200) i test padnie, a N9 zakazuje zmiany jego oczekiwań. Sprawdzanie kontaktu musi więc wymagać w odpowiedzi pola `email` równego zapisywanemu adresowi (bez rozróżniania wielkości liter). Atrapa zwraca `{id}` bez `email`, więc test zostaje zielony.
- W tym samym teście atrapa rzuca `TypeError` (`:233-237`), czyli przypadek N2. Dziś test sprawdza tylko status ≥ 500. Wpis `console.error` nowe testy N2 sprawdzają osobno, podmieniając `console.error`.
- **Brakuje** nowych testów:
  - N1: 401 `restricted_api_key` na `/contacts` i na `/emails`, a komunikat zawiera adres właściciela i adres odwiedzającego. Test sprawdza dokładnie jeden wpis i brak `klucz-atrapy`, `anna@example.com` i `wlasciciel@example.com`.
  - N2: wyjątek sieci daje jeden wpis z rodzajem błędu.
  - N3: odpowiedź „kontakt istnieje” na `POST /contacts`, potem `GET` z `email`, i wynik 200 `{ok:true}` z e-mailem do właściciela.

### 3. `worker/wrangler.toml` (N4)

- Plik ma `name`, `main`, `compatibility_date = "2026-11-01"`, `workers_dev`, wiązanie `LIMIT` i migrację `v1` (`worker/wrangler.toml:5-16`). Nie ma `[observability]`.
- Składnia z dokumentacji Cloudflare to `[observability]` i `enabled = true`, z opcjonalnym `head_sampling_rate` (domyślnie 1). Workers Logs działa na planie Free: 200 000 zdarzeń dziennie, przechowywane 3 dni. Od 1 grudnia 2026 plan Free ma 0,5 GB dziennie i 7 dni, a po przekroczeniu zbieranie staje do północy UTC. Źródła: https://developers.cloudflare.com/workers/observability/logs/workers-logs/ oraz https://developers.cloudflare.com/observability/pricing/, pobrane 2026-11-18.
- `console.error` jest wspierany i trafia do logów czasu rzeczywistego. Strona Workers Logs wymienia wprost tylko `console.log` i „errors”. To bardzo silna przesłanka, ale nie dosłowne zdanie z dokumentacji.
- `.github/workflows/pages.yml` jest chroniony (`.claude/guardrails.json`: `.github/workflows/**`) i według change.md zostaje bez zmian. Publikacja funkcji akcją `cloudflare/wrangler-action` czyta `wrangler.toml`, więc zmiana w tym pliku wystarczy.

### 4. Sprawdzenie na żywo: kontrakt autopilota (N5, N6, N7)

Źródło: `/home/fabryka/fabryka/scripts/autopilot.py`.
- **Parsowanie.** Sekcja `## Sprawdzenie na żywo` (`autopilot.py:597`), linie `- <nazwa>: \`<polecenie>\`` (`live_commands`, `:6106-6119`, `re.fullmatch(r"\`([^\`]+)\`", …)`). Linia bez lewych apostrofów jest pomijana. Sekcja nie należy do sekcji startu (`sekcje_startu`, `:5641`, `:5679`), więc gałąź zmiany może ją dopisać bez nowej zgody. Zmiana `## Dostępy` zatrzymałaby autopilota po zgodę.
- **Uruchomienie** (`live_one` i `live_command`, `:6250-6333`).
  - Polecenie biegnie w świeżym `git worktree add --detach …/na-zywo-<hex> <sha>`. Ten katalog nie ma `node_modules` ani `out/`.
  - `shlex.split` i `Popen` bez powłoki, `stdin=DEVNULL`, stdout i stderr do jednego pliku. Grupa procesów jest zabijana po zakończeniu.
  - Limit czasu to 1200 s (`:621`). Przekroczenie daje kod 124, a brak programu kod 127.
  - Środowisko to środowisko autopilota oraz `PATH` z shimami mise, `PORT`, `NA_ZYWO=1`, `NA_ZYWO_SCIEZKA`, `NA_ZYWO_ADRES=http://127.0.0.1:<port>` i `NA_ZYWO_WYNIK=<worktree>/.na-zywo-wynik.json`. Wartości z `## Dostępy` **nie** trafiają do środowiska, skrypt czyta pliki sam.
- **Kiedy.** W kroku `przygotowanie-wdrozenia` na `HEAD` po CI gałęzi (`:6469-6482`, `:7159`). W kroku `merge` na czubku gałęzi, ponownie tylko wtedy, gdy diff od sprawdzonego commitu dotyka plików spoza `context/`, gdy wyniku brak albo gdy jest `zablokowane` (`:6521-6572`). W praktyce prawdziwy zapis może więc pójść dwa razy, a drugi raz to **ponowny zapis istniejącego kontaktu**.
- **Ocena** (`live_verdict`, `:6205-6240`), w tej kolejności:
  1. Brak pliku albo plik, który nie jest JSON, daje `nie przeszło`.
  2. `sciezka` musi równać się `zapis-na-liste`.
  3. `wynik == "zablokowane"` daje `zablokowane` z polem `powod`, niezależnie od kodu wyjścia.
  4. Kod wyjścia ≠ 0 daje `nie przeszło`.
  5. `wynik` musi być `przeszło`.
  6. Host i port w `adres` muszą równać się `NA_ZYWO_ADRES` i nie mogą być adresem z `## Wdrożenie`.
  7. `atrapy` musi być dokładnie `[]`.
  8. `uslugi` musi być niepustą listą napisów.
  9. `stan_koncowy` musi być **dosłownie** tekstem ze `start.md:71` na gałęzi głównej.
  10. `dowod` musi być niepusty.
- **Skutki.**
  - `nie przeszło` zatrzymuje autopilota. Sesja naprawia kod aplikacji najwyżej 3 razy, a samego polecenia ścieżki nie zmienia (`/home/fabryka/fabryka/docs/zgody-i-bramki.md:45-51`).
  - `zablokowane` daje jedno pytanie do właściciela (`:6458-6465`, `zgody-i-bramki.md:52-54`). Według reguły kawałka odmowa usługi to `zablokowane`, nie `nie przeszło` (`docs/sesja/kawalek-intencja.md:14`).
  - Scalenie wymaga wyniku dla sprawdzanego commitu (`live_gaps`, `:6499-6518`), a N7 wymaga `przeszło`.
- **Maskowanie** (`live_secrets` i `mask_secrets`, `:6009-6065`). Autopilot czyta wartości plików z `## Dostępy` i zastępuje każde dokładne wystąpienie znakiem `<ukryte: <nazwa>>` w poleceniu, wyjściu i pliku wyniku. Inna wielkość liter albo inne kodowanie adresu (np. `%40` w URL `GET /contacts/{email}`) **nie** zostanie ukryte. Skrypt musi sam zastępować adresy znacznikiem, a URL z adresem nie może trafić do wyjścia.
- **Log i zapis.** Log trafia do `.autopilot-local/<id>/<czas>-przygotowanie-wdrozenia.log` albo `…-merge.log` jako linie `$ <polecenie>`, wyjście, `kod N` i `na żywo: zapis-na-liste: <wynik> (<powód>)`. Pole zaufane `na_zywo` leży poza repo. `context/przebiegi/<id>.md` dostaje linię `- zapis-na-liste: przeszło (commit …)` (`live_record_lines`, `:5051-5063`).
- **Wzór skryptu** w innym projekcie Factory: `/home/fabryka/projekty/legit/scripts/na-zywo.mjs`. `finish()` zawsze zapisuje plik wyniku, `stan_koncowy` wpisuje tylko przy `przeszło`, czyści sekrety z `dowod` i `powod` i kończy kodem 0 tylko przy `przeszło`. Parser `## Dostępy` w tym wzorze oczekuje ścieżki w lewych apostrofach. **W www-maestro ścieżki są bez apostrofów** (`CLAUDE.md`, `## Dostępy`: `- klucz API Resend: /home/…/resend-api-key`), więc parser trzeba dopasować do formatu `- <nazwa>: <ścieżka>`.

### 5. Skrypt ścieżki: co da się zrobić bez nowej zależności

- Node v22.23.5 (`mise.toml`) importuje `worker/index.ts` bez zależności, bo usuwa typy i sam rozpoznaje moduł ES. Sprawdziła to wcześniejsza część researchu, bez sieci. Skrypt `scripts/<nazwa>.mjs` może więc:
  1. wystawić `node:http` na `127.0.0.1:$PORT`;
  2. przekazać żądanie do `funkcja.fetch(request, env)`, gdzie `env` to klucz i adres z plików z `## Dostępy` oraz `LIMIT` na `LimitZapisow` z `Map`, jak `srodowisko()` w testach (`funkcja-zapisu.spec.ts:51-71`);
  3. wysłać `POST` na `NA_ZYWO_ADRES` z `Origin: https://lukeblonski.github.io` i treścią `{"email":<adres właściciela>,"website":""}`;
  4. zapytać Resend `GET /contacts/{email}` oraz o e-mail: `GET /emails/{id}`, gdzie pole `last_event` ma wartości `sent`, `delivered`, `queued` i inne, albo listę `GET /emails`.
- **Skąd identyfikator e-maila.** Funkcja zwraca klientowi tylko `{ok:true}`. Skrypt może:
  - (a) obserwować wychodzący `fetch` funkcji w swoim procesie: przepuszcza żądanie do prawdziwego Resend bez zmian i zapisuje `id` z odpowiedzi `POST /emails`. To nie jest atrapa, odpowiedzi idą bez zmian.
  - (b) wziąć najnowszy pasujący wpis z `GET /emails?limit=…`.
  Wariant (a) jest dokładny i przy okazji daje skryptowi status, `name` i `message` każdej odmowy do pola `powod` (N6).
- **Stan e-maila.** Zaraz po wysłaniu `last_event` może być `queued`. Stan końcowy wymaga „wysłany albo dostarczony”, więc skrypt musi odpytywać przez krótki czas (limit autopilota to 1200 s).
- **Kolizja z testem „krok 16”.** `tests/repo/zakres-przejecia.spec.ts:61-71` porównuje `package.json` z `5e4dcac` poza `scripts.{test,test:e2e,verify}` i `devDependencies.@playwright/test`. Nowa zależność albo nowy skrypt npm łamie `verify`, chyba że plan dopisze je z nazwy (change.md na to pozwala). Skrypt w `scripts/` oraz `CLAUDE.md` i `worker/` leżą poza `SCIEZKI` (`:9-18`), więc wariant „sam Node” nie dotyka tego testu.
- **Test N6 bez sieci.** Polecenie z `## Verify` biegnie bez sieci i bez plików z `## Dostępy`. Wariant bez nowych zmiennych „obejścia”:
  - test kopiuje się do katalogu tymczasowego, gdzie tworzy własny `CLAUDE.md` z `## Dostępy` wskazującym na pliki tymczasowe z wartościami atrapy;
  - uruchamia skrypt jako proces potomny z `cwd` = ten katalog (autopilot też uruchamia go w korzeniu drzewa roboczego);
  - skrypt bierze `worker/index.ts` względem własnego położenia;
  - Resend zastępuje moduł atrapy ładowany przez `node --import` (`NODE_OPTIONS`), który podmienia `fetch` tylko dla `https://api.resend.com/`;
  - test sprawdza pola pliku wyniku i to, że wyjście nie zawiera wartości atrapowego klucza ani adresu, także w postaci `%40`.

  Otwarte zostaje, czy skrypt pod atrapą ma zgłaszać `atrapy` niepuste. Sam tego nie wie. Autopilot przy prawdziwym przebiegu i tak wymaga `[]`.
- **Gdzie biegnie skrypt.** `tsconfig.json:25-29` obejmuje `**/*.ts`, więc skrypt `.ts` trafi do `typecheck`. Import `…/index.ts` z rozszerzeniem łamie `tsc` (S-02, F2 w `context/archive/2026-11-18-lista-oczekujacych/change.md:147`). Skrypt `.mjs` omija oba problemy.

### 6. Fakty o Resend (pobrane 2026-11-18, bez wywołań API)

| Fakt | Źródło |
| --- | --- |
| Każde żądanie potrzebuje `User-Agent`; bez niego 403, kod 1010, odpowiedź spoza API (nie JSON Resend) | https://resend.com/docs/api-reference/introduction.md (sekcja „User-Agent”), https://resend.com/docs/knowledge-base/403-error-1010.md |
| workerd nie dodaje domyślnego `User-Agent` (zgłoszenie otwarte, opiekunowie za tym, by go nie dodawać) | https://github.com/cloudflare/workerd/issues/4711 |
| Node `fetch` wysyła `User-Agent: node` | sprawdzone lokalnie (Node v22.23.5) |
| Klucz „Sending access” na `/contacts` dostaje 401 `restricted_api_key`, komunikat „This API key is restricted to only send emails” | https://resend.com/docs/api-reference/errors.md |
| Klucz usunięty albo nieistniejący: `validation_error` 400 na zwykłych endpointach i 401 na endpointach wysyłki („API key is invalid”) | jw. |
| Tryb testowy (`resend.dev`): 403 `validation_error`, komunikat zawiera adres konta | jw., https://resend.com/docs/knowledge-base/403-error-resend-dev-domain.md |
| Format błędu `{"statusCode","message","name"}` | nagrania w `resend/resend-node` (`src/contacts/__recordings__`), typ `ErrorResponse` |
| `POST /contacts` przyjmuje samo `email` (kontakty globalne, `audience_id` przestarzałe), a odpowiedź to `{"object":"contact","id":…}` (OpenAPI: 201) | https://resend.com/docs/api-reference/contacts/create-contact.md, OpenAPI `resend/resend-openapi` |
| Dodanie istniejącego kontaktu: **nieopisane** w żadnym oficjalnym źródle | jw. (dokumentacja, OpenAPI, SDK, blog) |
| `GET /contacts/{id_or_email}` zwraca kontakt (`email`, `id`, …); brak kontaktu daje 404 `not_found` | https://resend.com/docs/api-reference/contacts/get-contact.md |
| `GET /emails/{id}`: `last_event` ∈ {`queued`, `sent`, `delivered`, `bounced`, `failed`, …} | https://resend.com/docs/api-reference/emails/retrieve-email.md |
| Odczyt kontaktu i e-maila nie jest wysyłką, więc wymaga klucza z pełnym dostępem | https://resend.com/docs/api-reference/api-keys/create-api-key.md |
| Limit 10 żądań/s na zespół; Free: 100 e-maili/dobę (UTC), 3000/miesiąc | https://resend.com/docs/api-reference/rate-limit.md, https://resend.com/docs/knowledge-base/account-quotas-and-limits.md |

Wniosek dla skryptu ścieżki: jeśli klucz ma tylko „Sending access”, to nawet po poprawce `User-Agent` skrypt dostanie 401 `restricted_api_key` już na `POST /contacts`. Odczyt kontaktu i e-maila przy takim kluczu też nie przejdzie. Wynik to `zablokowane` z tym powodem, a sesja pyta człowieka o nowy klucz z pełnym dostępem. Tak każe change.md, „Ograniczenia”.

### 7. `CLAUDE.md` i pliki zmiany

- `CLAUDE.md` ma `## Verify`, `## Testy w CI`, `## Uruchomienie lokalne`, `## Dostępy` i `## Wdrożenie`, ale nie ma `## Sprawdzenie na żywo` (brakuje dla N5). `## Dostępy` już wymienia polecenie ścieżki jako jedynego czytelnika sekretów poza `npm run dev` i krokiem `przygotowanie-wdrozenia`.
- `## Verify` w `CLAUDE.md` opisuje testy `repo` i ich nazwy. Nowe testy N1–N3 i N6 warto do tego opisu dopisać.
- `context/foundation/limitations.md:99-104` (D-013): część „ponowny zapis” trzeba zmienić albo zamknąć po N3. Część o dziennym limicie 100 e-maili zostaje, change.md „Czego nie robimy”.

## Code References

- `worker/index.ts:25-27`: adres Resend, nadawca i temat e-maila.
- `worker/index.ts:147-158`: `wywolajResend`, bez logu, bez `User-Agent`, tylko `POST`.
- `worker/index.ts:199-210`: kolejność `/contacts`, potem `/emails`, każde niepowodzenie daje 502.
- `worker/wrangler.toml:5-16`: konfiguracja bez `[observability]`.
- `tests/repo/funkcja-zapisu.spec.ts:17-33`: atrapa Resend jako `globalThis.fetch`.
- `tests/repo/funkcja-zapisu.spec.ts:51-71`: `srodowisko()` z `LimitZapisow` na `Map`, wzór dla skryptu ścieżki.
- `tests/repo/funkcja-zapisu.spec.ts:87-107`: dokładnie dwa wywołania na ścieżce sukcesu.
- `tests/repo/funkcja-zapisu.spec.ts:222-238`: błąd Resend daje 5xx, a atrapa odpowiada 200 `{id}` na inne adresy.
- `tests/repo/zakres-przejecia.spec.ts:9-35,61-71`: „krok 16”, czyli `SCIEZKI`, `PLIKI_ZMIAN` i porównanie `package.json`.
- `context/foundation/start.md:71`: ścieżka `zapis-na-liste` z dosłownym stanem końcowym.
- `context/foundation/roadmap.md:98-111`: S-03, pole „Na żywo: zapis-na-liste”.
- `context/foundation/limitations.md:99-104`: D-013.
- `/home/fabryka/fabryka/scripts/autopilot.py:597,621-622,6009-6065,6106-6119,6205-6240,6250-6333,6420-6572`: kontrakt sprawdzenia na żywo.
- `/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`: reguły skryptu ścieżki: jedno polecenie, bez atrapy, `PORT`, `127.0.0.1`, `zablokowane` przy odmowie usługi.
- `/home/fabryka/projekty/legit/scripts/na-zywo.mjs:115-167`: wzór czytania `## Dostępy` i `finish()`.

## Architecture Insights

- Funkcja jest celowo przenośna między Workers a Node: nie importuje `cloudflare:workers`, a typy wiązań ma u siebie. Dzięki temu testy i skrypt ścieżki mogą uruchamiać **ten sam** kod bez wranglera. Ta przenośność kryje różnice runtime'u: Node dodaje `User-Agent`, workerd nie. Jawne ustawianie nagłówków, które jeden z runtime'ów dodaje sam, usuwa tę różnicę.
- Atrapy w testach repo podmieniają globalne API (`fetch`, `Date.now`). Ten sam sposób przez `node --import` daje test skryptu ścieżki bez sieci.
- Sekrety maskuje autopilot, ale tylko po dokładnym tekście. Za zastępowanie adresów w innych postaciach (komunikaty Resend, URL z `%40`) odpowiada skrypt i funkcja.

## Historical Context (from prior changes)

- `context/archive/2026-11-18-lista-oczekujacych/research.md:188`: research S-02 zauważył już, że „automatyczni klienci z domyślnym `User-Agent` bibliotek mogą dostać błąd 1010”, ale tylko w odniesieniu do klientów wywołujących funkcję, nie do wywołań z funkcji do Resend.
- `context/archive/2026-11-18-lista-oczekujacych/research.md:36,177`: kontakty globalne, `POST /contacts` z samym `email`.
- `context/archive/2026-11-18-lista-oczekujacych/change.md:118-119`: decyzje planu S-02. Każdy błąd Resend daje 502 (L11), a ponowny zapis i limit 100/dobę trafiły do rejestru jako D-013.
- `context/archive/2026-11-18-lista-oczekujacych/change.md:147` (F2): import `…/index.ts` z rozszerzeniem łamie `tsc --noEmit`.
- `context/przebiegi/lista-oczekujacych.md:76-78`: `## Sprawdzenie na żywo`: „Brak.”, czyli S-02 nie miał prawdziwego zapisu przed scaleniem.

## Related Research

- `context/archive/2026-11-18-lista-oczekujacych/research.md`
- `context/archive/2026-11-18-testy-zachowania-strony/research.md`

## Decyzje dla planu (z rekomendacją)

1. **Jak ustalić przyczynę z prawdziwej odpowiedzi (N8), skoro Node nie odtworzy 1010.**
   - Rekomendacja: skrypt ścieżki przed zapisem wysyła jedno żądanie diagnostyczne odtwarzające wywołanie z Workers. To `POST /contacts` z adresem właściciela, z tym samym kluczem i nagłówkami jak dziś w produkcji, **bez** `User-Agent`, przez `node:https`, który sam tego nagłówka nie dodaje. Status, `name` i `message` (z zastąpionymi adresami) skrypt zapisuje w wyjściu i w `dowod`. Potem przechodzi właściwą ścieżkę na kodzie z poprawką.
   - Gdy diagnostyka da 403/1010, a ścieżka przejdzie, przyczyna jest potwierdzona prawdziwą odpowiedzią.
   - Gdy diagnostyka da 401 `restricted_api_key`, przyczyną jest klucz. Ścieżka kończy się wtedy `zablokowane`, a sesja pyta człowieka o nowy klucz.
   - Alternatywa: uruchomić funkcję w workerd przez `wrangler` 4.164.0 (wersja istnieje i jest `latest`, wymaga Node ≥ 22.12.0). To nowa, ciężka zależność, a do tego `npm ci` w każdym przebiegu, zmiana `package.json` w teście „krok 16” i `npm audit` w `przygotowanie-wdrozenia`. change.md pozwala na nią tylko wtedy, gdy wariant w Node nie wystarcza.
2. **Poprawka.** Jawny `User-Agent` w `wywolajResend`. Bezpieczny niezależnie od wyniku diagnostyki, bo Resend wymaga nagłówka od wszystkich.
3. **Istniejący kontakt (N3).** Po nieudanym `POST /contacts` funkcja pyta `GET /contacts/{encodeURIComponent(email)}`. Zapis idzie dalej tylko przy 200 i `email` równym adresowi. Przy innym wyniku zostaje jeden `console.error` z odpowiedzią `POST`, czyli dokładnie jeden wpis jak w N1, i odpowiedź 502. Atrapa N3 odpowiada na `POST` np. 409 albo 422 z `name` „already exists”, czyli najgorszym przypadkiem. Dokumentacja tego nie opisuje, a drugi przebieg ścieżki pokaże prawdziwą odpowiedź.
4. **Mapowanie wyniku skryptu.** Odmowa Resend za kluczem albo kontem daje `zablokowane`: 401 `restricted_api_key`, 400/401 `validation_error` „API key is invalid”, 403 `validation_error` trybu testowego i 429 `daily_quota_exceeded`. Błąd po stronie kodu daje `nie przeszło`: inna odpowiedź funkcji niż 200, brak kontaktu albo e-maila po odpytywaniu.

## Open Questions

- Co dokładnie zwraca `POST /contacts` dla istniejącego adresu? Dokumentacja tego nie mówi. Ustali to drugi prawdziwy przebieg ścieżki, bo adres właściciela będzie już kontaktem. Projekt funkcji z p. 3 działa przy każdej odpowiedzi.
- Czy adres w `owner-email` jest adresem konta Resend? Bez własnej domeny Resend wysyła tylko na adres konta. Inny adres da 403 `validation_error` przy `/emails`, czyli `zablokowane` i pytanie do człowieka. Z repo tego nie widać, a krok nie czyta pliku.
- Czy skrypt pod atrapą w teście N6 zgłasza `atrapy` niepuste? Skrypt sam nie wie, że biegnie z atrapą, i trzeba to rozstrzygnąć w planie. Autopilot przy prawdziwym przebiegu wymaga `[]`, więc oznaczenie musi pochodzić z modułu atrapy, nie ze zmiennej, którą prawdziwy przebieg mógłby ustawić przypadkiem.
- Czy `console.error` trafia do Workers Logs? Dokumentacja mówi „errors” i `console.log`, a `console.error` wprost tylko w kontekście logów czasu rzeczywistego. Potwierdzi to dopiero wpis po publikacji. N10 i tak sprawdza zapis na opublikowanej funkcji.
