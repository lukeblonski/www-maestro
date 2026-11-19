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
 * Czeka, aż React podłączy się do przycisku wysyłki formularza w `#waitlist`. Przed tym
 * spis nie wyróżnia sekcji, a wysyłka formularza przeładowałaby stronę.
 */
export async function poHydracji(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const przycisk = document.querySelector('#waitlist button[type="submit"]');
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

/**
 * Adres funkcji zapisu, z którym `npm run test:e2e` i `npm run verify` budują stronę
 * (NEXT_PUBLIC_WAITLIST_URL). Domena `.invalid` nie istnieje, więc bez atrapy żądanie się nie uda.
 */
export const ADRES_FUNKCJI = "https://zapis.atrapa.invalid/";

export type OdpowiedzFunkcji = "sukces" | "blad" | "przerwane";

export type AtrapaFunkcji = {
  /** Żądania do funkcji zapisu, które doszły do atrapy. */
  zadania: Request[];
  /** Co atrapa odpowie na następne żądania. */
  ustaw: (odpowiedz: OdpowiedzFunkcji) => void;
  /** Zwalnia wstrzymane żądania (przy `wstrzymaj: true`). */
  zwolnij: () => void;
};

/**
 * Atrapa funkcji zapisu przez `page.route`: 200 `{ ok: true }`, 500 `{ ok: false }` albo przerwane
 * połączenie, zawsze z nagłówkiem CORS (bez niego przeglądarka odrzuci odpowiedź z innego originu).
 * Z `wstrzymaj: true` każda odpowiedź czeka na `zwolnij()`.
 */
export async function atrapaFunkcji(
  page: Page,
  { odpowiedz = "sukces", wstrzymaj = false }: { odpowiedz?: OdpowiedzFunkcji; wstrzymaj?: boolean } = {},
): Promise<AtrapaFunkcji> {
  let biezaca = odpowiedz;
  let wstrzymane: Array<() => void> = [];
  const atrapa: AtrapaFunkcji = {
    zadania: [],
    ustaw: (nowa) => {
      biezaca = nowa;
    },
    zwolnij: () => {
      const czekajace = wstrzymane;
      wstrzymane = [];
      wstrzymaj = false;
      czekajace.forEach((dalej) => dalej());
    },
  };
  await page.route((url) => url.href.startsWith(ADRES_FUNKCJI), async (trasa) => {
    atrapa.zadania.push(trasa.request());
    const teraz = biezaca;
    if (wstrzymaj) await new Promise<void>((dalej) => wstrzymane.push(dalej));
    if (teraz === "przerwane") {
      await trasa.abort("failed");
      return;
    }
    await trasa.fulfill({
      status: teraz === "sukces" ? 200 : 500,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: teraz === "sukces" }),
    });
  });
  return atrapa;
}

/** Wyrażenie regularne dopasowujące dokładnie podany tekst. */
export function dokladnie(tekst: string): RegExp {
  return new RegExp(`^${tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}
