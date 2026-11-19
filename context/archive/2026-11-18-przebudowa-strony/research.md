---
date: 2026-11-19T00:29:29+00:00
researcher: Claude (krok autopilota research)
git_commit: 2a56aa283188e0d638ff4fdf4c04b3b0f809b9ef
branch: przebudowa-strony
repository: www-maestro
topic: "Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji przebudowa-strony"
tags: [research, codebase, strona, makieta, testy-e2e, krok-16, porownanie, kreatory-aplikacji]
status: complete
last_updated: 2026-11-19
last_updated_by: Claude (krok autopilota research)
---

# Research: co istnieje, a czego brakuje dla przebudowa-strony

**Date**: 2026-11-19T00:29:29+00:00
**Researcher**: Claude (krok autopilota research)
**Git Commit**: 2a56aa283188e0d638ff4fdf4c04b3b0f809b9ef
**Branch**: przebudowa-strony (niewypchnięta, więc bez odnośników GitHub)
**Repository**: www-maestro

## Research Question

Co w repozytorium istnieje, a czego brakuje, żeby spełnić oczekiwany efekt i kryteria akceptacji P1–P14 z `context/changes/przebudowa-strony/change.md`?

Wzór ekranów: `context/changes/przebudowa-strony/makieta/makieta.html`. Suma sha256 to `f81e9dc0b7c23c095b277a859534c07cc0bfcf5c133a6d7e9cee9a1db91191ce`; sprawdziłem, że zgadza się z `makieta/akceptacja.md`.

## Summary

- **Z dzisiejszej strony zostaje niewiele.** Do ponownego użycia nadają się:
  - formularz zapisu (`WaitlistForm` i `lib/waitlist.ts`), razem z komunikatami;
  - komponent FAQ na `<details>`;
  - znak `BrandMark`;
  - sposób podawania fontów z adresu strony (`url("../public/…")` w CSS).

  Reszta jest do wymiany: `app/page.tsx`, większość `lib/content.ts`, prawie cały `app/globals.css` (2052 linie), motyw w `app/layout.tsx` i `components/interactive.tsx`. Brakuje kotwic `#control`, `#deploy` i `#after-launch`, spisu sekcji ze śledzeniem przewijania, tabeli porównania na `role=table`, plików fontów Host Grotesk i JetBrains Mono oraz obrazu hero.
- **Testy kroków 1–10 i 13 sprawdzają starą stronę i trzeba je przepisać.** Kroki 11 i 14 zostają, ale krok 14 powinien sprawdzać także obrazy. Do tego są cztery wspólne blokady:
  1. `poHydracji` czeka na `header button`, a w nowym nagłówku nie ma przycisku.
  2. Testy importują klucze z `lib/content.ts`, które znikną, a polecenie sprawdzające sprawdza typy także w testach.
  3. Krok 4 zabrania roli `navigation` na całej stronie, a spis z makiety jest `<nav>`.
  4. Krok 1 wymaga, by `<footer>` był po `#waitlist`, a w makiecie `#waitlist` jest tym samym `<footer>`.
- **Krok 16 ma listę plików wpisaną na stałe** (`PLIKI_ZMIAN`). Trzeba ją poszerzyć o pliki tej zmiany. Krok 16 nie pozwala też dodać ani usunąć zależności w `package.json`, więc `lucide-react` zostaje i nie dochodzi `@fontsource`.
- **Makieta jest sprzeczna z intencją w dwóch miejscach:**
  1. **Kontrast.** Kolor `--quiet` `#9aa3ab` ma 2.56:1 na bieli i 2.28:1 na `--sky-soft`. Tym kolorem są pierwsze połowy sześciu nagłówków oraz pozycje spisu po najechaniu i przy fokusie. Ograniczenie „kontrast tekstu co najmniej 4.5:1” to wyklucza.
  2. **Podświetlenie kolumny Maestro.** Makieta podświetla tę kolumnę tłem `--sky-soft`, a intencja mówi „Czego nie będzie: … podświetlania kolumny Maestro”.
- **P12, porównanie z kreatorami aplikacji z promptu.** Sprawdziłem zdania w sieci, w źródłach producentów (2026-11-19):
  - wiersze 2–5 są prawdziwe albo w większości prawdziwe;
  - wiersz 1 („Anyone who wants a quick prototype”) wprowadza w błąd;
  - wiersz 6 („Up to you”) wprowadza w błąd.

  Propozycje nowych sformułowań są w sekcji „Kategoria: kreatory aplikacji z promptu”.

## Detailed Findings

### 1. Struktura strony: dziś a makieta

