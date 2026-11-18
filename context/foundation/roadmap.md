---
project: "Maestro — strona www"
version: 2
status: draft
created: 2026-11-18
updated: 2026-11-18
prd_version: 2
main_goal: quality
top_blocker: none
---

# Roadmap: Maestro — strona www (przejęcie)

> Derived from `context/foundation/prd.md` (v2) + auto-researched codebase baseline.
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
| S-02 | lista-oczekujacych       | odwiedzający zapisuje się na listę oczekujących, a właściciel dostaje e-mail z każdym nowym adresem i ma je zebrane w jednej liście | S-01 | FR-014, FR-015, FR-016 | proposed |

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

### S-02: Prawdziwa lista oczekujących z powiadomieniem właściciela

- **Outcome:** odwiedzający wpisuje e-mail w formularz na stronie i jest zapisany na listę oczekujących; właściciel dostaje e-mail z każdym nowym adresem na adres swojego konta w usłudze wysyłki, a adresy są zebrane w liście kontaktów tej usługi.
- **Change ID:** lista-oczekujacych
- **Prośba człowieka:** podłączyć formularz listy oczekujących tak, żeby adresy trafiały na e-mail właściciela, wysyłka przez Resend (chyba że fabryka zdecyduje inaczej), bez informacji o prywatności na razie.
- **PRD refs:** FR-014, FR-015, FR-016 (PRD v2, „Zmiana po przejęciu: prawdziwa lista oczekujących”)
- **Zakres:** mała funkcja w Cloudflare Workers z kluczem Resend jako sekretem (dodaje adres do listy kontaktów Resend i wysyła właścicielowi powiadomienie; przyjmuje tylko żądania z adresu strony, pole-pułapka na boty, limit zapisów z jednego IP); `lib/waitlist.ts` wysyła adres do tej funkcji; komunikaty sukcesu i błędu zapisu w `lib/content.ts`; zniknięcie zdania „Form preview only…” i obu znaczników TODO (drugi ukryty decyzją człowieka „Ukryć (Recommended)”, sprawa prywatności zostaje w D-001); testy S-01 dla kroków 10 i 11 scenariusza zmienione na nowe zachowanie (jedno żądanie do punktu zapisu, w testach podstawionego); wdrożenie funkcji opisane w README. Bez informacji o prywatności.
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jak publikować funkcję: z komputera fabryki poleceniem narzędzia Cloudflare czy krokiem w workflow publikacji? — Owner: team (ustala `/10x-plan`; workflow publikacji bez zmian, jeśli się da, D-004). Block: no.
- **Pytania do człowieka (przenieść do `## Pytania do człowieka` w change.md przy `/intent`):**
  - rodzaj: zakres · krok: akceptacja-prd · pytanie: Strona www-maestro, plan pierwszej zmiany (lista oczekujących). Factory zapisała prośbę jako plan; nic nie jest zbudowane ani zacommitowane. Kolejność: najpierw A (S-47 w laboratorium), potem B (S-01, testy obecnego zachowania strony), potem nowa pozycja S-02 lista-oczekujacych (S-02 wymaga S-01). Zmiany w plikach (PRD w wersji 2, nowa pozycja S-02): formularz zapisuje adres na listę i pokazuje „jesteś zapisany”, a gdy zapis się nie uda — komunikat, że można spróbować jeszcze raz; właściciel dostaje e-mail z każdym nowym adresem, a wszystkie adresy są też w jednej liście w Resend; ze strony znika „[TODO: Connect the waiting list…]” i zdanie „Form preview only… nothing is sent or saved”; informacji o prywatności nie robimy; adresu e-mail właściciela nie ma w plikach (repo jest publiczne), tylko w ustawieniach usługi. Decyzja fabryki co do techniki: zostajemy przy Resend, ale strona na GitHub Pages nie może trzymać klucza Resend (każdy mógłby go podejrzeć). Formularz wysyła adres do małej funkcji na Cloudflare (plan darmowy), która trzyma klucz i wysyła maile. Resend bez własnej domeny wysyła maile tylko na adres właściciela konta, a tu więcej nie trzeba. Funkcja przyjmuje zapisy tylko z adresu strony, ma pułapkę na boty i limit zapisów z jednego adresu IP. Na później, przed budową S-02: konto Resend na Twój e-mail z kluczem API i konto Cloudflare z tokenem; oba klucze zapiszesz jednym poleceniem w terminalu, nie przez rozmowę. Rekomendacja Factory: akceptować — działająca lista przed premierą 30.11; ryzyko: Cloudflare to drugie konto do założenia. Alternatywa: gotowy serwis formularzy bez własnej funkcji — prostszy, ale darmowy plan ma około 50 zapisów miesięcznie. Pytanie 1: Czy akceptujesz zmieniony plan: S-02 po S-01, zapis przez funkcję Cloudflare i Resend, bez informacji o prywatności? Odpowiedzi: „Akceptuję (Recommended)”, „Zmień technikę”. (odpowiedź człowieka: „Akceptuję (Recommended)”) · rekomendacja: akceptować PRD v2 i S-02 (funkcja Cloudflare i Resend) · wybór: rekomendacja · rozstrzygnął: człowiek · granica: 20 pytaj mnie (akceptacja zmienionego opisu produktu i roadmapy)
  - rodzaj: zakres · krok: akceptacja-prd · pytanie: Strona www-maestro, drugi znacznik TODO. Czy „[TODO: Add the privacy notice and data controller details before collecting email addresses.]” ma zostać widoczny, kiedy formularz już naprawdę zbiera adresy? Rekomendacja Factory: ukryć go ze strony i zostawić sprawę jako zapisane ograniczenie — odwiedzający nie zobaczy notatki dla autora, która przeczy temu, co robi formularz. Ryzyko się nie zmienia: zbieranie adresów bez informacji o prywatności narusza RODO, a w roadmapie zostaje to zapisane jako ryzyko. Druga droga: zostawić go widocznym — uczciwe wobec odwiedzających, ale wygląda na niedokończoną stronę. Odpowiedzi: „Ukryć (Recommended)”, „Zostawić widoczny”. (odpowiedź człowieka: „Ukryć (Recommended)”) · rekomendacja: ukryć drugi znacznik TODO ze strony · wybór: rekomendacja · rozstrzygnął: człowiek · granica: 20 pytaj mnie (rozstrzygnięcie widoczne w aplikacji)
