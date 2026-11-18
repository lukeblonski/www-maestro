---
date: 2026-11-18T09:56:00+00:00
researcher: Claude (krok research autopilota)
git_commit: eff40e734c4a59dc65a33544fc00b244e0f1be13
branch: testy-zachowania-strony
repository: lukeblonski/www-maestro
topic: "Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji T1–T21 z change.md"
tags: [research, codebase, playwright, verify, testy-w-ci, readme, next-static-export, autopilot]
status: complete
last_updated: 2026-11-18
last_updated_by: Claude (krok research autopilota)
---

# Research: co istnieje, a czego brakuje dla testy-zachowania-strony

**Data**: 2026-11-18T09:56:00+00:00
**Badacz**: Claude (krok research autopilota)
**Commit**: eff40e734c4a59dc65a33544fc00b244e0f1be13
**Gałąź**: testy-zachowania-strony (niewypchnięta, więc bez permalinków)
**Repozytorium**: lukeblonski/www-maestro

## Pytanie

Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji z `context/changes/testy-zachowania-strony/change.md`?

## Podsumowanie

**Kod strony nadaje się do testów bez zmian.** Każdy krok 1–14 da się sprawdzić przez kotwice, role, nazwy dostępne, natywne `details` i wyliczone style, bez `data-testid` (szczegóły niżej). Budowa z `NEXT_PUBLIC_BASE_PATH=/www-maestro` przechodzi w ok. 11 s. Fonty i ikona dostają prefiks. Typy przechodzą także w świeżej kopii repo bez `.next/`. Gitleaks 8.30.1, Docker 29.9.3 bez roota i obraz `mcr.microsoft.com/playwright:v1.65.0-noble` już są na komputerze (sprawdzone w tej sesji). Root w kontenerze to uid 1000 na hoście, więc pliki zapisane przez kontener należą do `fabryka`.

**Wszystko, co dostarcza zmiana, trzeba dopiero dodać:**
- `@playwright/test` 1.65.0 w `devDependencies` i w `package-lock.json`;
- konfigurację Playwright z projektami 360 px i 1280 px;
- mały serwer statyczny podający `out/` pod `/www-maestro/` (bez nowej zależności);
- testy „krok 1” … „krok 16”;
- skrypty `test:e2e`, `verify` i jedno polecenie wszystkich testów;
- opis testów w README;
- sekcje `## Verify`, `## Testy w CI` i `## Uruchomienie lokalne` w `CLAUDE.md`.

**Trzy ustalenia zmieniają plan, więc idą najpierw:**

1. **Autopilot nie uruchamia `## Testy w CI` w tym projekcie.** Dla przejętego projektu (`context_type: brownfield`) krok scalenia uruchamia tylko polecenie z `## Verify` (`/home/fabryka/fabryka/scripts/autopilot.py:5541-5544`, `lab_gate(..., VERIFY_CHECK_NAME, verify_command, ...)`). Polecenie `## Testy w CI` uruchamia tylko workflow CI gałęzi z szablonu guardrails (`autopilot.py:1151-1156`). Takiego workflow tu nie ma i być nie może (D-004, `.github/workflows/**` chronione). Intencja mówi, że Factory uruchamia `## Testy w CI` „przed każdym scaleniem”, a człowiekowi obiecano, że fabryka „sama przeklikuje stronę Maestro przed każdym scaleniem” (`context/foundation/start.md:101`). Kod autopilota tego dziś nie robi. Testy w przeglądarce pobiegną tylko wtedy, gdy uruchomi je krok implementacji albo przeglądu (wiersze Automated planu) albo człowiek.
2. **T15 i T17 są sprzeczne.** T15: test „krok 15” w `npm run verify` uruchamia jedno polecenie wszystkich testów z README i oczekuje kodu 0. To polecenie obejmuje testy w przeglądarce, które wymagają Dockera. T17 i reguła kawałka Factory („polecenie sprawdzające ma przechodzić bez uruchomionych usług lokalnych”, `/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`) zabraniają Dockera w `verify`. Obu naraz nie da się spełnić; patrz Otwarte pytania 2.
3. **`## Verify` biegnie w świeżej kopii repo bez `node_modules`** (`autopilot.py:5351-5431`, `git worktree add --detach`, limit 1800 s). Polecenie w `CLAUDE.md` musi więc samo instalować zależności, np. `` `npm ci && npm run verify` ``. W świeżym worktree `npm ci` trwa ok. 5,5 s, `npm run typecheck` przechodzi bez `.next/`, a `gitleaks git --redact --no-banner .` → „no leaks found”. Commit `5e4dcac` jest osiągalny w worktree (sprawdzone).

