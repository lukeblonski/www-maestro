<!-- REVIEW-CLOSURE -->
# Closure check: context/changes/testy-zachowania-strony/reviews/impl-review.md

- **Report**: context/changes/testy-zachowania-strony/reviews/impl-review.md
- **Fix commit**: 1820ed4
- **Date**: 2026-11-18
- **Verdict**: APPROVED

## Uwagi

- F2 — Kontrast nie mierzy linków wyglądających jak przyciski: załatwione — commit 1820ed4 zmienia selektor w tests/e2e/motyw-siec-dostepnosc.spec.ts:166 na `"h1, h2, h3, p, button:not([disabled]), a.button"`, który obejmuje `a.button.button-primary` (app/page.tsx:48, :263) i `a.button.button-small.button-ink` (components/interactive.tsx:50) mierzone na własnym tle elementu albo przodka (spec:127-133), a krok 13 przechodzi w telefon-360 i komputer-1280.
- F7 — `gitleaks git` nie skanuje plików przed commitem: załatwione — `scripts.verify` w package.json:11 kończy się teraz `&& gitleaks git --staged --redact --no-banner .`, `npm run verify` bez Dockera kończy się kodem 0 i drugi przebieg wypisuje „0 commits scanned … no leaks found” dla plików przygotowanych do commita, a CLAUDE.md ## Verify to opisuje.

## Polecenia

- `node -e "const d=require('./package.json').devDependencies;for(const k of ['@playwright/test'])if(!/^\d+\.\d+\.\d+$/.test(d[k]||''))process.exit(1)" && npm ci --dry-run` → exit 0
- `npm run typecheck` → exit 0
- `npm run verify` → exit 0
- `git worktree remove --force /tmp/maestro-verify 2>/dev/null; rm -rf /tmp/maestro-verify; git worktree add --detach /tmp/maestro-verify HEAD && git ls-files -mo --exclude-standard -z | xargs -0 -r cp --parents -t /tmp/maestro-verify && (cd /tmp/maestro-verify && npm ci && npm run verify); s=$?; git worktree remove --force /tmp/maestro-verify; exit $s` → exit 0
- `npm run test:e2e -- --grep "krok 1\b"` → exit 0
- `npm run test:e2e -- --grep "krok 2\b"` → exit 0
- `npm run test:e2e -- --grep "krok 3\b"` → exit 0
- `npm run test:e2e -- --grep "krok 4\b"` → exit 0
- `npm run test:e2e -- --grep "krok 5\b"` → exit 0
- `npm run test:e2e -- --grep "krok 6\b"` → exit 0
- `npm run test:e2e -- --grep "krok 7\b"` → exit 0
- `npm run test:e2e -- --grep "krok 8\b"` → exit 0
- `npm run test:e2e -- --grep "krok 9\b"` → exit 0
- `npm run test:e2e -- --grep "krok 10\b"` → exit 0
- `npm run test:e2e -- --grep "krok 11\b"` → exit 0
- `npm run test:e2e -- --grep "krok 12\b"` → exit 0
- `npm run test:e2e -- --grep "krok 13\b"` → exit 0
- `npm run test:e2e -- --grep "krok 14\b"` → exit 0
- `npm run test:e2e -- --grep "krok 15\b"` → exit 0
- `! npm run test:e2e -- --grep "krok 99\b"` → exit 0
- `git diff --quiet 5e4dcac -- app components lib public .github/workflows/pages.yml next.config.ts tsconfig.json postcss.config.mjs` → exit 0
- `! grep -rn waitForTimeout tests/` → exit 0
- `npm test` → exit 0
- `(PORT=3199 npm run dev >/tmp/maestro-dev.log 2>&1 & echo $! >/tmp/maestro-dev.pid); for i in $(seq 1 60); do ss -ltn | grep -q ':3199 ' && break; sleep 1; done; ss -ltn | grep ':3199 ' | grep -q '127.0.0.1:3199' && ! ss -ltn | grep ':3199 ' | grep -vq '127.0.0.1:3199'; s=$?; pkill -P "$(cat /tmp/maestro-dev.pid)"; kill "$(cat /tmp/maestro-dev.pid)" 2>/dev/null; git checkout -- next-env.d.ts; exit $s` → exit 0 (proces `next-server` nasłuchiwał dalej na 127.0.0.1:3199 po poleceniu; zatrzymany po PID, `next-env.d.ts` przywrócony)
- `git diff --quiet -- next-env.d.ts` → exit 0
- `python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py testy-zachowania-strony --rules 6` → exit 0

