# Rejestr ograniczeń aplikacji

## D-001 Ograniczenie: lista oczekujących bez informacji o prywatności
- Co odłożone: formularz listy oczekujących zapisuje adresy (zmiana lista-oczekujacych: kontakty Resend w USA i e-mail do właściciela), ale na stronie brak informacji o prywatności i administratorze danych; odwiedzający nie przeczyta, kto przetwarza jego adres i po co, co jest ryzykiem RODO (decyzja człowieka: „tego na razie nie robimy”).
- Kiedy wrócić: gdy właściciel zamówi informację o prywatności i administratorze danych (zwykłą drogą zmiany po przejęciu) albo gdy zapisy z formularza zaczną służyć czemuś więcej niż powiadomieniu o pierwszym wydaniu.

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

## D-008 Ograniczenie: `test:e2e` pada na argumentach Playwright innych niż `--grep`
- Pytanie: czy naprawić teraz to, że `npm run test:e2e` ze ścieżką pliku testów albo z `--project` kończy się kodem 1 przed budową, bo liczenie testów README dokleja te argumenty do `--project readme`?
- Wybór: nie; ograniczenie zostaje. Scenariusz, kryteria i `## Testy w CI` wybierają testy tylko przez `--grep`, który działa, więc to przypadek spoza zwykłej pracy.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/impl-review.md F1, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotyka `scripts/test-e2e.sh` albo wiersz Automated planu, `README.md` lub `## Testy w CI` w `CLAUDE.md` każe uruchomić `npm run test:e2e` ze ścieżką pliku testów albo z `--project`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/impl-review.md` F1
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-009 Ograniczenie: Serwer statyczny bez obsługi błędu strumienia pliku
- Pytanie: czy naprawić teraz to, że `scripts/serwer-statyczny.mjs` kończy się nieobsłużonym błędem, gdy plik z `out/` zniknie między sprawdzeniem a otwarciem?
- Wybór: nie; ograniczenie zostaje. Skrypt buduje stronę przed testami, więc w zwykłym przebiegu `out/` się nie zmienia, a serwer słucha tylko lokalnie.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/impl-review.md F4, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotyka `scripts/serwer-statyczny.mjs` albo `scripts/test-e2e.sh` tak, że budowa albo zapis do `out/` może biec w trakcie testów (np. budowa równoległa, tryb obserwowania).
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/impl-review.md` F4
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-010 Ograniczenie: Krok 16 nie porównuje `package-lock.json`
- Pytanie: czy naprawić teraz to, że test „krok 16” nie wykrywa zmiany wersji zależności strony w `package-lock.json`?
- Wybór: nie; ograniczenie zostaje. T16 obejmuje pliki budowy i `package.json`, a diff tej zmiany w pliku blokady to same dodania pakietów testów; aktualizacja zależności strony jest wyłączona z przejęcia (D-002).
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/impl-review.md F5, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotyka `package-lock.json` poza wpisami `@playwright/test`, `playwright` i `playwright-core` albo uruchamia `npm install` lub `npm update` zależności strony (D-002).
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/impl-review.md` F5
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-011 Ograniczenie: Błąd typów w testach zablokuje publikację strony
- Pytanie: czy naprawić teraz to, że `npm run typecheck` w workflow publikacji sprawdza też testy, więc błąd typów w teście zatrzyma publikację strony?
- Wybór: nie; ograniczenie zostaje. Przy zwykłej pracy `verify` z `typecheck` biegnie przed commitem i przed scaleniem, więc to przypadek z obszaru D-004.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/impl-review.md F6, reguła przypadek szczególny
- Kiedy wrócić: zmiany zaczynają trafiać na `main` poza autopilotem albo zmiana dotyka `tsconfig.json` (`include`) lub `.github/workflows/pages.yml`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/impl-review.md` F6
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-012 Ograniczenie: Brak śladu przy nieudanym teście w przeglądarce
- Pytanie: czy naprawić teraz to, że test, który padnie w kontenerze, nie zostawia śladu (`trace`) do analizy?
- Wybór: nie; ograniczenie zostaje. Brak śladu utrudnia tylko szukanie przyczyny błędu i nie zmienia wyniku testów, które dziś przechodzą.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/testy-zachowania-strony/reviews/impl-review.md F8, reguła przypadek szczególny
- Kiedy wrócić: test w przeglądarce pada w kontenerze z niejasną przyczyną albo zmiana dotyka `use` lub `outputDir` w `playwright.config.ts`.
- Źródło: testy-zachowania-strony — `context/changes/testy-zachowania-strony/reviews/impl-review.md` F8
- Status: obowiązuje
- Zmiana: testy-zachowania-strony

## D-013 Ograniczenie: Dzienny limit e-maili Resend Free
- Pytanie: czy naprawić teraz to, że funkcja zapisu odpowiada niepowodzeniem po wyczerpaniu dziennego limitu 100 e-maili planu Resend Free?
- Wybór: nie; ograniczenie zostaje. Funkcja wywołuje najpierw `POST /contacts`, potem `POST /emails`, a błąd wysyłki e-maila daje kod 502 i komunikat „Your sign-up didn't go through. Please try again.” (L11). Po 100 e-mailach w ciągu dnia (plan Free) 101. zapis dnia dostanie niepowodzenie przy wysyłce e-maila, choć kontakt mógł zostać dodany. Ruch przed premierą jest daleko od 100 zapisów dziennie.
- Dopisek: część o ponownym zapisie tego samego adresu rozwiązała zmiana naprawa-listy-oczekujacych (N3): po odmowie dodania kontaktu funkcja pyta Resend o kontakt z tym adresem i przy istniejącym kontakcie wysyła e-mail i odpowiada sukcesem.
- Kto zdecydował: model (10x-plan)
- Podstawa: context/changes/lista-oczekujacych/plan.md, Decyzje planu (Open Question 3 i 4 z research.md), reguła najgorszy przypadek
- Kiedy wrócić: właściciel zgłosi niepowodzenie przy ponownym zapisie albo zapisów będzie blisko 100 dziennie; zmiana dotyka kolejności wywołań Resend w `worker/index.ts` albo plan Resend się zmienia.
- Źródło: lista-oczekujacych — `context/changes/lista-oczekujacych/plan.md` (Decyzje planu, Phase 4 §3)
- Status: obowiązuje
- Zmiana: lista-oczekujacych