Dziś `app/page.tsx` ma 13 bloków (szczegóły w tabeli w sekcji „Code References”):
- hero z „Build the right product, / the right way. / Autonomously.”, datą wydania, wizją 2027 i `HeroDemo`;
- misja;
- problem (`#why`);
- przykład w 8 krokach (`#how-it-works`);
- `#observer` z kaflami;
- „Less to manage…”;
- `#ownership`;
- tabela z trzema kolumnami;
- `#first-release` z roadmapą;
- „You know your world…”;
- `#faq`;
- `#waitlist`;
- stopka (`app/page.tsx:31-362`).

Kotwice, które istnieją dziś: `#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist`. Brakuje `#control`, `#deploy`, `#after-launch`.

Makieta, wiersz po wierszu (`/tmp/przebudowa-research/makieta-bez-base64.html` to kopia bez base64; numery wierszy są takie same jak w oryginale):

| Blok makiety | Co jest dziś do użycia | Czego brakuje |
|---|---|---|
| Nagłówek `.top` (165-173): znak, „maestro”, przycisk do `#waitlist` | `BrandMark` (`components/brand.tsx`), `content.hero.primary`, przyklejony nagłówek | Brak przełącznika i kropki po nazwie. Wysokość 68 px, a poniżej 640 px 60 px. Przycisk widoczny także na 360 px. |
| Hero `#top` (176-184), obraz w `.hero::after` (57) | `content.hero.mission` („Everyone can build their moonshot.”), `primary` | Nowy h1 z dwóch `span`, nowe zdanie wstępu, „See how it’s different” → `#why`, pełny ekran (`100svh - nav`), plik webp z maską i `mix-blend-mode: multiply` |
| Sekcje `#how-it-works` (187-255) i skrypt spisu (318-332) | Nic | Pięć sekcji z treścią z makiety, `nav.index aria-label="Chapters"`, klasa `on`, wyróżnianie przy `innerHeight*0.35` w `requestAnimationFrame`, `.soon`, linie `.next`, tło `#after-launch`, ukrycie spisu przy ≤980 px |
| Porównanie `#why` (257-274) | Nic. Dziś to `<table>` przewijana w bok. | Siatka na `div` z `role=table/row/columnheader/rowheader/cell`, etykiety `.who` poniżej 640 px, 6 wierszy, „Coming soon” w ostatnim wierszu |
| FAQ `#faq` (276-291) | `FAQ` (`components/interactive.tsx:262-276`) na `<details>` | 8 pytań z makiety. Nowe: „When can I start?”, „Does Maestro do anything without asking me?”. Usunięte: „How long…” i zdanie o cenie. Znaczek „+”/„−” w CSS zamiast `ChevronDown`. |
| Koniec `footer.close#waitlist` z `<span id="first-release">` (295-315) | Tytuł, opis i wszystkie komunikaty formularza (`lib/content.ts:396-407`) już są zgodne z makietą | Tło `--sky`, `.field-row`, duże słowo „maestro” (`aria-hidden`), `.foot` |
| Tokeny (12-19), fonty (5-6) | Nic | Nowe zmienne, Host Grotesk i JetBrains Mono, `[id]{scroll-margin-top}`, reguła ograniczonego ruchu |

### 2. Motyw (P5)

Pliki dzisiejszego motywu:
- skrypt `themeScript` w `<head>` czyta `localStorage['maestro-theme']` i `prefers-color-scheme` i ustawia `html[data-theme]` (`app/layout.tsx:10`, `:17`, `suppressHydrationWarning` w `:15`);
- przełącznik zapisuje wybór w `localStorage` (`components/interactive.tsx:23-35`);
- ciemne tokeny są w `app/globals.css:34-50`.

Wszystko to znika. Strona ma ustawić `color-scheme: light`, jak makieta w wierszu 18.

### 3. Fonty, obraz hero i prefiks `/www-maestro` (P13, kroki 11 i 14)

- **DM Sans dziś:** pliki ttf przez `@font-face` z `url("../public/fonts/dm-sans-*.ttf")` (`app/globals.css:2-15`). Webpack przepisuje ten adres na `/www-maestro/_next/static/media/…`. Nie ma `next/font` ani Google.
- **Nowe fonty i obraz:** trzeba wyjąć z base64 w `makieta.html` dwa pliki woff2 (Fontsource 5.3.0, podzbiór latin, zmienna grubość, `unicode-range` z wierszy 5-6) i obraz webp. Należy dołączyć licencje OFL obu fontów; dziś `public/fonts/OFL.txt` to licencja DM Sans.
- **Jak je podawać:** przez `url("../public/…")` w CSS, tak jak dziś DM Sans.
  - Wpisane jako `data:` (jak w makiecie) nie przejdą kroku 14. Krok 14 wymaga co najmniej jednej odpowiedzi typu `font` (`tests/e2e/zasoby.spec.ts:4`).
  - Adres zaczynający się od `/` nie dostaje prefiksu.
