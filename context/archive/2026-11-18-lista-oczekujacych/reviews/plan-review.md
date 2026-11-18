<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Prawdziwa lista oczekujących z powiadomieniem właściciela

- **Plan**: context/changes/lista-oczekujacych/plan.md
- **Mode**: Deep
- **Date**: 2026-11-18
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding

Grounding: 15/15 ścieżek ✓ (14 istnieje, `worker/` celowo nowy), 6/6 symboli ✓ (`submitWaitlist`, `WaitlistForm`, `SCIEZKI`, `ci_secret_problems`, `--green`, `--accent-soft`), brief↔plan ✓. `validate_change.py --rules 4`: exit 0.

Sprawdzone w kodzie i w źródłach (sub-agent, 2026-11-18):
- `ci_secret_problems(text, tools)` (`<fabryka>/scripts/autopilot.py:5853`) przyjmuje planowany job `worker`: `with.apiToken`, `with.secrets` (blok `|` pomijany, `autopilot.py:5868-5872`, `5900-5901`) i `env.*` kroku `cloudflare/wrangler-action@v4`.
- `cloudflare/wrangler-action` v4 (v4.1.3) ma wejście `secrets` i wyjście `deployment-url` (`action.yml:29`, `:55`). Sekrety idą przed `deploy` przez `wrangler secret bulk` (`src/wranglerAction.ts:64-65`). Gdy funkcji jeszcze nie ma, wrangler 4.164.0 tworzy szkic funkcji (`packages/wrangler/src/secret/index.ts:497-515`), więc pierwsza publikacja nie pada na sekretach.
- Wykluczenie `:(exclude).github/workflows/pages.yml` wygrywa z tą samą ścieżką w `SCIEZKI` (sprawdzone `git diff --quiet`).
- Kontrast `#8a2a1f` na `#e8f1df` = 7.43:1 i `#ffb4a8` na `#2c422f` = 6.41:1. Tło `#waitlist-status` to `section.waitlist-section` z `var(--accent-soft)` (`app/globals.css:1318-1319`).
- `next build` sprawdza typy całego programu z `tsconfig.json`, więc obejmuje `worker/`. Pliku, którego strona nie importuje, nie odrzuca.

## Findings

### F1 — Adres bez kropki w domenie przechodzi formularz i daje „Your sign-up didn't go through”

- **Severity**: ⚠️ WARNING
- **Dimension**: Blind Spots
- **Location**: Phase 2 — §3 Formularz (`components/interactive.tsx`), wobec Phase 1 — §1 Kod funkcji (`worker/index.ts`)
- **Detail**: Formularz zostaje przy `validity.valid` pola `type="email"` (`components/interactive.tsx:283`). Przeglądarka uznaje za poprawny adres bez kropki w domenie, np. `anna@gmail` (literówka bez `.com`). Funkcja wymaga wzorca `^[^\s@]+@[^\s@]+\.[^\s@]+$` i dla takiego adresu odpowiada 400. Strona traktuje każdą odpowiedź poza 2xx jako niepowodzenie, więc odwiedzający widzi „Your sign-up didn't go through. Please try again.”, a nie komunikat o błędnym adresie. Ponawia z tym samym adresem i dostaje to samo niepowodzenie za każdym razem. Każda taka próba to przy tym żądanie do funkcji. Scenariusz człowieka (krok 5) i L3 mówią, że błędny adres daje komunikat błędu bez wysyłki.
- **Fix**: Formularz po `validity.valid` sprawdza ten sam wzorzec co funkcja (stała we `lib/waitlist.ts`, np. `export const WZORZEC_ADRESU`). Adres, który go nie spełnia, daje stan `invalid` bez żądania. `krok 10` dostaje przypadek `anna@gmail` → `w.error`, `aria-invalid="true"`, zero żądań. Funkcja zostaje przy własnej kopii wzorca, bo nie importuje kodu strony.
  - Strength: Odwiedzający z literówką widzi, że adres jest zły, i może go poprawić. Funkcja nie dostaje żądań z góry skazanych na 400.
  - Tradeoff: Wzorzec stoi w dwóch miejscach (strona i funkcja), więc zmiana jednego bez drugiego wraca do tego samego błędu.
  - Confidence: HIGH — walidacja `type="email"` według specyfikacji HTML nie wymaga kropki w domenie, a wzorzec funkcji wymaga.
  - Blind spot: None significant.
  - Intent: within
