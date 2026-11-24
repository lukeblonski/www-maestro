import { expect, test } from "@playwright/test";
import { content as c } from "../../lib/content";
import { ADRES_FUNKCJI, atrapaFunkcji, dokladnie, otworzStrone, poFontach, poHydracji, zapisuj } from "./pomoc";

// Wzór: stan początkowy → kliknięcie albo przewinięcie → stan widoczny dla odwiedzającego → granica.
// Elementy po rolach, nazwach dostępnych i kotwicach; teksty z lib/content.ts.

// Nazwy cudzych produktów, których porównanie nie wymienia (P7).
const CUDZE_PRODUKTY = /\b(Lovable|Bolt|Replit|Cursor|Warp|HumanLayer|Devin)\b/;

// Wiersze porównania z „Oczekiwanego efektu” zmiany poprawki-tresci-strony, wpisane dosłownie (P1).
const WIERSZE_POROWNANIA = [
  {
    etykieta: "Made for",
    kreatory: "Anyone who wants to build an app by chatting with AI",
    maestro: "Anyone who has an idea for a product but doesn’t want to deal with the build details",
  },
  {
    etykieta: "What you need to know",
    kreatory: "How to prompt, maintain and grow",
    maestro: "The thing you want to build. Maestro helps you with the rest",
  },
  {
    etykieta: "Who steers the build",
    kreatory: "You, prompt by prompt",
    maestro: "Maestro. You decide what your product does",
  },
  {
    etykieta: "How it talks to you",
    kreatory: "Prompt, answer, prompt",
    maestro:
      "Like a partner who remembers everything you agreed, discussed and decided, in plain language without technical jargon",
  },
  {
    etykieta: "Where your product lives",
    kreatory: "Often on the builder’s platform",
    maestro: "On your own server. The code, documentation and knowledge are yours",
  },
  {
    etykieta: "After launch",
    kreatory: "Optional monitoring and AI fixes on some plans, which you need to oversee on your own",
    maestro: "Fixes issues and helps your product grow. You approve its decisions and add your input when you want",
  },
];

// Pytania FAQ w kolejności z „Oczekiwanego efektu” zmiany poprawki-tresci-strony (P2).
const PYTANIA_FAQ = [
  "Do I need to know how to code?",
  "What do I need to start?",
  "What will it cost?",
  "When can I start?",
  "Does Maestro do anything without asking me?",
  "Where are my data, code and project history?",
  "Can Maestro work on a product I already have?",
  "What’s under the hood?",
  "What happens if I stop using Maestro?",
  "Will it tell me whether my idea is worth building?",
  "Does the first release maintain my application automatically?",
];
const LICZBA_PYTAN_FAQ = 11;
const NOWE_ODPOWIEDZI: Record<string, string> = {
  "What do I need to start?":
    "The Claude app, an active Claude subscription and a server. The installer guides you through setting up the server.",
  "Can Maestro work on a product I already have?":
    "Yes. Maestro can take over an existing project: it learns how your product works, protects what already works with checks, and then keeps building with you.",
  "What’s under the hood?":
    "Maestro is the official Claude Code running on your own server. Behind it, a set of steps turns what you agree on into a written plan, builds it with AI agents, reviews and tests every change, and deploys it. Maestro is the one you talk to: it keeps your project’s memory, asks you only what needs your decision, and explains everything in plain language.",
};
const ZDANIE_O_KOSZCIE = "We don’t charge you anything for Maestro.";

test.beforeEach(async ({ page }) => {
  await otworzStrone(page);
  // Przed podłączeniem Reacta spis nie wyróżnia sekcji, a wysyłka formularza przeładowałaby stronę.
  await poHydracji(page);
});

