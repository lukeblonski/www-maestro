#!/usr/bin/env bash
# Testy kroków 1–14 w przeglądarce, a potem test „krok 15” na komputerze:
#   npm run test:e2e [-- <argumenty Playwright, np. --grep "krok 6\b">]
# Strona jest budowana na komputerze z NEXT_PUBLIC_BASE_PATH=/www-maestro. Lokalnie testy
# przeglądarki idą w obrazie Dockera Playwright bez sieci (komputer fabryki nie ma bibliotek
# systemowych przeglądarki), w CI (zmienna CI) wprost, po instalacji Chromium.
set -euo pipefail
shopt -s inherit_errexit

cd "$(dirname "$0")/.."

KONFIG_PRZEGLADARKI="playwright.config.ts"
KONFIG_BEZ_PRZEGLADARKI="playwright.bez-przegladarki.config.ts"

# Liczba testów, które wybierają podane argumenty (z `--list`, bez uruchamiania serwera).
policz() {
  local wynik
  if ! wynik=$(npx playwright test "$@" --list --pass-with-no-tests 2>&1); then
    printf '%s\n' "$wynik" >&2
    return 1
  fi
  printf '%s\n' "$wynik" | sed -n 's/^Total: \([0-9][0-9]*\) tests\{0,1\} in .*/\1/p' | tail -n 1
}

testy_przegladarki=$(policz -c "$KONFIG_PRZEGLADARKI" "$@")
testy_readme=$(policz -c "$KONFIG_BEZ_PRZEGLADARKI" --project readme "$@")
testy_przegladarki=${testy_przegladarki:-0}
testy_readme=${testy_readme:-0}

if [ "$testy_przegladarki" -eq 0 ] && [ "$testy_readme" -eq 0 ]; then
  echo "Podane argumenty nie wybierają żadnego testu ($*). Sprawdź numer kroku w --grep." >&2
  exit 1
fi

if [ "$testy_przegladarki" -gt 0 ]; then
  echo "Budowa strony z prefiksem /www-maestro…"
  # Adres funkcji zapisu to atrapa: ten sam adres przechwytują testy (ADRES_FUNKCJI w tests/e2e/pomoc.ts).
  NEXT_PUBLIC_BASE_PATH=/www-maestro NEXT_PUBLIC_WAITLIST_URL=https://zapis.atrapa.invalid/ NEXT_TELEMETRY_DISABLED=1 npm run build

  if [ -n "${CI:-}" ]; then
    npx playwright install --with-deps chromium
    npx playwright test -c "$KONFIG_PRZEGLADARKI" --pass-with-no-tests "$@"
  else
    wersja=$(node -p "require('@playwright/test/package.json').version")
    obraz="mcr.microsoft.com/playwright:v${wersja}-noble"
    kontener="$(basename "$PWD")-e2e"

    if ! command -v docker >/dev/null 2>&1; then
      echo "Brak programu docker. Testy w przeglądarce lokalnie wymagają Dockera bez roota i obrazu $obraz." >&2
      exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
      echo "Docker jest wyłączony — uruchamiam go (systemctl --user start docker)."
      systemctl --user start docker 2>/dev/null || true
      for _ in $(seq 1 30); do
        docker info >/dev/null 2>&1 && break
        sleep 1
      done
      if ! docker info >/dev/null 2>&1; then
        echo "Docker nie wystartował w 30 s. Sprawdź: systemctl --user status docker" >&2
        exit 1
      fi
    fi

    stan=$(docker inspect -f '{{.State.Status}}' "$kontener" 2>/dev/null || true)
    if [ "$stan" = "running" ]; then
      echo "Kontener $kontener już działa (inny przebieg testów). Poczekaj na jego koniec albo zatrzymaj go: docker rm -f $kontener" >&2
      exit 1
    elif [ -n "$stan" ]; then
      docker rm -f "$kontener" >/dev/null
    fi

    docker run --rm --name "$kontener" --network none --ipc=host \
      -v "$PWD":/work -w /work \
      "$obraz" \
      npx playwright test -c "$KONFIG_PRZEGLADARKI" --pass-with-no-tests "$@"
  fi
fi

if [ "$testy_readme" -gt 0 ]; then
  npx playwright test -c "$KONFIG_BEZ_PRZEGLADARKI" --project readme --pass-with-no-tests "$@"
fi
