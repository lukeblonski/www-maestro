# Rejestr ograniczeń aplikacji

## D-001 Ograniczenie: lista oczekujących tylko jako podgląd
- Co odłożone: formularz listy oczekujących niczego nie wysyła ani nie zapisuje, a na stronie brak informacji o prywatności i administratorze danych; odwiedzający, który zostawi e-mail, nie trafia na żadną listę i właściciel nie dowie się o zainteresowaniu.
- Kiedy wrócić: gdy właściciel zamówi podłączenie prawdziwej listy oczekujących (zwykłą drogą zmiany po przejęciu), najpóźniej przed ogłoszeniem pierwszego wydania 30 listopada 2026, jeśli strona ma wtedy zbierać zapisy.

## D-002 Ograniczenie: zależności bez przypiętych wersji
- Co odłożone: plik zależności projektu wskazuje wersje „najnowsze”, a stałe wersje są tylko w pliku zablokowanych wersji; instalacja bez tego pliku albo jego odświeżenie może po cichu wciągnąć nową główną wersję frameworka i zepsuć budowę strony.
- Kiedy wrócić: przy pierwszej zmianie, która aktualizuje zależności albo odświeża plik zablokowanych wersji.

## D-003 Ograniczenie: brak automatycznego sprawdzania stylu kodu
- Co odłożone: projekt nie ma lintera, formatowania ani wspólnych ustawień edytora (brak eslint.config.*, .prettierrc*, .editorconfig); styl i część błędów w zmianach strony (np. nieużywany kod, błędne zależności hooków React) nie są sprawdzane automatycznie, a polecenie sprawdzające uruchamia tylko testy.
- Kiedy wrócić: po kawałku testów, gdy właściciel zamówi porządki w kodzie albo pierwsza zmiana interakcji w components/interactive.tsx wymaga sprawdzenia hooków; wtedy linter Next.js z dokładnymi wersjami i dopisanie go do polecenia z ## Verify w CLAUDE.md.

## D-004 Ograniczenie: publikacja bez testów w CI
- Co odłożone: workflow publikacji (.github/workflows/pages.yml) sprawdza tylko typy i budowę, bez testów, lintera i skanu zależności; zmiana wysłana na main z pominięciem autopilota (np. ręcznie przez właściciela) opublikuje się od razu, nawet jeśli psuje demo rozmowy albo formularz. Przejęcie nie zmienia workflow (PRD: Non-Goals, krok 16 scenariusza), a testy przed scaleniem uruchamia lokalnie autopilot.
- Kiedy wrócić: gdy właściciel zamówi zmianę publikacji albo zmiany na main zaczną trafiać poza autopilotem; wtedy etap testów w przeglądarce i npm audit przed jobem deploy.