test("krok 6 — spis wyróżnia bieżącą sekcję i przenosi do niej", async ({ page }, testInfo) => {
  const spis = page.getByRole("navigation", { name: c.ui.chapters });
  if (testInfo.project.name === "telefon-360") {
    await expect(spis, "na telefonie spisu nie widać").toBeHidden();
    return;
  }

  const pozycje = spis.getByRole("link");
  await expect(spis).toBeVisible();
  await expect(pozycje, "pięć pozycji spisu w kolejności").toHaveText(c.chapters.map((r) => r.indexLabel));
  const biezace = spis.locator('[aria-current="true"]');

  const sprawdzBiezaca = async (indeks: number, opis: string) => {
    await expect(pozycje.nth(indeks), `${opis}: wyróżniona „${c.chapters[indeks].indexLabel}”`).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(biezace, `${opis}: dokładnie jedna wyróżniona pozycja`).toHaveCount(1);
  };
  await sprawdzBiezaca(0, "na starcie");

  // Przewinięcie do każdej sekcji w przód i z powrotem do pierwszej.
  const kolejnosc = [...c.chapters.keys(), 0];
  for (const indeks of kolejnosc) {
    const id = c.chapters[indeks].id;
    await page.locator(`#${id}`).evaluate((sekcja) => sekcja.scrollIntoView({ behavior: "instant", block: "start" }));
    await sprawdzBiezaca(indeks, `po przewinięciu do #${id}`);
  }

  // Kliknięcie pozycji „You decide” przenosi #control w górne 35% okna.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sprawdzBiezaca(0, "po powrocie na górę strony");
  const indeksControl = c.chapters.findIndex((r) => r.id === "control");
  expect(c.chapters[indeksControl]?.indexLabel, "pozycja #control w spisie").toBe("You decide");
  await spis.getByRole("link", { name: dokladnie("You decide") }).click();
  await expect
    .poll(
      () =>
        page.locator("#control").evaluate((sekcja) => {
          const gora = sekcja.getBoundingClientRect().top;
          return gora >= 0 && gora <= window.innerHeight * 0.35;
        }),
      { message: "#control w górnych 35% okna po kliknięciu pozycji spisu" },
    )
    .toBe(true);
  await sprawdzBiezaca(indeksControl, "po kliknięciu „You decide”");
});

test("krok 7 — porównanie z kreatorami aplikacji z promptu bez cudzych nazw", async ({ page }) => {
  const porownanie = page.locator("#why");
  const tabela = porownanie.getByRole("table", { name: c.comparison.ariaLabel });
  await expect(tabela.getByRole("columnheader", { includeHidden: true }).filter({ hasText: /\S/ })).toHaveText([
    "Prompt-to-app builders",
    "Maestro",
  ]);
  await expect(porownanie.locator("p.mono"), "etykieta porównania").toHaveText(dokladnie("Why Maestro"));
  await expect(tabela.getByRole("rowheader"), "6 wierszy w kolejności").toHaveText(
    WIERSZE_POROWNANIA.map((w) => w.etykieta),
  );
  expect(c.comparison.rows.length, "6 wierszy w lib/content.ts").toBe(6);
  // Wiersz nagłówka (ukryty poniżej 640 px) i 6 wierszy danych.
  const wiersze = tabela.getByRole("row", { includeHidden: true });
  await expect(wiersze).toHaveCount(7);
  for (let i = 0; i < WIERSZE_POROWNANIA.length; i++) {
    const komorki = wiersze.nth(i + 1).getByRole("cell");
    await expect(komorki).toHaveCount(2);
    await expect(komorki.nth(0), `${WIERSZE_POROWNANIA[i].etykieta}: kreatory`).toContainText(
      WIERSZE_POROWNANIA[i].kreatory,
    );
    await expect(komorki.nth(1), `${WIERSZE_POROWNANIA[i].etykieta}: Maestro`).toContainText(
      WIERSZE_POROWNANIA[i].maestro,
    );
  }

  // Bez czarnej linii nad wierszem nagłówka, z liniami między wierszami danych (P7).
  const ramki = await tabela.evaluate((el) => ({
    gora: parseFloat(getComputedStyle(el).borderTopWidth),
    wiersze: Array.from(el.querySelectorAll('[role="row"]'))
      .slice(1)
      .map((wiersz) => parseFloat(getComputedStyle(wiersz).borderBottomWidth)),
  }));
  expect(ramki.gora, "górna ramka tabeli porównania").toBe(0);
  expect(ramki.wiersze.length).toBe(6);
  ramki.wiersze.forEach((szerokosc, i) =>
    expect(szerokosc, `wiersz ${i + 1}: dolna linia`).toBeGreaterThan(0),
  );

  for (const tekst of ["Individual tools vary", "A comparison of typical approaches"]) {
    await expect(porownanie, `#why bez „${tekst}”`).not.toContainText(tekst);
  }
  const tekstStrony = await page.evaluate(() => document.body.textContent ?? "");
  expect(tekstStrony.match(CUDZE_PRODUKTY)?.[0] ?? null, "nazwa cudzego produktu w tekście strony").toBeNull();

  // Bez podświetlenia kolumny Maestro: komórki obu kolumn mają to samo tło.
  const tla = await tabela.evaluate((el) =>
    Array.from(el.querySelectorAll('[role="row"]'))
      .slice(1)
      .map((wiersz) => Array.from(wiersz.querySelectorAll('[role="cell"]')).map((k) => getComputedStyle(k).backgroundColor)),
  );
  expect(tla.length).toBe(6);
  tla.forEach(([kreatory, maestro], i) => expect(maestro, `wiersz ${i + 1}: tło komórki Maestro`).toBe(kreatory));
});

