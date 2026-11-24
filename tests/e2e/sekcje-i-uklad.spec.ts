import { expect, test } from "@playwright/test";
import { content as c } from "../../lib/content";
import { dokladnie, otworzStrone, poFontach, poHydracji } from "./pomoc";

// Kolejność z „Oczekiwanego efektu” zmiany przebudowa-strony, wpisana tu, a nie odczytana ze strony:
// hero, blok pięciu sekcji, porównanie, FAQ i koniec strony z zapisem.
const KOLEJNOSC_KOTWIC = [
  "top",
  "how-it-works",
  "observer",
  "control",
  "deploy",
  "after-launch",
  "ownership",
  "why",
  "faq",
  "waitlist",
  "first-release",
];

// Teksty starej strony, których nowa strona nie ma (P1 zmian przebudowa-strony i poprawki-tresci-strony).
const USUNIETE_TEKSTY = [
  "30 November 2026",
  "Our 2027 vision",
  "Autonomously.",
  "manual test",
  "You bring the problem",
  "Your server. Always on.",
  "Flat learning curve",
  "Through prompts and a preview",
  "In plain language, with a recommendation",
  "on some plans, which you turn on and oversee",
  "the will to build your next moonshot",
];

// Nowe i zmienione punkty pięciu sekcji z „Oczekiwanego efektu” zmiany poprawki-tresci-strony,
// wpisane tu dosłownie, a nie odczytane z lib/content.ts: sekcja, tytuł punktu i fragment jego tekstu.
const PUNKTY_SEKCJI: { sekcja: string; tytul: string; tekst: string }[] = [
  {
    sekcja: "observer",
    tytul: "It remembers.",
    tekst: "Its entire memory is stored on your server, so nothing gets lost between sessions.",
  },
  {
    sekcja: "control",
    tytul: "Every question comes with a recommendation.",
    tekst: "tells you which answer it recommends and why, so you can make informed decisions.",
  },
  {
    sekcja: "control",
    tytul: "Guardrails built in.",
    tekst:
      "Maestro works inside built-in safeguards. It keeps away from your passwords and keys, never changes files you protect, and never bends a test just to make a change pass.",
  },
  {
    sekcja: "deploy",
    tytul: "What works keeps working.",
    tekst:
      "Before any change reaches your users, Maestro checks that the main things your product already does still work, the way your users use them.",
  },
  {
    sekcja: "after-launch",
    tytul: "It looks after your product.",
    tekst:
      "Maestro keeps watching your product and, when something goes wrong, proactively fixes it, and lets you know every time it does.",
  },
  {
    sekcja: "after-launch",
    tytul: "It helps your product grow.",
    tekst:
      "Maestro helps you shape a product strategy, gathers feedback from your users and your tools, and implements changes, improvements and new features, while asking as little of your time as possible.",
  },
  {
    sekcja: "ownership",
    tytul: "You never touch the code.",
    tekst:
      "You don’t need to know what a PR, a merge, a ticket, an API, a skill or an md file is. All you need is the will to create!",
  },
  {
    sekcja: "ownership",
    tytul: "Maestro is always on.",
    tekst: "Maestro runs 24/7 on a separate server, so it has no access to the data on your computer.",
  },
  {
    sekcja: "ownership",
    tytul: "No new app to learn.",
    tekst:
      "You talk to Maestro in the Claude app on your computer or phone. Not another clunky drag-and-drop tool or cluttered interface.",
  },
  {
    sekcja: "ownership",
    tytul: "Your own subscription.",
    tekst:
      "Maestro runs the official Claude Code on your own server, signed in with your own Claude plan. No extra AI fees: Maestro only uses what your Claude subscription already includes.",
  },
];

