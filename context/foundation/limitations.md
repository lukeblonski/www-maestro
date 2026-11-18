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

## D-005 Ograniczenie: Zielone `typecheck` w świeżym worktree zależy od `skipLibCheck`
- Pytanie: czy naprawić teraz to, że `tsc --noEmit` w świeżym worktree przechodzi tylko dzięki `skipLibCheck: true`, bo `next-env.d.ts` importuje nieistniejące jeszcze pliki z `.next/types/`?
- Wybór: nie; ograniczenie zostaje. Dziś `typecheck` przechodzi, a T16 zamraża `tsconfig.json`, więc błąd wyszedłby tylko w przypadku szczególnym.
- Kto zdecydował: model (10x-plan-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/plan-review.md F4, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotyka `tsconfig.json` (zwłaszcza `skipLibCheck`) albo `next-env.d.ts`, albo testy dostają importy plików z `.next/types/`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/plan-review.md` F4
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-006 Ograniczenie: Strażnik „zero testów” liczy projekt `repo`, którego `test:e2e` nie uruchamia
- Pytanie: czy naprawić teraz to, że `npm run test:e2e -- --grep "krok 16\b"` kończy się kodem 0, choć nie uruchamia żadnego testu?
- Wybór: nie; ograniczenie zostaje. Krok 16 sprawdza `npm run verify`, więc przy zwykłej pracy nikt nie uruchamia `test:e2e` dla testu projektu `repo`.
- Kto zdecydował: model (10x-plan-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/plan-review.md F5, reguła przypadek szczególny
- Kiedy wrócić: zmiana dodaje test w `tests/repo/` albo kryterium ze Sprawdzeniem `npm run test:e2e -- --grep` wybiera test projektu `repo`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/plan-review.md` F5
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-007 Ograniczenie: Zagnieżdżone przebiegi Playwright czyszczą wspólny `outputDir`
- Pytanie: czy naprawić teraz to, że przebiegi uruchomione wewnątrz testu „krok 15” usuwają wspólny katalog wyników trwającego przebiegu zewnętrznego?
- Wybór: nie; ograniczenie zostaje. Projekt `readme` nie zapisuje artefaktów, więc dziś nic się nie psuje.
- Kto zdecydował: model (10x-plan-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/plan-review.md F6, reguła przypadek szczególny
- Kiedy wrócić: test „krok 15” albo projekt `readme` dostaje artefakty (`screenshot`, `trace`, `video`, pliki wyników) albo zmiana dotyka `outputDir` w `playwright.config.ts` lub `playwright.bez-przegladarki.config.ts`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/plan-review.md` F6
- Status: obowiązuje
- Zmiana: testy-zachowania-strony
