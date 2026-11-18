<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Naprawa listy oczekujących po błędzie 502 z Resend

- **Plan**: context/changes/naprawa-listy-oczekujacych/plan.md
- **Mode**: Deep
- **Date**: 2026-11-18
- **Verdict**: REVISE
- **Findings**: 0 critical, 2 warnings, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding
Grounding: 8/8 paths ✓ (worker/index.ts, worker/wrangler.toml, tests/repo/funkcja-zapisu.spec.ts, tests/repo/zakres-przejecia.spec.ts, tsconfig.json, context/foundation/limitations.md, context/foundation/start.md, CLAUDE.md; new files scripts/na-zywo.mjs, tests/repo/atrapa-resend.mjs and tests/repo/na-zywo.spec.ts are absent, as expected), 6/6 symbols ✓ (wywolajResend, srodowisko, SCIEZKI, D-013, live_verdict, `stan końcowy:` in start.md:71), brief↔plan ✓, validate_change.py --rules 4 → exit 0, Progress↔Phase ✓. Contract-surfaces file absent (check skipped).

Verified against the code (sub-agent): autopilot.py sets `PORT`, `NA_ZYWO=1`, `NA_ZYWO_SCIEZKA`, `NA_ZYWO_ADRES=http://127.0.0.1:{port}` and `NA_ZYWO_WYNIK` (6313-6319) and starts no server itself. The command runs without a shell (`shlex.split`, 6305) in a fresh worktree without `node_modules` (6296-6298), with `LIVE_TIMEOUT = 1200` (621). The line parser takes `` - zapis-na-liste: `cmd` `` (6116-6118), so a plain-sentence line in the section is safe. `live_verdict` (6205-6240) checks `sciezka` first, then gives `zablokowane` priority over the exit code. It compares `adres` by host:port and requires `atrapy == []`. `uslugi` only has to be a non-empty list, so `["api.resend.com"]` passes, and `stan_koncowy` is compared with start.md on main. Node v22.23.5 from `mise.toml` imports `../worker/index.ts` from `.mjs` without dependencies. `https.request` sends no `User-Agent`, global `fetch` sends `user-agent: node`, and swapping `https.request` on the default export of `node:https` reaches the script only through the default import, as the plan says. Research shows the Resend rate limit is 10 requests/s (resend.com/docs/api-reference/rate-limit.md) and Workers Logs is free (200 000 events/day), so neither is a risk.

## Findings

### F1 — Missing access file or line gives `zablokowane`, which lets the merge through without a live pass

- **Decision**: AUTO-FIX (normalne używanie): Skrypt `scripts/na-zywo.mjs` jest nowy, a jego czytanie `## Dostępy` i `start.md` biegnie przy każdym sprawdzeniu na żywo. Kontrakt planu zamienia błąd po stronie repo lub skryptu (brak pliku, linii albo wartości) na `zablokowane`, wbrew `kawalek-intencja.md:14`, a `zablokowane` otwiera scalenie bez `przeszło` i wtedy N7 nie jest spełnione. Option: Fix
- **Severity**: ⚠️ WARNING
- **Dimension**: Blind Spots
- **Location**: Phase 2 — §1 Skrypt ścieżki, Contract („Brak pliku, linii albo wartości daje `zablokowane`”)
- **Detail**: Factory's rules for the live-check script (`/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`) reserve `zablokowane` for a failed proxy or a service that refuses the run. A `zablokowane` result offers the owner the answer „oddaj z »niesprawdzone na żywo…«” (autopilot.py:664). That answer lets the merge through without `przeszło` (6513-6514), and then N7 is not met. A missing file, line or value under `## Dostępy` is neither of those cases: it is a fault in the script or in the repo, which the session fixes. The pattern script (`legit/scripts/na-zywo.mjs`) gives `nie przeszło` for missing access too. Resend refusals (401/403/429 with Resend JSON) can stay `zablokowane`: that is a service refusal under the rules.
- **Fix**: In the Phase 2 §1 Contract, change „Brak pliku, linii albo wartości daje `zablokowane`” to `nie przeszło` (reason without file contents). Add a short scenario to the §3 test: a `CLAUDE.md` without the key line gives `wynik` `nie przeszło` and exit code ≠ 0.
  - Strength: Keeps the script within Factory's rules. N7 cannot be bypassed by a fault on the repo side.
  - Tradeoff: One more test case.
  - Confidence: HIGH — the rule in kawalek-intencja.md:14 and the merge path for `zablokowane` in autopilot.py:6513-6514 are explicit.
  - Blind spot: None significant.
  - Intent: within

### F2 — N8: the autopilot drops `dowod`, and the plan does not say where the 502 cause is recorded

