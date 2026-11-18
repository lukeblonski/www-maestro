# Streszczenie: Maestro — strona www

## Jak to działa na przykładzie

Dziś to jednostronicowa, angielska strona zapowiedzi Maestro. Kasia, właścicielka małej piekarni z pomysłem na aplikację do zamówień, dostaje link do strony w wiadomości i otwiera go na telefonie. Strona otwiera się od razu, w jasnym albo ciemnym kolorze, tak jak ma ustawione w telefonie. Na górze widzi misję, plan na 2027 rok i datę pierwszego wydania: 30 listopada 2026. Obok krótka rozmowa „What’s for dinner?”: Kasia klika zatwierdzenie kierunku, widzi, jak rozmowa idzie dalej, i może ją odtworzyć od nowa.

Klika „See how it works” i strona przewija się do przykładu w 8 krokach. Przechodzi go przyciskami „następny” i „poprzedni” (na pierwszym i ostatnim kroku przycisk już dalej nie prowadzi), a na końcu pokazuje podgląd przykładowej aplikacji obiadowej i resetuje go. Tabelę porównania przesuwa palcem w bok, a reszta strony się nie rozjeżdża. Otwiera kilka pytań w FAQ i przełącza stronę na ciemny kolor; po odświeżeniu kolor zostaje. Na dole wpisuje swój e-mail w formularz listy oczekujących. Przy pustym albo błędnym adresie od razu widzi komunikat o błędzie, a przy poprawnym komunikat, że to tylko podgląd i nic nie zostało wysłane ani zapisane. „Back to top” zabiera ją na górę.

Co się zmienia teraz: dla Kasi nic. Treść, wygląd i każde kliknięcie działają jak przed przejęciem. Zmienia się praca fabryki: przed każdą przyszłą zmianą strony fabryka sama przechodzi te same 16 kroków na ekranie telefonu i komputera, na stronie zbudowanej tak jak do publikacji. Gdy coś przestanie działać, zmiana nie trafi do Twojej strony.

## Pod spodem

- Strona to same gotowe pliki, bez serwera aplikacji i bez bazy danych. Publikuje się tak jak dziś: po każdym wysłaniu kodu na główną gałąź Twojego repozytorium serwis, w którym leży kod, sam buduje stronę i wystawia ją pod adresem https://lukeblonski.github.io/www-maestro/. Przejęcie tego nie zmienia.
- Strona nie bierze danych z żadnej usługi z zewnątrz: treść i czcionki są w jej plikach, nie ma liczenia odwiedzin ani śledzenia. Jedyne, co zapamiętuje, to wybrany kolor strony, w przeglądarce odwiedzającego.
- Fabryka dopisze do Twojego projektu zawsze te same rzeczy, żeby każda zmiana była sprawdzona; Twojego kodu strony nie ruszam:
  - opis uruchomienia strony i testów, dopisany w README.md;
  - testy dzisiejszego zachowania strony;
  - polecenie uruchamiające testy i paczki potrzebne testom (wpisane na listę paczek projektu i do pliku z ich dokładnymi wersjami);
  - pliki fabryki: .fabryka, folder context/ (opis projektu i plan prac), mise.toml (wersje narzędzi), folder .claude/ oraz kilka linii dopisanych na końcu CLAUDE.md i .gitignore.
- Po akceptacji fabryka zainstaluje na swoim komputerze, bez uprawnień administratora: język, w którym zbudowana jest strona, w tej samej wersji co przy publikacji, jego menedżer paczek i paczki projektu z listy dokładnych wersji zapisanej w repozytorium. Do sprawdzania ekranów użyje przeglądarki w osobnym pudełku, które już jest na komputerze (3,6 GB). Nic nie musisz wklejać.

## Ograniczenia

- Treść strony jest tylko po angielsku, tak jak dziś. Odpadają osoby, które nie czytają po angielsku.
- Strona ma się nie rozjeżdżać od szerokości 360 px w górę. Odpadają osoby z bardzo wąskimi telefonami, poniżej 360 px: u nich część strony może wychodzić poza ekran.

## Czego nie wiemy

