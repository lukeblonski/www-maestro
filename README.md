# Maestro — landing page

Jednostronicowa strona w Next.js i Tailwind CSS. Angielskie treści i robocza nazwa produktu są w `lib/content.ts`. Projekt korzysta z lokalnych fontów i nie ma integracji analitycznych. Konfiguracja eksportuje stronę statycznie do `out/`.

## Uruchomienie

W katalogu projektu, z zainstalowanym Node.js i npm:

```sh
npm ci
npm run dev
```

Otwórz adres wypisany przez serwer — zwykle `http://127.0.0.1:3000`.

```sh
npm run typecheck
npm run build
```

Wynik produkcyjny znajduje się w `out/`. Można go udostępnić dowolnym serwerem plików statycznych. Przykładowy lokalny podgląd gotowego wyniku:

```sh
python3 -m http.server 3000 --directory out
```

Nie używaj `next start` do tego eksportu statycznego.

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