## Szczegółowe ustalenia

### Narzędzia i środowisko (stan dziś)

- `package.json:5-9` ma skrypty `dev` (`next dev --webpack --hostname 127.0.0.1`), `build` i `typecheck`. Nie ma `test`, `verify` ani `test:e2e`. Wszystkie zależności mają `"latest"` (D-002), a wersje z `package-lock.json` (lockfileVersion 3) to Next 16.4.6, React 19.3.1, TypeScript 7.0.2 i Tailwind 4.3.5.
- **Dodanie Playwright bez naruszenia T16** (sprawdzone na kopii w katalogu tymczasowym):
  - `npm install -D -E @playwright/test@1.65.0` **przestawia kolejność** kluczy w `dependencies` i `devDependencies` (sortuje alfabetycznie), więc tekstowy diff `package.json` pokazałby więcej niż wpisy testów.
  - Działa za to ręczne dopisanie linii `"@playwright/test": "1.65.0",` w `devDependencies` i potem `npm install --package-lock-only --ignore-scripts`. `package.json` zostaje bajt w bajt taki, jak po ręcznej edycji. W `package-lock.json` przybywają tylko `node_modules/@playwright/test`, `node_modules/playwright` i `node_modules/playwright-core` (1.65.0, `engines.node >=20`), a pozostałe wersje się nie zmieniają.
  - npm traktuje spec `latest` (tag) jako spełniony przez pakiet z rejestru (`~/.local/share/mise/installs/npm/10.9.10/package/node_modules/@npmcli/arborist/lib/dep-valid.js:65-68`), więc nie podnosi wersji frameworka.
- `npm ls` pokazuje dwa pakiety extraneous w lokalnym `node_modules` (`@emnapi/runtime`, `@img/sharp-wasm32`). Nie wpływa to na lockfile ani na `npm ci`, które daje czystą instalację.
- `npm ci --dry-run` przechodzi dziś (T19).
- `tsconfig.json` obejmuje `**/*.ts`, więc testy i `playwright.config.ts` wejdą do `npm run typecheck`, a także do kroku TypeScript w `next build`. Typy `@playwright/test` muszą się rozwiązywać. Wykluczać ich nie wolno, bo `tsconfig.json` ma zostać bez zmian (T16).
- Budowa: `NEXT_PUBLIC_BASE_PATH=/www-maestro NEXT_TELEMETRY_DISABLED=1 npm run build` → kod 0, ok. 11 s, `out/index.html`. Budowa nie zmienia plików śledzonych (`git status` czysty po budowie). `next.config.ts:4` bierze prefiks ze zmiennej.
- Zasoby w `out/`:
  - CSS ma `url(/www-maestro/_next/static/media/dm-sans-*.ttf)`, bo `@font-face` w `app/globals.css:4,11` używa `url("../public/fonts/…")`, a bundler to przepisuje;
  - ikona to `/www-maestro/icon.svg` (`app/layout.tsx:8`);
  - skrypty i style leżą pod `/www-maestro/_next/…`;
  - `out/fonts/*.ttf` są kopiowane, ale nikt ich nie pobiera.
  - Ryzyka 404 dla T14 dziś nie ma.
