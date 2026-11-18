# Rejestr ograniczeń aplikacji

## D-001 Ograniczenie: lista oczekujących tylko jako podgląd
- Co odłożone: formularz listy oczekujących niczego nie wysyła ani nie zapisuje, a na stronie brak informacji o prywatności i administratorze danych; odwiedzający, który zostawi e-mail, nie trafia na żadną listę i właściciel nie dowie się o zainteresowaniu.
- Kiedy wrócić: gdy właściciel zamówi podłączenie prawdziwej listy oczekujących (zwykłą drogą zmiany po przejęciu), najpóźniej przed ogłoszeniem pierwszego wydania 30 listopada 2026, jeśli strona ma wtedy zbierać zapisy.

## D-002 Ograniczenie: zależności bez przypiętych wersji
- Co odłożone: plik zależności projektu wskazuje wersje „najnowsze”, a stałe wersje są tylko w pliku zablokowanych wersji; instalacja bez tego pliku albo jego odświeżenie może po cichu wciągnąć nową główną wersję frameworka i zepsuć budowę strony.
- Kiedy wrócić: przy pierwszej zmianie, która aktualizuje zależności albo odświeża plik zablokowanych wersji.
