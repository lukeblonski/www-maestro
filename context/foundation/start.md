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

## Decyzje bez podstawy

## Wymagania komputera

## Sprawdzalność scenariusza

## Sprawdzenia przed posiedzeniem

## Do decyzji na posiedzeniu

## Wdrożenie projektu

## Akceptacja

## Zatrzymania autopilota

## Koszty kroków

| Krok | Sesja | Początek | Czas (s) | Model | Wejście | Wyjście | Odczyt cache | Zapis cache | Największy kontekst | Koszt USD | Czas modelu (s) | Czas narzędzi (s) | Testy | Pełne testy | Czas testów (s) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| prd | b3f512e1-73d2-4559-b99c-97672cf60b3e | 2026-11-18T07:15:13+00:00 | 184 | claude-opus-5-5 | 19 | 18810 | 541588 | 68297 | 76326 | 1.0310 | 182 | 0 | 0 | 0 | 0 |

## Pierwszy kawałek
