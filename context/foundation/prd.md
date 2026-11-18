---
project: "Maestro — strona www"
version: 2
status: draft
created: 2026-11-18
updated: 2026-11-18
context_type: brownfield
product_type: web-app
target_scale:
  users: medium
  qps: niski (statyczna strona z ruchem z udostępnień i ogłoszeń premiery)
  data_volume: adresy e-mail z listy oczekujących (od S-02), trzymane poza stroną, w usłudze wysyłki maili; strona sama nie zapisuje niczego poza preferencją motywu w przeglądarce
timeline_budget:
  delivery_weeks: 1
  hard_deadline: null
  after_hours_only: true
---

# PRD: Maestro — strona www (przejęcie)

## Current System Overview

**Cel (jedno zdanie).** Jednostronicowa strona zapowiedzi (landing page) produktu „Maestro” — partnera, który prowadzi osobę nietechniczną od pomysłu do działającej aplikacji na jej własnym serwerze; człowiek nazywa ją „wstępną propozycją tej strony”.

**Architektura.** Strona statyczna bez zaplecza: eksport statyczny Next.js (`output: "export"`) do katalogu `out/`, z prefiksem adresu `basePath` z `NEXT_PUBLIC_BASE_PATH`. Treść jest po angielsku i leży w `lib/content.ts`; robocza nazwa produktu jest w jednym miejscu (`PRODUCT_NAME` w `lib/content.ts`). Interakcje są w `components/interactive.tsx`, układ sekcji w `app/page.tsx`, skrypt motywu w `app/layout.tsx`, style w `app/globals.css`.

**Technologia.** Next.js z React i Tailwind CSS (PostCSS), TypeScript, ikony lucide-react, lokalne fonty DM Sans (`public/fonts/`). Zależności w `package.json` mają wersje `latest`, ale jest `package-lock.json`. Skrypty: `dev`, `build`, `typecheck`; brak testów i skryptu testów.

**Wdrożenie dziś.** Workflow `.github/workflows/pages.yml` przy każdym pushu na `main` instaluje zależności (`npm ci`, Node.js 22), sprawdza typy, buduje eksport z `NEXT_PUBLIC_BASE_PATH=/www-maestro` i publikuje na GitHub Pages konta właściciela repozytorium: https://lukeblonski.github.io/www-maestro/. Ostatnie przebiegi (2026-11-09) zakończyły się sukcesem. W repo jest też `.openai/hosting.json` (konfiguracja hostingu statycznego innego narzędzia, katalog `out`) — nie wiadomo, czy jest używany.

**Pliki opisu w repo.** `README.md` (po polsku: uruchomienie, gdzie zmieniać treść, jak podłączyć listę oczekujących), `AGENTS.md` (reguły agenta Next.js), `DESIGN.md` (system wizualny: kolory, typografia), `VERIFICATION.md` (co zostało sprawdzone ręcznie i w przeglądarce), `.impeccable/design.json`.

**Użytkownicy.** Właściciel (twórca Maestro) używa strony jako publicznej zapowiedzi produktu; odbiorcy to osoby nietechniczne — samodzielni założyciele, eksperci dziedzinowi, właściciele małych firm — którzy mają pomysł na aplikację. Historia: 8 commitów z 9–10 listopada 2026, jeden autor.

**Co strona robi dziś (z kodu):**

- Sekcje w kolejności: nagłówek (logo, przełącznik motywu, przycisk CTA powyżej progu mobilnego; bez nawigacji po sekcjach), hero z misją, wizją 2027, datą pierwszego wydania (30 listopada 2026) i interaktywną demonstracją rozmowy („What’s for dinner?”, z zatwierdzeniem kierunku i powtórką), sekcja problemu (`#why`), przykład krok po kroku w 8 etapach z przyciskami poprzedni/następny i podglądem aplikacji obiadowej (pokaż/resetuj) (`#how-it-works`), opis Maestro jako partnera (`#observer`), zasady, własność (`#ownership`), tabela porównania z własnym przewijaniem poziomym na wąskich ekranach, pierwsze wydanie (`#first-release`), roadmapa, dla kogo / dla kogo nie, FAQ na natywnych elementach rozwijanych `<details>` (`#faq`), formularz listy oczekujących (`#waitlist`), stopka z „Back to top” (`#top`). Jest też link „skip to content” do `#main`.
- Motyw jasny/ciemny: domyślnie według ustawień systemu (`prefers-color-scheme`), wybór zapamiętany w `localStorage` pod kluczem `maestro-theme` i odtwarzany przed wyrenderowaniem strony.
- Formularz listy oczekujących jest tylko demonstracją: sprawdza format e-maila, pokazuje dostępny komunikat błędu (`role="status"`, `aria-live="polite"`, `aria-invalid`) przy pustym/błędnym adresie, a przy poprawnym mówi wprost, że nic nie zostało wysłane ani zapisane. Adapter `lib/waitlist.ts` nie wysyła żadnego żądania. Na stronie są dwa widoczne TODO (podłączenie listy, informacja o prywatności i administratorze danych).
- Animacje przy przewijaniu; reguły `prefers-reduced-motion` wyłączają animacje i płynne przewijanie.
- Brak analityki i usług śledzących.

