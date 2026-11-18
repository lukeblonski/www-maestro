---
project: "Maestro — strona www"
version: 1
status: draft
created: 2026-11-18
updated: 2026-11-18
prd_version: 1
main_goal: quality
top_blocker: none
---

# Roadmap: Maestro — strona www (przejęcie)

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Maestro ma jednostronicową, angielską stronę zapowiedzi, publikowaną automatycznie po każdym wypchnięciu na `main`. Przejęcie do Factory ma sprawić, że kolejne zmiany strony idą zwykłą drogą zmiany (intencja, plan, przegląd, testy), a nie ręcznymi poprawkami. Strona nie ma dziś żadnych testów automatycznych, więc każda zmiana treści albo interakcji może po cichu zepsuć demo rozmowy, przykład w 8 krokach, motyw, formularz-demo albo układ na telefonie. Przejęcie nie zmienia tego, co strona robi i pokazuje; zmiany, których chce człowiek, idą po przejęciu zwykłą drogą zmiany i nie wchodzą do tej roadmapy.

## North star

**S-01: właściciel i Factory uruchamiają jednym poleceniem testy, które potwierdzają dzisiejsze zachowanie strony na telefonie i komputerze, a README opisuje uruchomienie strony i testów** — to jedyna rzecz, którą przejęcie dokłada, i warunek każdej następnej zmiany strony (cel `quality`: zachowanie strony ma być chronione, zanim ktokolwiek ją zmieni).

> Gwiazda przewodnia to najmniejszy kawałek od początku do końca, którego dostarczenie dowodzi głównego założenia — tu: że przejęta strona jest chroniona testami; stoi na początku, bo wszystko inne ma sens dopiero, gdy on działa.

## At a glance

| ID   | Change ID                | Outcome (user can …) | Prerequisites | PRD refs | Status |
| ---- | ------------------------ | -------------------- | ------------- | -------- | ------ |
| S-01 | testy-zachowania-strony  | właściciel i Factory uruchamiają jednym poleceniem testy dzisiejszego zachowania strony (360 px i 1280 px, strona zbudowana z `/www-maestro`), a README opisuje uruchomienie strony i testów | obraz przeglądarki testów i program kontenerów bez roota na komputerze fabryki (są) | US-01, FR-011, FR-012, FR-013, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010 | ready |

## Baseline

