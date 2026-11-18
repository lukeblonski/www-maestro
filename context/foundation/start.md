# Start projektu: www-maestro

## Zgody

## Opis właściciela

Repozytorium: https://github.com/lukeblonski/www-maestro

> „Zaczniemy od strony www dzisiaj. I w związku z tym, że mam już wstępną propozycję tej strony, kod, to potraktujemy to też jako test przejęcia projektu.”

## Pytania do człowieka

- rodzaj: kryterium · krok: prd · pytanie: Jak fabryka sprawdza kroki scenariusza pierwszej wersji strony, która ma ekrany i nie korzysta z usług z zewnątrz? · rekomendacja: każdy krok testem w przeglądarce na ekranie telefonu (360 px) i komputera (1280 px) na stronie zbudowanej jak do publikacji, bez ścieżek na żywo i bez wyjątków; dwa kroki o repo (polecenie testów i README, brak zmian w kodzie strony) testem bez przeglądarki · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: kryterium · krok: prd · pytanie: Czy scenariusz sprawdza publikację na prawdziwym adresie strony? · rekomendacja: nie; scenariusz sprawdza budowę z prefiksem adresu publikacji i otwarcie tak zbudowanej strony, bo przejęcie nie zmienia publikacji, a stan publicznego adresu przed scaleniem nie zależy od kawałka · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: zakres · krok: prd · pytanie: Czy trzy luki z notatek (drugie miejsce publikacji, własna domena, nienazwana zmiana człowieka) blokują PRD przejęcia? · rekomendacja: nie; trafiają do Open Questions bez blokady, bo przejęcie nie rusza publikacji ani treści, a zmiana człowieka idzie po przejęciu · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: zakres · krok: prd · pytanie: Gdzie zapisać odłożone sprawy: lista oczekujących tylko jako podgląd i zależności bez przypiętych wersji? · rekomendacja: wpisy D-001 i D-002 w context/foundation/limitations.md · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: technologia · pytanie: Jakie wersje języka i menedżera pakietów zapisać w mise.toml, skoro projekt nie ma pliku wersji Node.js? · rekomendacja: node = "22" z workflow publikacji (node-version: 22, zgodne z wymaganiem Next.js node >=20.9.0) i npm = "10", czyli npm dołączany do Node.js 22, zgodny z plikiem zablokowanych wersji (lockfileVersion 3) · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: zakres · krok: technologia · pytanie: Czy wymagania komputera obejmują testy w przeglądarce, choć projekt nie ma dziś żadnych testów? · rekomendacja: tak; scenariusz PRD sprawdza każdy krok w przeglądarce na 360 px i 1280 px, więc wymaganiem jest Playwright 1.65.0 w obrazie przeglądarki laboratorium uruchamianym przez docker bez roota · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: zakres · krok: technologia · pytanie: Czy linia wdrożenia obejmuje też plik konfiguracji hostingu innego narzędzia (.openai/hosting.json)? · rekomendacja: nie; w repo nie ma niczego, co go uruchamia, a jego użycie to otwarte pytanie PRD bez blokady; linia nazywa tylko workflow publikacji na GitHub Pages · wybór: rekomendacja · rozstrzygnął: agent
- rodzaj: inne · krok: technologia · pytanie: Jaką gotowość dla agenta przypisać technologii strony i czy proponowane wpisy instrukcji wkleić do CLAUDE.md? · rekomendacja: gotowa z kompensacją (TypeScript strict, Next.js 16, Tailwind 4; luki: brak testów, nowe wersje frameworka, wersje „latest”, brak lintera); wpisy zostają w context/foundation/stack-assessment.md, CLAUDE.md bez zmian · wybór: rekomendacja · rozstrzygnął: agent

## Decyzje bez podstawy

## Wymagania komputera

