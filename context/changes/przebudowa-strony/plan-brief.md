# Przebudowa treści i układu strony Maestro — Plan Brief

> Full plan: `context/changes/przebudowa-strony/plan.md`
> Research: `context/changes/przebudowa-strony/research.md`

## What & Why

Strona zapowiedzi Maestro ma 13 sekcji i za dużo treści, a osoba nietechniczna z pomysłem ma z niej zrozumieć wartość Maestro i zapisać się na listę oczekujących. Właściciel przyjął makietę nowej strony („Akceptuję tak, jak jest”). Plan buduje stronę dokładnie według tej makiety, bez zmiany zapisu na listę.

## Starting Point

Dziś strona ma hero „…Autonomously.”, datę wydania, wizję 2027, demo rozmowy, przykład w 8 krokach, roadmapę, trzy kolumny porównania i przełącznik jasnego i ciemnego motywu, w zieleni i DM Sans. Zostają formularz zapisu (`WaitlistForm`, `lib/waitlist.ts`) z komunikatami, FAQ na `<details>`, znak marki i sposób podawania fontów z adresu strony.

## Desired End State

Odwiedzający widzi nagłówek z logo i „Join the first release”, hero na cały ekran „You bring the idea. Maestro builds it.”, pięć sekcji ze spisem po lewej (na komputerze), porównanie z kreatorami aplikacji z promptu, 8 pytań FAQ i koniec strony z jedynym formularzem. Strona jest tylko jasna, w bieli z błękitnoszarymi akcentami, z fontami Host Grotesk i JetBrains Mono z adresu strony. Zapis działa jak dziś.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Kontrast szarego | `--quiet` `#646d76`, placeholder `#4d5964` | Kolory makiety mają 2.56:1 i 2.90:1, a intencja wymaga 4.5:1. | Research / Plan |
| Kolumna Maestro | Bez tła | Intencja wprost wyklucza podświetlanie kolumny Maestro. | Research / Plan |
| Wiersze 1 i 6 kolumny kreatorów | „Anyone who wants to build an app by chatting with AI”; „Optional monitoring and AI fixes on some plans, which you turn on and oversee” | Research uznał zdania z makiety za nieprawdziwe dla typowych produktów (P12). | Research |
| `#waitlist` | `<footer>` jak w makiecie | Wierność makiecie; krok 1 i tak jest przepisywany. | Research / Plan |
| Ikona karty | Czarne tło, biały znak | Zielone kolory znikają, makieta ikony nie pokazuje. | Plan |
| Link pominięcia | Zostaje, niewidoczny do fokusu | Kotwica `#main` ma działać bez zmiany wyglądu. | Research / Plan |
| Tailwind | Bez `@import "tailwindcss"` | Dawał tylko preflight, który zmienia wygląd wobec makiety. | Plan |
| Linter (D-003) | Nie teraz | Krok 16 zamraża `package.json`, a intencja ma „Instalacja: nic”. | Plan |
| Spis | `ChapterIndex` w `components/interactive.tsx` z `aria-current` | Cała interaktywność jest w tym pliku, a `aria-current` daje stan testom i czytnikom. | Plan |
| Krok 16 | Druga lista `PLIKI_PRZEBUDOWY`, nazwa testu bez zmian | Nazwa testu jest w `CLAUDE.md` i kryteriach. | Research / Plan |
| Opisy repo | Aktualizacja README, `CLAUDE.md` (`## Verify`), `DESIGN.md`, `VERIFICATION.md`, `test-plan.md` | Dziś opisują zielony i ciemny motyw oraz demo. | Research / Plan |

## Scope

**In scope:**
- Treść (`lib/content.ts`), układ (`app/page.tsx`, `app/layout.tsx`), interakcje (`components/interactive.tsx`, `components/brand.tsx`), style (`app/globals.css`).
- Fonty, licencje OFL i obraz hero z makiety w `public/`, nowa ikona, usunięcie DM Sans.
- Testy kroków 1–14 i lista kroku 16; typ `.webp` w serwerze testów.
- Opisy repo.

**Out of scope:**
- `worker/`, `lib/waitlist.ts`, komunikaty formularza, `pages.yml`, `package.json` i konfiguracja budowy.
- Ciemny motyw, informacja o prywatności (D-001), tłumaczenie, zmiana hasła poza stroną.
- `.impeccable/design.json`, `stack-assessment.md`, PRD, roadmapa.

## Architecture / Approach

Statyczny eksport Next bez zmian. `app/page.tsx` (komponent serwerowy) składa stronę z `content`; jedyne komponenty klienckie to spis (`ChapterIndex`: przewijanie, 35% wysokości okna, `requestAnimationFrame`) i formularz. CSS makiety przechodzi do `app/globals.css`, a fonty i obraz idą przez `url("../public/…")`, więc webpack podaje je pod `/www-maestro/_next/static/media/…`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Zasoby z makiety i granice kroku 16 | Fonty, licencje, obraz (sumy jak w makiecie), `.webp` w serwerze, lista kroku 16 | Zła kolejność danych base64 przy wyjmowaniu (sumy to wychwycą) |
| 2. Nowa strona i testy kroków 1–14 | Cała nowa strona i testy P1–P11 | Duży commit; testy zależne od hydracji i przewijania spisu |
| 3. Opisy w repo i pełne sprawdzenie | README, `CLAUDE.md`, `DESIGN.md`, `VERIFICATION.md`, plan testów; pełne polecenie z P13 | Krok 15 uruchamia całe `npm test` (długi przebieg) |

**Prerequisites:** Docker bez roota z obrazem Playwright do `npm run test:e2e`; makieta z sumą z `akceptacja.md`.
**Estimated effort:** ~1 sesja implementacji w 3 fazach, z czego faza 2 to większość pracy.

## Open Risks & Assumptions

- Sześć odstępstw od makiety (kolory, tło kolumny, dwa zdania porównania, formularz, link pominięcia, pliki zamiast `data:`) jest w planie dla weryfikatora P14; człowiek zobaczy je dopiero przy publikacji.
- Wiersz 6 po poprawce słabiej wyróżnia Maestro, bo Maestro ma tam „Coming soon”.
- Zdania o kreatorach opierają się na dokumentacji producentów z 2026-11-19, bez niezależnych recenzji.
- Scalenie od razu publikuje nową stronę.

## Success Criteria (Summary)

- Osoba na telefonie i komputerze widzi stronę z makiety, bez przewijania w bok i z kontrastem co najmniej 4.5:1.
- Spis na komputerze pokazuje bieżącą sekcję i przenosi do klikniętej.
- Zapis na końcu strony działa jak dziś, a strona nie wysyła niczego poza adres strony i funkcję zapisu.