## Problem Statement & Motivation

Przejęcie strony www Maestro do Factory, żeby kolejne zmiany strony szły zwykłą drogą zmiany (intencja, plan, przegląd, testy) zamiast ręcznych poprawek. Człowiek traktuje to też jako test przejęcia projektu przez Factory: „Zaczniemy od strony www dzisiaj. I w związku z tym, że mam już wstępną propozycję tej strony, kod, to potraktujemy to też jako test przejęcia projektu.” Przejęcie samo w sobie nie zmienia tego, co strona robi i pokazuje.

Problem, który przejęcie rozwiązuje: strona nie ma dziś żadnych testów automatycznych — jedynym zabezpieczeniem jest sprawdzenie typów i budowa przy publikacji, a resztę sprawdzono ręcznie (opis w pliku z wynikami ręcznego sprawdzenia). Każda zmiana treści albo interakcji może po cichu zepsuć działające dziś zachowanie (demo rozmowy, przykład w 8 krokach, motyw, formularz-demo, układ na telefonie). Dlaczego teraz: człowiek chce zmieniać stronę od dziś, a pierwsze wydanie produktu jest zapowiedziane na 30 listopada 2026.

## User & Persona

- **Właściciel projektu** — twórca Maestro, rozwija stronę przez rozmowę z Maestro/Factory. Po przejęciu jego doświadczenie się zmienia: zmiany strony są sprawdzane testami przed scaleniem, a opis uruchomienia strony i testów jest w README.
- **Odwiedzający stronę** — osoba nietechniczna z pomysłem na aplikację (samodzielny założyciel, ekspert dziedzinowy, właściciel małej firmy). Jego doświadczenie po przejęciu ma się **nie zmienić**.

## Success Criteria

### Primary

- Po przejęciu strona w repo buduje się tak jak dziś (same pliki statyczne pod prefiksem adresu `/www-maestro`), a testy automatyczne potwierdzają dzisiejsze zachowanie: sekcje i kotwice, przełącznik motywu z zapamiętaniem, demo rozmowy, przykład w 8 krokach z granicami poprzedni/następny, podgląd aplikacji obiadowej, FAQ, formularz-demo z komunikatami.

### Secondary

- README ma opis uruchomienia strony i uruchomienia testów, z którego Factory i właściciel mogą korzystać przy kolejnych zmianach.

### Guardrails

Poniższe granice obowiązują przejęcie (S-01). Zmiana „prawdziwa lista oczekujących” (S-02, sekcja „Zmiana po przejęciu” niżej) świadomie zmienia dwie z nich: formularz wysyła adres, a strona wykonuje jedno żądanie do własnego punktu zapisu.

- Treść, wygląd i interakcje strony bez zmian — przejęcie nie dotyka kodu strony.
- Publikacja działa dalej tak samo (ten sam adres, ta sama automatyczna publikacja przy każdym wypchnięciu na `main`).
- Strona nadal nie wysyła i nie zapisuje żadnych danych odwiedzających; jedyny zapis w przeglądarce to preferencja motywu.
- Brak analityki i usług zewnętrznych; fonty podawane z tego samego adresu co strona.

### Scenariusz pierwszej wersji

Strona ma ekrany oglądane w przeglądarce, więc każdy krok sprawdza test w przeglądarce na ekranie telefonu (szerokość 360 px) i komputera (szerokość 1280 px), na stronie zbudowanej tak jak do publikacji. Strona nie korzysta z żadnej usługi z zewnątrz, więc żaden krok nie ma ścieżki na żywo ani wyjątku.