- **Decision**: AUTO-FIX (normalne używanie): Literówka bez „.com” (np. `anna@gmail`) zdarza się przy zwykłym wpisywaniu adresu. Taki adres przechodzi formularz, funkcja go odrzuca, a odwiedzający dostaje „Your sign-up didn't go through” za każdym razem, choć „Oczekiwany efekt” i krok 5 scenariusza mówią, że błędny adres daje komunikat błędu bez żądania; poprawka mieści się w intencji i w plikach już objętych planem. · Option: Fix

### F2 — Szczegóły, które wywrócą `typecheck` albo zostawią zgadywanie

- **Severity**: 💬 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — §1 Kod funkcji, §3 Testy funkcji
- **Detail**: Trzy szczegóły. (1) Test ma importować `../../worker/index` bez rozszerzenia. Import `…/index.ts` przechodzi w Playwright, ale zamrożony `tsconfig.json` (bez `allowImportingTsExtensions`) daje w `tsc --noEmit` błąd TS5097. (2) Wywołanie obiektu Durable Object `stub.fetch(…)` potrzebuje pełnego adresu, np. `https://limit/`. (3) Plan nie mówi, co funkcja robi, gdy brak nagłówka `CF-Connecting-IP`.
- **Fix**: Dopisać w §1 i §3: import bez rozszerzenia, `stub.fetch("https://limit/")`, a przy braku `CF-Connecting-IP` klucz limitu `"brak-ip"` (wspólny licznik).
- **Decision**: AUTO-FIX (normalne używanie): Import `…/index.ts` z rozszerzeniem wywraca `tsc --noEmit` w `npm run verify`, a `stub.fetch` bez pełnego adresu pada przy każdym zapisie, więc oba błędy zdarzą się przy zwykłym przebiegu L7–L11; dopisanie zachowania przy braku `CF-Connecting-IP` usuwa zgadywanie w tym samym miejscu §1 i §3. · Option: Fix

### F3 — Numer wpisu D-013 zapisany na sztywno

- **Severity**: 💬 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 4 — §3 Rejestr ograniczeń
- **Detail**: Plan każe dopisać „nowy wpis D-013”. Dziś najwyższy numer to D-012, ale numeracja jest wspólna dla `decisions.md`, `limitations.md` i `decisions-archive.md`. Każdy wpis dodany przed fazą 4, np. z triage tego przeglądu, zajmie D-013.
- **Fix**: Zamiast „D-013” napisać „następny wolny numer `D-<nnn>` z trzech plików rejestru (`grep -hoE '^## D-[0-9]{3}' context/foundation/{decisions,limitations,decisions-archive}.md | sort | tail -1`)”.
- **Decision**: AUTO-FIX (normalne używanie): Ten triage dopisuje do rejestru wpis z F4, więc numer D-013 może być zajęty przed fazą 4 i wpis dostałby powtórzony numer. Branie następnego wolnego numeru z trzech plików rejestru zapobiega temu tanim kosztem. · Option: Fix

### F4 — Limit z jednego IP liczony po pełnym adresie IPv6

- **Severity**: 💬 OBSERVATION
- **Dimension**: Blind Spots
- **Location**: Phase 1 — §1 Kod funkcji (`LimitZapisow`, klucz `idFromName(ip)`)
- **Detail**: Klucz limitu to pełny `CF-Connecting-IP`. Łącze IPv6 zwykle dostaje całą sieć `/64`, więc jeden nadawca może zmieniać adres i ominąć limit 5 na minutę. Bot mógłby wtedy wyczerpać dzienny limit 100 e-maili Resend, a kolejni prawdziwi odwiedzający dostaliby niepowodzenie (L11). Kontrola `Origin` tego nie zatrzyma, bo poza przeglądarką da się ją podrobić. Przypadek wymaga celowego nadużycia.
- **Fix**: Dla adresu IPv6 (z `:`) kluczem limitu są pierwsze cztery grupy (`/64`), dla IPv4 pełny adres. Test L10 dostaje przypadek dwóch adresów z tej samej `/64`.
- **Decision**: AUTO-FIX (bezpieczeństwo B): Zabezpieczyłem limit zapisów przed obejściem przez zmianę adresu w jednej sieci IPv6, stosując standardowe liczenie limitu po prefiksie `/64` dla IPv6 i po pełnym adresie dla IPv4, z przypadkiem testowym dwóch adresów z tej samej `/64` w L10. · Option: Fix