- **Krok 14 nie sprawdza obrazów.** `TYPY_ZASOBOW = ["font", "stylesheet", "script"]` (`tests/e2e/zasoby.spec.ts:4`), więc webp bez prefiksu albo z błędem 404 przeszedłby niezauważony. Trzeba dodać `"image"`.
- **Typ webp w serwerze testów.** `scripts/serwer-statyczny.mjs` nie zna typu `.webp`; zna `.woff`/`.woff2` (`:27-28`). Trzeba dodać `".webp": "image/webp"`.
- **Ikona.** `public/icon.svg` jest zielono-limonkowa (`#163d31`/`#d5f680`), a intencja mówi, że zielone kolory znikają. Makieta nie pokazuje ikony karty, więc zmiana ikony to otwarte pytanie.

### 4. Formularz zapisu (P10): co zachować

- **Żądanie:**
  - wysyłka: `lib/waitlist.ts:12-27`, `fetch(NEXT_PUBLIC_WAITLIST_URL, { method: "POST", body: JSON.stringify({ email, website }) })`;
  - bez nagłówków, czyli prosty `text/plain` bez zapytania wstępnego CORS;
  - przy pustym adresie funkcji od razu `failed`.
- **Pole-pułapka:** `#waitlist-website` (`name="website"`, `tabIndex=-1`, w `.form-trap aria-hidden`). Funkcja zapisu traktuje niepuste `website` jako bota (`worker/index.ts:246`).
- **Kontrola adresu:** `email.validity.valid` i wzorzec `^[^\s@]+@[^\s@]+\.[^\s@]+$` (`lib/waitlist.ts:10`, `components/interactive.tsx:288`). Dzięki temu „anna@gmail” jest odrzucany.
- **Identyfikatory:**
  - pole `#waitlist-email` z `aria-describedby="waitlist-status"`;
  - komunikat `#waitlist-status` z `role="status"` i `aria-live="polite"`.
- **Nie kopiować formularza z makiety.** Ma `email-end`/`status-end`, nie ma `name`, `required` ani pułapki, a wysyłkę tylko udaje przez `setTimeout`. Dzisiejszy `WaitlistForm` (`components/interactive.tsx:278-352`) zostaje; zmieniają się tylko klasy i układ (`.join`, `.field-row`, `.status.failed`).

### 5. Testy: dziś a kryteria

Pełny opis asercji: `tests/e2e/sekcje-i-uklad.spec.ts` (kroki 1–4), `tests/e2e/motyw-siec-dostepnosc.spec.ts` (kroki 5, 11–13), `tests/e2e/interakcje.spec.ts` (kroki 6–10), `tests/e2e/zasoby.spec.ts` (krok 14), `tests/readme/readme.spec.ts` (krok 15), `tests/repo/zakres-przejecia.spec.ts` (krok 16).

**Blokady wspólne:**
- `poHydracji` (`tests/e2e/pomoc.ts:51-56`) czeka na `header button` z propsami Reacta. W nowym nagłówku nie ma przycisku, więc kroki 1, 5–10, 12 i 13 przekroczą limit czasu. Lepszy punkt to przycisk wysyłki formularza w `#waitlist`.
- `tsconfig.json` obejmuje `**/*.ts`, więc testy przechodzą sprawdzanie typów w `npm run verify` i w `pages.yml` (D-011). Testy odwołują się do `c.principles`, `c.roadmap`, `c.audience`, `c.heroDemo`, `c.example`, `c.ui.themeDark/themeLight`, `c.comparison.title`. Usunięcie tych kluczy wymaga zmiany testów w tym samym commicie.
- Krok 4 wymaga zera ról `navigation`/`menu`/`menubar` na całej stronie (`tests/e2e/sekcje-i-uklad.spec.ts:149-151`). Spis `<nav aria-label="Chapters">` to łamie, więc sprawdzenie trzeba zawęzić do nagłówka.
- Krok 1 szuka dokładnie jednego `footer` następującego po `#waitlist` (`tests/e2e/sekcje-i-uklad.spec.ts:54-61`). W makiecie `#waitlist` jest tym `footer`, więc porównanie elementu z samym sobą zawodzi. Do wyboru: `#waitlist` jako `<section>` z wewnętrznym `<footer>` albo zmiana testu.

**Kryterium → krok:**