- `out/` i `.next/` są w `.gitignore`. Nie ma tam `test-results/` ani `playwright-report/`. `change.md` nie wymienia `.gitignore` wśród plików zmiany, więc najprościej ustawić `outputDir` Playwright w już ignorowanym miejscu (np. `node_modules/.cache/…`) i reporter `list` bez raportu HTML. PRD dopuszcza też linie dopisane na końcu `.gitignore` (FR-013); decyduje plan.
- Docker i obraz (sprawdzone w tej sesji): `docker run --rm --network none -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.65.0-noble …` daje `uid=0` w kontenerze. Plik zapisany do zamontowanego katalogu należy na hoście do uid 1000, więc `--user` nie jest potrzebne. W obrazie są Node v26.13.0, `/ms-playwright/chromium-1254` (i `chromium_headless_shell-1254`) oraz `python3`.
- Reguła T18 dla `## Uruchomienie lokalne` jest już spełniona przez `npm run dev`. Skrypt słucha tylko na `127.0.0.1`, a CLI Next bierze port z `PORT`, z domyślnym 3000 (`node_modules/next/dist/bin/next:203`, `.default(3000).env('PORT')`). Brakuje tylko opisu w `CLAUDE.md` i README. README (`README.md:5-25`) ma już `npm ci`, `npm run dev`, budowę i podgląd `python3 -m http.server`, ale nic o testach ani o `PORT`. `start.md:64` notuje, że port 3000 jest zajęty przez inny proces, a Next dev wtedy sam bierze następny wolny.

### Reguły Factory dla sekcji `CLAUDE.md`

- **`## Verify`.** Polecenie to pierwszy fragment w odwrotnych apostrofach poza blokiem kodu (`autopilot.py:1737-1743`). Biegnie przez `sh -c` w świeżym worktree commita do scalenia, z PATH z mise. Kod różny od 0 zatrzymuje scalenie (`autopilot.py:5434-5445`). Szablon sekcji w `/home/fabryka/fabryka/skills/guardrails/SKILL.md:46-60` kończy się linią „Last passing run (<data>)” i 2–3 dosłownymi liniami wyniku. Standardowy skan sekretów to `gitleaks git --redact --no-banner .` na końcu `verify` (`skills/guardrails/SKILL.md:42`).
- **`## Testy w CI`.** Jedno polecenie w odwrotnych apostrofach, skrypt menedżera pakietów. W aplikacji z ekranami „samo przygotowuje przeglądarkę w CI, … a lokalnie … w obrazie kontenera” (`kawalek-intencja.md:14`).
- **`## Uruchomienie lokalne`.** Pierwsze polecenie w odwrotnych apostrofach (`fabryka/scripts/podglad.py:120`), port z `PORT`, nasłuch tylko na 127.0.0.1, to samo polecenie w README (`kawalek-intencja.md:14`, `docs/start-projektu.md:316`).
- **Gotowy wzór Playwright w kontenerze:** `/home/fabryka/projekty/dziennik-wagi/scripts/test-e2e.sh` i `scripts/kontener-e2e.sh`, z sekcją `## Testy w CI` w jego `CLAUDE.md` (linie 64-68). Wzór robi cztery rzeczy:
  - przy `CI` uruchamia `npx playwright install --with-deps chromium` i odpala testy wprost;
  - lokalnie uruchamia się ponownie przez `docker run --rm --ipc=host -v "$PWD":/work -w /work … "$obraz"`;
  - tag obrazu bierze z `require('@playwright/test/package.json').version`;
  - włącza Dockera przez `systemctl --user start docker`, gdy ten nie działa.

  W www-maestro wystarczy budować na hoście (Node 22) i w kontenerze tylko podawać `out/` i uruchamiać Playwright. Wtedy `--network none` jest możliwe, bo serwer i przeglądarka są w tym samym kontenerze na loopbacku. Dodatkowo blokuje to każde żądanie na zewnątrz (pomaga T11, ale test i tak musi je zapisywać). Nazwę kontenera, jeśli jest, trzeba brać z folderu roboczego (reguła o zasobach lokalnych w `kawalek-intencja.md:14`).