## Kryteria

- T1: spełnione — `npm run test:e2e -- --grep "krok 1\b"` exit 0, 2 passed (telefon-360 i komputer-1280).
- T2: spełnione — `npm run test:e2e -- --grep "krok 2\b"` exit 0.
- T3: spełnione — `npm run test:e2e -- --grep "krok 3\b"` exit 0.
- T4: spełnione — `npm run test:e2e -- --grep "krok 4\b"` exit 0.
- T5: spełnione — `npm run test:e2e -- --grep "krok 5\b"` exit 0.
- T6: spełnione — `npm run test:e2e -- --grep "krok 6\b"` exit 0.
- T7: spełnione — `npm run test:e2e -- --grep "krok 7\b"` exit 0.
- T8: spełnione — `npm run test:e2e -- --grep "krok 8\b"` exit 0.
- T9: spełnione — `npm run test:e2e -- --grep "krok 9\b"` exit 0.
- T10: spełnione — `npm run test:e2e -- --grep "krok 10\b"` exit 0.
- T11: spełnione — `npm run test:e2e -- --grep "krok 11\b"` exit 0.
- T12: spełnione — `npm run test:e2e -- --grep "krok 12\b"` exit 0.
- T13: spełnione — `npm run test:e2e -- --grep "krok 13\b"` exit 0 na telefon-360 i komputer-1280, z selektorem rozszerzonym o `a.button`.
- T14: spełnione — `npm run test:e2e -- --grep "krok 14\b"` exit 0.
- T15: spełnione — `npm run test:e2e -- --grep "krok 15\b"` exit 0: krok 15 [readme] passed, a zagnieżdżone `npm test` uruchomiło 28 testów w przeglądarce, które przeszły, przy pominiętym w środku kroku 15.
- T16: spełnione — `npm run verify` exit 0 z testem „krok 16”, a `git diff --quiet 5e4dcac -- …` exit 0.
- T17: spełnione — `npm run verify` exit 0 bez Dockera (typy, projekt `repo`, gitleaks na historii i na plikach przygotowanych do commita), także exit 0 w świeżym worktree.
- T18: spełnione — CLAUDE.md ma `## Testy w CI` (obraz `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble`, Docker bez roota, `npx playwright install --with-deps chromium` w CI) i `## Uruchomienie lokalne` (`npm run dev`, `PORT`, tylko `127.0.0.1`); README.md:11 i :16 mają to samo `npm run dev` z `PORT` i 127.0.0.1; package.json:6 ma `next dev --webpack --hostname 127.0.0.1`; polecenie z portem 3199 potwierdziło nasłuch tylko na 127.0.0.1:3199.
- T19: spełnione — sprawdzenie `node` i `npm ci --dry-run` exit 0.
- T20: spełnione — `! grep -rn waitForTimeout tests/` exit 0; testy importują `content as c` z `../../lib/content` (tests/e2e/interakcje.spec.ts:2, motyw-siec-dostepnosc.spec.ts:2, sekcje-i-uklad.spec.ts:2) i opierają się na `getByRole`, `getByLabel` i kotwicach `#`, bez skopiowanych zdań treści.
- T21: spełnione — `validate_change.py testy-zachowania-strony --rules 6` exit 0 („OK: testy-zachowania-strony: rules 6 passed”).
