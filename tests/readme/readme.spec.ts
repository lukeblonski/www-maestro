import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

// Krok 15 scenariusza PRD, bez przeglądarki: README ma polecenie uruchomienia strony i jedno
// polecenie wszystkich testów, a to polecenie naprawdę przechodzi. Biegnie w `npm run test:e2e`
// po testach w kontenerze; polecenie z README dostaje MAESTRO_POMIN_KROK_15=1, które pomija
// w nim sam ten test (bez pętli).

const KORZEN = resolve(__dirname, "..", "..");

function czytaj(plik: string): string {
  return readFileSync(resolve(KORZEN, plik), "utf8");
}

// Linie sekcji `## <tytuł>` aż do następnego nagłówka `## `; brak sekcji to błąd testu.
function sekcja(tekst: string, tytul: string, plik: string): string {
  const linie = tekst.split("\n");
  const poczatek = linie.findIndex((linia) => linia.trim() === `## ${tytul}`);
  expect(poczatek, `${plik} nie ma sekcji „## ${tytul}”`).toBeGreaterThanOrEqual(0);
  const koniec = linie.findIndex((linia, i) => i > poczatek && linia.startsWith("## "));
  return linie.slice(poczatek + 1, koniec === -1 ? undefined : koniec).join("\n");
}

function uruchom(polecenie: string): Promise<number | null> {
  return new Promise((gotowe, blad) => {
    const dziecko = spawn("sh", ["-c", polecenie], {
      cwd: KORZEN,
      env: { ...process.env, MAESTRO_POMIN_KROK_15: "1" },
      stdio: "inherit",
    });
    dziecko.on("error", blad);
    dziecko.on("close", (kod) => gotowe(kod));
  });
}

test("krok 15 — README ma polecenie uruchomienia i jedno polecenie wszystkich testów, które przechodzi", async () => {
  test.skip(process.env.MAESTRO_POMIN_KROK_15 === "1", "uruchomione przez polecenie testów z README");
  test.setTimeout(20 * 60 * 1000);

  const readme = czytaj("README.md");

  const uruchomienie = /`([^`\n]+)`/.exec(sekcja(czytaj("CLAUDE.md"), "Uruchomienie lokalne", "CLAUDE.md"));
  expect(uruchomienie, "„## Uruchomienie lokalne” w CLAUDE.md nie ma polecenia w odwrotnych apostrofach").not.toBeNull();
  const polecenieUruchomienia = uruchomienie![1].trim();
  expect(readme, `README nie zawiera polecenia uruchomienia „${polecenieUruchomienia}”`).toContain(
    polecenieUruchomienia,
  );

  const blok = /```[^\n]*\n([^\n]*)/.exec(sekcja(readme, "Testy", "README.md"));
  expect(blok, "„## Testy” w README nie ma bloku kodu").not.toBeNull();
  const polecenieTestow = blok![1].trim();
  expect(polecenieTestow, "pierwsza linia bloku kodu w „## Testy” README jest pusta").not.toBe("");

  const kod = await uruchom(polecenieTestow);
  expect(kod, `polecenie testów z README „${polecenieTestow}” zakończyło się kodem ${kod}`).toBe(0);
});