| Kryterium | Krok | Stan |
|---|---|---|
| P1 | 1 | Przepisać. Nowa kolejność: `#top`, `#how-it-works`, `#observer`, `#control`, `#deploy`, `#after-launch`, `#ownership`, `#why`, `#faq`, `#waitlist` (z `#first-release` w środku), stopka. Dodać `toHaveTitle`. Dodać sprawdzenie, że w `textContent` nie ma zakazanych tekstów (`textContent`, nie `innerText`, żeby objąć zamknięte odpowiedzi FAQ). Dziś test nie sprawdza tytułu karty. |
| P2 | 2 | Częściowo. „See how it’s different” → `#why` (dziś „See how it works” → `#how-it-works`). Przycisk w nagłówku → `#waitlist`. Istnienie `#how-it-works` i `#first-release`. |
| P3 | 3 | Odwrócić. Dziś test wymaga przewijania tabeli w bok na 360 px; P3 wymaga, by go nie było. Na 1280 px: 2 niepuste nagłówki kolumn i 6 wierszy z komórkami (7 `role=row` razem z nagłówkiem). |
| P4 | 4 | Przepisać. Brak przycisku w nagłówku, w nagłówku 2 linki (logo i przycisk zapisu), przycisk widoczny na obu szerokościach (dziś ukryty na 360 px). |
| P5 | 5 | Przepisać. Jasne tło przy systemowym jasnym i ciemnym motywie. Zapisane wcześniej `maestro-theme=dark` jest ignorowane. Zero wywołań `Storage.prototype.setItem` (podsłuch przez `addInitScript`). |
| P6 | 6 | Nowy (dziś demo rozmowy). 5 pozycji spisu; po przewinięciu wyróżniona jest właściwa; kliknięcie przenosi; na 360 px spis ukryty. Warto, by kod ustawiał `aria-current` obok klasy `on`. |
| P7 | 7 | Nowy (dziś przykład w 8 krokach). Nagłówki kolumn, 6 nagłówków wierszy, brak przypisu, brak nazw cudzych produktów (wyrażenie z granicami słów). |
| P8 | 8 | Nowy (dziś podgląd obiadowy). „Coming soon” w `#after-launch`, dwie linie `.next` w `#ownership`, „coming soon” w ostatnim pytaniu FAQ. |
| P9 | 9 | W większości zgodny. Dodać liczbę 8 i dokładne pytania. |
| P10 | 10 | Zgodny. Dodać sprawdzenie, że na stronie jest jeden formularz i jedno pole e-mail. |
| P11 | 12 | Zgodny co do treści; dziś pada tylko przez `poHydracji`. Reguła z makiety wyłącza tylko przejścia; trzeba zostawić także wyłączenie animacji, jak w `app/globals.css:2042-2052`. |
| P13 | 11, 13, 14, 16 | Krok 11 bez zmian. Krok 13 przepisać na jeden jasny motyw: dziś pętla po jasnym i ciemnym i asercja `data-theme` w `:162`; selektor `a.button` nie łapie `a.btn`. Krok 14: dodać `image`. Krok 16: poszerzyć listę. |

`tests/e2e/pomoc.ts` zostaje: `atrapaFunkcji`, `ADRES_FUNKCJI`, `zapisuj`, `otworzStrone`, `przewinDoKonca`, `poFontach`, `dokladnie`. Kod motywu w samym pliku kroku (`KLUCZ_MOTYWU`, `MOTYWY`, `przeciwny`, `etykietaPrzelacznika`, `motyw-siec-dostepnosc.spec.ts:5-11`) i stałe przykładu (`interakcje.spec.ts:8-9`) przestają być potrzebne.

### 6. Krok 16 i reguła 6 walidatora (P13)

- **Krok 16** (`tests/repo/zakres-przejecia.spec.ts:12-35`):
  - `BAZA="5e4dcac"`;
  - `SCIEZKI` = `app`, `components`, `lib`, `public`, `pages.yml`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`;
  - `PLIKI_ZMIAN` jest wpisane na stałe: `interactive.tsx`, `waitlist.ts`, `content.ts`, `globals.css`, `pages.yml`;
  - `package.json` może się różnić od bazy tylko wpisami `scripts.test`, `test:e2e`, `verify` i `devDependencies.@playwright/test`.

  Trzeba dopisać pliki tej zmiany, najlepiej jako drugą listę z komentarzem: `app/page.tsx`, `app/layout.tsx`, `components/brand.tsx` (jeśli się zmienia), nowe pliki komponentów, nowe i usunięte pliki w `public/fonts/` oraz obraz hero. Usunięty plik też jest różnicą wobec bazy. Pliki `next.config.ts`, `tsconfig.json` i `postcss.config.mjs` zostają bez zmian. Trzeba też poprawić opisy „poza plikami zmiany lista-oczekujacych” w `CLAUDE.md` (`## Verify`) i w README.
- **Reguła 6 walidatora** (`~/.claude/skills/10x-impl-review/scripts/validate_change.py:795-836`):
  - zbiera pliki z commitów o temacie `^[a-z]+\(przebudowa-strony\)!?: `, pomijając `context/`;
  - każdy z tych plików musi pasować do wpisu `**File**:`/`**Files**:` w `### Changes Required` jakiejś `## Phase N:` w `plan.md`, albo do `- **Files**:` w `## Plan Changes`;
  - ścieżki podaje się w odwrotnych apostrofach i obsługują one `fnmatch` (`*` przechodzi przez `/`, końcowy `/` oznacza katalog, działa `{a,b}`).

  Plan musi więc wymienić wszystkie pliki testów, `scripts/serwer-statyczny.mjs`, usuwane `public/fonts/dm-sans-*.ttf`, README, `CLAUDE.md`, a także `VERIFICATION.md` i `DESIGN.md`, jeśli się zmieniają.

