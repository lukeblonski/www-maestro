# Naprawa listy oczekujących po błędzie 502 z Resend — Plan Brief

> Full plan: `context/changes/naprawa-listy-oczekujacych/plan.md`
> Research: `context/changes/naprawa-listy-oczekujacych/research.md`

## What & Why

Prawdziwy zapis na opublikowanej funkcji zapisu dał 502 i nie przyszedł żaden e-mail. Przyczyny nie widać, bo funkcja nie loguje odpowiedzi Resend. Plan dodaje log odmów i poprawkę najbardziej prawdopodobnej przyczyny (brak nagłówka `User-Agent` w Workers). Ponowny zapis istniejącego adresu kończy się sukcesem. Do tego dochodzi ścieżka na żywo, która przed scaleniem ustala przyczynę z prawdziwej odpowiedzi Resend i sprawdza poprawkę na prawdziwym Resend.

## Starting Point

`worker/index.ts` wywołuje Resend (`POST /contacts`, potem `POST /emails`) bez `User-Agent` i zamienia każdą odpowiedź na sam `true`/`false`. Testy biegną tylko na atrapie `fetch` w Node, a Node sam dodaje `User-Agent`, więc problemu z Workers nie widać. Nie ma `[observability]` ani `## Sprawdzenie na żywo`.

## Desired End State

Odwiedzający po zapisie widzi sukces, właściciel dostaje e-mail, a adres jest w kontaktach Resend. Ponowny zapis też kończy się sukcesem. Każda odmowa Resend zostawia w Workers Logs jeden wpis ze ścieżką, statusem, nazwą i komunikatem, bez klucza i adresów. Autopilot przed scaleniem uruchamia `node scripts/na-zywo.mjs` na prawdziwym Resend, a log tego przebiegu podaje przyczynę 502.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Ustalenie przyczyny (N8) | Żądanie diagnostyczne `POST /contacts` bez `User-Agent` przez `node:https` przed właściwym zapisem | Node `fetch` dodaje `User-Agent`, a diagnostyka odtwarza wywołanie z Workers bez wranglera | Research |
| Zgoda na dane | Diagnostyka mieści się w zgodzie „dane Resend (USA)”: ten sam adres, ta sama usługa i ten sam cel, bez dodatkowego e-maila | Człowiek zgodził się na kontakt i jeden e-mail na sprawdzenie | Plan |
| Poprawka | `User-Agent: maestro-waitlist/1.0` w obu wywołaniach Resend | Resend go wymaga, a workerd go nie dodaje | Research |
| Istniejący kontakt (N3) | Po nieudanym `POST /contacts` funkcja pyta `GET /contacts/{email}` i idzie dalej przy 200 z tym samym `email` | Nie zależy od nieopisanej odpowiedzi Resend i nie łamie testu „błąd Resend daje 5xx” | Research |
| Log | Jeden `console.error` na niepowodzenie, w wywołującym. Adresy (`@`, `%40`) i klucz zastępuje znacznik, a z treści, która nie jest JSON, wchodzi 300 znaków | N1 wymaga dokładnie jednego wpisu, a komunikat Resend bywa z adresem konta | Plan |
| Wynik skryptu | 401/403/429 z JSON Resend, błąd klucza i bounce dają `zablokowane`, reszta `nie przeszło` | Odmowę za kluczem albo kontem rozwiązuje człowiek w panelu, a resztę naprawia kod | Research |
| `atrapy` pod atrapą | Oznaczenie z modułu atrapy (`globalThis.ATRAPY_NA_ZYWO`) | Prawdziwy przebieg nie ustawi go przypadkiem | Plan |
| Zależności | Żadnych nowych, `package.json` bez zmian | Świeży worktree nie ma `node_modules`, a „krok 16” porównuje `package.json` | Plan |
| D-013 | Część o ponownym zapisie zamknięta, limit 100/dobę zostaje | Tak mówi change.md | Plan |

## Scope

**In scope:**
- `worker/index.ts`: log odmów, `User-Agent`, istniejący kontakt.
- `worker/wrangler.toml`: `[observability]`.
- Nowe testy N1–N3 w `tests/repo/funkcja-zapisu.spec.ts`.
- `scripts/na-zywo.mjs`, `tests/repo/atrapa-resend.mjs`, `tests/repo/na-zywo.spec.ts`.
- `## Sprawdzenie na żywo` i opis `## Verify` w `CLAUDE.md`.
- D-013 w `limitations.md`.

**Out of scope:**
- Strona i formularz.
- Workflow publikacji, `## Wdrożenie`, `## Dostępy` i sekrety.
- `wrangler` w zależnościach.
- Pomijanie kontaktów.
- Domena nadawcy i limit 100 e-maili.

## Architecture / Approach

Funkcja zostaje przenośna między Workers a Node. Skrypt ścieżki uruchamia ten sam `worker/index.ts` w `node:http` na `127.0.0.1:$PORT`, z prawdziwym kluczem i adresem z plików z `## Dostępy` (czyta je z `CLAUDE.md` w folderze roboczym) i z limitem na `Map`. Obserwator `fetch` przepuszcza odpowiedzi Resend bez zmian i zapisuje ich status i `id` e-maila do `dowod`/`powod`. Test skryptu biegnie bez sieci, w katalogu tymczasowym z własnym `CLAUDE.md`, a Resend gra w nim atrapa ładowana przez `node --import`, która podmienia `fetch` i `https.request`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Funkcja zapisu | Log odmów bez sekretów, `User-Agent`, ponowny zapis, Workers Logs | Dodatkowe wywołanie na ścieżce sukcesu złamałoby stare testy (N9) |
| 2. Ścieżka na żywo | Skrypt, atrapa, test bez sieci i linia w `CLAUDE.md` | Wyciek adresu w innej postaci niż dokładna wartość, dlatego skrypt sam czyści każdy tekst |

**Prerequisites:** S-02 scalone. Pliki z `## Dostępy` są (uruchamia je tylko autopilot).
**Estimated effort:** ~1 sesja implementacji, 2 fazy.

## Open Risks & Assumptions

- Przyczyna z diagnostyki zakłada, że Cloudflare przed Resend traktuje żądanie z Node bez `User-Agent` tak jak żądanie z workerd. Gdy diagnostyka przejdzie, a produkcja dalej da 502, przyczynę pokażą Workers Logs po publikacji (N10).
- Gdy klucz ma tylko „Sending access” albo adres właściciela nie jest adresem konta Resend, wynik to `zablokowane`, a sesja pyta człowieka o działanie w panelu Resend.
- Wpis `console.error` w Workers Logs potwierdzi dopiero publikacja.

## Success Criteria (Summary)

- `npm run verify` przechodzi z nowymi testami, a stare testy są bez zmian.
- Ścieżka `zapis-na-liste` ma `przeszło` przed scaleniem, a jej log podaje przyczynę 502.
- Po publikacji prawdziwy zapis daje 200 i e-mail u właściciela.
