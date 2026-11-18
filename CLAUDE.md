Dopóki context/foundation/start.md nie ma sekcji „## Lista końcowa”, przy prośbie o budowę albo zmianę sesja czyta /home/fabryka/fabryka/docs/start-projektu.md i działa według niego.
Gdy człowiek w rozmowie mówi „zrób zmianę”, „zrób <ID kawałka>”, „zrób kolejny kawałek”, „kontynuuj <change-id>” albo „co się dzieje?”, albo gdy kończy się wywołanie autopilota uruchomione w tle, sesja czyta /home/fabryka/fabryka/docs/sesja-glowna.md i działa według niego. Krok claude -p autopilota (ma w środowisku zmienną AUTOPILOT_KROK) tego nie robi i nie uruchamia autopilota.

## Verify

Uruchom `npm ci && npm run verify` przed każdym commitem. Polecenie sprawdza typy, uruchamia bez przeglądarki test „krok 16” (kod strony i konfiguracja budowy jak w `5e4dcac`) i skanuje historię git programem `gitleaks`; nie potrzebuje Dockera ani innych usług lokalnych i kończy się kodem różnym od 0, gdy cokolwiek nie przejdzie.

Last passing run (2026-11-18):

```
  ✓  1 [repo] › tests/repo/zakres-przejecia.spec.ts:32:1 › krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac (20ms)
10:27AM INF no leaks found
```

## Wdrożenie

Pisze sesja główna przed autopilotem, razem ze zgodą człowieka w ## Zgody zmiany. Autopilot czyta te pola i uruchamia ich polecenia (kroki przygotowanie-wdrozenia i wynik-wdrozenia). Zmiana tej sekcji wymaga nowej zgody człowieka; krok agenta jej nie zmienia.

- workflow: pages.yml
- krok wdrożenia: Deploy to GitHub Pages
- narzędzia z sekretami:
- cofnięcie: brak
- adres: https://lukeblonski.github.io/www-maestro/
