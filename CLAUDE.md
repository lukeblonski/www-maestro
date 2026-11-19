Dopóki context/foundation/start.md nie ma sekcji „## Lista końcowa”, przy prośbie o budowę albo zmianę sesja czyta /home/fabryka/fabryka/docs/start-projektu.md i działa według niego.
Gdy człowiek w rozmowie mówi „zrób zmianę”, „zrób <ID kawałka>”, „zrób kolejny kawałek”, „kontynuuj <change-id>” albo „co się dzieje?”, albo gdy kończy się wywołanie autopilota uruchomione w tle, sesja czyta /home/fabryka/fabryka/docs/sesja-glowna.md i działa według niego. Krok claude -p autopilota (ma w środowisku zmienną AUTOPILOT_KROK) tego nie robi i nie uruchamia autopilota.

## Verify

Uruchom `npm ci && npm run verify` przed każdym commitem. Polecenie sprawdza typy, buduje stronę z `NEXT_PUBLIC_BASE_PATH=/www-maestro` i adresem atrapy funkcji zapisu `NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/`, uruchamia bez przeglądarki testy projektu `repo` i skanuje programem `gitleaks` historię git oraz pliki przygotowane do commita. Testy `repo` to: testy funkcji zapisu z `worker/` na atrapie Resend, bez sieci („funkcja zapisu — …”), testy skryptu ścieżki na żywo `scripts/na-zywo.mjs` na atrapie Resend (`tests/repo/atrapa-resend.mjs`), bez sieci („skrypt na żywo — …”), test zbudowanego `out/` bez adresu `api.resend.com` i nazwy `RESEND_API_KEY`, z adresem atrapy („zbudowana strona — …”), i „krok 16” (kod strony i konfiguracja budowy jak w `5e4dcac`, poza plikami zmian lista-oczekujacych i przebudowa-strony wymienionymi w teście z nazwy). Polecenie nie potrzebuje Dockera ani innych usług lokalnych i kończy się kodem różnym od 0, gdy cokolwiek nie przejdzie.

Last passing run (2026-11-19):

```
  ✓  19 [repo] › tests/repo/na-zywo.spec.ts:218:1 › skrypt na żywo — brak linii klucza Resend w ## Dostępy daje nie przeszło (50ms)
  ✓  20 [repo] › tests/repo/zakres-przejecia.spec.ts:53:1 › krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac (12ms)
  ✓  21 [repo] › tests/repo/zbudowana-strona.spec.ts:20:1 › zbudowana strona — bez adresu Resend i nazwy klucza (4ms)
  21 passed (1.1s)
1:07AM INF no leaks found
```

## Testy w CI

`npm run test:e2e`

Testy kroków 1–14 scenariusza z `tests/e2e/` w Chromium, na stronie zbudowanej z `NEXT_PUBLIC_BASE_PATH=/www-maestro` i adresem atrapy funkcji zapisu `NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/` (testy przechwytują go przez `page.route`, `ADRES_FUNKCJI` w `tests/e2e/pomoc.ts`) i podanej pod `/www-maestro/`, w projektach `telefon-360` (360 px) i `komputer-1280` (1280 px). Lokalnie biegną w obrazie `mcr.microsoft.com/playwright:v<wersja @playwright/test>-noble` przez Docker bez roota (skrypt sam uruchamia Dockera, gdy jest wyłączony), w kontenerze `<folder repo>-e2e` z `--network none`; w CI (zmienna `CI`) wprost, po `npx playwright install --with-deps chromium`. Potem na komputerze biegnie test „krok 15” (README i `npm test` w całości). Jeden krok wybiera `npm run test:e2e -- --grep "krok 6\b"`. Polecenie z `## Verify` tych testów nie uruchamia.

## Uruchomienie lokalne

`npm run dev`

Serwer deweloperski Next słucha tylko na `127.0.0.1`, na porcie ze zmiennej `PORT` (domyślnie 3000), np. `PORT=3001 npm run dev`. `next dev` przepisuje `next-env.d.ts`, więc po zatrzymaniu serwera przywróć plik: `git checkout -- next-env.d.ts`.

## Sprawdzenie na żywo

- zapis-na-liste: `node scripts/na-zywo.mjs`

Skrypt wysyła do Resend jedno żądanie diagnostyczne bez nagłówka `User-Agent` (jak funkcja w Workers przed poprawką), uruchamia funkcję zapisu z `worker/index.ts` na `127.0.0.1:$PORT` z kluczem Resend i adresem właściciela z plików z `## Dostępy`, zapisuje się adresem właściciela, sprawdza w Resend kontakt i stan e-maila i zapisuje wynik w pliku `$NA_ZYWO_WYNIK`; uruchamia go tylko skrypt autopilota, nigdy kroki agenta ani testy.

## Dostępy

Ścieżki do plików z sekretami, poza repo. Kroki i sesja nie czytają tych plików i nie wypisują ich treści. Czyta je tylko polecenie z `## Uruchomienie lokalne`, polecenie ścieżki z `## Sprawdzenie na żywo`, które uruchamia tylko skrypt autopilota, i krok autopilota `przygotowanie-wdrozenia`, który podaje wartość na wejście polecenia z `## Wdrożenie` i jej nie wypisuje. Testy używają atrapy usługi.

- klucz API Resend: /home/fabryka/.secrets/www-maestro/resend-api-key
- token API Cloudflare: /home/fabryka/.secrets/www-maestro/cloudflare-api-token
- adres e-mail właściciela: /home/fabryka/.secrets/www-maestro/owner-email

## Wdrożenie

Pisze sesja główna przed autopilotem, razem ze zgodą człowieka w ## Zgody zmiany. Autopilot czyta te pola i uruchamia ich polecenia (kroki przygotowanie-wdrozenia i wynik-wdrozenia). Zmiana tej sekcji wymaga nowej zgody człowieka; krok agenta jej nie zmienia.

- workflow: pages.yml
- krok wdrożenia: Deploy to GitHub Pages
- narzędzia z sekretami: cloudflare/wrangler-action
- sekret: `gh secret set CLOUDFLARE_API_TOKEN` < token API Cloudflare
- sekret: `gh secret set RESEND_API_KEY` < klucz API Resend
- sekret: `gh secret set OWNER_EMAIL` < adres e-mail właściciela
- cofnięcie: brak
- adres: https://lukeblonski.github.io/www-maestro/
