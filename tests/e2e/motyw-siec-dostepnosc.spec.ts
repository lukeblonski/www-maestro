import { expect, test, type Page } from "@playwright/test";
import { content as c } from "../../lib/content";
import { atrapaFunkcji, dokladnie, otworzStrone, poFontach, poHydracji, przewinDoKonca } from "./pomoc";

const KLUCZ_MOTYWU = "maestro-theme";
const MOTYWY = ["light", "dark"] as const;
type Motyw = (typeof MOTYWY)[number];

const przeciwny = (motyw: Motyw): Motyw => (motyw === "light" ? "dark" : "light");
// Etykieta przycisku mówi, na jaki motyw przełącza.
const etykietaPrzelacznika = (motyw: Motyw) => (motyw === "light" ? c.ui.themeDark : c.ui.themeLight);

async function pamiecPrzegladarki(page: Page) {
  return page.evaluate(() => ({ local: Object.keys(localStorage), session: sessionStorage.length }));
}

test("krok 5 — motyw według systemu i zapamiętany po odświeżeniu", async ({ page }) => {
  const html = page.locator("html");
  for (const system of MOTYWY) {
    const wybrany = przeciwny(system);
    await page.emulateMedia({ colorScheme: system });
    await otworzStrone(page);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(html, `bez zapisanego wyboru motyw jak system (${system})`).toHaveAttribute("data-theme", system);
    expect(await pamiecPrzegladarki(page), "pamięć przeglądarki przed przełączeniem").toEqual({ local: [], session: 0 });

    await poHydracji(page);
    const przelacznik = page.getByRole("banner").getByRole("button", { name: etykietaPrzelacznika(system) });
    await expect(przelacznik).toBeVisible();
    await przelacznik.click();
    await expect(html, `po przełączeniu (system ${system})`).toHaveAttribute("data-theme", wybrany);
    await expect(page.getByRole("banner").getByRole("button", { name: etykietaPrzelacznika(wybrany) })).toBeVisible();

    await page.reload();
    await expect(html, `po odświeżeniu zostaje ${wybrany} (system ${system})`).toHaveAttribute("data-theme", wybrany);
    await expect(page.getByRole("banner").getByRole("button", { name: etykietaPrzelacznika(wybrany) })).toBeVisible();
    expect(await pamiecPrzegladarki(page), "jedyny klucz w pamięci przeglądarki").toEqual({
      local: [KLUCZ_MOTYWU],
      session: 0,
    });
  }
});

test("krok 11 — wszystkie żądania idą pod adres strony", async ({ page }) => {
  const adresStrony = new URL(test.info().project.use.baseURL ?? "").origin;
  const { zapis } = await otworzStrone(page);
  await poFontach(page);
  await przewinDoKonca(page);
  await poFontach(page);

  expect(zapis.zadania.length, "liczba zapisanych żądań").toBeGreaterThan(0);
  const obce = zapis.zadania
    .map((z) => z.url())
    .filter((adres) => {
      const url = new URL(adres);
      return url.protocol !== "data:" && url.protocol !== "blob:" && url.origin !== adresStrony;
    });
  expect(obce, `żądania poza ${adresStrony}`).toEqual([]);
});

test("krok 12 — ograniczony ruch bez płynnego przewijania i animacji", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await otworzStrone(page);
  await poHydracji(page);

  const przewijanie = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(przewijanie, "scroll-behavior dokumentu").not.toBe("smooth");

  await przewinDoKonca(page);
  const trwajace = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => {
        const cel = a.effect instanceof KeyframeEffect ? a.effect.target : null;
        const nazwa = a instanceof CSSAnimation ? a.animationName : a instanceof CSSTransition ? a.transitionProperty : a.id;
        return `${cel ? `${cel.tagName.toLowerCase()}.${cel.className}` : "?"}: ${nazwa}`;
      }),
  );
  expect(trwajace, "trwające animacje po przewinięciu").toEqual([]);
});

