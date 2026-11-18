---
project: Maestro — strona www
context_type: brownfield
incumbent: null
created: 2026-11-18
updated: 2026-11-18
product_type: web-app
target_scale:
  users: medium
  qps: niski (statyczna strona z ruchem z udostępnień i ogłoszeń premiery)
  data_volume: brak danych użytkowników (strona nie zapisuje niczego poza preferencją motywu w przeglądarce)
timeline_budget:
  delivery_weeks: 1
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: tryb przejęcia
      decision: "Przejęcie bez zmiany funkcji: shape-notes opisuje stan dzisiejszy; zmiany człowieka idą po przejęciu zwykłą drogą zmiany. rozstrzygnął: agent (technika)"
    - topic: zakres przejęcia
      decision: "Factory dokłada tylko opis uruchomienia, testy dzisiejszego zachowania, skrypt testów z zależnościami i pliki fabryki; kodu strony nie zmienia. rozstrzygnął: agent (technika)"
    - topic: runda sokratejska
      decision: "Pominięta: przejęcie nie ma rundy, bo nie niesie zmiany. rozstrzygnął: agent (technika)"
  frs_drafted: 13
  quality_check_status: warned
---

# Shape notes: Maestro — strona www (przejęcie)

Źródło: `context/foundation/start.md`, sekcja `## Opis właściciela` (link https://github.com/lukeblonski/www-maestro i słowa człowieka: „Zaczniemy od strony www dzisiaj. I w związku z tym, że mam już wstępną propozycję tej strony, kod, to potraktujemy to też jako test przejęcia projektu.”) oraz odczyt kodu klonu. Kod nie był uruchamiany, zależności nie były instalowane.

## Current System

**Co to jest.** Jednostronicowa strona zapowiedzi (landing page) produktu „Maestro” — partnera, który prowadzi osobę nietechniczną od pomysłu do działającej aplikacji na jej własnym serwerze. Człowiek nazywa ją „wstępną propozycją tej strony”. Treść jest po angielsku; robocza nazwa produktu jest w jednym miejscu (`PRODUCT_NAME` w `lib/content.ts`).

**Co strona robi dziś (z kodu):**

- Sekcje w kolejności: nagłówek (logo, przełącznik motywu, przycisk CTA powyżej progu mobilnego; bez nawigacji po sekcjach), hero z misją, wizją 2027, datą pierwszego wydania (30 listopada 2026) i interaktywną demonstracją rozmowy („What’s for dinner?”, z zatwierdzeniem kierunku i powtórką), sekcja problemu (`#why`), przykład krok po kroku w 8 etapach z przyciskami poprzedni/następny i podglądem aplikacji obiadowej (pokaż/resetuj) (`#how-it-works`), opis Maestro jako partnera (`#observer`), zasady, własność (`#ownership`), tabela porównania z własnym przewijaniem poziomym na wąskich ekranach, pierwsze wydanie (`#first-release`), roadmapa, dla kogo / dla kogo nie, FAQ na natywnych elementach rozwijanych (`#faq`), formularz listy oczekujących (`#waitlist`), stopka z „Back to top”.
- Motyw jasny/ciemny: domyślnie według ustawień systemu, wybór zapamiętany w przeglądarce (`localStorage`, klucz `maestro-theme`) i odtwarzany przed wyrenderowaniem strony.
- Formularz listy oczekujących jest **tylko demonstracją**: sprawdza format e-maila, pokazuje dostępny komunikat błędu przy pustym/błędnym adresie, a przy poprawnym mówi wprost, że nic nie zostało wysłane ani zapisane. Adapter `lib/waitlist.ts` nie wysyła żadnego żądania. Na stronie są dwa widoczne TODO (podłączenie listy, informacja o prywatności i administratorze danych).
- Animacje przy przewijaniu; reguły ograniczonego ruchu wyłączają animacje i płynne przewijanie.
- Lokalne fonty (DM Sans), brak analityki i usług śledzących.

**Technika (z kodu, informacyjnie):** Next.js z React i Tailwind CSS, TypeScript, ikony lucide-react, eksport statyczny (`output: "export"`) do `out/`, `basePath` z `NEXT_PUBLIC_BASE_PATH`. Zależności w `package.json` mają wersje `latest`, ale jest `package-lock.json`. Skrypty: `dev`, `build`, `typecheck`; **brak testów i skryptu testów**.

**Wdrożenie dziś:** workflow `.github/workflows/pages.yml` przy każdym pushu na `main` instaluje zależności (`npm ci`), sprawdza typy, buduje eksport z `NEXT_PUBLIC_BASE_PATH=/www-maestro` i publikuje na GitHub Pages konta właściciela repozytorium: https://lukeblonski.github.io/www-maestro/. Ostatnie przebiegi (2026-11-09) zakończyły się sukcesem. W repo jest też `.openai/hosting.json` (konfiguracja hostingu statycznego innego narzędzia, katalog `out`) — nie wiadomo, czy jest używany.

**Pliki opisu w repo:** `README.md` (po polsku: uruchomienie, gdzie zmieniać treść, jak podłączyć listę oczekujących), `AGENTS.md` (reguły agenta Next.js), `DESIGN.md` (system wizualny: kolory, typografia), `VERIFICATION.md` (co zostało sprawdzone ręcznie i w przeglądarce), `.impeccable/design.json`.

**Kto jej używa:** właściciel (twórca Maestro) jako publiczna zapowiedź produktu; odbiorcy to osoby nietechniczne — samodzielni założyciele, eksperci dziedzinowi, właściciele małych firm — którzy mają pomysł na aplikację. Historia: 8 commitów z 9–10 listopada 2026, jeden autor.

## Vision & Problem Statement

Przejęcie strony www Maestro do Factory, żeby kolejne zmiany strony szły zwykłą drogą zmiany (intencja, plan, przegląd, testy) zamiast ręcznych poprawek. Człowiek traktuje to też jako test przejęcia projektu przez Factory. Przejęcie samo w sobie nie zmienia tego, co strona robi i pokazuje.

Problem, który przejęcie rozwiązuje: strona nie ma dziś żadnych testów automatycznych — jedynym zabezpieczeniem jest sprawdzenie typów i budowa w workflow. Każda zmiana treści albo interakcji może po cichu zepsuć działające dziś zachowanie (demo rozmowy, przykład w 8 krokach, motyw, formularz-demo, układ na telefonie).

## User & Persona

- **Właściciel projektu** — twórca Maestro, rozwija stronę przez rozmowę z Maestro/Factory. Po przejęciu jego doświadczenie się zmienia: zmiany strony są sprawdzane testami przed scaleniem.
- **Odwiedzający stronę** — osoba nietechniczna z pomysłem na aplikację (samodzielny założyciel, ekspert dziedzinowy, właściciel małej firmy). Jego doświadczenie po przejęciu ma się **nie zmienić**.

## Access Control

Strona jest publiczna, bez logowania, kont i ról. Nie zbiera danych odwiedzających. No changes planned — current model preserved.

## Success Criteria

### Primary

Po przejęciu strona w repo buduje się tak jak dziś (eksport statyczny), a testy automatyczne potwierdzają dzisiejsze zachowanie: sekcje i kotwice, przełącznik motywu z zapamiętaniem, demo rozmowy, przykład w 8 krokach z granicami poprzedni/następny, podgląd aplikacji obiadowej, FAQ, formularz-demo z komunikatami.

### Secondary

README ma opis uruchomienia i uruchomienia testów, z którego Factory i właściciel mogą korzystać przy kolejnych zmianach.

### Guardrails

- Treść, wygląd i interakcje strony bez zmian — przejęcie nie dotyka kodu strony.
- Wdrożenie na GitHub Pages działa dalej tak samo (ten sam adres, ten sam workflow).
- Strona nadal nie wysyła i nie zapisuje żadnych danych odwiedzających; jedyny zapis w przeglądarce to preferencja motywu.
- Brak analityki i usług zewnętrznych; fonty lokalne.

## User Stories

### US-01: Odwiedzający przegląda stronę i próbuje formularza

- **Given** odwiedzający otwiera stronę na telefonie (360 px) lub komputerze
- **When** przewija sekcje, klika „See how it works”, przechodzi przez 8 kroków przykładu, przełącza motyw i wpisuje e-mail w formularz
- **Then** wszystkie kotwice prowadzą do istniejących sekcji, przykład zatrzymuje się na pierwszym i ostatnim kroku, motyw zostaje po odświeżeniu, a formularz mówi wprost, że nic nie zostało wysłane ani zapisane

#### Acceptance Criteria

- Szerokość dokumentu na 360 px równa szerokości okna; tabela porównania przewija się w swoim obszarze.
- Pusty e-mail daje dostępny komunikat błędu; poprawny daje komunikat podglądu.

## Functional Requirements

### Treść i układ

- FR-001: Odwiedzający widzi wszystkie sekcje strony w obecnej kolejności i treści z `lib/content.ts`. Priority: must-have. Change: preserved
- FR-002: Odwiedzający przechodzi linkami wewnętrznymi (hero → `#waitlist`, `#how-it-works`; „Back to top”) do istniejących sekcji. Priority: must-have. Change: preserved
- FR-003: Odwiedzający na telefonie widzi stronę bez poziomego przewijania dokumentu; tabela porównania ma własne przewijanie. Priority: must-have. Change: preserved
- FR-004: Nagłówek pokazuje logo i przełącznik motywu, a przycisk CTA powyżej progu mobilnego; bez nawigacji po sekcjach. Priority: must-have. Change: preserved

### Interakcje

- FR-005: Odwiedzający przełącza motyw jasny/ciemny, a wybór zostaje po odświeżeniu; bez wyboru obowiązuje ustawienie systemu. Priority: must-have. Change: preserved
- FR-006: Odwiedzający zatwierdza kierunek w demo rozmowy w hero i może je odtworzyć ponownie. Priority: must-have. Change: preserved
- FR-007: Odwiedzający wybiera każdy z 8 kroków przykładu; przyciski poprzedni/następny respektują pierwszy i ostatni krok. Priority: must-have. Change: preserved
- FR-008: Odwiedzający pokazuje i resetuje podgląd przykładowej aplikacji obiadowej. Priority: must-have. Change: preserved
- FR-009: Odwiedzający otwiera i zamyka odpowiedzi FAQ. Priority: must-have. Change: preserved
- FR-010: Odwiedzający wpisuje e-mail w formularz listy oczekujących i dostaje dostępny komunikat błędu (pusty/błędny adres) albo komunikat, że to tylko podgląd i nic nie zostało wysłane ani zapisane. Priority: must-have. Change: preserved

### Dokładane przez przejęcie

- FR-011: Właściciel (i Factory) uruchamia testy dzisiejszego zachowania strony jednym poleceniem. Priority: must-have. Change: new
- FR-012: Właściciel znajduje w README opis uruchomienia strony i testów. Priority: must-have. Change: new
- FR-013: Repo ma pliki fabryki (`.fabryka`, `context/`, `mise.toml`, `.claude/`, linie dopisane na końcu `CLAUDE.md` i `.gitignore`). Priority: must-have. Change: new

Runda sokratejska (Step 4.5): pominięta — przejęcie nie ma rundy, bo nie niesie zmiany. rozstrzygnął: agent (technika)

## Business Logic

No domain logic change. This is an infrastructure/technical change.

Strona nie podejmuje decyzji za odwiedzającego; jedyne reguły to walidacja formatu e-maila w formularzu-demo (bez wysyłki) i wybór motywu (zapamiętany wybór, inaczej ustawienie systemu).

## Constraints & Preserved Behavior

- Kod strony (`app/`, `components/`, `lib/`, `public/`, style) zostaje bez zmian w przejęciu.
- Eksport statyczny (`output: "export"`) do `out/` i `basePath` z `NEXT_PUBLIC_BASE_PATH` zostają — od nich zależy adres na GitHub Pages (`/www-maestro`).
- Workflow `.github/workflows/pages.yml` zostaje bez zmian; dalej publikuje stronę przy każdym pushu na `main`. Uwaga: każdy commit Factory scalony na `main` uruchomi publikację — sama strona się nie zmieni, bo przejęcie nie rusza jej kodu.
- Formularz listy oczekujących zostaje demonstracją bez wysyłki i bez zapisu danych.
- Jedyny zapis w przeglądarce: `maestro-theme` w `localStorage`.
- Brak analityki i usług zewnętrznych; fonty lokalne.
- Dostępność: komunikaty formularza dostępne dla czytników ekranu, kontrast tekstu WCAG AA w obu motywach, ograniczony ruch wyłącza animacje.
- `README.md`, `AGENTS.md`, `DESIGN.md`, `VERIFICATION.md`, `.openai/hosting.json`, `.impeccable/design.json` zostają; README tylko dostaje dopisany opis uruchomienia testów.
- Instalacja zależności tylko z `package-lock.json` (`npm ci`), bo `package.json` ma wersje `latest`. rozstrzygnął: agent (technika)

## Non-Functional Requirements

- Strona działa jako statyczne pliki: bez serwera aplikacji i bez zaplecza.
- Prywatność: strona nie wysyła i nie przechowuje danych odwiedzających.
- Dostępność: kontrast tekstu co najmniej 4.5:1 w obu motywach; komunikaty formularza ogłaszane czytnikom ekranu; poszanowanie ustawienia ograniczonego ruchu.
- Responsywność: brak poziomego przewijania dokumentu od 360 px w górę.

## Non-Goals

- Podłączenie prawdziwej listy oczekujących i informacji o prywatności — to zmiana, idzie po przejęciu zwykłą drogą zmiany.
- Zmiany treści, wyglądu, nazwy produktu i tłumaczenia strony — po przejęciu, zwykłą drogą zmiany.
- Zmiana sposobu wdrożenia (GitHub Pages zostaje).
- Przypięcie wersji zależności w `package.json` i aktualizacje frameworka — poza przejęciem.
- Pełny audyt dostępności, czytników ekranu i przeglądarek.

## Open Questions

1. Luka: czy `.openai/hosting.json` (hosting statyczny innego narzędzia) jest dziś używany jako drugie miejsce publikacji — z kodu nie da się tego ustalić.
2. Luka: czy strona ma docelowo własną domenę zamiast adresu GitHub Pages — w repo brak pliku `CNAME`.
3. Luka: jaką zmianę strony człowiek chce zrobić „dzisiaj” — słowa człowieka jej nie nazywają; idzie po przejęciu zwykłą drogą zmiany.

## Forward: tech-stack

Next.js (wersja `latest`, `AGENTS.md` ostrzega, że API mogą się różnić od znanych), React, Tailwind CSS (PostCSS), TypeScript, lucide-react, Node.js 22 w workflow. Brak środowiska testów — testy dzisiejszego zachowania (m.in. w prawdziwej przeglądarce, jak w `VERIFICATION.md`) dokłada przejęcie.

## Quality cross-check

Przejęcie: miękka bramka bez pytań.

- Access Control: present.
- Business Logic: present („No domain logic change”).
- Project artifacts: present.
- Timeline-cost ack: present (delivery_weeks: 1).
- Non-Goals: present.
- Preserved behavior: present.
- Luki do `## Open Questions` PRD: drugie miejsce publikacji (`.openai/hosting.json`) nieznane — wpływa na to, czy przejęcie zostawia jedno czy dwa wdrożenia; własna domena nieznana — wpływa na opis adresu strony; zmiana człowieka nienazwana — idzie po przejęciu.
