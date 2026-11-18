# Maestro — landing page

Jednostronicowa strona w Next.js i Tailwind CSS. Angielskie treści i robocza nazwa produktu są w `lib/content.ts`. Projekt korzysta z lokalnych fontów i nie ma integracji analitycznych. Konfiguracja eksportuje stronę statycznie do `out/`.

## Uruchomienie

W katalogu projektu, z zainstalowanym Node.js i npm:

```sh
npm ci
npm run dev
```

Otwórz adres wypisany przez serwer — zwykle `http://127.0.0.1:3000`.

Serwer słucha tylko na `127.0.0.1`, więc strona nie jest widoczna z innych urządzeń w sieci. Port bierze się ze zmiennej `PORT` (domyślnie 3000), np. `PORT=3001 npm run dev`; gdy port jest zajęty, Next wybiera następny wolny i wypisuje go w adresie.

```sh
npm run typecheck
npm run build
```

Wynik produkcyjny znajduje się w `out/`. Można go udostępnić dowolnym serwerem plików statycznych. Przykładowy lokalny podgląd gotowego wyniku:

```sh
python3 -m http.server 3000 --directory out
```

Nie używaj `next start` do tego eksportu statycznego.

## Testy

Wszystkie testy jednym poleceniem, w katalogu projektu po `npm ci`:

```sh
npm test
```

`npm test` uruchamia po kolei dwa polecenia i kończy się kodem różnym od 0, gdy cokolwiek nie przejdzie:

- `npm run verify` — sprawdzenie typów, test bez przeglądarki „krok 16” (kod strony i konfiguracja budowy jak w commicie `5e4dcac`) i skan sekretów programem `gitleaks`. Nie potrzebuje Dockera.
- `npm run test:e2e` — buduje stronę tak jak do publikacji, z prefiksem `/www-maestro` (`NEXT_PUBLIC_BASE_PATH=/www-maestro`), i uruchamia testy kroków 1–14 scenariusza w przeglądarce Chromium, na ekranie telefonu (360 px, projekt `telefon-360`) i komputera (1280 px, projekt `komputer-1280`). Lokalnie przeglądarka działa w obrazie Playwright `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` przez Docker bez roota (skrypt sam uruchamia Dockera, gdy jest wyłączony), w kontenerze bez dostępu do sieci. Na koniec, już bez przeglądarki, test „krok 15” sprawdza to README i uruchamia `npm test`.

Każdy test nazywa się krokiem scenariusza, np. „krok 6 — demo rozmowy: zatwierdzenie i powtórka”. Jeden krok, na obu ekranach, uruchamia:

```sh
npm run test:e2e -- --grep "krok 6\b"
```

`\b` sprawia, że „krok 1” nie wybiera też kroków 10–16. Argumenty, które nie wybierają żadnego testu, kończą polecenie błędem.

## Gdzie wprowadzać zmiany

- `lib/content.ts` — cała treść strony i `PRODUCT_NAME`.
- `app/page.tsx` — kompozycja sekcji.
- `components/interactive.tsx` — interakcje, w tym `WaitlistForm`.
- `app/globals.css` — style, motywy i reguły responsywne.
- `public/fonts/` — lokalne pliki kroju pisma.

## Podłączenie listy oczekujących

Obecna wersja to wyłącznie demonstracja. Sprawdza format e-maila, lecz nie wysyła żądania i nie przechowuje danych. Wyświetlane potwierdzenie mówi o zakończeniu podglądu, nie o zapisaniu na listę.

Punktem podłączenia obsługi zapisów jest adapter `lib/waitlist.ts`, wywoływany przez `WaitlistForm` w `components/interactive.tsx`. Do uruchomienia rzeczywistych zapisów:

1. Podłącz adapter do własnego endpointu i zwracaj potwierdzenie dopiero po faktycznym przyjęciu zapisu.
2. Po stronie endpointu dodaj walidację, obsługę powtórzeń i błędów oraz ochronę przed automatycznymi zgłoszeniami. Klucze i sekrety pozostają po stronie serwera.
3. Uzupełnij informację o prywatności i administratorze danych, zanim formularz zacznie zbierać adresy.
4. Dostosuj komunikaty `waitlist` w `lib/content.ts` do rzeczywistego działania i usuń oba widoczne TODO po wykonaniu wskazanych prac.
5. Sprawdź poprawny zapis, błędny adres, powtórzony zapis i błąd połączenia. Zachowaj komunikaty dostępne dla czytników ekranu.

Ze względu na `output: 'export'` endpoint musi działać osobno albo konfiguracja wdrożenia musi zostać rozszerzona o zaplecze. Bezpośrednio w tym statycznym eksporcie nie działa serwerowa trasa obsługująca formularz.