1. Czy strona otwiera się bez błędów i ostrzeżeń w konsoli przeglądarki i pokazuje sekcje w dzisiejszej kolejności: hero, problem (`#why`), przykład w 8 krokach (`#how-it-works`), Maestro jako partner (`#observer`), zasady, własność (`#ownership`), porównanie, pierwsze wydanie (`#first-release`), roadmapa, dla kogo / dla kogo nie, FAQ (`#faq`), lista oczekujących (`#waitlist`), stopka z „Back to top”?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera czyta kolejność sekcji i ich nagłówki oraz zbiera błędy i ostrzeżenia konsoli.
2. Czy każdy link wewnętrzny (przyciski hero do `#waitlist` i `#how-it-works`, przycisk w pierwszym wydaniu, link „skip to content”, logo i „Back to top” do `#top`) prowadzi do istniejącej sekcji?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera zbiera wszystkie linki zaczynające się od `#`, sprawdza, że cel istnieje, i klika przyciski hero, sprawdzając, że sekcja docelowa jest w widoku.
3. Czy na telefonie (360 px) szerokość dokumentu równa się szerokości okna, a tabela porównania przewija się poziomo we własnym obszarze?
   Sprawdzenie: test w przeglądarce na ekranie telefonu porównuje szerokość dokumentu z szerokością okna i sprawdza, że obszar tabeli porównania jest szerszy w treści niż na ekranie i daje się przewinąć; na ekranie komputera sprawdza tylko brak poziomego przewijania dokumentu.
4. Czy nagłówek pokazuje logo i przełącznik motywu, przycisk CTA tylko na ekranie szerszym niż próg mobilny, i nie ma nawigacji po sekcjach ani menu?
   Sprawdzenie: test w przeglądarce na ekranie komputera widzi logo, przełącznik i przycisk CTA, a na ekranie telefonu logo i przełącznik bez przycisku CTA; na obu sprawdza brak nawigacji i menu w nagłówku.
5. Czy bez zapisanego wyboru motyw idzie za ustawieniem systemu (jasny i ciemny), a po przełączeniu motyw zostaje po odświeżeniu strony, przy czym w pamięci przeglądarki jest tylko klucz `maestro-theme`?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera otwiera stronę przy jasnym i ciemnym ustawieniu systemu, przełącza motyw, odświeża stronę, sprawdza motyw strony i listę kluczy w pamięci przeglądarki.
6. Czy w demo rozmowy w hero odwiedzający zatwierdza kierunek i może odtworzyć rozmowę od nowa?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera klika zatwierdzenie kierunku, sprawdza zmieniony stan demo, klika powtórkę i sprawdza powrót do stanu początkowego.
7. Czy każdy z 8 kroków przykładu daje się wybrać, przycisk „poprzedni” nie cofa poza pierwszy krok, a „następny” nie idzie poza ósmy?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera wybiera po kolei każdy z 8 kroków i sprawdza wyświetlony opis, a na pierwszym i ósmym kroku sprawdza, że przycisk „poprzedni” i „następny” jest wyłączony albo nie zmienia kroku.
8. Czy odwiedzający pokazuje podgląd przykładowej aplikacji obiadowej i resetuje go do stanu początkowego?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera klika pokazanie podglądu, sprawdza widoczny wynik posiłku, klika reset i sprawdza stan początkowy.
9. Czy każda odpowiedź w FAQ otwiera się i zamyka?
   Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera klika każde pytanie FAQ dwa razy i sprawdza, że odpowiedź jest widoczna po pierwszym kliknięciu i ukryta po drugim.
10. Czy formularz listy oczekujących przy pustym i błędnym adresie pokazuje komunikat błędu ogłaszany czytnikom ekranu, a przy poprawnym adresie komunikat, że to tylko podgląd i nic nie zostało wysłane ani zapisane, bez żadnego żądania wychodzącego ze strony?
    Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera wysyła formularz pusty, z adresem bez „@” i z poprawnym adresem; sprawdza tekst komunikatu w obszarze ogłaszanym czytnikom ekranu, oznaczenie pola jako błędnego i to, że przy wysyłce przeglądarka nie wykonała żadnego żądania sieciowego.
