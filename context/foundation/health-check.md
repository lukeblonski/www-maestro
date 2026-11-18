---
project: www-maestro
checked_at: 2026-11-18T07:31:49Z
health_status: critical-issues
context_type: brownfield
language_family: js
stack_assessment_available: true
checks_run:
  - lockfile
  - dependency_audit
  - outdated_deps
  - test_runner
  - ci_cd
  - configuration
audit_findings:
  critical: 0
  high: 0
  moderate: 0
  low: 0
test_runner_detected: false
ci_provider: GitHub Actions
recommended_fixes: 4
---

Sprawdzenie na kopii repozytorium w tym folderze (commit `987f4fa`). Narzędzia z `mise.toml`: Node.js 22.23.5, npm 10.9.10 (oba były już w mise). Zależności zainstalowane wyłącznie z pliku blokady: `npm ci --no-audit --no-fund` → „added 52 packages in 16s”. Po wszystkich poleceniach `git status --porcelain` jest pusty: powstały tylko katalogi `node_modules/`, `.next/` i `out/`, które projekt ignoruje w `.gitignore`.

Nazwa projektu: folder i repozytorium to `www-maestro`; `package.json` ma `"name": "moonshot-landing"` (pozostałość szablonu, bez wpływu na budowę).

## Dependency Health

### Lockfile

Status: present (`package-lock.json`, lockfileVersion 3)
Package manager: npm

Plik blokady jest jedynym źródłem dokładnych wersji: `package.json` ma wszędzie `latest` (D-002 w `context/foundation/limitations.md`). `npm ci` przechodzi na Node.js 22 / npm 10 bez ostrzeżeń.

### Security Audit

Tool: `npm audit --json` (kod wyjścia 0)
Summary: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW
Direct vs transitive: brak podatności ani w zależnościach bezpośrednich, ani przechodnich (`metadata.vulnerabilities.total: 0`).

Brak luk, więc brak wpisu bezpieczeństwa w rejestrze ograniczeń.

### Outdated Dependencies

Tool: `npm outdated --json`
Packages with major version gaps: 0