What's already in place in the codebase as of `2026-11-18` (auto-researched + user-confirmed — w przejęciu potwierdzone pytaniem przejęcia i krokiem sprawdzenia zdrowia projektu, `context/foundation/health-check.md`).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — jednostronicowa strona: układ sekcji `app/page.tsx`, interakcje `components/interactive.tsx`, treść `lib/content.ts`, style `app/globals.css`; eksport statyczny (`next.config.ts`, `output: "export"`), budowa z `/www-maestro` przechodzi.
- **Backend / API:** absent — z założenia (same pliki statyczne, bez zaplecza; PRD ## Constraints & Compatibility).
- **Data:** absent — z założenia (brak danych odwiedzających; jedyny zapis to `maestro-theme` w przeglądarce).
- **Auth:** absent — z założenia (strona publiczna, bez kont; PRD ## Access Control Changes).
- **Deploy / infra:** present — `.github/workflows/pages.yml` publikuje na GitHub Pages przy każdym pushu na `main`; zostaje bez zmian.
- **Observability:** absent — z założenia (brak analityki i usług zewnętrznych to wymaganie strony).
- **Testy:** absent — brak narzędzia testów, skryptu `test` i plików testów; polecenie z `## Verify` w `CLAUDE.md` kończy się komunikatem o braku testów.
- **Pliki fabryki (FR-013):** present — `.fabryka`, `context/`, `mise.toml`, `.claude/`, linie na końcu `CLAUDE.md` i `.gitignore` dopisały kroki startu.

## Foundations

Brak. Narzędzie testów, ustawienia ekranów 360 px i 1280 px oraz podawanie zbudowanej strony pod `/www-maestro` powstają w S-01, pierwszym i jedynym kawałku, który ich używa; osobny fundament niczego by nie odblokował.

## Slices

### S-01: Testy dzisiejszego zachowania strony, opis uruchomienia w README i polecenie testów projektu

- **Outcome:** właściciel i Factory uruchamiają jednym poleceniem testy, które na stronie zbudowanej tak jak do publikacji (prefiks `/www-maestro`), na ekranie telefonu (360 px) i komputera (1280 px), potwierdzają dzisiejsze zachowanie strony — kroki 1–16 scenariusza pierwszej wersji z PRD; README opisuje uruchomienie strony i testów, a polecenie z `## Verify` w `CLAUDE.md` przestaje kończyć się komunikatem o braku testów i uruchamia testy projektu.
- **Change ID:** testy-zachowania-strony
- **PRD refs:** US-01, FR-011, FR-012, FR-013, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010
- **Cytowane zachowanie do zachowania (PRD [preserved] i ## Constraints & Compatibility):**
  - FR-001 sekcje w dzisiejszej kolejności i treści; FR-002 linki wewnętrzne do istniejących sekcji; FR-003 brak poziomego przewijania od 360 px, tabela porównania z własnym przewijaniem; FR-004 nagłówek z logo, przełącznikiem motywu i przyciskiem CTA powyżej progu mobilnego, bez nawigacji.
  - FR-005 motyw według systemu i zapamiętany wybór; FR-006 demo rozmowy z zatwierdzeniem i powtórką; FR-007 8 kroków przykładu z granicami poprzedni/następny; FR-008 podgląd aplikacji obiadowej z resetem; FR-009 FAQ otwiera się i zamyka; FR-010 formularz-demo z dostępnym komunikatem błędu albo komunikatem podglądu.
  - „Kotwice sekcji (`#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist`) zostają”; „Klucz preferencji motywu `maestro-theme` w pamięci przeglądarki zostaje”; „Adres publikacji i prefiks ścieżki `/www-maestro` zostają”.
  - „Formularz listy oczekujących zostaje demonstracją bez wysyłki i bez zapisu danych”; „Brak analityki i usług zewnętrznych; fonty podawane z tego samego adresu co strona”; „Dostępność: komunikaty formularza ogłaszane czytnikom ekranu, kontrast tekstu co najmniej 4.5:1 (WCAG AA) w obu motywach, ustawienie ograniczonego ruchu wyłącza animacje i płynne przewijanie”; „Responsywność: brak poziomego przewijania dokumentu od 360 px w górę”.
  - „Kod strony (katalogi strony, komponentów, treści, plików publicznych i style) zostaje bez zmian w przejęciu”; workflow publikacji bez zmian — sprawdza krok 16 scenariusza (porównanie z commitem `5e4dcac`).
- **Zakres:** testy w przeglądarce dla kroków 1–14 scenariusza (oba ekrany, strona zbudowana z `/www-maestro`), testy bez przeglądarki dla kroków 15–16; skrypt testów i zależności testów w pliku zależności projektu i pliku zablokowanych wersji (dokładne wersje, instalacja przez plik zablokowanych wersji); dopisany w `README.md` opis uruchomienia strony i testów; polecenie testów projektu w `## Verify` w `CLAUDE.md`. Nic poza listą z PRD ## Constraints & Compatibility („Co przejęcie dokłada do repo bez pytania”).
- **Prerequisites:** obraz przeglądarki testów i program kontenerów bez roota na komputerze fabryki (są)
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Czy krok 16 scenariusza („pliki konfiguracji budowy” bez różnic względem `5e4dcac`) obejmuje plik zależności projektu, który ten kawałek zmienia o skrypt i zależności testów dozwolone przez przejęcie? — Owner: team (ustala `/10x-plan`: porównanie obejmuje pliki budowy strony, a plik zależności tylko poza wpisem skryptu i zależności testów). Block: no.
- **Potrzebuje:** nic
- **Risk:** stoi pierwszy, bo bez testów żadna następna zmiana strony nie jest sprawdzana; ryzyko to testy zależne od dokładnych tekstów i czasów animacji (kruche) oraz scalenie na `main`, które od razu uruchamia publikację (strona się nie zmienia, bo kod strony zostaje); kawałek kończy roadmapę przejęcia (koniec PRD) — kolejne zmiany człowieka idą zwykłą drogą zmiany.
- **Status:** ready

## Backlog Handoff

| Roadmap ID | Change ID               | Suggested issue title                                                        | Ready for `/10x-plan` | Notes |
| ---------- | ----------------------- | ---------------------------------------------------------------------------- | --------------------- | ----- |
| S-01       | testy-zachowania-strony | Testy dzisiejszego zachowania strony (360/1280 px, `/www-maestro`), README i polecenie testów | yes                   | Run `/10x-plan testy-zachowania-strony` |

## Open Roadmap Questions

1. **Czy plik konfiguracji hostingu innego narzędzia (`.openai/hosting.json`) jest dziś używany jako drugie miejsce publikacji?** — Owner: właściciel. Block: no (przejęcie zostawia plik bez zmian).
2. **Czy strona ma docelowo własną domenę zamiast dzisiejszego adresu publikacji?** — Owner: właściciel. Block: no.
3. **Jaką zmianę strony człowiek chce zrobić „dzisiaj”?** — Owner: właściciel. Block: no (idzie po przejęciu zwykłą drogą zmiany, poza tą roadmapą).

## Parked

- **Podłączenie prawdziwej listy oczekujących i informacji o prywatności** — Why parked: PRD ## Non-Goals; rejestr ograniczeń D-001 (zwykła droga zmiany po przejęciu, najpóźniej przed ogłoszeniem pierwszego wydania, jeśli strona ma zbierać zapisy).
- **Zmiany treści, wyglądu, nazwy produktu i tłumaczenia strony** — Why parked: PRD ## Non-Goals; zmiany człowieka po przejęciu.
- **Zmiana sposobu i miejsca publikacji, testy i skan zależności w workflow publikacji** — Why parked: PRD ## Non-Goals, krok 16 scenariusza; rejestr ograniczeń D-004.
- **Przypięcie wersji zależności i aktualizacje frameworka** — Why parked: PRD ## Non-Goals; rejestr ograniczeń D-002.
- **Linter, formatowanie i wspólne ustawienia edytora** — Why parked: przejęcie ich nie zapowiadało; rejestr ograniczeń D-003.
- **Pełny audyt dostępności, czytników ekranu i przeglądarek** — Why parked: PRD ## Non-Goals; scenariusz sprawdza tylko to, co sprawdzono ręcznie przed przejęciem.

## Done