- **Uruchomienie Playwright bez przeglądarki.** Playwright uruchamia przeglądarkę dopiero, gdy test używa fixture `page`/`browser`. Testy kroków 15–16 bez `page` przejdą więc na hoście bez zainstalowanych przeglądarek. `webServer` z konfiguracji startuje jednak dla każdego uruchomienia tej konfiguracji. Testy bez przeglądarki potrzebują więc osobnej konfiguracji (np. drugi plik konfiguracji) albo `webServer` warunkowego. Inaczej `verify` budowałby i podawał stronę.
- **`--grep "krok 1\b"`.** npm dokleja argumenty po `--` na końcu polecenia skryptu. Skrypt-opakowanie musi je więc przekazać dalej do `playwright test` (`"$@"`). W cudzysłowie bash `\b` zostaje dosłownie, więc regex to `krok 1\b`. Tytuły testów muszą mieć postać „krok N …” ze spacją albo znakiem niebędącym cyfrą po numerze. Wtedy `krok 1\b` nie łapie „krok 10”–„krok 16”. Nazwy plików i projektów nie mogą zawierać ciągu „krok <cyfra>”, bo grep dopasowuje się do ścieżki tytułu.
- **Hooki zabezpieczeń.**
  - `lock_tests.py` blokuje tylko ścieżki z `.claude/locked-tests`. Ten plik nie istnieje, więc nowe testy można pisać swobodnie.
  - `protect_paths.py` blokuje narzędziom plików `.github/workflows/**`, `.env*`, `**/secrets/**` i pliki `.claude` zabezpieczeń (`.claude/guardrails.json`, `/home/fabryka/projekty/www-maestro/.claude/hooks/guardrails/guardlib.py:26-38`). Zmiana ich nie potrzebuje.
  - `block_secrets.py` blokuje treść podobną do kluczy (`guardlib.py:40-44`).
- **T21 (`validate_change.py --rules 6`,** `/home/fabryka/.claude/skills/10x-impl-review/scripts/validate_change.py:795-836`). Każdy plik zmieniony commitami `<typ>(testy-zachowania-strony): …` poza `context/` musi pasować do ścieżki w backtickach w linii `**File**:`/`**Files**:` pod `### Changes Required` fazy planu. Dozwolone są `{a,b}`, katalog z `/` i `*`. Plan musi więc wymienić `package.json`, `package-lock.json`, `README.md`, `CLAUDE.md`, plik(i) konfiguracji Playwright, `tests/` i ewentualne skrypty (np. `scripts/`).

### Strona: czym test może trafić w każdy krok (bez zmian kodu)

Wszystkie sekcje są w `main#main` (`app/page.tsx`). Żadna sekcja nie ma `aria-label`, więc nie ma roli `region` (z wyjątkiem obszaru tabeli).

- **T1 kolejność.** `section#top.hero` z h1 (`page.tsx:36`) → `#why` (76) → `#how-it-works` (99) → `#observer` (108) → `section.principles-section` bez id (155) → `#ownership` (181) → `section.comparison-section` bez id (206) → `#first-release` (252) → `section.audience-section` bez id (308, h3 „Made for you if…” i „Consider another approach if…”) → `#faq` (335) → `#waitlist` (339) → `footer` poza `main` (350, rola `contentinfo`).
  - **Roadmapa nie jest osobną sekcją.** To `div.roadmap` z własnym h2 wewnątrz `#first-release` (`page.tsx:277`). Kolejność z PRD trzeba więc sprawdzać po kolejności nagłówków h1/h2 i kotwic, nie po liczbie `section`.
  - Sekcje bez id trzeba rozpoznać po h2. Nagłówki to nazwy dostępne, więc spełniają T20. Można też importować tytuły z `lib/content.ts`, który nie ma importów, zamiast kopiować zdania.
  - Kodu z `console.*` nie ma. Ryzyko ostrzeżeń hydracji jest niskie, bo `<html suppressHydrationWarning>` (`layout.tsx:15`) obejmuje jedyną różnicę, `data-theme`.
- **T2 linki `#`.**
  - `#main`: skip link „Skip to main content” (`page.tsx:31`).
  - `#top`: trzy linki o nazwie „Back to top” (logo w nagłówku `components/interactive.tsx:39`, logo w stopce `page.tsx:352`, tekst w stopce `page.tsx:357`).
  - `#waitlist`: trzy linki „Join the first release” (nagłówek, hero `page.tsx:48`, karta wydania `page.tsx:263`), a do tego przycisk formularza o tej samej nazwie.
  - `#how-it-works`: hero „See how it works” (`page.tsx:52`).
  - Zduplikowane nazwy trzeba zawęzić do `banner`, `contentinfo` albo sekcji, inaczej tryb ścisły Playwright zgłosi błąd.
  - `html { scroll-behavior: smooth }` (`globals.css:52-53`): sprawdzenie „w widoku” musi czekać na stan (`toBeInViewport`) albo emulować `reducedMotion: 'reduce'`.