### 7. Kontrast w makiecie

Policzone wzorem WCAG:

| Kolor tekstu | Tło | Kontrast | Gdzie |
|---|---|---|---|
| `--quiet` `#9aa3ab` | biel | **2.56:1** | `span.q` w h2 (wiersze 199, 213, 224, 245, 279), pozycje spisu po najechaniu i przy fokusie |
| `--quiet` | `--sky-soft` | **2.28:1** | h2 w `#after-launch` (235) |
| placeholder `#6b7a87` | `--sky` | **2.90:1** | pole e-mail |
| `--slate-muted` `#4d5964` | `--sky` | 4.71:1 | stopka (na granicy, przechodzi) |
| `--muted` | biel / `--sky-soft` | 6.42 / 5.71 | przechodzi |
| `--accent` `#3f6a92` | `--sky-soft` | 5.06 | przechodzi |

`--quiet` nie spełnia 4.5:1, a nawet 3:1 dla dużego tekstu. Dzisiejszy krok 13 tego nie wykryje, bo mierzy kolor samego `h2` (ink), a nie wewnętrznego `span`.

Kandydaci na ciemniejszy szary: `#667079` (5.05 na bieli, 4.49 na `--sky-soft`, czyli tuż pod progiem) i `#646d76` (5.26 i 4.68). Najbliższy kolor makiety, który przechodzi na obu tłach, to około `#646d76`. To zmiana wyglądu wobec makiety, więc trzeba ją zgłosić człowiekowi albo wpisać w plan jako świadome odstępstwo od makiety na rzecz ograniczenia z intencji.

### 8. Pozostałe różnice między makietą a intencją

- **Podświetlenie kolumny Maestro.** `.cmp-row > :nth-child(3) { background: var(--sky-soft); … font-weight: 500 }` (makieta, wiersz 96) i tło bloku poniżej 640 px (157). Intencja (`change.md:18`) i treść pytania o akceptację („Czego nie będzie: … podświetlanie tabeli”) to wykluczają. Podświetlenie było we wszystkich wersjach makiety od `b9e9d1f`. Dzisiejsza strona też podświetla kolumnę Maestro (`.maestro-column { background: var(--accent-soft) }`, `app/globals.css`, około wiersza 1116). Do rozstrzygnięcia przez człowieka.
- **Link pominięcia nawigacji.** Makieta go nie ma; dziś jest („Skip to main content”, `app/page.tsx:31`). Kotwica `#main` istnieje w obu wersjach.
- **Opis strony.** `<meta name="description">` to dziś stary opis hero (`lib/content.ts:11`). Intencja nie podaje nowego, więc naturalnym wyborem jest zdanie z nowego hero.
- **Obszary bezpieczne ekranu.** `env(safe-area-inset-*)` działa tylko z `viewport-fit=cover`. Znacznik `claude:viewport-fit-sides` z makiety dotyczy tylko podglądu na claude.ai.

### 9. Kod i treść, które przestaną być używane

- **`components/interactive.tsx`:** przełącznik w `Header` (23-58), `HeroDemo` (60-151), `ProjectWalkthrough` (153-260), `ScrollMotion` (354-373) oraz większość importów `lucide-react`. Paczka zostaje w `package.json` (krok 16).
- **`lib/content.ts`:**
  - `heroDemo` 23-52, `problem` 53-74, `example` 75-158, `observer` 159-191, `principles` 192-223, `ownership` 224-250, `comparison` 251-299, `release` 300-316, `roadmap` 317-340, `audience` 341-357;
  - pola `hero.heading`, `vision`, `releaseNote`, `proofs`;
  - pytanie FAQ „How long…”;
  - teksty motywu w `ui`.
- **`app/layout.tsx`:** `themeScript`.
- **`app/globals.css`:** prawie całość.
- **`public/fonts/dm-sans-*.ttf`.**
- **Nieaktualne opisy:** `DESIGN.md` (zielone tokeny, ciemny motyw, DM Sans), `.impeccable/design.json`, `VERIFICATION.md` (motywy, demo, 8 kroków), README (`:48` przykład „krok 6 — demo rozmowy”, „style, motywy”).

## Kategoria: kreatory aplikacji z promptu (P12)

**Zakres.** Kategoria to produkty typu Bolt.new, Lovable i Replit Agent; pomocniczo także v0 i Base44. Strona nie wymienia tych nazw (P7).

