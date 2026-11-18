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

- `npm run verify` — sprawdzenie typów, budowa strony z adresem atrapy funkcji zapisu (`NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/`), testy bez przeglądarki i skan sekretów programem `gitleaks`. Testy bez przeglądarki to testy funkcji zapisu z `worker/` na atrapie Resend (bez sieci), test zbudowanego `out/` (brak adresu `api.resend.com` i nazwy `RESEND_API_KEY`) i „krok 16” (kod strony i konfiguracja budowy jak w commicie `5e4dcac`, poza plikami formularza wymienionymi w teście z nazwy). Nie potrzebuje Dockera.
- `npm run test:e2e` — buduje stronę tak jak do publikacji, z prefiksem `/www-maestro` (`NEXT_PUBLIC_BASE_PATH=/www-maestro`) i z adresem atrapy funkcji zapisu, który testy przechwytują w przeglądarce, i uruchamia testy kroków 1–14 scenariusza w przeglądarce Chromium, na ekranie telefonu (360 px, projekt `telefon-360`) i komputera (1280 px, projekt `komputer-1280`). Lokalnie przeglądarka działa w obrazie Playwright `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` przez Docker bez roota (skrypt sam uruchamia Dockera, gdy jest wyłączony), w kontenerze bez dostępu do sieci. Na koniec, już bez przeglądarki, test „krok 15” sprawdza to README i uruchamia `npm test`.

Każdy test nazywa się krokiem scenariusza, np. „krok 6 — demo rozmowy: zatwierdzenie i powtórka”. Jeden krok, na obu ekranach, uruchamia:

```sh
npm run test:e2e -- --grep "krok 6\b"
```

`\b` sprawia, że „krok 1” nie wybiera też kroków 10–16. Argumenty, które nie wybierają żadnego testu, kończą polecenie błędem.

## Gdzie wprowadzać zmiany

- `lib/content.ts` — cała treść strony i `PRODUCT_NAME`.
- `app/page.tsx` — kompozycja sekcji.
- `components/interactive.tsx` — interakcje, w tym `WaitlistForm`.
- `lib/waitlist.ts` — adapter, który wysyła zapis do funkcji zapisu.
- `worker/` — funkcja zapisu na listę oczekujących (Cloudflare Workers) i jej konfiguracja `wrangler.toml`.
- `app/globals.css` — style, motywy i reguły responsywne.
- `public/fonts/` — lokalne pliki kroju pisma.

## Lista oczekujących

Strona jest statyczna (`output: 'export'`), więc zapisów nie obsługuje sama. Zapis działa tak:

1. Formularz `WaitlistForm` (`components/interactive.tsx`) sprawdza format adresu. Pusty albo błędny adres daje komunikat błędu bez żadnego żądania.
2. Adapter `lib/waitlist.ts` wysyła poprawny adres jednym żądaniem `POST` do funkcji zapisu w Cloudflare Workers (kod w `worker/index.ts`, konfiguracja w `worker/wrangler.toml`). Adres funkcji strona dostaje przy budowie ze zmiennej `NEXT_PUBLIC_WAITLIST_URL`.
3. Funkcja przyjmuje zapis tylko z adresu strony (nagłówek `Origin`), pomija zgłoszenia z wypełnionym ukrytym polem-pułapką i przyjmuje najwyżej 5 zapisów na minutę z jednego adresu IP.
4. Funkcja dodaje adres do listy kontaktów Resend i wysyła właścicielowi e-mail z tym adresem. Klucz Resend i adres właściciela są sekretami funkcji, a nie częścią strony ani repozytorium.
5. Strona pokazuje „Joining…” na przycisku w czasie wysyłki, a potem komunikat, że adres jest zapisany, albo że zapis nie przeszedł. Wpisany adres zostaje w polu, więc można spróbować ponownie.

Funkcję publikuje job `worker` w workflow `.github/workflows/pages.yml`, przed budową strony, akcją `cloudflare/wrangler-action`. Budowa strony czeka na ten job i dostaje od niego adres funkcji w `NEXT_PUBLIC_WAITLIST_URL`, więc strona nie wyjdzie bez działającej funkcji.

Potrzebne sekrety repozytorium GitHub (tylko nazwy, wartości nigdy nie trafiają do repozytorium):

- `CLOUDFLARE_API_TOKEN` — token API Cloudflare do publikacji funkcji;
- `RESEND_API_KEY` — klucz API Resend, przekazywany do sekretów funkcji;
- `OWNER_EMAIL` — adres e-mail właściciela, na który funkcja wysyła powiadomienia, przekazywany do sekretów funkcji.

Lokalnie (`npm run dev`, `npm run build`) bez zmiennej `NEXT_PUBLIC_WAITLIST_URL` formularz po wysłaniu poprawnego adresu pokazuje komunikat, że zapis nie przeszedł. Testy nie łączą się z Resend ani z Cloudflare: funkcję sprawdzają na atrapie Resend, a formularz na atrapie funkcji.

Strona nie ma informacji o prywatności i administratorze danych (rejestr ograniczeń, D-001).
