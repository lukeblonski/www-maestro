import type { ConsoleMessage, Page, Request, Response } from "@playwright/test";

// Wspólne otwarcie strony dla testów kroków 1–14: adres pod prefiksem publikacji
// i zapis tego, co przeglądarka zrobiła od pierwszego żądania.

export const PREFIKS = "/www-maestro";
export const ADRES_STRONY = `${PREFIKS}/`;

export type Zapis = {
  konsola: ConsoleMessage[];
  bledyStrony: Error[];
  zadania: Request[];
  odpowiedzi: Response[];
  nieudane: Request[];
};

/** Zaczyna zapis konsoli, błędów strony, żądań i odpowiedzi. Wywołaj przed `goto`. */
export function zapisuj(page: Page): Zapis {
  const zapis: Zapis = { konsola: [], bledyStrony: [], zadania: [], odpowiedzi: [], nieudane: [] };
  page.on("console", (komunikat) => zapis.konsola.push(komunikat));
  page.on("pageerror", (blad) => zapis.bledyStrony.push(blad));
  page.on("request", (zadanie) => zapis.zadania.push(zadanie));
  page.on("response", (odpowiedz) => zapis.odpowiedzi.push(odpowiedz));
  page.on("requestfailed", (zadanie) => zapis.nieudane.push(zadanie));
  return zapis;
}

/** Otwiera stronę pod `/www-maestro/` z zapisem od pierwszego żądania. */
export async function otworzStrone(page: Page): Promise<{ odpowiedz: Response | null; zapis: Zapis }> {
  const zapis = zapisuj(page);
  const odpowiedz = await page.goto(ADRES_STRONY);
  return { odpowiedz, zapis };
}

/** Czeka, aż przeglądarka skończy ładować fonty użyte na stronie. */
export async function poFontach(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Ścieżka adresu bez schematu, hosta i zapytania. */
export function sciezka(adres: string): string {
  return new URL(adres).pathname;
}
