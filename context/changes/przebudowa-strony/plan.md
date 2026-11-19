# Przebudowa treści i układu strony Maestro — Implementation Plan

## Overview

Strona zapowiedzi Maestro dostaje nowy układ i treść według makiety przyjętej przez właściciela (`context/changes/przebudowa-strony/makieta/makieta.html`, sha256 `f81e9dc0…91ce`). Powstają: nagłówek z logo i przyciskiem zapisu, hero na cały ekran, pięć sekcji ze spisem po lewej, porównanie z kreatorami aplikacji z promptu, FAQ z 8 pytaniami i koniec strony z jedynym formularzem zapisu. Strona ma jeden jasny motyw i fonty Host Grotesk i JetBrains Mono. Formularz, funkcja zapisu i workflow publikacji się nie zmieniają. Testy kroków 1–14 i krok 16 dostają nowe asercje według kryteriów P1–P14 z `change.md`.

## Current State Analysis

Według `research.md`:

- `app/page.tsx:31-362` ma 13 bloków starej strony (hero „…Autonomously.”, data wydania, wizja 2027, `HeroDemo`, przykład w 8 krokach, roadmapa, trzy kolumny porównania). Brakuje kotwic `#control`, `#deploy`, `#after-launch`.
- Motyw: `themeScript` w `app/layout.tsx:10`, przełącznik w `components/interactive.tsx:23-58`, ciemne tokeny w `app/globals.css:34-50`.
- Do ponownego użycia: `WaitlistForm` (`components/interactive.tsx:278-352`) i `lib/waitlist.ts` z komunikatami (`lib/content.ts:396-407`, już zgodne z makietą), `FAQ` na `<details>` (`components/interactive.tsx:262-276`), `BrandMark` (`components/brand.tsx`), fonty podawane przez `url("../public/…")` w CSS (`app/globals.css:2-15`), które webpack przepisuje na `/www-maestro/_next/static/media/…`.
- Testy kroków 1–10, 12, 13 sprawdzają starą stronę. Wspólne blokady: `poHydracji` czeka na `header button` (`tests/e2e/pomoc.ts:51-56`), testy importują klucze `lib/content.ts`, które znikną (a `typecheck` obejmuje testy, D-011), krok 4 zabrania roli `navigation` na całej stronie, krok 1 szuka `footer` po `#waitlist`.
- Krok 14 (`tests/e2e/zasoby.spec.ts:4`) nie sprawdza obrazów; `scripts/serwer-statyczny.mjs:20-32` nie zna typu `.webp`.
- Krok 16 (`tests/repo/zakres-przejecia.spec.ts:12-35`) zamraża `app`, `components`, `lib`, `public`, konfigurację budowy i `package.json` wobec `5e4dcac`, poza listą `PLIKI_ZMIAN` zmiany lista-oczekujacych. `package.json` nie może zmienić zależności.
- Makieta ma w base64 trzy pliki, w tej kolejności: Host Grotesk woff2 (wiersz 5), JetBrains Mono woff2 (wiersz 6) i obraz hero webp (wiersz 57). Sprawdziłem: rozkodowane mają sumy sha256 `ce9c9db8a488852eb7e4a52f51fd8ce0c93ef61a8d3bfa054b509ec92958dcfe` (20296 B), `18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e` (40404 B) i `151d291c45e55498969171b3215fa979d001c18878a71e0fdeeb10cdd5b3e38a` (92032 B, `RIFF…WEBPVP8X`). Tabele `name` fontów podają: „Copyright 2023 The Host Grotesk Project Authors (https://github.com/Element-Type/HostGrotesk)” i „Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)”.
- Makieta kłóci się z intencją w dwóch miejscach: kolor `--quiet` `#9aa3ab` ma 2.56:1 na bieli i 2.28:1 na `--sky-soft` (wymóg 4.5:1), placeholder `#6b7a87` ma 2.90:1 na `--sky`, a kolumna Maestro ma tło `--sky-soft` (`makieta.html:96`, `:157`), choć intencja mówi „Czego nie będzie: … podświetlania kolumny Maestro”.
- Research sprawdził zdania kolumny „Prompt-to-app builders” w źródłach producentów: wiersze 2–5 są prawdziwe, wiersze 1 („Anyone who wants a quick prototype”) i 6 („Up to you”) wprowadzają w błąd.

## Desired End State

- `app/page.tsx` składa stronę w kolejności: link pominięcia, `<header>` (logo, „Join the first release” → `#waitlist`), `<main id="main">` z hero `#top`, blokiem `#how-it-works` (spis `nav[aria-label="Chapters"]` i sekcje `#observer`, `#control`, `#deploy`, `#after-launch`, `#ownership`), porównaniem `#why` i FAQ `#faq`, potem `<footer id="waitlist">` z `<span id="first-release">`, formularzem, słowem „maestro” i stopką.
- Cała treść jest w `lib/content.ts` i jest dosłownie taka jak w makiecie, poza wierszami 1 i 6 kolumny kreatorów (Decyzje planu).
- Brak przełącznika i skryptu motywu, `color-scheme: light`, strona nie czyta ani nie zapisuje `localStorage`.
- Fonty i obraz hero są plikami w `public/` podawanymi pod `/www-maestro/_next/static/media/…`; stare pliki DM Sans znikają.
- `npm run test:e2e && npm ci && npm run verify` przechodzi, a `validate_change.py przebudowa-strony --rules 6` nie zgłasza plików spoza planu.

### Odstępstwa od makiety (dla weryfikatora P14)

Zamierzone różnice wobec przyjętej makiety; każda wynika z tekstu przyjętej intencji albo z kodu, który ma zostać:

1. `--quiet` ma wartość `#646d76` zamiast `#9aa3ab` (5.26:1 na bieli, 4.68:1 na `--sky-soft`); placeholder pola e-mail ma `#4d5964` zamiast `#6b7a87` (4.71:1 na `--sky`). Powód: ograniczenie „kontrast tekstu co najmniej 4.5:1”.
2. Komórki kolumny Maestro nie mają tła `--sky-soft` (ani na komputerze, ani w blokach poniżej 640 px). Nagłówek kolumny Maestro zostaje jak w makiecie (znak i font bezszeryfowy). Powód: „Czego nie będzie: … podświetlania kolumny Maestro”.
3. Kolumna „Prompt-to-app builders”: wiersz „Made for” brzmi „Anyone who wants to build an app by chatting with AI”, a wiersz „After launch” — „Optional monitoring and AI fixes on some plans, which you turn on and oversee”. Powód: P12 i zapowiedź z pytania o akceptację, że Factory poprawi nieprawdziwe zdania o kreatorach.
4. Formularz to dzisiejszy `WaitlistForm` (identyfikatory `#waitlist-email` i `#waitlist-status`, `name`, `required`, pole-pułapka `website`, prawdziwa wysyłka), w układzie i klasach makiety (`.join`, `.field-row`, `.status`).
5. Link pominięcia „Skip to main content” zostaje (niewidoczny, pokazuje się przy fokusie).
6. Fonty i obraz są plikami z adresu strony, a nie `data:` (ograniczenie z intencji i krok 14).

### Key Discoveries:

- `context/changes/przebudowa-strony/makieta/makieta.html:12-162`: pełny CSS strony do przeniesienia do `app/globals.css`; `:318-332`: logika spisu (35% wysokości okna, `requestAnimationFrame`, `scroll` i `resize`).
- `app/globals.css:1`: `@import "tailwindcss"` daje dziś tylko preflight; makieta go nie ma, a preflight zmienia m.in. `svg { display: block }` i style `summary`.
- `tests/e2e/pomoc.ts:51-56`: `poHydracji` trzeba przepiąć na przycisk wysyłki w `#waitlist` (jedyny przycisk klienta na stronie z propsami Reacta).
- `tests/e2e/motyw-siec-dostepnosc.spec.ts:83-152`: `zmierzKontrast` mierzy kolor elementu na tle najbliższego nieprzezroczystego przodka i pomija elementy niewidoczne (`checkOpacity`), więc pozycje spisu trzeba zmierzyć przy fokusie, a placeholder osobno (`::placeholder`).
- `tests/repo/zakres-przejecia.spec.ts:31`: wyjątki to pathspec `:(exclude)<ścieżka>`; katalog (`public/fonts`) wyłącza też usunięte i nowe pliki w nim.
- `AGENTS.md`: przed pisaniem kodu Next czytać przewodnik z `node_modules/next/dist/docs/` (metadane, CSS `url()`).

## Decyzje planu

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Kontrast `--quiet` i placeholdera (research, pytanie 1) | `--quiet: #646d76`, placeholder `#4d5964`; krok 13 mierzy też `span.q`, pozycje spisu przy fokusie i placeholder | Intencja wymaga 4.5:1 dla tekstu, a te kolory są najbliższymi kolorami makiety, które go spełniają na wszystkich tłach strony. |
| Podświetlenie kolumny Maestro (research, pytanie 2) | Bez tła komórek kolumny Maestro; krok 7 sprawdza, że tło komórek obu kolumn jest takie samo | Przyjęta intencja i pytanie o akceptację wymieniają to wprost w „Czego nie będzie”. |
| Wiersze 1 i 6 porównania (research, pytanie 3) | Nowe brzmienie z „Odstępstw od makiety”, pkt 3; wiersze 2–5 bez zmian | P12 wymaga zgodności z wnioskiem researchu, a człowiek przyjął zapowiedź poprawienia nieprawdziwych zdań przed budową; w wierszu 6 „Optional … on some plans” zamiast „some paid plans”, bo research nie potwierdził, że każda z tych funkcji jest płatna. |
| Element `#waitlist` (research, pytanie 4) | `<footer id="waitlist">` jak w makiecie; krok 1 sprawdza, że to ostatni element `body` poza `script` i `next-route-announcer` i stoi po `<main>` | Wierność makiecie (P14), a krok 1 i tak jest przepisywany. |
| Ikona karty (research, pytanie 5) | `public/icon.svg`: tło `#111111`, znak `#ffffff` | Intencja usuwa zielone kolory, a makieta nie pokazuje ikony; to najmniejsza zmiana zgodna z nowymi kolorami. |
| Link pominięcia nawigacji (research, pytanie 5) | Zostaje, niewidoczny do fokusu | Kotwica `#main` ma działać, a link nie zmienia wyglądu ekranu z makiety. |
| `meta description` (research, pytanie 5) | Zdanie z hero: „Your partner in building the right product, the right way. You agree on what to build. Maestro takes care of the rest.” | Dzisiejszy opis to usuwany tekst starego hero, a intencja nie podaje innego. |
| `DESIGN.md`, `VERIFICATION.md`, README, `CLAUDE.md`, `test-plan.md` (research, pytanie 5) | Aktualizacja opisów w fazie 3 | Opisują zielony motyw, ciemny motyw, demo rozmowy i stary krok 16, więc wprowadzałyby w błąd następne zmiany; PRD zostawia te pliki, nie ich treść. |
| `.impeccable/design.json` i `stack-assessment.md` (research, pytanie 5) | Bez zmian | Plik `.impeccable` generuje zewnętrzne narzędzie, którego repo nie używa, a ocena stosu to zapis historyczny. |
| Źródła o kreatorach (research, pytanie 6) | Werdykty z dokumentacji producentów, wiersze 1 i 6 według najgorszego przypadku | Dla zdań o tym, co produkty oferują, dokumentacja producenta jest najmocniejszym źródłem, a brak niezależnych recenzji rozstrzyga najgorszy przypadek. |
| Tailwind | Usunąć `@import "tailwindcss"` z `app/globals.css`, zostawić `postcss.config.mjs` i `package.json` | Tailwind daje dziś tylko preflight, który zmienia wygląd wobec makiety, a krok 16 zamraża konfigurację i zależności. |
| Linter (D-003) | Bez lintera; nowy hook spisu ma jeden `useEffect` z pustą listą zależności i sprzątaniem | Dodanie lintera zmienia `package.json`, które krok 16 zamraża, a intencja ma „Instalacja: nic”. |
| Komponent spisu | `ChapterIndex` w `components/interactive.tsx`, ustawia klasę `on` i `aria-current="true"` | Cała interaktywność strony jest w tym jednym pliku klienckim, a `aria-current` daje testom i czytnikom stan bez zależności od klasy. |
| Nagłówek | Komponent serwerowy w `app/page.tsx`, bez stanu | Bez przełącznika motywu nagłówek nie potrzebuje kodu klienta. |
| Pliki fontów i obrazu | `public/fonts/host-grotesk-latin-wght-normal.woff2`, `public/fonts/jetbrains-mono-latin-wght-normal.woff2`, `public/fonts/OFL-host-grotesk.txt`, `public/fonts/OFL-jetbrains-mono.txt`, `public/hero-lines.webp`; usunięte `public/fonts/dm-sans-*.ttf` i `public/fonts/OFL.txt` | Ten sam sposób podawania co DM Sans dziś (`url("../public/…")`), a licencja OFL ma towarzyszyć każdemu fontowi. |
| Lista krok 16 | Druga lista `PLIKI_PRZEBUDOWY` obok `PLIKI_ZMIAN`, nazwa testu bez zmian | Nazwa testu jest w `CLAUDE.md` i w kryteriach, a osobna lista mówi, która zmiana zwolniła które pliki. |

## What We're NOT Doing

- Bez zmian w `worker/`, `lib/waitlist.ts`, komunikatach formularza i `.github/workflows/pages.yml`.
- Bez ciemnego motywu, przełącznika i migracji klucza `maestro-theme` (strona go po prostu nie czyta).
- Bez zmian w `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`; `lucide-react` zostaje w zależnościach, choć strona przestaje go importować.
- Bez nowych tekstów poza makietą, poza wierszami 1 i 6 kolumny kreatorów, `meta description` i dzisiejszym linkiem pominięcia.
- Bez informacji o prywatności (D-001), tłumaczenia, zmiany nazwy produktu i zmiany hasła poza stroną.
- Bez `viewport-fit=cover`: reguły `env(safe-area-inset-*)` z makiety zostają w CSS i działają jak zero.
- Bez zmian w `.impeccable/design.json`, `context/foundation/stack-assessment.md`, PRD i roadmapie.

## Implementation Approach

Trzy fazy, każda z zielonym `npm run verify`:

1. Zasoby z makiety (fonty, licencje, obraz), typ `.webp` w serwerze testów i poszerzona lista kroku 16. Strona się jeszcze nie zmienia.
2. Nowa strona i testy kroków 1–14 w jednym commicie: testy importują klucze `lib/content.ts`, a `typecheck` obejmuje testy, więc nie da się ich rozdzielić.
3. Opisy w repo i pełne sprawdzenie z P13.

## Critical Implementation Details

**Kolejność w fazie 2.** Pliki DM Sans usuwa się dopiero razem z nowym `app/globals.css`: dopóki CSS ma `url("../public/fonts/dm-sans-*.ttf")`, budowa bez tych plików pada. `lib/content.ts`, `app/page.tsx`, `components/interactive.tsx` i wszystkie pliki `tests/e2e/` muszą zmienić się razem, bo stare testy odwołują się do usuwanych kluczy.

**Hydracja w testach.** Spis i formularz działają dopiero po hydracji Reacta. `poHydracji` ma czekać na przycisk wysyłki w `#waitlist` z kluczem `__reactProps$`; kliknięcie wcześniej wysłałoby formularz natywnie i przeładowało stronę.

**Spis a przewijanie w teście.** Na 1280×800 sekcja ma co najmniej 732 px wysokości, a `scroll-margin-top` to 84 px, więc po `scrollIntoView` górna krawędź sekcji jest na 84 px (< 280 px, czyli 35%), a następnej na ≥ 816 px. Test przewija bez płynności (`behavior: "instant"`) i czeka na `aria-current` przez `expect.poll`/`toHaveAttribute`, bez `waitForTimeout`.

## Phase 1: Zasoby z makiety i granice kroku 16

**Criteria**: P13

### Overview

Pliki fontów, licencje i obraz hero trafiają do `public/` z sumami takimi jak w makiecie. Serwer testów zna `.webp`. Krok 16 zwalnia pliki tej zmiany.

### Changes Required:

#### 1. Fonty, licencje i obraz hero

**File**: `public/fonts/host-grotesk-latin-wght-normal.woff2`, `public/fonts/jetbrains-mono-latin-wght-normal.woff2`, `public/fonts/OFL-host-grotesk.txt`, `public/fonts/OFL-jetbrains-mono.txt`, `public/hero-lines.webp`

**Intent**: Wyjąć trzy pliki z base64 w `makieta.html` (w kolejności wystąpienia: Host Grotesk, JetBrains Mono, webp) skryptem poza repo i zapisać je w `public/`. Dodać dwie licencje OFL 1.1: tekst licencji jak w dzisiejszym `public/fonts/OFL.txt`, z pierwszą linią praw autorskich z tabeli `name` danego fontu (cytaty w „Current State Analysis”).

**Contract**: sumy sha256 plików dokładnie jak w „Current State Analysis”. Pliki DM Sans zostają do fazy 2.

#### 2. Typ `.webp` w serwerze testów

**File**: `scripts/serwer-statyczny.mjs`

**Intent**: Dodać `".webp": "image/webp"` do mapy typów, żeby obraz hero z `out/` miał właściwy typ w testach przeglądarki.

**Contract**: mapa typów MIME (`scripts/serwer-statyczny.mjs:20-32`).

#### 3. Krok 16 zwalnia pliki przebudowy

**File**: `tests/repo/zakres-przejecia.spec.ts`

**Intent**: Dodać drugą listę `PLIKI_PRZEBUDOWY` z komentarzem „Pliki zmiany przebudowa-strony” i dołączyć ją do wyjątków; poprawić komentarz nagłówka testu. Nazwa testu zostaje.

**Contract**: `PLIKI_PRZEBUDOWY = ["app/page.tsx", "app/layout.tsx", "components/brand.tsx", "public/icon.svg", "public/fonts", "public/hero-lines.webp"]`; `WYJATKI` z obu list. Pliki z `PLIKI_ZMIAN` (`components/interactive.tsx`, `lib/content.ts`, `app/globals.css`, `lib/waitlist.ts`, `pages.yml`) już są zwolnione. Reguły `package.json` bez zmian.

### Success Criteria:

#### Automated Verification:

- Pliki mają sumy z makiety: `printf '%s  %s\n' ce9c9db8a488852eb7e4a52f51fd8ce0c93ef61a8d3bfa054b509ec92958dcfe public/fonts/host-grotesk-latin-wght-normal.woff2 18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e public/fonts/jetbrains-mono-latin-wght-normal.woff2 151d291c45e55498969171b3215fa979d001c18878a71e0fdeeb10cdd5b3e38a public/hero-lines.webp | sha256sum -c`
- Licencje mają linie praw autorskich: `grep -q "Host Grotesk Project Authors" public/fonts/OFL-host-grotesk.txt && grep -q "JetBrains Mono Project Authors" public/fonts/OFL-jetbrains-mono.txt`
- Sprawdzenie projektu przechodzi: `npm ci && npm run verify`

---

## Phase 2: Nowa strona i testy kroków 1–14

**Criteria**: P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P14

### Overview

Treść, układ, style, spis i formularz według makiety, z odstępstwami z „Desired End State”. Testy kroków 1–10 i 12–14 sprawdzają nową stronę według kryteriów.

### Changes Required:

#### 1. Treść

**File**: `lib/content.ts`

**Intent**: Zastąpić treść starej strony treścią makiety, dosłownie (z typograficznymi apostrofami, np. „See how it’s different”, „Maestro’s”), z `PRODUCT_NAME` tam, gdzie tekst wymienia Maestro. Usunąć klucze nieużywane przez nową stronę (`heroDemo`, `problem`, `example`, `observer`, `principles`, `ownership`, `comparison` w starym kształcie, `release`, `roadmap`, `audience`, teksty motywu i demo w `ui`).

**Contract**: `content` ma: `meta { title: "Maestro — You bring the idea. Maestro builds it.", description }`; `hero { mission, heading: [2 linie], lead, primary, secondary }`; `chapters`: 5 obiektów `{ id, label, indexLabel, quiet, heading, lead?, soon?, points: { title, text, next? }[] }` w kolejności `observer`, `control`, `deploy`, `after-launch`, `ownership` (dla `deploy` `label` „From build to deploy”, `indexLabel` „Build to deploy”); `comparison { label, title, lead, ariaLabel, columns: { builders, maestro }, rows: { label, builders, maestro, soon? }[6] }`; `faq { label, title: [część zwykła, część cicha], items[8] }`; `waitlist` bez zmian; `footer { tagline, backToTop }`; `ui { skipLink, chapters: "Chapters", comingSoon: "Coming soon", brandHome: "Maestro, back to top" }`.

#### 2. Układ strony i metadane

**File**: `app/page.tsx`, `app/layout.tsx`

**Intent**: `page.tsx` buduje strukturę z makiety (`makieta.html:165-315`) z treści `content`, z nagłówkiem jako zwykłym JSX. `layout.tsx` traci `themeScript` i `suppressHydrationWarning`, a `description` bierze z `content.meta.description`.

**Contract**: identyfikatory i kolejność jak w „Desired End State”; h1 z dwóch `span` rozdzielonych spacją (tekst dostępny „You bring the idea. Maestro builds it.”); porównanie na `div` z `role="table"`, `row`, `columnheader`, `rowheader`, `cell` i etykietami `.who` w komórkach; słowo „maestro” z `aria-hidden`.

#### 3. Interakcje

**File**: `components/interactive.tsx`, `components/brand.tsx`

**Intent**: Usunąć `Header`, `HeroDemo`, `ProjectWalkthrough`, `ScrollMotion` i importy `lucide-react`. Dodać `ChapterIndex` z logiką spisu z makiety. `FAQ` bez ikony (znak „+”/„−” robi CSS). `WaitlistForm` zachowuje logikę, identyfikatory, pułapkę i komunikaty, a dostaje klasy makiety. `BrandMark` dostaje grubości linii z makiety (3.2 i 2.1), `Brand` traci kropkę po nazwie.

**Contract**: `ChapterIndex({ items: { id, label }[] , label })` renderuje `nav.index` z `aria-label`; bieżąca pozycja (ostatnia sekcja, której `getBoundingClientRect().top <= innerHeight * 0.35`, domyślnie pierwsza) ma klasę `on` i `aria-current="true"`; nasłuch `scroll` (passive) i `resize` przez jedno `requestAnimationFrame`, usuwany przy odmontowaniu; bieżąca pozycja jest wyliczana też raz przy montowaniu (jak `markChapter()` w `makieta.html:331`), żeby strona otwarta z linku z kotwicą od razu wyróżniała właściwą sekcję. `WaitlistForm`: `form.join`, `.field-row`, przycisk `.btn`, komunikat `#waitlist-status.status` z klasą `failed` przy niepowodzeniu, pole-pułapka w `.form-trap`.

#### 4. Style

**File**: `app/globals.css`

**Intent**: Zastąpić cały plik CSS-em makiety (`makieta.html:12-162`) z `@font-face` wskazującymi pliki z `public/` i z odstępstwami 1–2. Dołożyć reguły spoza makiety: `.skip-link` (ukryty do fokusu, kolory nowej palety), `.form-trap` (poza ekranem), `.status.failed`. Przy ograniczonym ruchu wyłączyć płynne przewijanie, przejścia i animacje.

**Contract**: `@font-face` z `src: url("../public/fonts/<plik>.woff2") format("woff2")`, zakresami grubości i `unicode-range` jak w `makieta.html:5-6`; `.hero::after` z `url("../public/hero-lines.webp")`; `:root { --quiet: #646d76; … color-scheme: light }`; placeholder `#4d5964`; bez tła i bez dodatkowego wcięcia komórek kolumny Maestro; `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } *, *::before, *::after { transition: none !important; animation: none !important } }`; bez `@import "tailwindcss"` i bez `[data-theme]`.

#### 5. Ikona i stare fonty

**File**: `public/icon.svg`, `public/fonts/dm-sans-regular.ttf`, `public/fonts/dm-sans-semibold.ttf`, `public/fonts/OFL.txt`

**Intent**: Ikona w kolorach nowej palety (tło `#111111`, znak `#ffffff`, ten sam kształt). Usunąć pliki DM Sans i ich licencję.

**Contract**: `public/icon.svg` z tym samym `viewBox` i ścieżką; trzy pliki usunięte.

#### 6. Testy wspólne i kroki 1–4

**File**: `tests/e2e/pomoc.ts`, `tests/e2e/sekcje-i-uklad.spec.ts`

**Intent**: `poHydracji` czeka na przycisk wysyłki w `#waitlist`. Kroki 1–4 sprawdzają P1–P4.

**Contract**:
- krok 1 (P1, oba ekrany): `toHaveTitle` z `content.meta.title`; identyfikatory `top`, `how-it-works`, `observer`, `control`, `deploy`, `after-launch`, `ownership`, `why`, `faq`, `waitlist`, `first-release` w tej kolejności dokumentu; h1 i nagłówki sekcji z treści; `#waitlist` to jedyny `footer` (jedyna rola `contentinfo`), stoi w dokumencie po `main` i jest ostatnim elementem `body` poza `script` i `next-route-announcer` (Next dokłada je po stopce); `document.body.textContent` i tytuł bez „30 November 2026”, „Our 2027 vision”, „Autonomously.”, „manual test”, „You bring the problem”; zero błędów konsoli i strony.
- krok 2 (P2): każdy `a[href^="#"]` wskazuje istniejący element; dokładnie dwa linki „Join the first release”, oba z `href="#waitlist"`; „See how it’s different” → `#why`; `#how-it-works` i `#first-release` istnieją; kliknięcie przycisku hero przewija do `#waitlist`.
- krok 3 (P3): na obu ekranach `scrollWidth` dokumentu ≤ `clientWidth`, a `[role=table]` ma `scrollWidth` ≤ `clientWidth`; na 1280 px dwa niepuste `columnheader` („Prompt-to-app builders”, „Maestro”), 7 wierszy `row` (nagłówek i 6), w każdym wierszu danych `rowheader` i dwie komórki obok siebie (ta sama górna krawędź); na 360 px komórki jedna pod drugą i widoczne etykiety `.who`.
- krok 4 (P4, oba ekrany): `banner` ma dokładnie dwa linki (logo „Maestro, back to top” → `#top` i „Join the first release” → `#waitlist`, widoczny), zero przycisków i zero ról `navigation`, `menu`, `menubar`; jedyna `navigation` na stronie to spis „Chapters” poza nagłówkiem.

#### 7. Kroki 5, 11–13

**File**: `tests/e2e/motyw-siec-dostepnosc.spec.ts`

**Intent**: Krok 5 i 13 przechodzą na jeden jasny motyw; usunąć `KLUCZ_MOTYWU`-owe przełączanie, `MOTYWY`, `przeciwny`, `etykietaPrzelacznika`. Krok 11 bez zmian w logice. Krok 12 sprawdza też brak przejść w spisie.

**Contract**:
- krok 5 (P5): przy systemowym jasnym i ciemnym, z `maestro-theme=dark` wpisanym przed załadowaniem (`addInitScript`), tło `body` to `rgb(255, 255, 255)`, `color-scheme` dokumentu to `light`, brak `data-theme`; podsłuch `Storage.prototype.setItem` (zainstalowany w `addInitScript` po wpisaniu klucza) liczy zero wywołań po przewinięciu, otwarciu pytania FAQ i wysyłce formularza do atrapy; `sessionStorage` pusty i brak ciasteczek.
- krok 12 (P11): przy `reducedMotion: "reduce"` `scroll-behavior` dokumentu nie jest `smooth`, po przewinięciu brak trwających animacji, a na 1280 px każda pozycja spisu ma `transition-duration` `0s` na `::after` (`getComputedStyle(a, "::after")`) i na wewnętrznym `span` — tam makieta ma przejścia (`makieta.html:68-69`); sam link przejścia nie ma, więc pomiar na nim nic nie sprawdza.
- krok 13 (P13): przy systemowym jasnym i ciemnym, kontrast ≥ 4.5:1 dla `h1, h2, h2 span, h3, p, summary, label, a, button:not([disabled]), [role=columnheader], [role=rowheader], [role=cell], .soon`, dla pozycji spisu przy fokusie (na 1280 px), dla placeholdera pola e-mail (`getComputedStyle(pole, "::placeholder")` na tle `#waitlist`) i dla `#waitlist-status` po błędzie, sukcesie i niepowodzeniu.

#### 8. Kroki 6–10

**File**: `tests/e2e/interakcje.spec.ts`

**Intent**: Nowe kroki 6–8 zamiast demo rozmowy, przykładu i podglądu; kroki 9–10 według P9–P10. Usunąć stałe przykładu (`interakcje.spec.ts:8-9`).

**Contract**:
- krok 6 (P6): na 1280 px spis „Chapters” ma 5 linków z `indexLabel` w kolejności; po przewinięciu do każdej sekcji (w przód i z powrotem do pierwszej) dokładnie jej link ma `aria-current="true"`; kliknięcie pozycji „You decide” przenosi `#control` w górne 35% okna i daje jej `aria-current`; na 360 px spis `toBeHidden()`.
- krok 7 (P7, P12 w treści): `columnheader` „Prompt-to-app builders” i „Maestro”; 6 `rowheader` z treści w kolejności; `#why` bez tekstów „Individual tools vary” i „A comparison of typical approaches”; `document.body.textContent` bez `/\b(Lovable|Bolt|Replit|Cursor|Warp|HumanLayer|Devin)\b/`; komórki obu kolumn mają to samo wyliczone tło.
- krok 8 (P8): „Coming soon” widoczne w `#after-launch`; „Codex and others coming soon” i „Codex and OpenCode coming soon” widoczne w `#ownership`; po otwarciu pytania „Does the first release maintain my application automatically?” odpowiedź zawiera „coming soon”.
- krok 9 (P9): dokładnie 8 `summary` z pytaniami z treści w kolejności; każde otwiera się po pierwszym kliknięciu i zamyka po drugim.
- krok 10 (P10): jak dziś (pusty i błędny adres: komunikat błędu w `role=status`, `aria-invalid`, zero żądań; poprawny: jedno żądanie do `ADRES_FUNKCJI`, „Joining…”, sukces albo niepowodzenie z `content.waitlist`), plus na stronie dokładnie jeden `form` i jedno pole `type=email`.

#### 9. Krok 14 sprawdza obrazy

**File**: `tests/e2e/zasoby.spec.ts`

**Intent**: Dodać `"image"` do `TYPY_ZASOBOW`, żeby obraz hero bez prefiksu albo z 404 nie przeszedł.

**Contract**: `TYPY_ZASOBOW = ["font", "stylesheet", "script", "image"]`; reszta testu bez zmian.

### Success Criteria:

#### Automated Verification:

- Testy kroków 1–14 w przeglądarce przechodzą na obu ekranach: `npm run test:e2e -- --grep "krok ([1-9]|1[0-4])\b"`
- Sprawdzenie projektu przechodzi: `npm ci && npm run verify`
- Strona nie ma zielonych tokenów, DM Sans ani motywu: `! grep -rniE "dm sans|data-theme|maestro-theme|#163d31|#d5f680" app components lib public/icon.svg`

---

## Phase 3: Opisy w repo i pełne sprawdzenie

**Criteria**: P13

### Overview

Opisy repo mówią o nowej stronie, a pełne polecenie z P13 przechodzi.

### Changes Required:

#### 1. README i instrukcje projektu

**File**: `README.md`, `CLAUDE.md`

**Intent**: README: przykład kroku 6 z nową nazwą testu, „style i reguły responsywne” zamiast „style, motywy”, `public/` z fontami i obrazem hero, krok 16 „poza plikami zmian lista-oczekujacych i przebudowa-strony wymienionymi w teście z nazwy”. `CLAUDE.md`: tylko to samo zdanie o kroku 16 w `## Verify` i nowy wynik ostatniego przebiegu; `## Wdrożenie` i `## Dostępy` bez zmian.

**Contract**: sekcje `## Testy` i `## Gdzie wprowadzać zmiany` w README (pierwsza linia bloku kodu w `## Testy` dalej `npm test`, krok 15); akapit `## Verify` w `CLAUDE.md`.

#### 2. Opis wyglądu i sprawdzeń

**File**: `DESIGN.md`, `VERIFICATION.md`

**Intent**: `DESIGN.md` opisuje nowy system: tokeny z `app/globals.css`, fonty, układ, progi 980 i 640 px, jeden jasny motyw, zasada kontrastu, z odnośnikiem do makiety jako wzoru. `VERIFICATION.md` mówi, co sprawdzają kroki 1–16 nowej strony, bez motywów, demo i 8 kroków.

**Contract**: frontmatter `DESIGN.md` (`name`, `description`, `colors`) z nowymi kolorami; cały `VERIFICATION.md`.

#### 3. Plan testów

**File**: `context/foundation/test-plan.md`

**Intent**: Poprawić zdania o oczekiwaniach starej strony: CTA nagłówka widoczne na 360 px, porównanie bez przewijania w bok, pamięć przeglądarki pusta zamiast `['maestro-theme']`, jeden motyw w krokach 5 i 13.

**Contract**: sekcje 6.3–6.5 planu testów.

### Success Criteria:

#### Automated Verification:

- Opisy nie mówią o starej stronie: `! grep -niE "dm sans|demo rozmowy|maestro-theme|botanical green|dark-paper|light and dark themes|plikami formularza" README.md VERIFICATION.md DESIGN.md CLAUDE.md`
- Pełne sprawdzenie z P13 przechodzi: `npm run test:e2e && npm ci && npm run verify && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py przebudowa-strony --rules 6`

---

## Testing Strategy

### Unit Tests:

- Brak testów jednostkowych: strona jest statyczna, a jej zachowanie sprawdzają kroki 1–14 w przeglądarce.
- Krok 16 (bez przeglądarki) pilnuje, że poza plikami z obu list nic w kodzie strony, konfiguracji budowy i `package.json` się nie zmienia.

### Integration Tests:

- Kroki 1–14 w Chromium na 360 i 1280 px na stronie zbudowanej jak do publikacji, z atrapą funkcji zapisu i bez sieci w kontenerze.
- Przypadki brzegowe: zapisany `maestro-theme=dark` i systemowy ciemny motyw (krok 5), przewijanie spisu w obie strony (krok 6), wiersze porównania jako bloki na 360 px (krok 3), placeholder i pozycje spisu przy fokusie w pomiarze kontrastu (krok 13), obraz hero pod prefiksem (krok 14), ograniczony ruch (krok 12).

## Performance Considerations

Strona dochodzi do dwóch plików woff2 (20 i 40 KB) i obrazu webp (92 KB) zamiast dwóch ttf DM Sans (2 × 48 KB). Skrypt spisu liczy pozycje raz na klatkę przy przewijaniu.

## Migration Notes

Osoba z zapisanym `maestro-theme=dark` zobaczy jasną stronę; klucz zostaje w jej przeglądarce nieczytany. Scalenie publikuje nową stronę przez niezmieniony `pages.yml`.

## References

- Intencja i kryteria: `context/changes/przebudowa-strony/change.md`
- Research: `context/changes/przebudowa-strony/research.md`
- Makieta: `context/changes/przebudowa-strony/makieta/makieta.html` (suma w `makieta/akceptacja.md`)
- Wzór testów: `context/foundation/test-plan.md` §6
- Poprzednia zmiana formularza: `context/archive/2026-11-18-lista-oczekujacych/plan.md`

## Plan Changes

> Append-only. One entry per departure from the plan, written in the same commit as the phase. See `references/progress-format.md`.

- **PC1 (Phase 2)**: Logo w nagłówku to `<a class="brand-link">` z komponentem `Brand` (`<span class="brand">`) w środku zamiast `<a class="brand">` z makiety, z jedną regułą CSS spoza makiety `.brand-link { display: inline-flex; align-items: center }`; krok 5 poza podsłuchem `Storage.prototype.setItem` liczy też wywołania `getItem` (zero), a kroki 3 i 7 liczą wiersze porównania z `includeHidden`, bo wiersz nagłówka jest ukryty poniżej 640 px.
  - **Why**: plan zostawia komponent `Brand` (bez kropki), więc link opakowuje go zamiast powielać znak i nazwę; „Desired End State” mówi, że strona nie czyta ani nie zapisuje `localStorage`, a sam `setItem` sprawdza tylko zapis; bez `includeHidden` na 360 px rola `row` nagłówka nie jest liczona.
  - **Criteria**: P4, P5, P3, P7, P14
  - **Files**: `app/page.tsx`, `app/globals.css`, `tests/e2e/motyw-siec-dostepnosc.spec.ts`, `tests/e2e/sekcje-i-uklad.spec.ts`, `tests/e2e/interakcje.spec.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Zasoby z makiety i granice kroku 16

#### Automated

- [x] 1.1 Pliki mają sumy z makiety — c7afa3e
- [x] 1.2 Licencje mają linie praw autorskich — c7afa3e
- [x] 1.3 Sprawdzenie projektu przechodzi — c7afa3e

### Phase 2: Nowa strona i testy kroków 1–14

#### Automated

- [x] 2.1 Testy kroków 1–14 w przeglądarce przechodzą na obu ekranach — d03ce0e
- [x] 2.2 Sprawdzenie projektu przechodzi — d03ce0e
- [x] 2.3 Strona nie ma zielonych tokenów, DM Sans ani motywu — d03ce0e

### Phase 3: Opisy w repo i pełne sprawdzenie

#### Automated

- [x] 3.1 Opisy nie mówią o starej stronie — 98ae6c4
- [x] 3.2 Pełne sprawdzenie z P13 przechodzi — 98ae6c4