11. Czy podczas otwierania i przeglądania całej strony przeglądarka nie wykonuje żadnego żądania poza adres strony (brak analityki, usług śledzących i fontów z zewnątrz)?
    Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera zapisuje adresy wszystkich żądań przy otwarciu i przewinięciu strony do końca i sprawdza, że każdy jest pod adresem strony.
12. Czy przy włączonym w systemie ograniczeniu ruchu strona nie ma animacji ani płynnego przewijania?
    Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera włącza ustawienie ograniczonego ruchu, sprawdza wyliczony styl przewijania dokumentu i brak trwających animacji elementów po przewinięciu.
13. Czy główne pary kolorów tekstu i tła mają kontrast co najmniej 4.5:1 w motywie jasnym i ciemnym?
    Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera liczy kontrast z wyliczonych kolorów tekstu i tła nagłówków, akapitów, przycisków i komunikatów formularza w obu motywach.
14. Czy strona zbudowana z prefiksem adresu `/www-maestro`, tak jak przy publikacji, otwiera się pod tym prefiksem razem z fontami, ikoną i stylami?
    Sprawdzenie: test w przeglądarce na ekranie telefonu i komputera otwiera zbudowane pliki podane pod ścieżką `/www-maestro/` i sprawdza, że żadne żądanie fontu, ikony, stylu ani skryptu nie skończyło się błędem.
15. Czy wszystkie testy strony uruchamiają się jednym poleceniem opisanym w README, a README opisuje też uruchomienie strony?
    Sprawdzenie: test bez przeglądarki uruchamia polecenie testów z README i sprawdza wynik zero, i sprawdza, że README zawiera polecenie uruchomienia strony i polecenie testów.
16. Czy przejęcie zostawia bez zmian kod strony, treść, style, pliki publiczne, konfigurację budowy i workflow publikacji?
    Sprawdzenie: test bez przeglądarki porównuje katalogi `app/`, `components/`, `lib/`, `public/`, katalog workflow publikacji i pliki konfiguracji budowy z ostatnim commitem właściciela przed przejęciem (`5e4dcac`) i sprawdza brak różnic.

## User Stories

### US-01: Odwiedzający przegląda stronę i próbuje formularza

- **Given** odwiedzający otwiera stronę na telefonie (360 px) lub komputerze
- **When** przewija sekcje, klika „See how it works”, przechodzi przez 8 kroków przykładu, przełącza motyw i wpisuje e-mail w formularz
- **Then** wszystkie kotwice prowadzą do istniejących sekcji, przykład zatrzymuje się na pierwszym i ostatnim kroku, motyw zostaje po odświeżeniu, a formularz mówi wprost, że nic nie zostało wysłane ani zapisane

Przed przejęciem: to samo zachowanie — przejęcie go nie zmienia, tylko dokłada testy, które je potwierdzają.

#### Acceptance Criteria

- Szerokość dokumentu na 360 px równa szerokości okna; tabela porównania przewija się w swoim obszarze.
- Pusty e-mail daje dostępny komunikat błędu; poprawny daje komunikat podglądu.

## Scope of Change

### Treść i układ

- [preserved] FR-001: Odwiedzający widzi wszystkie sekcje strony w obecnej kolejności i treści z pliku treści strony. Priority: must-have
- [preserved] FR-002: Odwiedzający przechodzi linkami wewnętrznymi (hero → `#waitlist`, `#how-it-works`; „Back to top”) do istniejących sekcji. Priority: must-have
- [preserved] FR-003: Odwiedzający na telefonie widzi stronę bez poziomego przewijania dokumentu; tabela porównania ma własne przewijanie. Priority: must-have
- [preserved] FR-004: Nagłówek pokazuje logo i przełącznik motywu, a przycisk CTA powyżej progu mobilnego; bez nawigacji po sekcjach. Priority: must-have

### Interakcje

- [preserved] FR-005: Odwiedzający przełącza motyw jasny/ciemny, a wybór zostaje po odświeżeniu; bez wyboru obowiązuje ustawienie systemu. Priority: must-have
- [preserved] FR-006: Odwiedzający zatwierdza kierunek w demo rozmowy w hero i może je odtworzyć ponownie. Priority: must-have
- [preserved] FR-007: Odwiedzający wybiera każdy z 8 kroków przykładu; przyciski poprzedni/następny respektują pierwszy i ostatni krok. Priority: must-have
- [preserved] FR-008: Odwiedzający pokazuje i resetuje podgląd przykładowej aplikacji obiadowej. Priority: must-have
- [preserved] FR-009: Odwiedzający otwiera i zamyka odpowiedzi FAQ. Priority: must-have
- [preserved] FR-010: Odwiedzający wpisuje e-mail w formularz listy oczekujących i dostaje dostępny komunikat błędu (pusty/błędny adres) albo komunikat, że to tylko podgląd i nic nie zostało wysłane ani zapisane. Priority: must-have