Jedyna różnica: **lucide-react** 1.70.0 → 1.75.0 (wersja podrzędna, bez zmiany głównej). Pozostałe zależności (next 16.4.6, react / react-dom 19.3.1, tailwindcss i @tailwindcss/postcss 4.3.5, typescript 7.0.2, @types/*) są na najnowszych wersjach. Uwaga: przy `latest` w `package.json` „wanted” zawsze równa się „latest”, więc każde odświeżenie pliku blokady przyjmie też przyszłe wersje główne (D-002).

## Test Suite

Test runner: not detected
Tests found: not applicable
Test execution: not attempted

⚠ No test runner detected. The agent cannot verify its own changes.

Brak skryptu `test` w `package.json`, brak plików `*.test.*` / `*.spec.*`, brak `playwright.config.*`, `vitest.config.*`, `jest.config.*`, `cypress.config.*`. Jedyne sprawdzenia, które dziś działają (uruchomione w tym kroku):

- `npm exec next -- typegen` → „✓ Types generated successfully”
- `npm run typecheck` (`tsc --noEmit`) → kod 0, bez błędów
- `NEXT_PUBLIC_BASE_PATH=/www-maestro npm run build` (`next build --webpack`, Next.js 16.4.6) → „✓ Compiled successfully”, 3/3 stron statycznych (`/`, `/_not-found`), katalog `out/` z `index.html`; zasoby w `out/index.html` mają prefiks `/www-maestro/` (`/www-maestro/_next/static/...`, `/www-maestro/icon.svg`)

Recommended: Playwright 1.65.0 (zgodny z obrazem przeglądarki `mcr.microsoft.com/playwright:v1.65.0-noble`, który już jest na komputerze fabryki, zob. `## Wymagania komputera` w `start.md`): `npm install --save-dev --save-exact @playwright/test@1.65.0`, plik `playwright.config.ts` z dwoma projektami (360 px i 1280 px) i serwerem statycznym dla `out/` pod ścieżką `/www-maestro`, skrypt `test` w `package.json`, testy uruchamiane w kontenerze (`docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.65.0-noble npx playwright test`). Zakres testów: scenariusz pierwszej wersji z PRD, kroki 1–16 (FR-011).

## CI/CD

Provider: GitHub Actions
Configuration: `.github/workflows/pages.yml`

| Stage      | Status | Notes                                                              |
|------------|--------|--------------------------------------------------------------------|
| Lint       | ✗      | not configured (projekt nie ma lintera)                            |
| Test       | ✗      | not configured (projekt nie ma testów)                             |
| Build      | ✓      | `npm run build` z `NEXT_PUBLIC_BASE_PATH=/www-maestro`             |
| Type check | ✓      | `npm exec next -- typegen` + `npm run typecheck`                   |
| Security   | ✗      | not configured (brak `npm audit`, CodeQL, `.github/dependabot.yml`) |

Workflow buduje i publikuje stronę na GitHub Pages przy każdym pushu na `main` (i ręcznie); uprawnienia minimalne (`permissions: {}`, `pages: write` + `id-token: write` tylko w jobie `deploy`), `persist-credentials: false`. Workflow publikacji zostaje bez zmian (PRD: Non-Goals i krok 16 scenariusza), więc brakujące etapy testów, lintera i skanu nie trafiają do niego w przejęciu — testy przed scaleniem uruchamia lokalnie autopilot poleceniem z `## Verify` w `CLAUDE.md` (D-004).

## Configuration

### High severity

Brak. `tsconfig.json` ma `"strict": true`; `.gitignore` jest i obejmuje `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo`, `/.autopilot-local/`.

### Medium severity

- **`eslint.config.*`** — brak lintera; agent nie dostaje automatycznej informacji o nieużywanym kodzie, błędnych zależnościach hooków React ani regułach Next.js. Fix: osobna zmiana po przejęciu (D-003): `npm install --save-dev --save-exact eslint eslint-config-next`, `eslint.config.mjs` z konfiguracją Next.js, skrypt `lint`.
- **`.prettierrc*` / `biome.json`** — brak formatowania; styl zmian agenta zależy od jego dyscypliny. Fix: ta sama osobna zmiana co linter (D-003); do tego czasu reguła stylu z `context/foundation/stack-assessment.md` (2 spacje, podwójne cudzysłowy, średniki).

### Low severity

- **`.editorconfig`** — brak wspólnych ustawień edytora (wcięcia, końce linii). Fix: plik `.editorconfig` z `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `insert_final_newline = true` — przy zmianie lintera (D-003), bo przejęcie nie dodaje plików poza zapowiedzianymi.
- **`.env.example`** — nie dotyczy w praktyce: jedyna zmienna to `NEXT_PUBLIC_BASE_PATH`, ustawiana w workflow publikacji; README może ją opisać przy opisie uruchomienia (FR przejęcia o README).

## Stack Assessment Cross-Reference

Stack assessment: context/foundation/stack-assessment.md
Agent readiness (from stack-assess): ready-with-compensation

| Quality Gate Gap | Health-Check Finding | Status |
|------------------|----------------------|--------|
| Framework: popularność w danych treningowych — częściowo (Next.js 16.4, React 19.3, Tailwind 4.3, TypeScript 7) | Budowa i typy przechodzą na zainstalowanych wersjach; brak testów, które złapałyby użycie starego API (np. zepsuty eksport statyczny albo `basePath`), a CI sprawdza tylko typy i budowę | Reinforced (kompensuje dopiero test w przeglądarce na stronie zbudowanej z `/www-maestro`) |
| Brak testów (luka, nie bramka) | Brak narzędzia testów, skryptu `test` i etapu testów w CI | Reinforced |
| Wersje `latest` w `package.json` (D-002) | `npm ci` z pliku blokady działa, audyt czysty, brak luk wersji głównych | Mitigated (dopóki instalacja idzie tylko przez `npm ci`) |
| Brak lintera i formatowania | Potwierdzone: brak `eslint.config.*`, `.prettierrc*`, `.editorconfig`; brak etapu lint w CI | Reinforced (D-003) |
| Wpisy do plików instrukcji (`## Recommended Instruction File Additions`) | `CLAUDE.md` ma tylko linie fabryki; `AGENTS.md` ma blok reguł Next.js (czytaj `node_modules/next/dist/docs/`); reszta wpisów (eksport statyczny, `basePath`, `npm ci`, styl, testy) jest tylko w `stack-assessment.md` | Gap — Category B (wdrożenie agenta) |

## Recommended Fixes

### Fix before agent work (Category A)

### 1. Brak testów strony

**Impact**: agent nie ma jak sprawdzić, że zmiana nie zepsuła demo rozmowy, 8 kroków, podglądu aplikacji obiadowej, motywu, FAQ, formularza-demo ani układu 360 px; dziś łapie tylko błędy typów i budowy.
**Severity**: critical
**Effort**: significant (> 1 hour)
**Fix**:

Pierwszy kawałek roadmapy (FR-011, scenariusz PRD kroki 1–16):

```bash
npm install --save-dev --save-exact @playwright/test@1.65.0
# playwright.config.ts: projekty 360x800 i 1280x800, webServer serwujący out/ pod /www-maestro
# package.json: "test": "NEXT_PUBLIC_BASE_PATH=/www-maestro next build --webpack && playwright test"
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.65.0-noble npx playwright test
```

Potem kawałek zmienia `## Verify` w `CLAUDE.md` z dzisiejszego `exit 1` na `npm ci && npm test` (albo uruchomienie w kontenerze).

### 2. Brak lintera i formatowania

**Impact**: styl i jakość zmian agenta nie są sprawdzane automatycznie; nowe wersje Next.js/React (stack assessment) zwiększają ryzyko błędów, które linter Next.js by wskazał.
**Severity**: medium
**Effort**: moderate (15–30 min)
**Fix**:

Odłożone na osobną zmianę (D-003): `npm install --save-dev --save-exact eslint eslint-config-next`, `eslint.config.mjs`, skrypt `"lint": "eslint ."`, potem dopisanie `npm run lint` do polecenia z `## Verify`. Do tego czasu reguła stylu ze `stack-assessment.md`.

### 3. Wersje `latest` w `package.json`

**Impact**: `npm install` albo odświeżenie `package-lock.json` może wciągnąć nową główną wersję Next.js/React/Tailwind/TypeScript i zepsuć budowę; agent musi pamiętać, żeby instalować tylko `npm ci`.
**Severity**: medium
**Effort**: moderate (15–30 min)
**Fix**:

Odłożone (D-002, PRD Non-Goals). Przy pierwszej zmianie zależności: zastąpić `latest` dokładnymi wersjami z `package-lock.json` (next 16.4.6, react / react-dom 19.3.1, lucide-react 1.70.0, tailwindcss / @tailwindcss/postcss 4.3.5, typescript 7.0.2) i sprawdzić `npm ci && npm run build`.

### 4. Brak `.editorconfig`

**Impact**: drobne różnice wcięć i końców linii w zmianach z różnych edytorów.
**Severity**: low
**Effort**: quick (< 5 min)
**Fix**:

```ini
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
```

Razem ze zmianą lintera (D-003).

### Addressed in later steps (Category B)

### CI bez etapów testów, lintera i skanu zależności

**Step**: kawałek testów i późniejsze zmiany (D-004); infrastruktura przejęcia nie zmienia workflow publikacji
**What you'll do there**: dziś testy przed scaleniem uruchamia lokalnie autopilot (`## Verify`); dodanie testów i `npm audit` do workflow to osobna zmiana na życzenie właściciela.

### Wpisy instrukcji dla agenta ze stack assessment

**Step**: wdrożenie agenta (po zabezpieczeniach)
**What you'll do there**: przeniesienie reguł z `## Recommended Instruction File Additions` (eksport statyczny, `basePath`, `npm ci`, styl, testy) do plików instrukcji; blok `<!-- BEGIN:nextjs-agent-rules -->` w `AGENTS.md` zostaje bez zmian.

### Polecenie sprawdzające i blokady

**Step**: zabezpieczenia (instalator blokad autopilota)
**What you'll do there**: blokady edycji plików chronionych, sekretów i zablokowanych testów; polecenie z `## Verify` w `CLAUDE.md` dziś kończy się kodem 1, bo projekt nie ma testów.

## Summary

Health status: critical-issues

Projekt jest w dobrym stanie technicznym: plik blokady działa z `npm ci`, audyt zależności jest czysty (0 luk), żadna zależność nie ma luki wersji głównej, TypeScript jest w trybie ścisłym, a typy i budowa statyczna z prefiksem `/www-maestro` przechodzą lokalnie i w CI. Werdykt „critical-issues” wynika wyłącznie z braku testów: agent nie może sprawdzić zachowania strony po zmianie — to zamyka pierwszy kawałek roadmapy (testy w przeglądarce na 360 px i 1280 px). Pozostałe luki (linter, formatowanie, `.editorconfig`, wersje `latest`, etapy CI) są odłożone w rejestrze ograniczeń (D-002, D-003, D-004).

Next step: dodać testy w pierwszym kawałku roadmapy, then run /guardrails.