- Każde scalenie kawałka na główną gałąź od razu publikuje stronę pod publicznym adresem, bo tak działa dziś publikacja. Kawałki przejęcia nie zmieniają kodu strony, więc odwiedzający nie zobaczą różnicy; przy przyszłych zmianach treści każda scalona zmiana będzie od razu publiczna.
- Formularz listy oczekujących to tylko podgląd: nikt nie trafia na listę i nie wiesz, kto jest zainteresowany, a na stronie brakuje informacji o prywatności. Fabryka wróci do tego, gdy zamówisz prawdziwą listę, najpóźniej przed ogłoszeniem pierwszego wydania 30 listopada 2026, jeśli strona ma wtedy zbierać zapisy.
- Lista paczek projektu wskazuje „najnowsze” wersje, a stałe wersje są tylko w osobnym pliku. Fabryka instaluje wyłącznie z tego pliku; jego odświeżenie mogłoby po cichu wciągnąć nową wersję i zepsuć budowę strony. Fabryka wróci do tego przy pierwszej zmianie, która aktualizuje paczki.
- Nie wiem, czy w repozytorium plik ustawień innego narzędzia do publikacji jest dziś używany jako drugie miejsce, w którym strona jest opublikowana. Fabryka go nie rusza.
- Nie wiem, czy strona ma docelowo dostać własną domenę zamiast dzisiejszego adresu.
- Nie wiem, jaką zmianę strony chcesz zrobić „dzisiaj”; zrobisz ją po przejęciu zwykłą drogą zmiany.
- Testy nie otwierają strony pod prawdziwym publicznym adresem. Sprawdzają stronę zbudowaną tak samo jak do publikacji, na komputerze fabryki, bo przejęcie nie zmienia publikacji.
- Testy oglądają stronę na dwóch szerokościach ekranu: telefonu (360 px) i komputera (1280 px). Innych szerokości i pełnego sprawdzenia dostępności nie obejmują.
- Wersję języka strony fabryka wzięła z Twojej automatycznej publikacji, bo projekt sam jej nie zapisuje.
- Sprawdzenie na żywo: brak. Żaden krok nie łączy się z usługą z zewnątrz, a formularz niczego nie wysyła. Żadne dane nie trafiają do obcych usług, a koszt takich sprawdzeń w całym planie prac to 0 zł.
- Kroki, których fabryka nie sprawdzi sama: brak.

## Koszt

- Publikacja zostaje bez zmian, więc i jej koszt: strona publikuje się w serwisie, w którym leży kod, za darmo, bo repozytorium jest publiczne. Przejęcie nie dodaje żadnej płatnej usługi.
- Komputer, na którym fabryka buduje, jest już opłacony; instalacje po akceptacji nic nie kosztują.
- Dodatkowy koszt testów: dopóki repozytorium jest publiczne, minuty automatycznych sprawdzeń przed scaleniem są darmowe, więc 0 zł. Najgorszy przypadek, gdyby repozytorium stało się prywatne: do ok. 15 minut sprawdzeń razy 3 próby i ok. 2 minuty publikacji po scaleniu, po 0,006 USD za minutę, czyli do ok. 0,28 USD na kawałek. Plan prac oszacowany z opisu projektu ma najwyżej 5 kawałków (to górna granica), razem do ok. 1,40 USD.
- Dłuższy krok budowy kawałka: budowa strony jak do publikacji i 14 kroków sprawdzanych w przeglądarce na telefonie i komputerze wydłużą każdy kawałek o ok. 5–15 minut na komputerze fabryki (2 rdzenie).

## Dodatek: technologia

Technologia projektu zostaje bez zmian (ocena w context/foundation/stack-assessment.md):

- Język: TypeScript 7 w trybie ścisłym.
- Framework: Next.js 16.4 (App Router) z React 19.3, eksport statyczny (`output: "export"`) do katalogu `out/`, prefiks adresu z `NEXT_PUBLIC_BASE_PATH` (w publikacji `/www-maestro`).
- Style: Tailwind CSS 4.3 przez PostCSS; ikony lucide-react; lokalne fonty DM Sans.
- Budowa: `next build --webpack`; pakiety npm z package-lock.json (instalacja tylko `npm ci`).
- Wdrożenie: GitHub Actions (`.github/workflows/pages.yml`) publikuje na GitHub Pages przy każdym wysłaniu na `main`, Node.js 22.
- Testy: dziś brak; przejęcie dodaje testy i jedno polecenie testów, a testy ekranów biegną w Playwright 1.65.0.
- Lint i formatowanie: brak.
- Ocena przyjazności dla agenta: gotowa z kompensacją (luki: brak testów, bardzo nowe wersje frameworka, wersje „latest” w package.json, brak lintera).

## Komputer, na którym fabryka buduje

- zainstaluję: node 22 (Node.js 22.23.5) i npm 10 (menedżer pakietów npm 10.9.10) z mise.toml, a potem zależności projektu z jego pliku blokady package-lock.json (`npm ci`) (bez administratora)
- testy w przeglądarce: Playwright 1.65.0 w obrazie kontenera mcr.microsoft.com/playwright:v1.65.0-noble (3,6 GB, już na komputerze), uruchamianym przez Docker 29.9.3 bez administratora; polecenie administratora niepotrzebne
- wyniki sprawdzeń: mise 2026.11.4, git 2.53.0, python3 3.14.4 i gitleaks 8.30.1 są; strona nie potrzebuje żadnych usług (bez bazy i zaplecza); port 3000 zajmuje inny proces, więc serwer deweloperski i testy wezmą inny wolny port; pamięć 7,7 GiB (6,1 GiB dostępne, budowa potrzebuje ok. 2 GB), dysk 69 GB wolne (potrzeba ok. 1 GB poza obrazem przeglądarki), 2 rdzenie
- prywatny podgląd przez Tailscale działa (HTTPS włączone, konto fabryki może ustawiać podgląd), więc stronę w trakcie budowy zobaczysz na swoich urządzeniach zalogowanych do tej samej prywatnej sieci, bez polecenia administratora
- zapora komputera jest włączona i domyślnie blokuje połączenia przychodzące
