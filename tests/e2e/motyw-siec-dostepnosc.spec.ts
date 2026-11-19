import { expect, test, type Page } from "@playwright/test";
import { content as c } from "../../lib/content";
import { atrapaFunkcji, dokladnie, otworzStrone, poFontach, poHydracji, przewinDoKonca } from "./pomoc";

// Klucz, pod którym stara strona zapisywała wybrany motyw. Nowa strona go nie czyta ani nie zapisuje.
const KLUCZ_MOTYWU = "maestro-theme";
// Ustawienie motywu w systemie odwiedzającego; strona ma jeden, jasny motyw przy obu.
const SCHEMATY_SYSTEMU = ["light", "dark"] as const;
type Schemat = (typeof SCHEMATY_SYSTEMU)[number];

test("krok 5 — jeden jasny motyw i nic w pamięci przeglądarki", async ({ page }) => {
  // Przed każdym załadowaniem: zapisany kiedyś ciemny motyw, potem podsłuch zapisów i odczytów pamięci.
  await page.addInitScript((klucz) => {
    const okno = window as unknown as { __zapisyPamieci: string[]; __odczytyPamieci: string[] };
    okno.__zapisyPamieci = [];
    okno.__odczytyPamieci = [];
    try {
      localStorage.setItem(klucz, "dark");
    } catch {}
    const zapisz = Storage.prototype.setItem;
    const odczytaj = Storage.prototype.getItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      okno.__zapisyPamieci.push(String(k));
      return zapisz.call(this, k, v);
    };
    Storage.prototype.getItem = function (k: string) {
      okno.__odczytyPamieci.push(String(k));
      return odczytaj.call(this, k);
    };
  }, KLUCZ_MOTYWU);
  const atrapa = await atrapaFunkcji(page);

  for (const system of SCHEMATY_SYSTEMU) {
    await page.emulateMedia({ colorScheme: system });
    await otworzStrone(page);
    await poHydracji(page);

    const wyglad = await page.evaluate(() => ({
      tlo: getComputedStyle(document.body).backgroundColor,
      schemat: getComputedStyle(document.documentElement).colorScheme,
      motyw: document.documentElement.getAttribute("data-theme"),
    }));
    expect(wyglad, `wygląd przy systemowym ${system} i zapisanym ${KLUCZ_MOTYWU}=dark`).toEqual({
      tlo: "rgb(255, 255, 255)",
      schemat: "light",
      motyw: null,
    });

    // Przewinięcie, otwarcie pytania FAQ i wysyłka formularza do atrapy.
    await przewinDoKonca(page);
    const pytanie = page.locator("#faq details").first();
    await pytanie.locator("summary").click();
    await expect(pytanie).toHaveAttribute("open");
    const formularz = page.locator("#waitlist");
    await formularz.getByLabel(c.waitlist.label).fill("osoba@example.com");
    await formularz.getByRole("button", { name: c.waitlist.button }).click();
    await expect(formularz.getByRole("status")).toHaveText(dokladnie(c.waitlist.success));

    const pamiec = await page.evaluate(() => {
      const okno = window as unknown as { __zapisyPamieci: string[]; __odczytyPamieci: string[] };
      return {
        zapisy: okno.__zapisyPamieci,
        odczyty: okno.__odczytyPamieci,
        session: sessionStorage.length,
        ciasteczka: document.cookie,
      };
    });
    expect(pamiec, `pamięć przeglądarki po przewinięciu, FAQ i zapisie (system ${system})`).toEqual({
      zapisy: [],
      odczyty: [],
      session: 0,
      ciasteczka: "",
    });
    expect(await page.context().cookies(), "ciasteczka kontekstu").toEqual([]);
  }
  expect(atrapa.zadania.length, "wysyłki formularza doszły do atrapy").toBe(SCHEMATY_SYSTEMU.length);
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

test("krok 12 — ograniczony ruch bez płynnego przewijania i przejść", async ({ page }, testInfo) => {
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

  if (testInfo.project.name !== "komputer-1280") return;
  // Spis: makieta ma przejścia na ::after (kreska) i na wewnętrznym span (nazwa sekcji).
  const przejsciaSpisu = await page
    .getByRole("navigation", { name: c.ui.chapters })
    .getByRole("link")
    .evaluateAll((linki) =>
      linki.map((a) => ({
        pozycja: (a.textContent ?? "").trim(),
        kreska: getComputedStyle(a, "::after").transitionDuration,
        nazwa: getComputedStyle(a.querySelector("span") ?? a).transitionDuration,
      })),
    );
  expect(przejsciaSpisu.length, "pozycje spisu").toBe(c.chapters.length);
  expect(
    przejsciaSpisu.filter((p) => p.kreska.split(",").some((d) => d.trim() !== "0s") || p.nazwa.split(",").some((d) => d.trim() !== "0s")),
    "pozycje spisu z przejściem przy ograniczonym ruchu",
  ).toEqual([]);
});

// Kontrast WCAG 2: kolor tekstu z wyliczonego `color` elementu (albo jego pseudoelementu, np.
// `::placeholder`; alfa zmieszana z tłem), tło z samego elementu albo najbliższego przodka (do body
// włącznie) o nieprzezroczystym background-color.
async function zmierzKontrast(page: Page, selektor: string, system: Schemat, pseudo?: string): Promise<string[]> {
  const { zmierzone, problemy } = await page.evaluate(
    ({ selektor, system, pseudo }) => {
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
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${klasy}${pseudo ?? ""} „${tekst}”`;
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
          problemy.push(`[${system}] ${opisz(el)}: brak nieprzezroczystego tła w elemencie i przodkach do body`);
          continue;
        }
        const [r, g, b, a] = rgba(getComputedStyle(el, pseudo).color);
        const tekst = [r * a + tlo[0] * (1 - a), g * a + tlo[1] * (1 - a), b * a + tlo[2] * (1 - a)];
        const [jasny, ciemny] = [luminancja(tekst), luminancja(tlo)].sort((x, y) => y - x);
        const stosunek = (jasny + 0.05) / (ciemny + 0.05);
        if (stosunek < 4.5) {
          problemy.push(`[${system}] ${opisz(el)}: tekst ${hex(tekst)} na tle ${hex(tlo)} = ${stosunek.toFixed(2)}:1`);
        }
      }
      return { zmierzone, problemy };
    },
    { selektor, system, pseudo },
  );
  expect(zmierzone, `[${system}] liczba zmierzonych widocznych elementów ${selektor}${pseudo ?? ""}`).toBeGreaterThan(0);
  return problemy;
}

const TEKSTY_STRONY =
  "h1, h2, h2 span, h3, p, summary, label, a, button:not([disabled]), [role=columnheader], [role=rowheader], [role=cell], .soon";

test("krok 13 — kontrast co najmniej 4.5:1 przy systemowym motywie jasnym i ciemnym", async ({ page }, testInfo) => {
  const problemy: string[] = [];
  const atrapa = await atrapaFunkcji(page);
  for (const system of SCHEMATY_SYSTEMU) {
    await page.emulateMedia({ colorScheme: system, reducedMotion: "reduce" });
    await otworzStrone(page);
    await poHydracji(page);
    await poFontach(page);
    await page.mouse.move(0, 0);

    problemy.push(...(await zmierzKontrast(page, TEKSTY_STRONY, system)));

    // Pozycje spisu: nazwa sekcji jest widoczna dopiero przy fokusie (na komputerze).
    if (testInfo.project.name === "komputer-1280") {
      const pozycje = page.getByRole("navigation", { name: c.ui.chapters }).getByRole("link");
      await expect(pozycje).toHaveCount(c.chapters.length);
      for (let i = 0; i < c.chapters.length; i++) {
        await pozycje.nth(i).focus();
        await expect(pozycje.nth(i).locator("span"), `pozycja spisu ${i + 1} widoczna przy fokusie`).toHaveCSS(
          "opacity",
          "1",
        );
        problemy.push(...(await zmierzKontrast(page, "nav.index a:focus span", system)));
      }
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    }

    const formularz = page.locator("#waitlist");
    const pole = formularz.getByLabel(c.waitlist.label);
    const wyslij = formularz.getByRole("button", { name: c.waitlist.button });
    const status = formularz.locator("#waitlist-status");

    // Placeholder pustego pola bez fokusu, na tle #waitlist.
    await expect(pole).toHaveValue("");
    await expect(pole).not.toBeFocused();
    problemy.push(...(await zmierzKontrast(page, "#waitlist-email", system, "::placeholder")));

    await wyslij.click();
    await expect(status, "komunikat po błędnej wysyłce").not.toBeEmpty();
    await expect(pole).toHaveAttribute("aria-invalid", "true");
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", system)));

    // Komunikat zapisano i komunikat niepowodzenia po odpowiedziach atrapy funkcji zapisu.
    await pole.fill("osoba@example.com");
    atrapa.ustaw("sukces");
    await wyslij.click();
    await expect(status, "komunikat zapisano po odpowiedzi sukcesu").toHaveText(dokladnie(c.waitlist.success));
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", system)));

    atrapa.ustaw("blad");
    await wyslij.click();
    await expect(status, "komunikat niepowodzenia po odpowiedzi błędu").toHaveText(dokladnie(c.waitlist.failure));
    problemy.push(...(await zmierzKontrast(page, "#waitlist-status", system)));
  }
  expect(problemy, "elementy z kontrastem poniżej 4.5:1").toEqual([]);
});