test("krok 1 — sekcje w kolejności z makiety i brak błędów w konsoli", async ({ page }) => {
  const { zapis } = await otworzStrone(page);
  await poHydracji(page);
  await poFontach(page);

  await expect(page, "tytuł karty").toHaveTitle(c.meta.title);

  const bledy = await page.evaluate((kotwice) => {
    const problemy: string[] = [];
    let poprzedni: Element | null = null;
    for (const id of kotwice) {
      const elementy = document.querySelectorAll(`[id="${id}"]`);
      if (elementy.length !== 1) {
        problemy.push(`#${id}: ${elementy.length} elementów zamiast 1`);
        continue;
      }
      if (poprzedni && !(poprzedni.compareDocumentPosition(elementy[0]) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        problemy.push(`#${id} nie następuje po poprzedniej kotwicy`);
      }
      poprzedni = elementy[0];
    }
    return problemy;
  }, KOLEJNOSC_KOTWIC);
  expect(bledy, "kotwice w kolejności z makiety").toEqual([]);

  // Nagłówki z lib/content.ts.
  await expect(page.getByRole("heading", { level: 1 }), "h1").toHaveText(dokladnie(c.hero.heading.join(" ")));
  for (const rozdzial of c.chapters) {
    await expect(page.locator(`#${rozdzial.id} h2`), `h2 w #${rozdzial.id}`).toHaveText(
      dokladnie(`${rozdzial.quiet} ${rozdzial.heading}`),
    );
  }
  await expect(page.locator("#why h2"), "h2 porównania").toHaveText(dokladnie(c.comparison.title));
  await expect(page.locator("#faq h2"), "h2 FAQ").toHaveText(dokladnie(c.faq.title.join(" ")));
  await expect(page.locator("#waitlist h2"), "h2 końca strony").toHaveText(dokladnie(c.waitlist.title));

  // #waitlist to jedyna stopka, po <main>, ostatni element body poza skryptami Next.
  await expect(page.getByRole("contentinfo"), "jedna rola contentinfo").toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveAttribute("id", "waitlist");
  const stopka = await page.evaluate(() => {
    const stopki = Array.from(document.querySelectorAll("footer"));
    const main = document.querySelector("main");
    const poStopce = (() => {
      const elementy = Array.from(document.body.children);
      const indeks = elementy.findIndex((el) => el.id === "waitlist");
      return elementy
        .slice(indeks + 1)
        .map((el) => el.tagName.toLowerCase())
        .filter((nazwa) => nazwa !== "script" && nazwa !== "next-route-announcer");
    })();
    return {
      stopki: stopki.map((f) => f.id),
      dzieckoBody: stopki[0]?.parentElement === document.body,
      poMain: !!main && !!stopki[0] && !!(main.compareDocumentPosition(stopki[0]) & Node.DOCUMENT_POSITION_FOLLOWING),
      wMain: !!main && !!stopki[0] && main.contains(stopki[0]),
      poStopce,
    };
  });
  expect(stopka.stopki, "jedyny footer to #waitlist").toEqual(["waitlist"]);
  expect(stopka.dzieckoBody, "#waitlist jest dzieckiem body").toBe(true);
  expect(stopka.poMain && !stopka.wMain, "#waitlist stoi po <main>").toBe(true);
  expect(stopka.poStopce, "elementy body po #waitlist (poza script i next-route-announcer)").toEqual([]);

  // Nowe i zmienione punkty w swoich sekcjach, z tekstem w akapicie pod tytułem (P1).
  for (const { sekcja, tytul, tekst } of PUNKTY_SEKCJI) {
    const punkt = page.locator(`#${sekcja} li`).filter({ has: page.locator("h3", { hasText: dokladnie(tytul) }) });
    await expect(punkt, `#${sekcja}: jeden punkt „${tytul}”`).toHaveCount(1);
    await expect(punkt.locator("p").first(), `#${sekcja}: tekst punktu „${tytul}”`).toContainText(tekst);
  }

  const tekstStrony = await page.evaluate(() => document.body.textContent ?? "");
  const tytul = await page.title();
  for (const tekst of USUNIETE_TEKSTY) {
    expect(tekstStrony.includes(tekst), `tekst strony bez „${tekst}”`).toBe(false);
    expect(tytul.includes(tekst), `tytuł bez „${tekst}”`).toBe(false);
  }

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

  const zapis = page.getByRole("link", { name: dokladnie(c.hero.primary), includeHidden: true });
  await expect(zapis, `dokładnie dwa linki „${c.hero.primary}”`).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(zapis.nth(i)).toHaveAttribute("href", "#waitlist");
  await expect(page.locator("#top").getByRole("link", { name: dokladnie(c.hero.secondary) })).toHaveAttribute(
    "href",
    "#why",
  );
  await expect(page.locator("#how-it-works"), "#how-it-works istnieje").toHaveCount(1);
  await expect(page.locator("#first-release"), "#first-release istnieje").toHaveCount(1);

  const przejscia = [
    { nazwa: c.hero.primary, cel: "#waitlist" },
    { nazwa: c.hero.secondary, cel: "#why" },
  ];
  for (const { nazwa, cel } of przejscia) {
    await otworzStrone(page);
    const sekcja = page.locator(cel);
    await expect(sekcja, `${cel} przed kliknięciem poza widokiem`).not.toBeInViewport();
    await page.locator("#top").getByRole("link", { name: dokladnie(nazwa) }).click();
    await expect(sekcja, `${cel} w widoku po kliknięciu „${nazwa}”`).toBeInViewport();
  }
});

test("krok 3 — brak poziomego przewijania, porównanie w dwóch kolumnach albo blokach", async ({ page }, testInfo) => {
  await otworzStrone(page);
  await poFontach(page);

  const dokument = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dokument.scrollWidth, `scrollWidth dokumentu przy clientWidth ${dokument.clientWidth}`).toBeLessThanOrEqual(
    dokument.clientWidth,
  );

  const tabela = page.getByRole("table", { name: c.comparison.ariaLabel });
  await expect(tabela).toBeVisible();
  const szerokosci = await tabela.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(szerokosci.scrollWidth, `treść porównania szersza niż obszar ${szerokosci.clientWidth}`).toBeLessThanOrEqual(
    szerokosci.clientWidth,
  );

  // Wiersz nagłówka jest ukryty poniżej 640 px, więc liczony z ukrytymi.
  const wiersze = tabela.getByRole("row", { includeHidden: true });
  await expect(wiersze, "wiersz nagłówka i 6 wierszy").toHaveCount(7);
  const komorki = await tabela.evaluate((el) =>
    Array.from(el.querySelectorAll('[role="row"]'))
      .slice(1)
      .map((wiersz) => ({
        naglowki: wiersz.querySelectorAll('[role="rowheader"]').length,
        komorki: Array.from(wiersz.querySelectorAll('[role="cell"]')).map((k) => {
          const r = k.getBoundingClientRect();
          return { gora: r.top, dol: r.bottom };
        }),
      })),
  );
  expect(komorki.length, "6 wierszy danych").toBe(6);

  if (testInfo.project.name === "komputer-1280") {
    const kolumny = tabela.getByRole("columnheader");
    await expect(kolumny).toHaveCount(3);
    await expect(kolumny.filter({ hasText: /\S/ }), "dwa niepuste nagłówki kolumn").toHaveText([
      c.comparison.columns.builders,
      c.comparison.columns.maestro,
    ]);
    await expect(kolumny.filter({ hasText: /\S/ }).first()).toBeVisible();
    komorki.forEach((w, i) => {
      expect(w.naglowki, `wiersz ${i + 1}: rowheader`).toBe(1);
      expect(w.komorki.length, `wiersz ${i + 1}: dwie komórki`).toBe(2);
      expect(Math.abs(w.komorki[0].gora - w.komorki[1].gora), `wiersz ${i + 1}: komórki obok siebie`).toBeLessThan(1);
    });
  } else {
    komorki.forEach((w, i) => {
      expect(w.naglowki, `wiersz ${i + 1}: rowheader`).toBe(1);
      expect(w.komorki.length, `wiersz ${i + 1}: dwie komórki`).toBe(2);
      expect(w.komorki[1].gora, `wiersz ${i + 1}: komórki jedna pod drugą`).toBeGreaterThanOrEqual(w.komorki[0].dol);
    });
    const etykiety = tabela.locator('[role="cell"] .who');
    await expect(etykiety).toHaveCount(12);
    for (let i = 0; i < 12; i++) await expect(etykiety.nth(i), `etykieta .who ${i + 1} widoczna`).toBeVisible();
  }
});