- **T3 przewijanie.** `getByRole('region', { name: <tytuł porównania> })` to `div.comparison-scroll` z `role="region"`, `aria-label` i `tabIndex=0` (`page.tsx:211-216`), `overflow-x: auto` (`globals.css:1074`), tabela min. 720 px albo 690 px przy ≤900 px (`globals.css:1082, 1869`). `html` ani `body` nie ma `overflow-x: hidden/clip`, więc porównanie `scrollWidth === clientWidth` dokumentu ma realny sygnał.
- **T4 nagłówek.** `banner` zawiera logo „Back to top”, przycisk motywu i link CTA „Join the first release” (`interactive.tsx:37-55`). Przy `max-width: 700px` CTA dostaje `display: none` (`globals.css:1627-1628`), czyli jest w DOM, ale ukryty. Na 360 px trzeba więc sprawdzać `toBeHidden()`, nie liczbę elementów. Elementu `nav` ani menu nie ma nigdzie.
- **T5 motyw.**
  - Skrypt w `<head>` (`layout.tsx:10,17`) ustawia `html[data-theme]`: najpierw z `localStorage['maestro-theme']`, inaczej z `prefers-color-scheme`. Emulacja `colorScheme` w Playwright więc działa.
  - Przycisk ma nazwę „Switch to dark theme” albo „Switch to light theme” (`interactive.tsx:45`), bez `aria-pressed`.
  - **Pułapka:** w statycznym HTML etykieta to zawsze „Switch to dark theme” i poprawia ją dopiero `useEffect` (`interactive.tsx:24-27`). Przy ciemnym starcie test musi czekać na właściwą etykietę przed kliknięciem.
  - Zapis motywu jest w `interactive.tsx:31-33`. Innego użycia `localStorage` ani `sessionStorage` nie ma.
- **T6 demo rozmowy** (`interactive.tsx:60-151`).
  - Przycisk „Yes. Start with tonight.” jest w `div.demo-action[aria-live=polite]`. Po kliknięciu znika, pojawia się tekst potwierdzenia i przycisk „Replay the conversation”.
  - Status `strong` zmienia się z „Your direction, ready to review” na „Direction approved. Planning next.”.
  - Kroki ścieżki zmieniają tylko klasy `li.done/.active`, bez `aria-current`. Test powinien opierać się na przyciskach i statusie.
  - Teksty mają typograficzny apostrof (U+2019).
- **T7 osiem kroków** (`interactive.tsx:153-260`).
  - `getByRole('group', { name: 'Step' })` zawiera 8 przycisków z `aria-pressed` i `aria-controls="example-panel"`. Ich nazwy zaczynają się od numeru („01” + tytuł), więc trzeba dopasowywać podciąg albo regex.
  - `#example-panel .example-copy` ma `aria-live` i pokazuje „Step N of 8”, h3 z tytułem i opis.
  - „Previous step” jest `disabled` na kroku 1, a „Next step” na kroku 8.
- **T8 podgląd obiadu** (`interactive.tsx:189-218`, tylko w kroku 3).
  - Przycisk „Show a dinner idea” zmienia się w „Reset the preview”, a wynik jest w `role=status`. Zmiana kroku resetuje podgląd.
  - Zawsze istnieje drugi `role=status` (`#waitlist-status`), więc zapytanie trzeba zawęzić do `#example-panel`.