## D-014 Ograniczenie: Brak limitu rozmiaru treści żądania
- Pytanie: czy naprawić teraz to, że funkcja zapisu czyta i parsuje treść żądania dowolnej wielkości (`request.text()`, `JSON.parse`), więc duża treść z podrobionym `Origin` może przekroczyć limit CPU planu Free?
- Wybór: nie; ograniczenie zostaje. Duża treść przerywa tylko żądanie, które ją wysłało, i nie zużywa limitów Resend.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/lista-oczekujacych/reviews/impl-review.md F3, reguła przypadek szczególny
- Kiedy wrócić: logi funkcji w Cloudflare pokażą błędy 1102 (przekroczony limit CPU) albo zmiana dotknie odczytu treści żądania (`request.text()` / `JSON.parse`) w `worker/index.ts`.
- Źródło: lista-oczekujacych — `context/changes/lista-oczekujacych/reviews/impl-review.md` F3
- Status: obowiązuje
- Zmiana: lista-oczekujacych

## D-015 Ograniczenie: „krok 16” trwale wyłącza z ochrony całe pliki formularza
- Pytanie: czy naprawić teraz to, że test „krok 16” pomija w całości `components/interactive.tsx`, `lib/content.ts`, `app/globals.css` i `.github/workflows/pages.yml`, więc zmiana nagłówka, FAQ, demo albo stylów poza formularzem też go przejdzie?
- Wybór: nie; ograniczenie zostaje. Wyjątki na całe pliki są tym, czego wymagają L13 i „Ograniczenia” zmiany lista-oczekujacych, a słabsza ochrona ma znaczenie dopiero przy kolejnej zmianie tych plików.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/lista-oczekujacych/reviews/impl-review.md F6, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotknie `components/interactive.tsx`, `lib/content.ts` albo `app/globals.css` poza sekcją `#waitlist` albo zmieni listę `PLIKI_ZMIAN` w `tests/repo/zakres-przejecia.spec.ts`.
- Źródło: lista-oczekujacych — `context/changes/lista-oczekujacych/reviews/impl-review.md` F6
- Status: obowiązuje
- Zmiana: lista-oczekujacych

## D-016 Ograniczenie: Wyjątek na `GET /contacts` po nieudanym `POST` nieopisany w planie
- Pytanie: czy naprawić teraz to, że plan nie mówi, jaki wpis logu i jaką odpowiedź daje funkcja, gdy `GET /contacts/{email}` po nieudanym `POST /contacts` kończy się wyjątkiem sieci albo treścią, która nie jest JSON?
- Wybór: nie; ograniczenie zostaje. To rzadka awaria Resend lub sieci spoza scenariusza człowieka.
- Kto zdecydował: model (10x-plan-review)
- Podstawa: context/changes/naprawa-listy-oczekujacych/reviews/plan-review.md F4, reguła przypadek szczególny
- Kiedy wrócić: zmiana dotyka sekwencji wywołań Resend w `worker/index.ts` albo w Workers Logs funkcji pojawia się wpis o wyjątku lub treści, która nie jest JSON, przy `GET /contacts`, albo odpowiedź funkcji inna niż 200 i 502.
- Źródło: naprawa-listy-oczekujacych — `context/changes/naprawa-listy-oczekujacych/reviews/plan-review.md` F4
- Status: obowiązuje
- Zmiana: naprawa-listy-oczekujacych

## D-017 Ograniczenie: Zajęty port wychodzi dopiero po prawdziwym wywołaniu Resend
- Pytanie: czy naprawić teraz to, że skrypt `scripts/na-zywo.mjs` wysyła diagnostyczne `POST /contacts` do prawdziwego Resend, zanim sprawdzi, że `PORT` jest wolny?
- Wybór: nie; ograniczenie zostaje. Zajęty `PORT` przy przebiegu autopilota to rzadki przypadek, a jego skutek to jedno dodatkowe wywołanie diagnostyczne adresem właściciela w ramach udzielonej zgody.
- Kto zdecydował: model (10x-impl-review)
- Podstawa: context/changes/naprawa-listy-oczekujacych/reviews/impl-review.md F4, reguła przypadek szczególny
- Kiedy wrócić: log kroku `przygotowanie-wdrozenia` albo `merge` pokazuje `EADDRINUSE` na porcie skryptu `scripts/na-zywo.mjs`, albo zmiana dotyka sposobu, w jaki autopilot przydziela `PORT` sprawdzeniu na żywo.
- Źródło: naprawa-listy-oczekujacych — `context/changes/naprawa-listy-oczekujacych/reviews/impl-review.md` F4
- Status: obowiązuje
- Zmiana: naprawa-listy-oczekujacych