**Źródła.** Wyłącznie strony i dokumentacja producentów, pobrane 2026-11-19. Wyszukiwarki nie dały wyników, więc **nie ma tu niezależnych recenzji**. Daty: notatki wydań Bolt sięgają „Nov 9 - 15” 2026, a dokumentacja Lovable wspomina aplikacje „created from May 13, 2026”. Strona główna lovable.dev zwróciła 403; jej cennik i dokumentacja się otworzyły.

Pięć cytatów sprawdziłem osobiście (curl): Replit Monitoring Agent, Lovable project monitoring, Lovable hosting, Replit „production-ready”, Lovable „production-grade”, Bolt „can't test what it built”.

| # | Wiersz | Zdanie z makiety | Werdykt | Rekomendacja |
|---|---|---|---|---|
| 1 | Made for | Anyone who wants a quick prototype | **Wprowadza w błąd** | Zmienić, np. „Anyone who wants to build an app by chatting with AI” |
| 2 | What you need to know | How to prompt, and how to fix what breaks | W większości prawda | Zostawić; ewentualnie „…and how to get what breaks fixed” |
| 3 | Who steers the build | You, prompt by prompt | W większości prawda | Zostawić |
| 4 | How it talks to you | Through prompts and a preview | Prawda | Zostawić |
| 5 | Where your product lives | Often on the builder’s platform | Prawda | Zostawić |
| 6 | After launch | Up to you | **Wprowadza w błąd** (fałsz, jeśli czytać „nic nie oferują”) | Zmienić, np. „Monitoring and AI fixes on some paid plans, which you turn on and oversee” |

**Dowody:**