- **T9 FAQ** (`interactive.tsx:262-276`): 7 natywnych `details/summary`. Test klika `summary` w `#faq details` i sprawdza właściwość `open` albo widoczność odpowiedzi.
- **T10 formularz** (`interactive.tsx:278-335`).
  - Pole to `getByLabel('Email address')` (`#waitlist-email`, `type=email`, `required`, formularz `noValidate`), a przycisk `getByRole('button', { name: 'Join the first release' })`.
  - Ważność sprawdza `validity.valid`, więc pusty adres i adres bez „@” dają błąd.
  - Przy błędzie pole dostaje `aria-invalid="true"`, fokus wraca do pola, a w `#waitlist-status` pojawia się komunikat. Ten element ma `role=status` i `aria-live=polite`, istnieje od początku i jest pusty. `role=alert` nie ma, a „obszar ogłaszany czytnikom ekranu” to właśnie ten `status`.
  - Poprawny adres daje komunikat podglądu „Preview complete. No details were sent or saved. …”. Wpisywanie czyści status (`interactive.tsx:306`).
  - `submitWaitlist` (`lib/waitlist.ts:7-11`) nie wykonuje żądania. Test zapisuje `page.on('request')` od chwili po załadowaniu i oczekuje 0 żądań przy trzech wysyłkach.
- **T11 żądania.** W kodzie nie ma zewnętrznych URL-i (jest tylko `xmlns` SVG, który nie jest żądaniem). Wszystkie linki prowadzą wewnątrz strony, a fonty i ikona są lokalne.
- **T12 ograniczony ruch.** `@media (prefers-reduced-motion: reduce)` (`globals.css:2038-2047`) ustawia `scroll-behavior: auto` oraz `animation: none !important; transition: none !important` dla wszystkich elementów. `ScrollMotion` (`interactive.tsx:337-356`) sprawdza `matchMedia` przy montowaniu i wtedy nie dodaje obserwatora. Test: `reducedMotion: 'reduce'`, potem `getComputedStyle(documentElement).scrollBehavior !== 'smooth'`, a po przewinięciu `document.getAnimations()` bez stanu `running`.
- **T13 kontrast.**
  - Zmienne motywu jasnego są w `globals.css:16-31`, ciemnego w `globals.css:33-48`.
  - Panele `--forest` używają `--on-forest`, `--forest-muted` i `--lime`.
  - Nie ma gradientów, `rgba` ani `color-mix` w tłach, więc szukanie najbliższego nieprzezroczystego przodka działa. Wyjątkiem jest obrócony `.hero-demo:before` za oknem demo, które samo ma nieprzezroczysty `--surface`.
  - Przyciski `disabled` mają `opacity: .35` i są zwolnione z wymogu kontrastu, więc test powinien je pominąć.
  - Animacja `reply-in` (`globals.css:1439`) startuje od `opacity .6`. Kontrast trzeba więc mierzyć przy `reducedMotion: 'reduce'` albo po zakończeniu animacji (`document.getAnimations()` + `finished`), nie czekając stałym czasem (T20).
- **T14 zasoby pod prefiksem.** Dziś wszystko ładuje się pod `/www-maestro/…` (patrz Narzędzia). Test zapisuje `response.status()` dla zasobów typu font, ikona (`/icon.svg`), stylesheet i script.

### Testy bez przeglądarki (kroki 15–16)

- **Krok 16.** Wystarczy `git diff --quiet 5e4dcac -- app components lib public .github/workflows/pages.yml next.config.ts tsconfig.json postcss.config.mjs`, a dla `package.json` porównanie semantyczne: JSON z `git show 5e4dcac:package.json` i JSON bieżący bez dozwolonych kluczy skryptów testów i `devDependencies['@playwright/test']`.
  - Dziś te ścieżki nie różnią się od `5e4dcac`. Diff `5e4dcac..HEAD` dotyka tylko `.claude/`, `.fabryka`, `.gitignore`, `CLAUDE.md` i `mise.toml`.
  - Test potrzebuje pełnej historii, co lokalnie i w worktree autopilota jest spełnione. W CI z `fetch-depth: 1` by padł, ale CI dla tej zmiany nie powstaje.
- **Krok 15.** README dziś nie ma polecenia testów. Jak uniknąć pętli (zmienna środowiska pomijająca „krok 15”) i jak pogodzić to z T17, opisują Otwarte pytania 2.

## Odwołania do kodu