- Node.js 22 (workflow publikacji node-version: 22, Next.js 16.4.6 wymaga node >=20.9.0) — sprawdzone: mise registry node (core:node), mise latest node@22 → 22.23.5, mise ls node (22.23.5 już w mise) — wynik: do instalacji po akceptacji (mise, bez roota, w folderze projektu)
- npm 10 (plik zablokowanych wersji lockfileVersion 3, instalacja npm ci) — sprawdzone: mise registry npm (aqua:npm/cli), mise ls-remote npm 10 → 10.9.10, mise ls npm (10.9.10 już w mise) — wynik: do instalacji po akceptacji (mise, bez roota, w folderze projektu)
- mise (instaluje Node.js i npm z mise.toml) — sprawdzone: mise --version → 2026.11.4 — wynik: spełnione
- plik mise.toml z [tools] node = "22", npm = "10" — sprawdzone: brak mise.toml, .tool-versions i .mise.toml w repo przed krokiem — wynik: naprawione (zapisany mise.toml w katalogu głównym)
- git (zabezpieczenia projektu, historia) — sprawdzone: git --version → 2.53.0 — wynik: spełnione
- python3 (zabezpieczenia projektu, podgląd zbudowanej strony z README) — sprawdzone: python3 --version → 3.14.4 — wynik: spełnione
- gitleaks (skan sekretów w zabezpieczeniach projektu) — sprawdzone: gitleaks version → 8.30.1 — wynik: spełnione
- testy w przeglądarce: Playwright 1.65.0 w obrazie mcr.microsoft.com/playwright:v1.65.0-noble (wersja z obrazu laboratorium) — sprawdzone: docker images → obraz jest lokalnie, 3.63 GB — wynik: spełnione
- program kontenerów dla testów w przeglądarce bez roota — sprawdzone: docker --version → 29.10.0, docker info → serwer 29.9.3 w trybie rootless, dostęp z konta fabryka — wynik: spełnione
- usługi: brak (strona statyczna bez bazy i zaplecza) — sprawdzone: next.config.ts (output: "export"), package.json bez klientów baz i usług — wynik: spełnione
- port serwera deweloperskiego 3000 na 127.0.0.1 (skrypt dev) — sprawdzone: ss -ltn → port 3000 na 127.0.0.1 jest już zajęty przez inny proces — wynik: spełnione (serwer deweloperski Next.js sam bierze następny wolny port, a testy i podgląd zbudowanej strony używają własnego wolnego portu)
- pamięć na budowę Next.js (około 2 GB) — sprawdzone: free -h → 7.7 GiB razem, 6.1 GiB dostępne, 2 rdzenie (nproc) — wynik: spełnione
- dysk na zależności, budowę i obraz przeglądarki (około 1 GB poza obrazem) — sprawdzone: df -h /home/fabryka → 69 GB wolne — wynik: spełnione

## Sprawdzalność scenariusza

## Sprawdzenia przed posiedzeniem

## Do decyzji na posiedzeniu

## Wdrożenie projektu

- workflow .github/workflows/pages.yml uruchamiany wysłaniem na gałąź main (publikuje stronę na GitHub Pages repozytorium właściciela lukeblonski/www-maestro, adres https://lukeblonski.github.io/www-maestro/)

## Akceptacja

## Zatrzymania autopilota

## Koszty kroków

| Krok | Sesja | Początek | Czas (s) | Model | Wejście | Wyjście | Odczyt cache | Zapis cache | Największy kontekst | Koszt USD | Czas modelu (s) | Czas narzędzi (s) | Testy | Pełne testy | Czas testów (s) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| prd | b3f512e1-73d2-4559-b99c-97672cf60b3e | 2026-11-18T07:15:13+00:00 | 184 | claude-opus-5-5 | 19 | 18810 | 541588 | 68297 | 76326 | 1.0310 | 182 | 0 | 0 | 0 | 0 |
| technologia | 87bc0beb-ee27-4cc9-9e41-3ee8dd651543 | 2026-11-18T07:18:33+00:00 | 182 | claude-opus-5-5 | 27 | 16030 | 908400 | 78716 | 88545 | 1.1321 | 178 | 3 | 0 | 0 | 0 |

## Pierwszy kawałek