1. **„Quick prototype”.** Wszyscy producenci sprzedają dziś aplikacje produkcyjne:
   - Replit: „Build production-ready apps and websites with Replit Agent” (https://replit.com/products/agent);
   - Lovable: „build production-grade web applications using natural language” (https://docs.lovable.dev/introduction/welcome.md);
   - Bolt: „Launch a full business in days”, „Production-ready starting points” (https://bolt.new/);
   - v0: „Deploy to production immediately”;
   - Base44: „Ship something real”.

   Prawdziwa część zdania to „Anyone”: Lovable pisze „enables anyone to build for the web … no technical knowledge needed” (https://lovable.dev/pricing), a Bolt „Bolt is for everyone”.
2. **Prompt i naprawy.** Bolt pisze, że „can't test what it built or see what the preview looks like … can report a fix as done even when … the feature doesn't work” (https://support.bolt.new/troubleshooting/issues.md). Lovable radzi: „If **Try to fix** has not solved an error after a couple of attempts, switch tactics” (https://docs.lovable.dev/tips-tricks/from-idea-to-app.md).

   Przeciw: Replit testuje aplikację w przeglądarce i sam poprawia błędy (https://docs.replit.com/features/agent/app-testing.md), a v0 obiecuje „Automatically fix errors”. Człowiek nie poprawia kodu, ale nadal zauważa i opisuje usterki.
3. **Prompt po prompcie.** Bolt opisuje pracę jako „Iterate: more prompting” i „add one feature per prompt” (https://support.bolt.new/get-started/project-lifecycle.md).

   Przeciw: tryb Build w Lovable jest „autonomous … end to end with minimal supervision” (https://docs.lovable.dev/features/agent-mode.md), a Replit ma Missions, czyli trwały cel z kryteriami, budżetem i granicami (https://docs.replit.com/home/plan-your-launch-with-a-mission.md). Mimo to o kolejnym kroku decyduje człowiek, więc zdanie się broni. Najsłabiej wypada wobec Replit Missions.
4. **Prompt i podgląd.** Rdzeniem interfejsu są czat i podgląd na żywo. Dochodzą edytory wizualne (Bolt, Lovable, v0, Replit), komentarze na podglądzie i plan do zatwierdzenia. Nie przeczy to zdaniu.
5. **Hosting.** Lovable: „Lovable hosts your published app for you” (https://docs.lovable.dev/features/hosting.md, domena `lovable.app`). Bolt daje domenę `.bolt.host` (https://support.bolt.new/bolt-cloud/hosting.md), Replit `replit.app`, v0 wdraża na Vercel, Base44 ma hosting wbudowany.

   Eksport jest możliwy: Lovable „you are never locked in” (https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership.md), Bolt przez GitHub i zip, v0 przez eksport, Base44 przez GitHub (backend zostaje u Base44). Stąd „Often” jest trafne.
6. **Po starcie.**
   - Replit Monitoring Agent ma opcjonalne „Auto-fix” i „Auto-republish” (https://docs.replit.com/features/publishing/monitoring-agent.md).
   - Lovable project monitoring „check your app on a schedule, catch bugs and visitor errors early, alert you by email” (beta, plany Pro i wyższe; https://docs.lovable.dev/features/project-monitoring.md). Do tego analityka na wszystkich planach i skan bezpieczeństwa przy każdej publikacji (https://docs.lovable.dev/features/security.md).
   - Base44 ma alerty produkcyjne z poprawkami AI (https://docs.base44.com/Building-your-app/monitoring-your-app.md).
   - Bolt ma analitykę hostingu na płatnych planach.

   Na korzyść zdania przemawia, że funkcje są opcjonalne albo płatne, a odpowiedzialność zostaje u właściciela („You are responsible for ensuring that your app meets the security requirements…”, Lovable).

**Wniosek dla P12.** Wiersze 2–5 mogą zostać w brzmieniu z makiety. Wiersze 1 i 6 są nieprawdziwe dla typowych produktów tej kategorii w listopadzie 2026 i trzeba je przeformułować. Daje to podstawę zapowiedź z pytania o akceptację: „Zdania o kreatorach Factory sprawdzi w sieci przed budową i poprawi te, które okażą się nieprawdziwe”.

Po poprawce wiersz 6 słabiej wyróżnia Maestro, bo strona Maestro ma tam „Coming soon”. To decyzja produktowa, którą warto pokazać człowiekowi przy planie.

## Code References

- `app/page.tsx:31-362`: dzisiejsza strona, 13 bloków.
- `app/layout.tsx:4-17`: metadane (tytuł z `content.meta.title`, `lib/content.ts:7`: „Maestro — Build your next moonshot”), `themeScript`, `suppressHydrationWarning`.
- `components/interactive.tsx:23-58`: `Header` z przełącznikiem motywu.
- `components/interactive.tsx:262-276`: `FAQ`, do ponownego użycia.
- `components/interactive.tsx:278-352`: `WaitlistForm`, zostaje.
- `components/interactive.tsx:354-373`: `ScrollMotion`, znika.
- `lib/waitlist.ts:10-27`: wzorzec adresu i żądanie zapisu.
- `lib/content.ts:2`: `PRODUCT_NAME`.
- `lib/content.ts:396-407`: komunikaty formularza zgodne z makietą.
- `app/globals.css:2-15`: `@font-face` DM Sans.
- `app/globals.css:16-50`: tokeny jasne i ciemne.
- `app/globals.css:2042-2052`: ograniczony ruch.
- `tests/e2e/pomoc.ts:51-56`: `poHydracji` zależne od `header button`.
- `tests/e2e/sekcje-i-uklad.spec.ts:13-153`: kroki 1–4.
- `tests/e2e/motyw-siec-dostepnosc.spec.ts:17-192`: kroki 5, 11, 12, 13.
- `tests/e2e/interakcje.spec.ts:17-219`: kroki 6–10.
- `tests/e2e/zasoby.spec.ts:4`: `TYPY_ZASOBOW` bez `image`.
- `tests/repo/zakres-przejecia.spec.ts:12-35`: `SCIEZKI`, `PLIKI_ZMIAN`, `WPISY_TESTOW`.
- `scripts/serwer-statyczny.mjs:27-28`: typy MIME bez `.webp`.
- `~/.claude/skills/10x-impl-review/scripts/validate_change.py:795-836`: reguła 6.
- `context/changes/przebudowa-strony/makieta/makieta.html:57`: obraz hero.
- `context/changes/przebudowa-strony/makieta/makieta.html:96`: podświetlenie kolumny Maestro.
- `context/changes/przebudowa-strony/makieta/makieta.html:13`: `--quiet`.
- `context/changes/przebudowa-strony/makieta/makieta.html:318-332`: spis.

## Architecture Insights

- **Statyczny eksport.** Strona to statyczny eksport Next 16.4.6 (`output: "export"`, `basePath` z `NEXT_PUBLIC_BASE_PATH`). Tailwind 4.3.5 działa w praktyce tylko jako preflight; style to ręcznie pisane klasy w jednym `globals.css`.
- **Komponenty klienckie.** Cała interaktywność siedzi w jednym pliku `"use client"` (`components/interactive.tsx`). Spis z makiety wymaga nowego komponentu klienckiego (przewijanie i `requestAnimationFrame`). D-003 (`context/foundation/limitations.md:11-13`) mówi, że linter wraca przy pierwszej zmianie interakcji wymagającej sprawdzenia hooków.
- **Treść.** Cała treść jest w `lib/content.ts`, a testy importują z niego teksty. Zasady testów (`context/foundation/test-plan.md:135-161`): role i nazwy dostępne zamiast `data-testid`, bez `waitForTimeout`, kontrast z kolorów obliczonych przez przeglądarkę, każda zmiana sama aktualizuje swoje kroki (D-304).
- **Granice zmiany.** Granicę pilnują dwa mechanizmy niezależnie:
  - krok 16: ścieżki wobec `5e4dcac`, plus `package.json`;
  - reguła 6 walidatora: pliki z commitów wobec `plan.md`.

## Historical Context (from prior changes)

- `context/foundation/roadmap.md:116-130`: S-04. Zakres: `lib/content.ts`, `app/page.tsx`, `app/layout.tsx`, `components/interactive.tsx`, `app/globals.css`, fonty i obraz w `public/`, testy kroków 1–10, 12, 13, 16. Bez zmian zostają `worker/` i workflow publikacji. Ryzyko (`:129`): zdania o kreatorach mają być prawdziwe dla typowych produktów kategorii.
- `context/foundation/prd.md:156-169`: FR-017–FR-024 i FR-009 (kolejność sekcji, kotwice, 360 px, jeden motyw, spis od 980 px i 35%, FAQ 8 pytań, jeden formularz, 2 kolumny i 6 wierszy). `:189-190`, `:204-208`: kotwice do zachowania, `maestro-theme` przestaje być czytany, brak analityki, kontrast 4.5:1. `:208` mówi, że `DESIGN.md` „zostają”, co kłóci się z nowym wyglądem.
- `context/archive/2026-11-18-lista-oczekujacych/plan.md:22-53`, `:186`: kształt żądania zapisu, pole-pułapka, wzorzec adresu, `NEXT_PUBLIC_WAITLIST_URL` poza `next.config.ts`.
- `context/archive/2026-11-18-naprawa-listy-oczekujacych/`: przyczyną 502 był klucz Resend z samym „Sending access”. Dotyczyło to tylko funkcji zapisu; przebudowy nie dotyczy.
- `context/archive/2026-11-18-testy-zachowania-strony/change.md:12`, `:89`: skąd kroki 1–16 i zakaz `waitForTimeout`.
- `context/foundation/limitations.md`:
  - D-011: błąd typów w testach blokuje publikację;
  - D-015: krok 16 zwalnia całe pliki, a warunek powrotu to dokładnie zmiana `PLIKI_ZMIAN` i plików poza `#waitlist`, czyli ta zmiana;
  - D-008: `test:e2e` działa tylko z `--grep`.
- Nieaktualne opisy: `context/foundation/test-plan.md:155` oczekuje `localStorage` równego `['maestro-theme']`; `context/foundation/stack-assessment.md:84-86` opisuje klucz motywu.

## Related Research

Brak wcześniejszych plików `research.md` o porównaniu z konkurencją. Stara tabela (`lib/content.ts:251-299`) miała kolumny „Prototype builders”, „Agents for developers” i Maestro oraz przypis „A comparison of typical approaches, not every product in each category. Individual tools vary.”

## Open Questions

1. **Kontrast `--quiet` (2.56:1) wobec wymogu 4.5:1.** Rekomendacja: przyciemnić do około `#646d76` (5.26 na bieli, 4.68 na `--sky-soft`) i rozszerzyć selektor kroku 13 o `span.q`, pozycje spisu, `summary`, `label`, komórki tabeli, `.soon` i `a.btn`. To odstępstwo od makiety; trzeba je zgłosić człowiekowi albo wpisać w plan jako rozstrzygnięcie na korzyść ograniczenia z intencji. Placeholder `#6b7a87` na `--sky` (2.9:1) wymaga tej samej decyzji.
2. **Podświetlenie kolumny Maestro.** Makieta je ma, intencja i pytanie o akceptację je wykluczają. Rekomendacja: zapytać człowieka. Bez odpowiedzi zrobić tak, jak mówi tekst przyjętej intencji (bez podświetlenia). Intencja wymienia to wprost w „Czego nie będzie”, człowiek przeczytał to w pytaniu o akceptację, a różnica wobec makiety jest drobna: tło jednej kolumny. Odstępstwo trzeba wpisać w plan, żeby weryfikator P14 je znał.
3. **Wiersze 1 i 6 porównania.** Według tego researchu trzeba je przeformułować. Plan powinien podać nowe brzmienie, a człowiek je zobaczyć, bo zmienia się treść przyjętej makiety. Zapowiedź poprawki była już w pytaniu o akceptację.
4. **Kto jest `<footer>`.** `#waitlist` jako `<footer>` (makieta) czy `<section>` z wewnętrznym `<footer>`? To decyzja planu; drugi wariant nie wymaga zmiany logiki kroku 1.
5. **Pozostałe drobiazgi.** Ikona karty (zielona), link pominięcia nawigacji (dziś jest, w makiecie go nie ma), nowy `meta description`, los `DESIGN.md`, `.impeccable/design.json`, `VERIFICATION.md` i nieaktualnych zdań w `test-plan.md` i `stack-assessment.md`. Każdy zmieniony plik musi być w `plan.md` (reguła 6).
6. **Niezależne źródła o kreatorach.** Wyszukiwarki były niedostępne. Werdykty opierają się na stronach producentów, co dla zdań o tym, co produkty oferują, jest najmocniejszym źródłem. Według zasady najgorszego przypadku wiersze 1 i 6 traktuję jako nieprawdziwe.
