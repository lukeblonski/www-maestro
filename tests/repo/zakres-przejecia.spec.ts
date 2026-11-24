import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

// Krok 16 scenariusza PRD, bez przeglądarki: kod strony, konfiguracja budowy i workflow
// publikacji są takie jak w commicie właściciela (poza plikami zmian z PLIKI_ZMIAN i
// PLIKI_PRZEBUDOWY), a package.json różni się tylko wpisami testów.

const KORZEN = resolve(__dirname, "..", "..");
const BAZA = "5e4dcac";
const SCIEZKI = [
  "app",
  "components",
  "lib",
  "public",
  ".github/workflows/pages.yml",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
];
// Pliki zmiany lista-oczekujacych (formularz zapisu i workflow publikacji funkcji), a także
// zmiany poprawki-tresci-strony (lib/content.ts, components/interactive.tsx z pogrubionym zdaniem
// FAQ i app/globals.css bez górnej linii porównania): mogą się różnić od bazy, ale nie muszą.
// Każdy inny plik w SCIEZKI zostaje jak w BAZA.
const PLIKI_ZMIAN = [
  "components/interactive.tsx",
  "lib/waitlist.ts",
  "lib/content.ts",
  "app/globals.css",
  ".github/workflows/pages.yml",
];
// Pliki zmiany przebudowa-strony (nowa treść, układ, fonty i obraz hero): mogą się różnić od bazy,
// ale nie muszą. Katalog public/fonts obejmuje też usunięte i nowe pliki w nim.
const PLIKI_PRZEBUDOWY = [
  "app/page.tsx",
  "app/layout.tsx",
  "components/brand.tsx",
  "public/icon.svg",
  "public/fonts",
  "public/hero-lines.webp",
];
const WYJATKI = [...PLIKI_ZMIAN, ...PLIKI_PRZEBUDOWY].map((plik) => `:(exclude)${plik}`);
const WPISY_TESTOW: Record<string, string[]> = {
  scripts: ["test", "test:e2e", "verify"],
  devDependencies: ["@playwright/test"],
};

type Pakiet = Record<string, Record<string, string> | string | boolean | undefined>;

function git(...argumenty: string[]): string {
  return execFileSync("git", argumenty, { cwd: KORZEN, encoding: "utf8" });
}

test("krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac", () => {
  const roznica = spawnSync("git", ["diff", "--quiet", BAZA, "--", ...SCIEZKI, ...WYJATKI], {
    cwd: KORZEN,
    encoding: "utf8",
  });
  const zmienione =
    roznica.status === 0 ? "" : git("diff", "--stat", BAZA, "--", ...SCIEZKI, ...WYJATKI) + (roznica.stderr ?? "");
  expect(roznica.status, `git diff ${BAZA} pokazuje zmiany:\n${zmienione}`).toBe(0);

  const nowe = git("ls-files", "--others", "--exclude-standard", "--", ...SCIEZKI, ...WYJATKI).trim();
  expect(nowe, "nowe, nieśledzone pliki w ścieżkach strony").toBe("");

  const dawny = JSON.parse(git("show", `${BAZA}:package.json`)) as Pakiet;
  const biezacy = JSON.parse(readFileSync(resolve(KORZEN, "package.json"), "utf8")) as Pakiet;
  for (const [sekcja, klucze] of Object.entries(WPISY_TESTOW)) {
    const dawnaSekcja = dawny[sekcja] as Record<string, string> | undefined;
    const biezacaSekcja = biezacy[sekcja] as Record<string, string> | undefined;
    for (const klucz of klucze) {
      expect(dawnaSekcja?.[klucz], `${sekcja}.${klucz} w ${BAZA}`).toBeUndefined();
      if (biezacaSekcja) delete biezacaSekcja[klucz];
    }
  }
  expect(biezacy, `package.json poza wpisami testów jak w ${BAZA}`).toEqual(dawny);
});