### Zmiana po przejęciu: prawdziwa lista oczekujących (S-02)

Prośba człowieka (2026-11-18): „na stronie trzeba obsluzyc: [TODO: Connect the waiting list before accepting sign-ups.]”; „adresy maja trafic na <adres e-mail właściciela>. Wysylka maili moze byc obsluzona przez https://resend.com chyba ze fabryka zdecyduje inaczej. [Add the privacy notice and data controller details before collecting email addresses.] - tego na razie nie robimy.” (adres w repo zastąpiony opisem, bo repo jest publiczne).

- [changed] FR-010 → FR-014: Odwiedzający wpisuje e-mail w formularz listy oczekujących; pusty albo błędny adres daje jak dziś dostępny komunikat błędu, poprawny adres trafia na listę, a odwiedzający dostaje dostępny komunikat, że jest zapisany. Gdy zapis się nie uda, dostaje dostępny komunikat, że zapis nie przeszedł i może spróbować ponownie. Priority: must-have
- [new] FR-015: Właściciel dostaje e-mail z każdym nowym adresem z listy na swój adres (adres konta w usłudze wysyłki), a adresy są też zebrane w jednej liście w tej usłudze. Priority: must-have
- [new] FR-016: Klucz usługi wysyłki i adres właściciela nie są w kodzie strony ani w repo; strona zna tylko publiczny adres punktu zapisu. Priority: must-have
- [changed] Usunięty z widoku pierwszy znacznik TODO („Connect the waiting list…”) i zdanie formularza „Form preview only… nothing is sent or saved”. Drugi znacznik TODO (informacja o prywatności i administratorze danych) też znika z widoku — człowiek: „Ukryć (Recommended)”; informacji o prywatności na razie nie robimy (człowiek: „tego na razie nie robimy”), ryzyko zostaje w rejestrze ograniczeń D-001.

**Technika (zaproponował agent, zaakceptował człowiek 2026-11-18: „Akceptuję (Recommended)”).** Strona zostaje statyczna na GitHub Pages. Klucza usługi wysyłki nie można trzymać w plikach strony (każdy odwiedzający by go zobaczył), więc formularz wysyła adres do małej funkcji w chmurze (Cloudflare Workers, plan darmowy), która trzyma klucz Resend jako sekret, dodaje adres do listy kontaktów Resend i wysyła właścicielowi e-mail z nowym adresem. Resend bez własnej domeny wysyła tylko na adres właściciela konta — dokładnie to, czego ta zmiana potrzebuje. Funkcja przyjmuje żądania tylko z adresu strony, ma pole-pułapkę na boty i limit zapisów z jednego adresu IP.

### Dokładane przez przejęcie

- [new] FR-011: Właściciel (i Factory) uruchamia testy dzisiejszego zachowania strony jednym poleceniem. Priority: must-have
- [new] FR-012: Właściciel znajduje w README opis uruchomienia strony i testów. Priority: must-have
- [new] FR-013: Repo ma pliki fabryki (`.fabryka`, `context/`, `mise.toml`, `.claude/`, linie dopisane na końcu `CLAUDE.md` i `.gitignore`). Priority: must-have

## Constraints & Compatibility

**Co przejęcie dokłada do repo bez pytania (pełna lista; nic poza nią):**

- opis uruchomienia projektu (i uruchomienia testów) dopisany w `README.md`;
- testy dzisiejszego zachowania strony;
- skrypt testów i jego zależności (wpis skryptu i zależności testów w pliku zależności projektu i w pliku zablokowanych wersji);
- pliki fabryki: `.fabryka`, `context/`, `mise.toml`, `.claude/` oraz linie dopisane na końcu `CLAUDE.md` i `.gitignore`.

**Zgodność wstecz (adresy i formaty):**

