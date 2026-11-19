<!-- REVIEW-CLOSURE -->
# Closure check: context/changes/przebudowa-strony/reviews/plan-review.md

- **Report**: context/changes/przebudowa-strony/reviews/plan-review.md
- **Fix commit**: acd59f5620e39cb56ee61d9f1e20cc3f5b767109
- **Date**: 2026-11-19
- **Verdict**: SOUND

## Uwagi

- F1 — Krok 12 sprawdza `transition-duration` na elemencie, który nie ma przejścia: załatwione — commit acd59f5 zmienia kontrakt kroku 12: mierzy `transition-duration` `0s` na `::after` (`getComputedStyle(a, "::after")`) i na wewnętrznym `span` każdej pozycji spisu, tam gdzie makieta ma przejścia (`makieta.html:68-69`).
- F2 — „Ostatni blok `body`” w Decyzjach planu nie da się spełnić w Next: załatwione — commit acd59f5 zastępuje w tabeli decyzji „ostatni blok `body`” brzmieniem „ostatni element `body` poza `script` i `next-route-announcer`” i dopisuje to samo do kontraktu kroku 1, więc tabela i kontrakt są zgodne.
- F3 — Kontrakt `ChapterIndex` nie mówi o wyliczeniu pozycji przy montowaniu: załatwione — commit acd59f5 dopisuje do kontraktu `ChapterIndex` wyliczenie bieżącej pozycji raz przy montowaniu (jak `markChapter()` w `makieta.html:331`).

## Polecenia

- `Progress↔Phase scan` → exit 0
- `python3 /home/fabryka/.local/state/fabryka/skille-krokow/aa56bd33811f5cb2/.claude/skills/10x-impl-review/scripts/validate_change.py przebudowa-strony --rules 4` → exit 0

## Kryteria

- brak