test("krok 8 — „Coming soon” przy opiece po starcie i innych agentach", async ({ page }) => {
  await expect(page.locator("#after-launch").getByText(dokladnie("Coming soon"))).toBeVisible();
  const wlasnosc = page.locator("#ownership");
  await expect(wlasnosc.getByText(dokladnie("Codex and others coming soon"))).toBeVisible();
  await expect(wlasnosc.getByText(dokladnie("Codex and OpenCode coming soon"))).toBeVisible();

  // „Coming soon” w wierszu porównania „After launch”.
  const wierszPoStarcie = page
    .locator("#why")
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: dokladnie("After launch") }) });
  await expect(wierszPoStarcie, "jeden wiersz porównania „After launch”").toHaveCount(1);
  await expect(wierszPoStarcie.getByText(dokladnie("Coming soon"))).toBeVisible();

  // Zapowiedź ustawiania zabezpieczeń pod punktem „Guardrails built in.” w #control.
  const zabezpieczenia = page
    .locator("#control li")
    .filter({ has: page.locator("h3", { hasText: dokladnie("Guardrails built in.") }) });
  await expect(zabezpieczenia, "jeden punkt „Guardrails built in.”").toHaveCount(1);
  await expect(zabezpieczenia.getByText(dokladnie("Setting your own guardrails coming soon"))).toBeVisible();

  const pytanie = page
    .locator("#faq details")
    .filter({ has: page.locator("summary", { hasText: "Does the first release maintain my application automatically?" }) });
  await expect(pytanie).toHaveCount(1);
  await pytanie.locator("summary").click();
  await expect(pytanie.locator("p")).toBeVisible();
  await expect(pytanie.locator("p")).toContainText("coming soon");
});

test("krok 9 — każde z 11 pytań FAQ otwiera się i zamyka", async ({ page }) => {
  const pytania = page.locator("#faq details");
  await expect(pytania).toHaveCount(LICZBA_PYTAN_FAQ);
  expect(PYTANIA_FAQ.length).toBe(LICZBA_PYTAN_FAQ);
  await expect(page.locator("#faq summary"), "pytania w kolejności z Oczekiwanego efektu").toHaveText(
    PYTANIA_FAQ.map((p) => dokladnie(p)),
  );

  // Trzy nowe odpowiedzi dosłownie, a w odpowiedzi o koszcie pogrubione zdanie.
  for (const [pytanie, odpowiedz] of Object.entries(NOWE_ODPOWIEDZI)) {
    const element = pytania.filter({ has: page.locator("summary", { hasText: dokladnie(pytanie) }) });
    await expect(element.locator("p"), `odpowiedź na „${pytanie}”`).toHaveText(dokladnie(odpowiedz));
  }
  const koszt = pytania.filter({ has: page.locator("summary", { hasText: dokladnie("What will it cost?") }) });
  await expect(koszt.locator("p strong"), "pogrubione zdanie w odpowiedzi o koszcie").toHaveText(
    dokladnie(ZDANIE_O_KOSZCIE),
  );

  for (let i = 0; i < LICZBA_PYTAN_FAQ; i++) {
    const pytanie = pytania.nth(i);
    const naglowek = pytanie.locator("summary");
    const odpowiedz = pytanie.locator("p");

    await expect(pytanie, `pytanie ${i + 1} na starcie zamknięte`).not.toHaveAttribute("open");
    await expect(odpowiedz, `odpowiedź ${i + 1} na starcie ukryta`).toBeHidden();

    await naglowek.click();
    await expect(pytanie, `pytanie ${i + 1} po pierwszym kliknięciu otwarte`).toHaveAttribute("open");
    await expect(odpowiedz, `odpowiedź ${i + 1} po pierwszym kliknięciu widoczna`).toBeVisible();

    await naglowek.click();
    await expect(pytanie, `pytanie ${i + 1} po drugim kliknięciu zamknięte`).not.toHaveAttribute("open");
    await expect(odpowiedz, `odpowiedź ${i + 1} po drugim kliknięciu ukryta`).toBeHidden();
  }
});

