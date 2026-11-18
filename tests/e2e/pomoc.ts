import { expect, type ConsoleMessage, type Page, type Request, type Response } from "@playwright/test";

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

/**
 * Czeka, aż React podłączy się do przycisku motywu w nagłówku. Przed tym kliknięcie
 * przycisku nic nie robi, a wysyłka formularza przeładowałaby stronę.
 */
export async function poHydracji(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const przycisk = document.querySelector("header button");
    return !!przycisk && Object.keys(przycisk).some((klucz) => klucz.startsWith("__reactProps$"));
  });
}

/** Przewija stronę ekran po ekranie do samego końca, bez płynnego przewijania. */
export async function przewinDoKonca(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const klatka = () => new Promise<void>((gotowe) => requestAnimationFrame(() => gotowe()));
    const dokument = document.documentElement;
    for (let y = 0; y <= dokument.scrollHeight; y += Math.max(1, Math.floor(window.innerHeight / 2))) {
      window.scrollTo({ top: y, behavior: "instant" });
      await klatka();
    }
    window.scrollTo({ top: dokument.scrollHeight, behavior: "instant" });
    await klatka();
  });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const d = document.documentElement;
          return Math.ceil(window.scrollY + window.innerHeight) >= d.scrollHeight - 1;
        }),
      { message: "strona przewinięta do końca" },
    )
    .toBe(true);
}

/** Wyrażenie regularne dopasowujące dokładnie podany tekst. */
export function dokladnie(tekst: string): RegExp {
  return new RegExp(`^${tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}
