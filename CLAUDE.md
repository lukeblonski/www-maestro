Dopóki context/foundation/start.md nie ma sekcji „## Lista końcowa”, przy prośbie o budowę albo zmianę sesja czyta /home/fabryka/fabryka/docs/start-projektu.md i działa według niego.
Gdy człowiek w rozmowie mówi „zrób zmianę”, „zrób <ID kawałka>”, „zrób kolejny kawałek”, „kontynuuj <change-id>” albo „co się dzieje?”, albo gdy kończy się wywołanie autopilota uruchomione w tle, sesja czyta /home/fabryka/fabryka/docs/sesja-glowna.md i działa według niego. Krok claude -p autopilota (ma w środowisku zmienną AUTOPILOT_KROK) tego nie robi i nie uruchamia autopilota.

## Verify

`echo "Projekt nie ma jeszcze testów; dodaje je pierwszy kawałek roadmapy." >&2; exit 1`

## Wdrożenie

Pisze sesja główna przed autopilotem, razem ze zgodą człowieka w ## Zgody zmiany. Autopilot czyta te pola i uruchamia ich polecenia (kroki przygotowanie-wdrozenia i wynik-wdrozenia). Zmiana tej sekcji wymaga nowej zgody człowieka; krok agenta jej nie zmienia.

- workflow: pages.yml
- krok wdrożenia: Deploy to GitHub Pages
- narzędzia z sekretami:
- cofnięcie: brak
- adres: https://lukeblonski.github.io/www-maestro/