- Adres publikacji i prefiks ścieżki `/www-maestro` zostają; od nich zależy adres strony.
- Kotwice sekcji (`#top`, `#main`, `#why`, `#how-it-works`, `#observer`, `#ownership`, `#first-release`, `#faq`, `#waitlist`) zostają, bo mogą być już udostępnione w linkach.
- Klucz preferencji motywu `maestro-theme` w pamięci przeglądarki zostaje, żeby powracający odwiedzający nie stracili wybranego motywu.

**Przenoszenie danych:** brak — strona nie ma danych odwiedzających ani zaplecza; plan wycofania to cofnięcie commitów przejęcia, bo nie dotykają kodu strony.

**Istniejące integracje:**

- Automatyczna publikacja przy każdym wypchnięciu na `main` zostaje bez zmian. Uwaga: każdy commit Factory scalony na `main` uruchomi publikację — sama strona się nie zmieni, bo przejęcie nie rusza jej kodu.
- Instalacja zależności tylko z pliku zablokowanych wersji, bo plik zależności projektu ma wersje „najnowsza”. rozstrzygnął: agent (technika)

**Zachowanie, którego przejęcie nie może zepsuć** (S-02 zmienia punkty o formularzu i o usługach zewnętrznych — sekcja „Zmiana po przejęciu”):

- Kod strony (katalogi strony, komponentów, treści, plików publicznych i style) zostaje bez zmian w przejęciu.
- Strona działa jako same pliki statyczne, bez zaplecza; budowa daje katalog gotowych plików z prefiksem adresu ustawianym przy budowie.
- Formularz listy oczekujących zostaje demonstracją bez wysyłki i bez zapisu danych.
- Jedyny zapis w przeglądarce: preferencja motywu pod kluczem `maestro-theme`.
- Brak analityki i usług zewnętrznych; fonty podawane z tego samego adresu co strona.
- Dostępność: komunikaty formularza ogłaszane czytnikom ekranu, kontrast tekstu co najmniej 4.5:1 (WCAG AA) w obu motywach, ustawienie ograniczonego ruchu wyłącza animacje i płynne przewijanie.
- Responsywność: brak poziomego przewijania dokumentu od 360 px w górę.
- `README.md`, `AGENTS.md`, `DESIGN.md`, `VERIFICATION.md`, plik konfiguracji hostingu innego narzędzia i plik ustawień systemu wizualnego zostają; README tylko dostaje dopisany opis uruchomienia strony i testów.

## Business Logic Changes

No domain logic change. This is an infrastructure/technical change.

Strona nie podejmuje decyzji za odwiedzającego; jedyne reguły to walidacja formatu e-maila w formularzu-demo (bez wysyłki) i wybór motywu (zapamiętany wybór, inaczej ustawienie systemu).

## Access Control Changes

No access control changes — current model preserved.

Strona jest publiczna, bez logowania, kont i ról. Nie zbiera danych odwiedzających.

## Non-Goals

- Informacja o prywatności i administratorze danych — człowiek: „tego na razie nie robimy” (rejestr ograniczeń D-001). Podłączenie prawdziwej listy oczekujących przeszło do zakresu jako S-02, po przejęciu.
- Zmiany treści, wyglądu, nazwy produktu i tłumaczenia strony — po przejęciu, zwykłą drogą zmiany.
- Zmiana sposobu i miejsca publikacji — dzisiejsza publikacja zostaje.
- Przypięcie wersji zależności w pliku zależności projektu i aktualizacje frameworka — poza przejęciem.
- Pełny audyt dostępności, czytników ekranu i przeglądarek — scenariusz sprawdza tylko to, co sprawdzono ręcznie przed przejęciem.

## Open Questions

1. **Czy plik konfiguracji hostingu innego narzędzia (opisany w Current System Overview) jest dziś używany jako drugie miejsce publikacji?** — z kodu nie da się tego ustalić; wpływa na to, czy przejęcie zostawia jedno czy dwa wdrożenia. Owner: właściciel. Block: no (przejęcie zostawia plik bez zmian).
2. **Czy strona ma docelowo własną domenę zamiast dzisiejszego adresu publikacji?** — w repo brak pliku domeny; wpływa na opis adresu strony. Owner: właściciel. Block: no.
3. ~~Jaką zmianę strony człowiek chce zrobić „dzisiaj”?~~ — rozstrzygnięte 2026-11-18: prawdziwa lista oczekujących (S-02).
