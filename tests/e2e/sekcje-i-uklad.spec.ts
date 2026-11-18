import { expect, test } from "@playwright/test";
import { content as c } from "../../lib/content";
import { dokladnie, otworzStrone, poFontach, poHydracji } from "./pomoc";

// Kolejność z kroku 1 scenariusza PRD, wpisana tu, a nie odczytana ze strony.
// Sekcje bez id rozpoznaje nazwa ich h2 z lib/content.ts.
type Oczekiwany =
  | { opis: string; id: string }
  | { opis: string; sekcjaZH2: string }
  | { opis: string; h2: string }
  | { opis: string; stopka: true };

const KOLEJNOSC_Z_PRD: Oczekiwany[] = [
  { opis: "hero #top", id: "top" },
  { opis: "#why", id: "why" },
  { opis: "#how-it-works", id: "how-it-works" },
  { opis: "#observer", id: "observer" },
  { opis: "zasady", sekcjaZH2: c.principles.title },
  { opis: "#ownership", id: "ownership" },
  { opis: "porównanie", sekcjaZH2: c.comparison.title },
  { opis: "#first-release", id: "first-release" },
  { opis: "roadmapa", h2: c.roadmap.title },
  { opis: "dla kogo / dla kogo nie", sekcjaZH2: c.audience.title },
  { opis: "#faq", id: "faq" },
  { opis: "#waitlist", id: "waitlist" },
  { opis: "stopka", stopka: true },
];

test("krok 1 — sekcje w kolejności z PRD i brak błędów w konsoli", async ({ page }) => {
  const { zapis } = await otworzStrone(page);
  await poHydracji(page);
  await poFontach(page);

  const stopka = page.getByRole("contentinfo");
  await expect(stopka).toHaveCount(1);
  await expect(stopka.getByRole("link", { name: c.footer.backToTop }).filter({ hasText: c.footer.backToTop })).toHaveAttribute(
    "href",
    "#top",
  );

  const bledy = await page.evaluate((oczekiwane) => {
    const problemy: string[] = [];
    const znalezione: Element[] = [];
    const h2ZTekstem = (tekst: string) =>
      Array.from(document.querySelectorAll("h2")).filter((h) => h.textContent?.trim() === tekst);
    for (const o of oczekiwane) {
      let elementy: Element[];
      if ("id" in o) elementy = Array.from(document.querySelectorAll(`[id="${o.id}"]`));
      else if ("sekcjaZH2" in o)
        elementy = h2ZTekstem(o.sekcjaZH2)
          .map((h) => h.closest("section"))
          .filter((s): s is HTMLElement => !!s);
      else if ("h2" in o) elementy = h2ZTekstem(o.h2);
      else elementy = Array.from(document.querySelectorAll("footer"));
      if (elementy.length !== 1) {
        problemy.push(`${o.opis}: ${elementy.length} elementów zamiast 1`);
        continue;
      }
      const poprzedni = znalezione[znalezione.length - 1];
      if (poprzedni && !(poprzedni.compareDocumentPosition(elementy[0]) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        problemy.push(`${o.opis} nie następuje po poprzednim elemencie listy`);
      }
      znalezione.push(elementy[0]);
    }
    return problemy;
  }, KOLEJNOSC_Z_PRD);
  expect(bledy, "kolejność sekcji z PRD").toEqual([]);

  const komunikaty = zapis.konsola
    .filter((k) => k.type() === "error" || k.type() === "warning")
    .map((k) => `${k.type()}: ${k.text()}`);
  expect(komunikaty, "błędy i ostrzeżenia konsoli").toEqual([]);
  expect(
    zapis.bledyStrony.map((b) => b.message),
    "błędy strony (pageerror)",
  ).toEqual([]);
});

test("krok 2 — linki # prowadzą do istniejących sekcji", async ({ page }) => {
  await otworzStrone(page);

  const bezCelu = await page.evaluate(() => {
    const linki = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    return {
      liczba: linki.length,
      bezCelu: linki
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => !document.getElementById(decodeURIComponent(href.slice(1)))),
    };
  });
  expect(bezCelu.liczba, "liczba linków #").toBeGreaterThan(0);
  expect(bezCelu.bezCelu, "linki # bez celu").toEqual([]);

  const hero = page.locator("#top");
  const przejscia = [
    { nazwa: c.hero.primary, cel: "#waitlist" },
    { nazwa: c.hero.secondary, cel: "#how-it-works" },
  ];
  for (const { nazwa, cel } of przejscia) {
    await otworzStrone(page);
    const sekcja = page.locator(cel);
    await expect(sekcja, `${cel} przed kliknięciem poza widokiem`).not.toBeInViewport();
    await hero.getByRole("link", { name: nazwa }).click();
    await expect(sekcja, `${cel} w widoku po kliknięciu „${nazwa}”`).toBeInViewport();
  }
});

test("krok 3 — brak poziomego przewijania i przewijana tabela porównania", async ({ page }, testInfo) => {
  await otworzStrone(page);
  await poFontach(page);

  const dokument = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dokument.scrollWidth, `scrollWidth dokumentu przy clientWidth ${dokument.clientWidth}`).toBeLessThanOrEqual(
    dokument.clientWidth,
  );

  if (testInfo.project.name !== "telefon-360") return;

  const tabela = page.getByRole("region", { name: c.comparison.title });
  await expect(tabela).toBeVisible();
  const szerokosci = await tabela.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(szerokosci.scrollWidth, `treść tabeli szersza niż obszar ${szerokosci.clientWidth}`).toBeGreaterThan(
    szerokosci.clientWidth,
  );
  await tabela.evaluate((el) => {
    el.scrollLeft = 200;
  });
  await expect.poll(() => tabela.evaluate((el) => el.scrollLeft), { message: "tabela przewija się poziomo" }).toBeGreaterThan(0);
});

test("krok 4 — nagłówek bez nawigacji", async ({ page }, testInfo) => {
  await otworzStrone(page);

  const naglowek = page.getByRole("banner");
  await expect(naglowek.getByRole("link", { name: c.ui.backToTop })).toBeVisible();
  const przelacznik = naglowek.getByRole("button", {
    name: new RegExp(`${dokladnie(c.ui.themeDark).source}|${dokladnie(c.ui.themeLight).source}`),
  });
  await expect(przelacznik).toBeVisible();

  const cta = naglowek.getByRole("link", { name: c.hero.primary, includeHidden: true });
  await expect(cta).toHaveCount(1);
  if (testInfo.project.name === "telefon-360") await expect(cta).toBeHidden();
  else await expect(cta).toBeVisible();

  for (const rola of ["navigation", "menu", "menubar"] as const) {
    await expect(page.getByRole(rola, { includeHidden: true }), `rola ${rola}`).toHaveCount(0);
  }
  await expect(naglowek.locator("button[aria-haspopup]")).toHaveCount(0);
});