- **Decision**: AUTO-FIX (normalne używanie): Przy każdym przebiegu ścieżki autopilot usuwa `dowod` razem z worktree, a plan wypisuje na stdout tylko linię diagnostyki i nie mówi, gdzie i kiedy sesja zapisuje przyczynę. Gdy przyczyna leży poza diagnostyką (np. 401 na `/contacts` funkcji), log kroku może jej nie zawierać i kryterium N8 nie da się sprawdzić. Option: Fix
- **Severity**: ⚠️ WARNING
- **Dimension**: Plan Completeness
- **Location**: Phase 2 — Overview and §1 Skrypt ścieżki (Wyjście, `dowod`); Implementation Approach („Wpis przyczyny w raporcie kawałka (N8) … robi sesja główna”)
- **Detail**: The autopilot deletes the result file together with the worktree (autopilot.py:6331-6333). Only `wynik` and `powod` reach the `na_zywo` state field (6446-6450), so `dowod` is never kept. The only lasting record of the run is the step's stdout/stderr log `.autopilot-local/<id>/<czas>-przygotowanie-wdrozenia.log` (and `…-merge.log` on a re-run). The plan prints only the diagnostic line to stdout. It sends the function's Resend calls (method, path, status, `name`, `message`) only to `dowod`/`powod`. When the 502 cause is something other than a missing `User-Agent` (e.g. 401 `restricted_api_key` on the function's `/contacts`), the only thing the log may keep is `powod`. Factory has no „raport kawałka”: koniec-kawalka-aplikacji.md has no step that writes a 502 cause. After the `archiwum` step the change folder sits in `context/archive/`, while N8 is checked in `context/changes/naprawa-listy-oczekujacych/` „(plan albo raport)”. impl-review runs before `przygotowanie-wdrozenia` (CHAIN, autopilot.py:444), so it cannot judge N7, N8 or N10 either.
- **Fix**: Phase 2 §1: the script prints to stdout, through `scrub()`, one line per observed Resend call (method, path without the address, status, `name`, `message`) and a final line `wynik: <wynik> — <powod>`. The step log then holds the real Resend response for N8. In the Phase 2 Overview, name where N8 is recorded and when: the main session takes the cause from the step log `.autopilot-local/naprawa-listy-oczekujacych/*-przygotowanie-wdrozenia.log` and writes it, together with the N10 result, to `raport.md` in the change folder (after archiving, in its `context/archive/…` folder). Add one sentence: N7, N8 and N10 are judged after `przygotowanie-wdrozenia` and `wynik-wdrozenia`, not in impl-review.
  - Strength: The cause survives in the log regardless of which call fails. The weryfikator for N8 knows which file to read.
  - Tradeoff: More lines in the step log. The main session gets one more write at the end of the slice.
  - Confidence: MED — the loss of `dowod` is confirmed in code, but the main session's procedure for the end of the slice has no such step, so it depends on the session following the plan.
  - Blind spot: Whether the weryfikator of the archive accepts `raport.md` in the archive folder as „raport kawałka”.
  - Intent: within

### F3 — Criteria 1.2 and 2.3 have no command that decides

- **Decision**: AUTO-FIX (normalne używanie): Implementacja pod `/goal` uruchamia kryteria faz przy każdej fazie. Dziś 2.3 przechodzi przy dowolnym imporcie, a 1.2 nie ma polecenia, więc bramka faz nie rozstrzyga ani N9 (stare oczekiwania bez zmian), ani ograniczenia „bez nowych zależności”. Option: Fix
- **Severity**: 💡 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 1 Success Criteria (1.2), Phase 2 Success Criteria (2.3)
- **Detail**: 1.2 („`git diff` tego pliku … nie zmienia ani nie usuwa linii `expect`”) has no command. 2.3 (`grep -nE "^import|import\(" scripts/na-zywo.mjs`) exits 0 whenever any import exists, so its exit code proves nothing.
- **Fix**: 1.2: `! git diff -U0 main -- tests/repo/funkcja-zapisu.spec.ts | grep -E '^-\s*expect'`. 2.3: `! grep -nE "(from|import\()\s*['\"]" scripts/na-zywo.mjs | grep -vE "['\"](node:[a-z_/]+|\.\./worker/index\.ts)['\"]"`.

### F4 — Exception on `GET /contacts` after a failed `POST` is not described

- **Decision**: AUTO-LIMIT (przypadek szczególny): Wyjątek sieci albo treść, która nie jest JSON, na `GET /contacts` zaraz po nieudanym `POST /contacts` to rzadka awaria Resend lub sieci. Nie ma jej w scenariuszu człowieka, a `change.md` nie ma „Chroni przed” (przyjęto model „przypadkowy błąd agenta, nie celowe obejście”). Return when: zmiana dotyka sekwencji wywołań Resend w `worker/index.ts` albo w Workers Logs funkcji pojawia się wpis o wyjątku lub treści, która nie jest JSON, przy `GET /contacts`, albo odpowiedź funkcji inna niż 200 i 502. · D-016
- **Severity**: 💡 OBSERVATION
- **Dimension**: Plan Completeness
- **Location**: Phase 1 §1 Funkcja zapisu, Contract — Sekwencja, step 2
- **Detail**: Step 2 describes a `GET` that returns 200 with a different `email`, or no 200. It does not say what the log entry and the response are when `GET` itself throws a network exception or returns non-JSON. The implementer has to guess whether to log the `POST` response or the `GET` exception.
- **Fix**: Add to step 2: every `GET` result other than 200 with a matching `email`, including an exception and non-JSON, gives one entry with the `POST /contacts` response and 502.