// Kontrast WCAG 2: kolor tekstu z wyliczonego `color` (alfa zmieszana z tłem), tło z samego
// elementu albo najbliższego przodka (do body włącznie) o nieprzezroczystym background-color.
async function zmierzKontrast(page: Page, selektor: string, motyw: Motyw): Promise<string[]> {
  const { zmierzone, problemy } = await page.evaluate(
    ({ selektor, motyw }) => {
      const plotno = document.createElement("canvas");
      plotno.width = 1;
      plotno.height = 1;
      const ctx = plotno.getContext("2d", { willReadFrequently: true });
      if (!ctx) return { zmierzone: 0, problemy: ["brak kontekstu 2d do odczytu kolorów"] };
      const rgba = (kolor: string): [number, number, number, number] => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = kolor;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
      };
      const kanal = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const luminancja = ([r, g, b]: number[]) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
      const hex = (k: number[]) => `#${k.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
      const opisz = (el: Element) => {
        const tekst = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 50);
        const klasy = typeof el.className === "string" && el.className ? `.${el.className.trim().replace(/\s+/g, ".")}` : "";
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${klasy} „${tekst}”`;
      };

      const problemy: string[] = [];
      let zmierzone = 0;
      for (const el of Array.from(document.querySelectorAll(selektor))) {
        const prostokat = el.getBoundingClientRect();
        const widoczny =
          prostokat.width > 0 &&
          prostokat.height > 0 &&
          el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
        if (!widoczny) continue;
        zmierzone += 1;

        let tlo: [number, number, number, number] | null = null;
        for (let n: Element | null = el; n; n = n === document.body ? null : n.parentElement) {
          const kolor = rgba(getComputedStyle(n).backgroundColor);
          if (kolor[3] === 1) {
            tlo = kolor;
            break;
          }
        }
        if (!tlo) {
          problemy.push(`[${motyw}] ${opisz(el)}: brak nieprzezroczystego tła w elemencie i przodkach do body`);
          continue;
        }
        const [r, g, b, a] = rgba(getComputedStyle(el).color);
        const tekst = [r * a + tlo[0] * (1 - a), g * a + tlo[1] * (1 - a), b * a + tlo[2] * (1 - a)];
        const [jasny, ciemny] = [luminancja(tekst), luminancja(tlo)].sort((x, y) => y - x);
        const stosunek = (jasny + 0.05) / (ciemny + 0.05);
        if (stosunek < 4.5) {
          problemy.push(`[${motyw}] ${opisz(el)}: tekst ${hex(tekst)} na tle ${hex(tlo)} = ${stosunek.toFixed(2)}:1`);
        }
      }
      return { zmierzone, problemy };
    },
    { selektor, motyw },
  );
  expect(zmierzone, `[${motyw}] liczba zmierzonych widocznych elementów ${selektor}`).toBeGreaterThan(0);
  return problemy;
}

test("krok 13 — kontrast co najmniej 4.5:1 w motywie jasnym i ciemnym", async ({ page }) => {
  const problemy: string[] = [];
  const atrapa = await atrapaFunkcji(page);
  for (const motyw of MOTYWY) {
    await page.emulateMedia({ colorScheme: motyw, reducedMotion: "reduce" });
    await otworzStrone(page);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", motyw);
    await poHydracji(page);
    await poFontach(page);
    await page.mouse.move(0, 0);

    problemy.push(...(await zmierzKontrast(page, "h1, h2, h3, p, button:not([disabled]), a.button", motyw)));

    const formularz = page.locator("#waitlist");
    const pole = formularz.getByLabel(c.waitlist.label);
    const wyslij = formularz.getByRole("button", { name: c.waitlist.button });
    const status = formularz.locator("#waitlist-status");

    await wyslij.click();
    await expect(status, "komunikat po błędnej wysyłce").not.toBeEmpty();
    await expect(pole).toHaveAttribute("aria-invalid", "true");
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", motyw)));

    // Komunikat zapisano i komunikat niepowodzenia po odpowiedziach atrapy funkcji zapisu.
    await pole.fill("osoba@example.com");
    atrapa.ustaw("sukces");
    await wyslij.click();
    await expect(status, "komunikat zapisano po odpowiedzi sukcesu").toHaveText(dokladnie(c.waitlist.success));
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", motyw)));

    atrapa.ustaw("blad");
    await wyslij.click();
    await expect(status, "komunikat niepowodzenia po odpowiedzi błędu").toHaveText(dokladnie(c.waitlist.failure));
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", motyw)));
  }
  expect(problemy, "elementy z kontrastem poniżej 4.5:1").toEqual([]);
});
