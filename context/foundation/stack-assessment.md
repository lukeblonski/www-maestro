---
project: www-maestro
assessed_at: 2026-11-18T08:00:00+00:00
agent_readiness: ready-with-compensation
context_type: brownfield
stack_components:
  language: TypeScript (strict)
  framework: Next.js 16.4.6 (App Router, static export) + React 19.3.1
  build_tool: next build --webpack (Tailwind CSS 4.3.5 przez @tailwindcss/postcss)
  test_runner: null
  package_manager: npm (package-lock.json, lockfileVersion 3)
  ci_provider: GitHub Actions
  deployment_target: GitHub Pages (https://lukeblonski.github.io/www-maestro/)
gates_passed: 7
gates_failed: 0
---

## Stack Components

Ocena opiera się wyłącznie na plikach w repo (bez uruchamiania kodu i bez instalacji). Wersje z `package-lock.json`, bo `package.json` ma wszędzie `latest` (wpis D-002 w `context/foundation/limitations.md`).

**Język — TypeScript 7.0.2, tryb ścisły.** `tsconfig.json` ma `"strict": true`, `"isolatedModules": true`, `"moduleResolution": "bundler"`, alias `@/*` na katalog główny. `allowJs: true`, ale w repo nie ma plików `.js` z kodem strony (jest tylko `postcss.config.mjs`). Sprawdzenie typów: skrypt `typecheck` (`tsc --noEmit`), w CI poprzedzony `next typegen`. TypeScript 7 to nowa linia kompilatora (natywna); flagi `tsconfig.json` są standardowe.

**Framework — Next.js 16.4.6 z React 19.3.1 (App Router).** `app/layout.tsx` (układ, skrypt motywu przed renderem, klucz `maestro-theme`), `app/page.tsx` (kompozycja sekcji), `app/globals.css` (style, motywy, reguły responsywne i `prefers-reduced-motion`). Komponenty w `components/` (`brand.tsx`, `interactive.tsx` z `"use client"`: `Header`, `HeroDemo`, `ProjectWalkthrough`, `FAQ`, `WaitlistForm`, `ScrollMotion`), treść w `lib/content.ts`, adapter formularza w `lib/waitlist.ts`. `next.config.ts`: `output: "export"`, `basePath` z `NEXT_PUBLIC_BASE_PATH`, `images.unoptimized`, `poweredByHeader: false`. Engines Next.js: `node >=20.9.0`. Ikony: lucide-react 1.70.0. Fonty lokalne DM Sans w `public/fonts/`.

**Narzędzie budowy — `next build --webpack` + Tailwind CSS 4.3.5.** Skrypty `dev` i `build` wymuszają webpack (`--webpack`) zamiast domyślnego w Next.js 16 Turbopacka; `next.config.ts` ma jednak `turbopack.root`. Tailwind 4 przez `@tailwindcss/postcss` (`postcss.config.mjs`), bez pliku `tailwind.config.*` (konfiguracja CSS-first w `app/globals.css`). Wynik: statyczny katalog `out/`.

**Testy — brak.** Nie ma narzędzia testów, plików testów ani skryptu `test` w `package.json`. Jedyne automatyczne sprawdzenia to typy i budowa w CI. `VERIFICATION.md` opisuje sprawdzenia ręczne. PRD (scenariusz pierwszej wersji) wymaga testów w przeglądarce na 360 px i 1280 px — narzędzie dokłada przejęcie (Playwright 1.65.0 w obrazie przeglądarki laboratorium, zob. `## Wymagania komputera` w `start.md`).

**Menedżer pakietów — npm.** `package-lock.json` (lockfileVersion 3), CI instaluje `npm ci`. Brak pliku wersji Node.js w repo; CI używa `node-version: 22` — stąd `mise.toml` z `node = "22"` i `npm = "10"` (npm dołączany do Node.js 22).

**Linter i formatowanie — brak.** Nie ma `eslint.config.*`, `.eslintrc*`, `.prettierrc*` ani `.editorconfig`.

**CI/CD — GitHub Actions.** `.github/workflows/pages.yml`: przy pushu na `main` (i ręcznie) `npm ci` → `next typegen` → `npm run typecheck` → `npm run build` z `NEXT_PUBLIC_BASE_PATH=/www-maestro` → publikacja `out/` na GitHub Pages; uprawnienia minimalne (`permissions: {}` na poziomie workflow, `pages: write` + `id-token: write` tylko w jobie `deploy`). Cel wysyłki: GitHub Pages repozytorium `lukeblonski/www-maestro`, czyli konta właściciela z `origin`. `.openai/hosting.json` to konfiguracja hostingu statycznego innego narzędzia (`directory: out`), bez workflow w repo — nie wiadomo, czy jest używana (PRD, Open Question 1).

**Pliki instrukcji.** `AGENTS.md` (blok reguł Next.js dopisywany przez `next dev`: „This is NOT the Next.js you know”, czytaj `node_modules/next/dist/docs/`), `CLAUDE.md` (linie fabryki), `DESIGN.md` (system wizualny), `VERIFICATION.md`, `README.md`, `.impeccable/design.json`.

## Quality Gate Assessment

| Component  | Typed | Convention | Training Data | Documented | Verdict |
|------------|-------|------------|---------------|------------|---------|
| Language (TypeScript 7, strict) | ✓ | — | — | — | pass |
| Framework (Next.js 16 App Router + React 19) | — | ✓ | ~ | ✓ | pass with note |
| Build tool (next build --webpack + Tailwind 4) | — | ✓ | ✓ | ✓ | pass |
| Test runner | — | — | — | — | brak (luka, nie bramka) |

Legend: ✓ = pass, ✗ = fail, ~ = partial, — = not applicable

Liczenie: 7 sprawdzeń, które mają zastosowanie (typy języka, 3 kryteria frameworka, 3 kryteria narzędzia budowy): 6 zaliczonych w pełni, 1 częściowo (popularność nowych wersji frameworka, liczona jako zaliczona z uwagą), 0 niezaliczonych. Brak testów nie jest niezaliczonym kryterium technologii, tylko luką, którą przejęcie zamyka (PRD FR-011).

### Gate Details

**Typy — zaliczone.** `tsconfig.json`: `"strict": true`; wszystkie pliki kodu to `.ts`/`.tsx` (`app/layout.tsx`, `app/page.tsx`, `components/brand.tsx`, `components/interactive.tsx`, `lib/content.ts`, `lib/waitlist.ts`); CI uruchamia `tsc --noEmit` po `next typegen`.

**Konwencje — zaliczone.** Next.js App Router narzuca układ (`app/layout.tsx`, `app/page.tsx`, `public/`), a projekt ma udokumentowany podział: README („Gdzie wprowadzać zmiany”) wskazuje `lib/content.ts` (treść, `PRODUCT_NAME`), `app/page.tsx` (sekcje), `components/interactive.tsx` (interakcje), `app/globals.css` (style), `public/fonts/`. Tailwind 4 i webpack przez skrypty Next.js — konwencje frameworka.

**Popularność w danych treningowych — częściowo (framework), zaliczone (budowa).** Next.js i React to główny wybór w rodzinie JS/TS, Tailwind to najpopularniejszy CSS utility-first. Uwaga: wersje są nowe — Next.js 16.4, React 19.3, Tailwind 4.3, TypeScript 7 — a `AGENTS.md` wprost ostrzega, że API, konwencje i układ plików mogą różnić się od danych treningowych. Agent musi sprawdzać API w dokumentacji dołączonej do pakietu, nie z pamięci.

**Dokumentacja — zaliczone.** Next.js ma wersjonowaną dokumentację (nextjs.org/docs) i — według `AGENTS.md` — kopię dokumentacji w `node_modules/next/dist/docs/` dla zainstalowanej wersji. React (react.dev), Tailwind 4 (tailwindcss.com/docs) i lucide (lucide.dev) mają aktualną dokumentację.

## Gaps & Compensation

1. **Nowe wersje frameworka względem danych treningowych (częściowe kryterium).** Ryzyko: agent użyje API albo konwencji ze starszego Next.js (np. `next export`, `pages/`, `next/image` z optymalizacją, `next start`) i zepsuje eksport statyczny albo `basePath`. Kompensacja: reguła czytania dokumentacji z `node_modules/next/dist/docs/` (już w `AGENTS.md`) plus reguły eksportu statycznego niżej.
2. **Brak testów.** Ryzyko: każda zmiana treści albo interakcji może po cichu zepsuć demo rozmowy, 8 kroków, motyw, formularz-demo i układ 360 px. Kompensacja: testy w przeglądarce dokładane przez przejęcie (PRD, scenariusz kroki 1–16) i reguła „zmiana zachowania = zmiana testu”.
3. **Wersje `latest` w `package.json`.** Ryzyko: `npm install` zamiast `npm ci` albo odświeżenie pliku zablokowanych wersji wciągnie nową główną wersję. Kompensacja: reguła instalacji tylko `npm ci`; samo przypięcie wersji odłożone (D-002, PRD Non-Goals).
4. **Brak lintera i formatowania.** Ryzyko: niespójny styl kodu w zmianach agenta. Kompensacja: reguła trzymania się stylu istniejących plików (dwie spacje, podwójne cudzysłowy, średniki — jak w `next.config.ts` i `components/*.tsx`); dodanie lintera to osobna zmiana, nie przejęcie.
5. **Bloku w `AGENTS.md` nie wolno usuwać ani edytować.** `next dev` odtwarza go sam; reguła z samego bloku: zostawić go w commicie, gdy się pojawi.

### Recommended Instruction File Additions

Wpisy do wklejenia w `CLAUDE.md` / `AGENTS.md` projektu. Ten krok ich nie wkleja — zostają tutaj, do użycia w kolejnych krokach.

```markdown
## Next.js w tym projekcie
- Next.js 16 z App Router, React 19, Tailwind CSS 4, TypeScript 7 (strict). Przed użyciem API Next.js przeczytaj odpowiedni przewodnik w `node_modules/next/dist/docs/` (wersja zainstalowana), nie polegaj na pamięci ze starszych wersji.
- Strona to eksport statyczny: `output: "export"` w `next.config.ts`. Nie dodawaj tras API, Server Actions, middleware, `next start`, `headers()`/`cookies()` ani niczego, co wymaga serwera. Obrazy tylko z `images.unoptimized`.
- Wszystkie adresy wewnętrzne muszą działać z prefiksem `basePath` (`NEXT_PUBLIC_BASE_PATH`, w publikacji `/www-maestro`). Do plików z `public/` w CSS i w `<link>`/`<img>` używaj ścieżek, które Next.js prefiksuje, albo dopisuj prefiks z `process.env.NEXT_PUBLIC_BASE_PATH`; sprawdzaj budową z `NEXT_PUBLIC_BASE_PATH=/www-maestro`.
- Budowa i dev zawsze przez skrypty `npm run dev` / `npm run build` (wymuszają `--webpack`); nie zmieniaj ich na Turbopack.

## Gdzie co jest
- Cała treść strony i `PRODUCT_NAME`: `lib/content.ts`. Tekstów nie wpisuj na sztywno w komponentach.
- Kolejność i układ sekcji: `app/page.tsx`. Kotwice `#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist` są publiczne — nie zmieniaj ich nazw.
- Interakcje (komponenty klienckie, `"use client"`): `components/interactive.tsx`. Logo: `components/brand.tsx`.
- Motyw: skrypt w `app/layout.tsx` czyta `localStorage` pod kluczem `maestro-theme` przed renderem. Klucza nie zmieniaj; to jedyny zapis w przeglądarce.
- Style, motywy, reguły responsywne i `prefers-reduced-motion`: `app/globals.css` (Tailwind 4, konfiguracja w CSS, bez `tailwind.config.*`). System wizualny: `DESIGN.md`.
- Formularz listy oczekujących to demonstracja: `lib/waitlist.ts` nie wysyła żądań. Nie dodawaj wysyłki, analityki ani zasobów z zewnętrznych adresów (fonty są lokalne w `public/fonts/`).

## Zależności
- Instaluj tylko `npm ci`. `package.json` ma wersje `latest`; `npm install` lub odświeżenie `package-lock.json` może wciągnąć nową główną wersję. Nowe zależności dodawaj z dokładną wersją (`npm install --save-exact`).

## Styl kodu
- Brak lintera i formatowania w repo: trzymaj styl istniejących plików (2 spacje, podwójne cudzysłowy, średniki, komponenty jako `export function NazwaPascalCase`).
- Nie usuwaj i nie edytuj bloku `<!-- BEGIN:nextjs-agent-rules -->` w `AGENTS.md`; `next dev` odtwarza go sam.

## Testy
- Każda zmiana zachowania strony (sekcje, kotwice, motyw, demo rozmowy, 8 kroków, podgląd aplikacji obiadowej, FAQ, formularz, układ 360 px) idzie razem ze zmianą testu w przeglądarce na 360 px i 1280 px, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro`.
```

## Summary

Technologia strony jest przyjazna agentowi z kompensacją: typowany TypeScript w trybie ścisłym, Next.js z App Router o mocnych konwencjach, popularne i dobrze udokumentowane biblioteki, prosty eksport statyczny i działająca publikacja na GitHub Pages konta właściciela. Główne luki to brak jakichkolwiek testów (zamyka je przejęcie), bardzo nowe wersje frameworka względem wiedzy agenta (kompensacja: dokumentacja w pakiecie i reguły eksportu statycznego), wersje `latest` w `package.json` (D-002) i brak lintera. Żadna luka nie wymaga zmiany technologii. Następny krok: `/10x-health-check`.