test("krok 4 — nagłówek z logo i zapisem, bez innej nawigacji", async ({ page }) => {
  await otworzStrone(page);

  const naglowek = page.getByRole("banner");
  await expect(naglowek).toHaveCount(1);
  const linki = naglowek.getByRole("link", { includeHidden: true });
  await expect(linki, "dwa linki w nagłówku").toHaveCount(2);

  const logo = naglowek.getByRole("link", { name: dokladnie(c.ui.brandHome) });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("href", "#top");
  const cta = naglowek.getByRole("link", { name: dokladnie(c.hero.primary) });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "#waitlist");

  await expect(naglowek.getByRole("button", { includeHidden: true }), "przyciski w nagłówku").toHaveCount(0);
  for (const rola of ["navigation", "menu", "menubar"] as const) {
    await expect(naglowek.getByRole(rola, { includeHidden: true }), `rola ${rola} w nagłówku`).toHaveCount(0);
  }
  for (const rola of ["menu", "menubar"] as const) {
    await expect(page.getByRole(rola, { includeHidden: true }), `rola ${rola} na stronie`).toHaveCount(0);
  }

  const nawigacje = page.getByRole("navigation", { includeHidden: true });
  await expect(nawigacje, "jedna rola navigation na stronie").toHaveCount(1);
  await expect(nawigacje).toHaveAttribute("aria-label", c.ui.chapters);
  expect(await nawigacje.evaluate((el) => !!el.closest("header")), "spis poza nagłówkiem").toBe(false);
});