- `package.json:5-9`: skrypty dziś; brak `test`, `verify` i `test:e2e`.
- `next.config.ts:4`: `basePath` z `NEXT_PUBLIC_BASE_PATH`.
- `app/layout.tsx:8,10,15,17`: ikona z prefiksem, skrypt motywu, `suppressHydrationWarning`.
- `app/page.tsx:31-357`: kolejność sekcji, kotwice i linki `#`.
- `app/page.tsx:211-216`: obszar przewijania tabeli porównania (`role=region`).
- `components/interactive.tsx:24-45`: przełącznik motywu i `maestro-theme`.
- `components/interactive.tsx:60-151`: demo rozmowy.
- `components/interactive.tsx:153-260`: 8 kroków i podgląd obiadu (189-218).
- `components/interactive.tsx:262-276`: FAQ `details`.
- `components/interactive.tsx:278-335`: formularz-demo.
- `components/interactive.tsx:337-356`: `ScrollMotion` i reduced motion.
- `lib/waitlist.ts:7-11`: adapter bez żądania.
- `app/globals.css:4,11`: `@font-face` (przepisane na `/www-maestro/_next/static/media/…`).
- `app/globals.css:52-53`: `scroll-behavior: smooth`.
- `app/globals.css:1627-1628`: ukrycie CTA w nagłówku ≤700 px.
- `app/globals.css:2038-2047`: reguła ograniczonego ruchu.
- `/home/fabryka/fabryka/scripts/autopilot.py:5541-5544`: scalenie przejętego projektu bramkuje tylko `## Verify`.
- `/home/fabryka/fabryka/scripts/autopilot.py:5351-5445`: `## Verify` w świeżym worktree, limit 1800 s.
- `/home/fabryka/fabryka/docs/sesja/kawalek-intencja.md:14`: reguły kawałka (`## Testy w CI`, `## Uruchomienie lokalne`, verify bez usług lokalnych).
- `/home/fabryka/projekty/dziennik-wagi/scripts/test-e2e.sh`, `scripts/kontener-e2e.sh`: wzór Playwright w kontenerze.
- `/home/fabryka/.claude/skills/10x-impl-review/scripts/validate_change.py:795-836`: reguła 6 (T21).

## Wnioski o architekturze

- Strona to statyczny eksport z jednym modułem klienckim (`components/interactive.tsx`). Stan interakcji widać przez role, nazwy, `aria-pressed`, `disabled`, `aria-invalid`, `aria-live`/`role=status` i natywne `details[open]`. To wystarcza do testów bez `data-testid` i bez kopiowania zdań (T20). Dla sekcji bez id nazwą dostępną jest h2.
- Najtańsza architektura uruchomienia:
  1. budowa na hoście (Node 22 z mise, `NEXT_PUBLIC_BASE_PATH=/www-maestro`, `NEXT_TELEMETRY_DISABLED=1`);
  2. w kontenerze `--network none` serwer statyczny w Node (bez zależności), który mapuje `/www-maestro/*` na `out/*` z 404 dla reszty, uruchomiony jako `webServer` Playwright na 127.0.0.1;
  3. dwa projekty Chromium: telefon 360 px i komputer 1280 px;
  4. przy `CI` ten sam skrypt instaluje Chromium i biegnie bez kontenera.
- Testy bez przeglądarki w tym samym `@playwright/test` (`test-plan.md:94`), w osobnej konfiguracji bez `webServer`, uruchamiane na hoście w `verify`.

## Kontekst historyczny

- `context/foundation/test-plan.md:68-79`: jeden etap = S-01. Kolejność ochrony to wspólna budowa z prefiksem → #1 i #2 → #3 → #5 i #6 → #7. Wzorce 6.1–6.5 są „TBD — see Phase 1”, więc wypełnia je ta zmiana. `test-plan.md:118-119` nadal mówi, że testy w przeglądarce idą w `## Verify`; intencja to już rozdzieliła.
- `context/foundation/limitations.md`: D-002 (wersje `latest`, instalacja tylko `npm ci`), D-003 (bez lintera, `verify` nie dostaje lintu), D-004 (workflow publikacji bez testów; „testy przed scaleniem uruchamia lokalnie autopilot” to założenie, którego kod autopilota dziś nie realizuje, patrz Podsumowanie 1).
- `context/foundation/start.md:99-104`: pozycja „Do decyzji na posiedzeniu” obiecuje człowiekowi przeklikanie strony w przeglądarce przed każdym scaleniem. `start.md:145` pokazuje sprawdzenie obrazu `--network none`.
- `/home/fabryka/projekty/dziennik-wagi/CLAUDE.md:64-68`: gotowy tekst `## Testy w CI` innego projektu Factory z tym samym obrazem 1.65.0.