- **Potrzebuje:** konto Resend założone na adres e-mail właściciela, z kluczem API (plik klucza w `/home/fabryka/.secrets/www-maestro/`); konto Cloudflare z tokenem API do publikacji funkcji (plik klucza w tym samym folderze).
- **Risk:** strona zaczyna zbierać adresy e-mail bez informacji o prywatności i administratorze danych (decyzja człowieka „tego na razie nie robimy”; RODO wymaga tej informacji przy zbieraniu, rejestr ograniczeń D-001); pierwsza usługa zewnętrzna i pierwsze dane odwiedzających; scalenie na `main` od razu publikuje stronę z działającym formularzem.
- **Status:** proposed (PRD v2 i pozycja zaakceptowane przez człowieka 2026-11-18: „Akceptuję (Recommended)”; budowa dopiero na słowo człowieka „buduj”, po S-47 w laboratorium i S-01)

## Backlog Handoff

| Roadmap ID | Change ID               | Suggested issue title                                                        | Ready for `/10x-plan` | Notes |
| ---------- | ----------------------- | ---------------------------------------------------------------------------- | --------------------- | ----- |
| S-01       | testy-zachowania-strony | Testy dzisiejszego zachowania strony (360/1280 px, `/www-maestro`), README i polecenie testów | yes                   | Run `/10x-plan testy-zachowania-strony` |
| S-02       | lista-oczekujacych      | Prawdziwa lista oczekujących: zapis przez funkcję Cloudflare i Resend, powiadomienie właściciela | no (po S-01)          | Intencja przez `/intent` z człowiekiem |

## Open Roadmap Questions

1. **Czy plik konfiguracji hostingu innego narzędzia (`.openai/hosting.json`) jest dziś używany jako drugie miejsce publikacji?** — Owner: właściciel. Block: no (przejęcie zostawia plik bez zmian).
2. **Czy strona ma docelowo własną domenę zamiast dzisiejszego adresu publikacji?** — Owner: właściciel. Block: no.
3. ~~Jaką zmianę strony człowiek chce zrobić „dzisiaj”?~~ — rozstrzygnięte 2026-11-18: S-02 lista-oczekujacych.

## Parked

- **Informacja o prywatności i administratorze danych** — Why parked: człowiek 2026-11-18: „tego na razie nie robimy”; rejestr ograniczeń D-001 (podłączenie listy przeszło do S-02).
- **Zmiany treści, wyglądu, nazwy produktu i tłumaczenia strony** — Why parked: PRD ## Non-Goals; zmiany człowieka po przejęciu.
- **Zmiana sposobu i miejsca publikacji, testy i skan zależności w workflow publikacji** — Why parked: PRD ## Non-Goals, krok 16 scenariusza; rejestr ograniczeń D-004.
- **Przypięcie wersji zależności i aktualizacje frameworka** — Why parked: PRD ## Non-Goals; rejestr ograniczeń D-002.
- **Linter, formatowanie i wspólne ustawienia edytora** — Why parked: przejęcie ich nie zapowiadało; rejestr ograniczeń D-003.
- **Pełny audyt dostępności, czytników ekranu i przeglądarek** — Why parked: PRD ## Non-Goals; scenariusz sprawdza tylko to, co sprawdzono ręcznie przed przejęciem.

## Done

