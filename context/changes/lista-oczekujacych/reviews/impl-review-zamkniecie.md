<!-- REVIEW-CLOSURE -->
# Closure check: context/changes/lista-oczekujacych/reviews/impl-review.md

- **Report**: context/changes/lista-oczekujacych/reviews/impl-review.md
- **Fix commit**: 64e93d2
- **Date**: 2026-11-18
- **Verdict**: APPROVED

## Uwagi

- F1 — Jedno źródło może wyczerpać dzienny limit e-maili Resend: załatwione — `worker/index.ts:189-196` sprawdza dwa limity przed Resend: najpierw klucz IP (`minuta=5&doba=10`), potem wspólny klucz `wszystkie-zapisy` (`doba=90`); przekroczenie któregokolwiek daje 429. Test „jedenasty zapis z jednego IP w dobie i 91. zapis doby dostają 429 bez Resend” (`tests/repo/funkcja-zapisu.spec.ts:171`) przechodzi.
- F2 — Błąd wywołania Durable Object daje odpowiedź bez nagłówka CORS: załatwione — `sprawdzLimit` (`worker/index.ts:88-94`) obejmuje wywołanie obiektu limitu `try/catch` i przy wyjątku zwraca 500, które przechodzi w `odpowiedz(500, false, cors)` (`:196`). Test „błąd obiektu limitu daje 500 z nagłówkiem CORS bez Resend” (`spec.ts:201`) przechodzi.
- F4 — Szczegóły licznika zapisów: załatwione — przy 429 `LimitZapisow.fetch` wraca bez `storage.put` (`worker/index.ts:79-80`), a `kluczLimitu` zamienia `::ffff:a.b.c.d` na wbudowany adres IPv4 (`:133-136`). Test „adres IPv4 zapisany jako IPv6 dzieli limit z tym adresem IPv4” (`spec.ts:162`) przechodzi.
- F5 — Akcja z sekretami przypięta tagiem, a nie SHA: załatwione — `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml:28` ma `uses: cloudflare/wrangler-action@953926a2e2182532811c01a25e53647d93bf07c0 # cloudflare/wrangler-action@v4`, a `gh api repos/cloudflare/wrangler-action/git/ref/tags/v4` nadal zwraca commit `953926a2e2182532811c01a25e53647d93bf07c0`.

## Polecenia

- `npx playwright test -c playwright.bez-przegladarki.config.ts --project repo --grep "funkcja zapisu"` → exit 0
- `npm ci && npm run verify` → exit 0
- `! grep -rnE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}" worker/ | grep -v "onboarding@resend.dev"` → exit 0
- `npm run test:e2e -- --grep "krok 10\b"` → exit 0
- `npm run test:e2e -- --grep "krok 11\b"` → exit 0
- `npm run test:e2e -- --grep "krok 13\b"` → exit 0
- `npm run test:e2e -- --grep "krok 3\b"` → exit 0
- `python3 -c "import sys, pathlib; sys.path.insert(0, '/home/fabryka/fabryka/scripts'); import autopilot; p = autopilot.ci_secret_problems(pathlib.Path('context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml').read_text(), ['cloudflare/wrangler-action']); print(p); sys.exit(1 if p else 0)"` → exit 0
- `node -e "const t=require('fs').readFileSync('context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml','utf8'); for (const s of ['  worker:','  build:','  deploy:','needs: worker','Deploy to GitHub Pages','cloudflare/wrangler-action@v4']) if(!t.includes(s)) {console.error('brak: '+s); process.exit(1)}"` → exit 0
- `git diff --quiet 5e4dcac -- .github/workflows/pages.yml` → exit 0
- `npm run test:e2e -- --grep "krok 15\b"` → exit 0
- `npm ci && npm run verify && npm run test:e2e && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py lista-oczekujacych --rules 6` → exit 0

## Kryteria

- L1: spełnione — „krok 10” przechodzi w `telefon-360` i `komputer-1280`.
- L2: spełnione — „krok 10” przechodzi i obejmuje stan niepowodzenia.
- L3: spełnione — „krok 10” przechodzi i obejmuje błędy bez żądań.
- L4: spełnione — „krok 10” przechodzi; w `lib/content.ts` nie ma tekstów TODO ani „Form preview”.
- L5: spełnione — „krok 11 — wszystkie żądania idą pod adres strony” przechodzi w obu projektach.
- L6: spełnione — „krok 13 — kontrast co najmniej 4.5:1” przechodzi w obu projektach.
- L7: spełnione — w `npm run verify` przechodzi „poprawny zapis dodaje kontakt i wysyła e-mail właścicielowi”.
- L8: spełnione — w `npm run verify` przechodzi „inny Origin, brak Origin i błędny adres dają odmowę bez Resend”.
- L9: spełnione — w `npm run verify` przechodzi „wypełnione pole-pułapka daje sukces bez Resend”.
- L10: spełnione — w `npm run verify` przechodzi „szósty zapis z jednego IP w minucie dostaje 429 bez Resend”.
- L11: spełnione — w `npm run verify` przechodzi „błąd Resend daje 5xx”.
- L12: spełnione — w `npm run verify` przechodzą „zbudowana strona — bez adresu Resend i nazwy klucza” i gitleaks („no leaks found”). Odbiorca pochodzi tylko z `env.OWNER_EMAIL` (`worker/index.ts:51,204`). W `worker/`, `lib/`, `README.md`, `.github/workflows/` i `chronione/` są tylko `onboarding@resend.dev` (nadawca) i placeholder `you@example.com`.
- L13: spełnione — w `npm run verify` przechodzi „krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac”.
- L14: spełnione — job `worker` publikuje funkcję akcją `cloudflare/wrangler-action`, z sekretami tylko w `with:`/`env:` tego kroku (`chronione/.github/workflows/pages.yml:28-38`). Job `build` ma `needs: worker` i `NEXT_PUBLIC_WAITLIST_URL` (`:41,49`), a krok „Deploy to GitHub Pages” jest w `:87`.
- L15: spełnione — `README.md:58,67-69` opisuje zapis i kod, `:72` publikację, a `:74-78` sekrety z nazwy, bez wartości.
- L16: spełnione — pełne polecenie kończy się exit 0 (verify, 28 testów e2e, krok 15, rules 6).
- L17: spełnione — suma makiety zgadza się z `akceptacja.md`. Stany w `components/interactive.tsx:278-352` i teksty w `lib/content.ts:400-406` są takie jak w makiecie (`makieta.html:98-101`).
