import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

// Krok 16 scenariusza PRD, bez przeglądarki: kod strony, konfiguracja budowy i workflow
// publikacji są takie jak w commicie właściciela, a package.json różni się tylko wpisami testów.

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
const WPISY_TESTOW: Record<string, string[]> = {
  scripts: ["test", "test:e2e", "verify"],
  devDependencies: ["@playwright/test"],
};

type Pakiet = Record<string, Record<string, string> | string | boolean | undefined>;

function git(...argumenty: string[]): string {
  return execFileSync("git", argumenty, { cwd: KORZEN, encoding: "utf8" });
}

test("krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac", () => {
  const roznica = spawnSync("git", ["diff", "--quiet", BAZA, "--", ...SCIEZKI], {
    cwd: KORZEN,
    encoding: "utf8",
  });
  const zmienione =
    roznica.status === 0 ? "" : git("diff", "--stat", BAZA, "--", ...SCIEZKI) + (roznica.stderr ?? "");
  expect(roznica.status, `git diff ${BAZA} pokazuje zmiany:\n${zmienione}`).toBe(0);

  const nowe = git("ls-files", "--others", "--exclude-standard", "--", ...SCIEZKI).trim();
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