## Powiązane badania

- Brak: to pierwsza zmiana projektu; `context/archive/` jest pusty.

## Otwarte pytania

1. **Kto uruchamia testy w przeglądarce przed scaleniem?**
   - Autopilot dla tego projektu bramkuje tylko `## Verify` (`autopilot.py:5541-5544`), a CI gałęzi nie ma i nie powstanie (D-004, zakres „Czego nie robimy”).
   - Rekomendacja dla `/10x-plan`: wiersze Automated planu uruchamiają `npm run test:e2e -- --grep "krok N\b"`, więc kroki implementacji i przeglądu tej zmiany uruchomią testy w przeglądarce. Przyszłe zmiany powinny robić to samo (dopisać do wzorca 6.1 w `test-plan.md`).
   - Rozbieżność z obietnicą z `start.md:101` i z intencją („Factory uruchamia przed każdym scaleniem”) to sprawa Factory (`autopilot.py`), nie tego repo. Sesja główna powinna zgłosić ją człowiekowi. Ta zmiana nie może jej naprawić bez złamania D-004 albo reguły `verify` bez usług lokalnych.
2. **Sprzeczność T15 z T17.**
   - Jedno polecenie wszystkich testów z README (np. `npm test` = `verify` + `test:e2e`) wymaga Dockera. „Krok 15” w `verify` miałby je uruchomić i oczekiwać kodu 0, a `verify` ma przechodzić bez Dockera.
   - Wykonalne warianty:
     - (a) „krok 15” przechodzi do polecenia z `## Testy w CI`. Opakowanie `test:e2e` po przebiegu kontenera uruchamia go na hoście; uruchamia on polecenie z README ze zmienną pomijającą „krok 15”. Koszt: testy 1–14 biegną dwa razy w tym poleceniu, a T15 zmienia „Sprawdzenie” z `npm run verify` na polecenie z `## Testy w CI`.
     - (b) `verify` uruchamia Dockera przez „krok 15”. To łamie T17 i regułę Factory.
     - (c) „krok 15” w `verify` sprawdza tylko README i to, że polecenie wskazuje istniejące skrypty, bez uruchomienia. To łamie dosłowne T15 i decyzję z przeglądu intencji.
   - Rekomendacja: (a), bo zachowuje twardą regułę Factory i sens kroku 15 PRD (polecenie z README naprawdę przechodzi). Zmienia jednak „Sprawdzenie” T15 w intencji, więc wymaga decyzji przy planie; gdyby miała dotknąć intencji poza planem, decyduje człowiek.
3. **Pliki wyników Playwright.** `outputDir` w ignorowanym `node_modules/.cache/…` z reporterem `list` czy linia `test-results/` dopisana na końcu `.gitignore` (dozwolone przez PRD FR-013, ale nie wymienione w ograniczeniach `change.md`)? Rekomendacja: pierwsze, bo nie dotyka `.gitignore`.
4. **`next dev` zmienia śledzony `next-env.d.ts` (sprawdzone).**
   - `PORT=3199 npm run dev` słucha tylko na `127.0.0.1:3199` i odpowiada 200, ale przepisuje importy w `next-env.d.ts` z `./.next/types/…` na `./.next/dev/types/…`. `tsconfig.json` zostaje bez zmian.
   - `next-env.d.ts` nie jest na liście T16, więc „krok 16” nie padnie. Brudne drzewo po sprawdzeniu T18 może jednak trafić do commita i złamać T21.
   - Rekomendacja: plan nie commituje `next-env.d.ts`, a krok, który uruchamia dev, przywraca plik (`git checkout -- next-env.d.ts`); kolejna `npm run build` też zapisuje go w postaci budowy. Wzmianka w README jest opcjonalna. Zmiana dev-servera została po sprawdzeniu cofnięta.
