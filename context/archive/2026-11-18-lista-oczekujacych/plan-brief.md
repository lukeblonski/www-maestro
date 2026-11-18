# Prawdziwa lista oczekujących z powiadomieniem właściciela — Plan Brief

> Full plan: `context/changes/lista-oczekujacych/plan.md`
> Research: `context/changes/lista-oczekujacych/research.md`

## What & Why

Formularz `#waitlist` jest dziś tylko podglądem: nikt nie trafia na listę, a właściciel nie wie o zainteresowaniu. Do premiery 30 listopada 2026 strona ma zbierać prawdziwe zapisy. Ma przy tym nie trzymać klucza Resend w plikach strony.

## Starting Point

`WaitlistForm` już waliduje adres i woła adapter `lib/waitlist.ts`, który zawsze zwraca „preview”. Funkcji zapisu nie ma. „krok 16” zamraża pliki strony i workflow na `5e4dcac`, a `verify` nie buduje strony.

## Desired End State

Odwiedzający wpisuje adres i widzi „Joining…”, a potem komunikat, że jest zapisany albo że zapis nie przeszedł (adres zostaje w polu). Funkcja w Cloudflare dodaje adres do kontaktów Resend i wysyła właścicielowi e-mail. Po scaleniu workflow publikuje najpierw funkcję, a potem stronę z jej adresem.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
|---|---|---|---|
| Zapis | funkcja Cloudflare Workers + Resend | klucz poza stroną (FR-016) | Research (człowiek w change.md) |
| Publikacja funkcji | job `worker` w `pages.yml` przed `build`, plik w `chronione/` | autopilot podaje poleceniom tylko jedną wartość | Research (człowiek w change.md) |
| Limit IP | Durable Object z SQLite, 5 na 60 s | ścisły i potwierdzony na Free; `ratelimits` niepotwierdzone | Plan |
| Identyfikator konta Cloudflare | bez niego | wrangler sam wybiera jedyne konto z tokenu (kod źródłowy) | Plan |
| Błąd Resend (też duplikat i limit dzienny) | kontakt, potem e-mail; każdy błąd daje 502 | L11; zachowanie duplikatu niesprawdzone, więc najgorszy przypadek | Plan |
| Świeży `out/` dla L12 | `verify` buduje stronę | test na starym `out/` niczego nie dowodzi | Plan |
| Format żądania | `POST` z JSON jako `text/plain`, bez nagłówków | proste żądanie CORS bez preflightu, którego Playwright nie pokazuje | Plan |
| Kolor niepowodzenia | `#8a2a1f` jasny (makieta), `#ffb4a8` ciemny | 7.43:1 i 6.41:1 | Plan |
| Testy funkcji | `tests/repo/`, handler wołany w Node z atrapą `fetch` | bez wranglera i usług, w `verify` | Plan |
| Wersja wranglera | `4.164.0` przypięta w akcji | D-002: ryzyko wersji „najnowszych” | Plan |
| Linter (D-003) | nie teraz | brak hooków z zależnościami, a nowe zależności wywróciłyby „krok 16” | Plan |

## Scope

**In scope:**
- `worker/` (funkcja, `wrangler.toml`) z testami bez sieci
- formularz, teksty i style z makiety; pole-pułapka
- wyjątki „krok 16” z nazwy, test `out/`, budowa w `verify`
- przepisane `krok 10` i `krok 13` na atrapie funkcji
- workflow w `chronione/`, README, `CLAUDE.md` `## Verify`, rejestr ograniczeń

**Out of scope:**
- informacja o prywatności (D-001), własna domena, e-mail do odwiedzającego, double opt-in
- testy w CI (D-004), linter (D-003), odpowiedź na `OPTIONS`
- wpisanie `pages.yml` i `gh secret set` (robi autopilot)

## Architecture / Approach

Przeglądarka → `POST` pod `NEXT_PUBLIC_WAITLIST_URL` (wpisany przy budowie z wyjścia `deployment-url` joba `worker`). Funkcja sprawdza kolejno: `Origin`, treść, pułapkę, format, limit w Durable Object. Potem woła `api.resend.com/contacts` i `/emails` z sekretami funkcji. Testy podmieniają `fetch` (funkcja) i `page.route` (strona).

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Funkcja zapisu | `worker/` z L7–L11 w `verify` | typy Cloudflare zdefiniowane lokalnie muszą przejść `tsc` i `next build` |
| 2. Formularz na stronie | stany z makiety, „krok 16” z wyjątkami, `out/` bez klucza, `krok 10`/`13` | jeden duży commit, bo pliki zależą od siebie |
| 3. Workflow w `chronione/` | job `worker` przed `build`, sekrety tylko w kroku akcji | publikacja sprawdzi się dopiero po scaleniu |
| 4. Dokumentacja i pełne sprawdzenie | README, `CLAUDE.md`, rejestr ograniczeń, pełny przebieg | — |

**Prerequisites:** zgody z `## Zgody` w `change.md` (są), Docker bez roota do `test:e2e`.
**Estimated effort:** jeden przebieg implementacji w 4 fazach.

## Open Risks & Assumptions

- Pierwsza publikacja może paść w jobie `worker`, jeśli token widzi więcej niż jedno konto Cloudflare albo jeśli `wrangler-action` źle wgra sekrety przed pierwszym utworzeniem funkcji. Wtedy zostaje stara strona, a `wynik-wdrozenia` zgłasza porażkę.
- Powtórny zapis tego samego adresu może pokazać niepowodzenie (zachowanie Resend niesprawdzone). Dotyczy to też 101. zapisu dnia (limit Resend Free).
- Brak informacji o prywatności zostaje ryzykiem RODO (D-001, decyzja człowieka).
- `verify` trwa dłużej o czas budowy strony.

## Success Criteria (Summary)

- Poprawny adres daje jedno żądanie i komunikat „You're on the waiting list…”, a błąd daje „Your sign-up didn't go through…” z adresem w polu.
- Funkcja odrzuca obcy `Origin`, zły adres, boty i szósty zapis z IP bez dotykania Resend.
- `npm ci && npm run verify && npm run test:e2e` przechodzi, a `out/` i repo nie mają klucza ani adresu właściciela.