test("krok 10 — formularz zapisu: błędy bez żądań, wysyłanie, zapisano i niepowodzenie", async ({ page }) => {
  const w = c.waitlist;
  await poFontach(page);
  const atrapa = await atrapaFunkcji(page, { odpowiedz: "sukces", wstrzymaj: true });
  // Zapis żądań od chwili, gdy strona jest załadowana.
  const zapis = zapisuj(page);
  const zadaniaFunkcji = () =>
    zapis.zadania.filter((z) => z.method() === "POST" && z.url().startsWith(ADRES_FUNKCJI));

  const sekcja = page.locator("#waitlist");
  const pole = sekcja.getByLabel(w.label, { exact: true });
  const wyslij = sekcja.getByRole("button", { name: w.button });
  const wysylanie = sekcja.getByRole("button", { name: w.sending });
  const komunikat = sekcja.getByRole("status");

  // Bez notatek dla autora i bez zdania o podglądzie (L4).
  for (const tekst of ["[TODO: Connect the waiting list", "[TODO: Add the privacy notice", "Form preview only"]) {
    await expect(sekcja, `#waitlist bez „${tekst}”`).not.toContainText(tekst);
  }

  // Jedyny formularz i jedyne pole e-mail na stronie są na jej końcu.
  await expect(page.locator("form"), "jeden formularz na stronie").toHaveCount(1);
  await expect(page.locator('input[type="email"]'), "jedno pole e-mail na stronie").toHaveCount(1);
  await expect(sekcja.locator("form"), "formularz w #waitlist").toHaveCount(1);

  await expect(komunikat).toHaveAttribute("id", "waitlist-status");
  await expect(komunikat, "komunikat jest ogłaszany czytnikom ekranu").toHaveAttribute(
    "aria-live",
    /^(polite|assertive)$/,
  );
  await expect(pole, "stan początkowy: pole nie jest błędne").not.toHaveAttribute("aria-invalid", "true");
  await expect(komunikat, "stan początkowy: komunikat pusty").toHaveText("");

  // Błędne adresy: komunikat błędu, pole oznaczone, bez żądań (L3).
  for (const [opis, adres] of [
    ["puste pole", ""],
    ["adres bez @", "adres-bez-malpy.example.com"],
    ["adres bez kropki w domenie", "anna@gmail"],
  ]) {
    await pole.fill(adres);
    await wyslij.click();
    await expect(pole, `${opis}: pole oznaczone jako błędne`).toHaveAttribute("aria-invalid", "true");
    await expect(komunikat, `${opis}: komunikat błędu`).toHaveText(dokladnie(w.error));
  }
  expect(
    zapis.zadania.map((z) => `${z.method()} ${z.url()}`),
    "żądania przeglądarki przy trzech błędnych wysyłkach",
  ).toEqual([]);

  // Poprawny adres: w czasie wysyłki przycisk „Joining…” jest nieaktywny (L17).
  const adres = "osoba@example.com";
  await pole.fill(adres);
  await wyslij.click();
  await expect(wysylanie, "w czasie wysyłki przycisk ma tekst wysyłania").toBeVisible();
  await expect(wysylanie, "w czasie wysyłki przycisk jest nieaktywny").toBeDisabled();
  await expect(komunikat, "w czasie wysyłki komunikat pusty").toHaveText("");
  await expect.poll(() => atrapa.zadania.length, { message: "żądanie doszło do atrapy funkcji" }).toBe(1);

  // Odpowiedź sukcesu: komunikat zapisano i dokładnie jedno POST z adresem w treści (L1).
  atrapa.zwolnij();
  await expect(komunikat, "po odpowiedzi sukcesu: komunikat zapisano").toHaveText(dokladnie(w.success));
  await expect(wyslij, "po odpowiedzi przycisk wraca i działa").toBeEnabled();
  await expect(pole, "po sukcesie pole nie jest błędne").not.toHaveAttribute("aria-invalid", "true");
  const wyslane = zadaniaFunkcji();
  expect(wyslane.length, `liczba żądań POST pod ${ADRES_FUNKCJI}`).toBe(1);
  expect(wyslane[0].postData() ?? "", "treść żądania zawiera adres").toContain(adres);

  // Odpowiedź błędu i przerwane żądanie: komunikat niepowodzenia, adres zostaje w polu (L2).
  let oczekiwane = 1;
  for (const odpowiedz of ["blad", "przerwane"] as const) {
    atrapa.ustaw(odpowiedz);
    await wyslij.click();
    oczekiwane += 1;
    await expect
      .poll(() => atrapa.zadania.length, { message: `${odpowiedz}: żądanie doszło do atrapy funkcji` })
      .toBe(oczekiwane);
    await expect(komunikat, `${odpowiedz}: komunikat niepowodzenia`).toHaveText(dokladnie(w.failure));
    await expect(pole, `${odpowiedz}: adres zostaje w polu`).toHaveValue(adres);
    await expect(pole, `${odpowiedz}: pole nie jest błędne`).not.toHaveAttribute("aria-invalid", "true");
  }
});
