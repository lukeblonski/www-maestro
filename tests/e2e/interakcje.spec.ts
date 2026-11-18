import { expect, test } from "@playwright/test";
import { content as c } from "../../lib/content";
import { dokladnie, otworzStrone, poFontach, poHydracji, zapisuj } from "./pomoc";

// Wzór: stan początkowy → kliknięcie → stan widoczny dla odwiedzającego → granica.
// Elementy po rolach, nazwach dostępnych i kotwicach; teksty z lib/content.ts.

const LICZBA_KROKOW_PRZYKLADU = 8;
const KROK_PODGLADU = 3;

test.beforeEach(async ({ page }) => {
  await otworzStrone(page);
  // Przed podłączeniem Reacta kliknięcia nic nie zmieniają, a wysyłka formularza przeładowałaby stronę.
  await poHydracji(page);
});

test("krok 6 — demo rozmowy: zatwierdzenie i powtórka", async ({ page }) => {
  const d = c.heroDemo;
  const demo = page.locator("#top").getByRole("figure", { name: d.caption });
  const zatwierdzenie = demo.getByRole("button", { name: d.reply });
  const powtorka = demo.getByRole("button", { name: d.resetLabel });
  const statusPoczatkowy = demo.getByText(dokladnie(d.phase));
  const statusPoZatwierdzeniu = demo.getByText(dokladnie(d.buildMessage));

  await expect(zatwierdzenie, "stan początkowy: przycisk zatwierdzenia").toBeVisible();
  await expect(powtorka, "stan początkowy: bez przycisku powtórki").toHaveCount(0);
  await expect(statusPoczatkowy, "stan początkowy: status demo").toBeVisible();

  await zatwierdzenie.click();
  await expect(zatwierdzenie, "po zatwierdzeniu przycisk zatwierdzenia znika").toHaveCount(0);
  await expect(powtorka, "po zatwierdzeniu jest przycisk powtórki").toBeVisible();
  await expect(statusPoZatwierdzeniu, "po zatwierdzeniu status demo się zmienia").toBeVisible();
  await expect(statusPoczatkowy, "po zatwierdzeniu nie ma początkowego statusu").toHaveCount(0);

  await powtorka.click();
  await expect(zatwierdzenie, "po powtórce wraca przycisk zatwierdzenia").toBeVisible();
  await expect(powtorka, "po powtórce nie ma przycisku powtórki").toHaveCount(0);
  await expect(statusPoczatkowy, "po powtórce wraca początkowy status").toBeVisible();
  await expect(statusPoZatwierdzeniu, "po powtórce nie ma statusu zatwierdzenia").toHaveCount(0);
});

test("krok 7 — każdy z 8 kroków przykładu i granice", async ({ page }) => {
  const e = c.example;
  expect(e.steps.length, "liczba kroków przykładu w lib/content.ts").toBe(LICZBA_KROKOW_PRZYKLADU);

  const grupa = page.getByRole("group", { name: e.stepLabel, exact: true });
  const kroki = grupa.getByRole("button");
  const panel = page.locator("#example-panel");
  const tytul = panel.getByRole("heading", { level: 3 });
  const poprzedni = panel.getByRole("button", { name: e.previous, exact: true });
  const nastepny = panel.getByRole("button", { name: e.next, exact: true });

  await expect(kroki).toHaveCount(LICZBA_KROKOW_PRZYKLADU);

  // Granica na starcie: krok 1 wybrany, „Previous step” wyłączony.
  await expect(kroki.nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(poprzedni, "na kroku 1 „Previous step” jest wyłączony").toBeDisabled();
  await expect(nastepny, "na kroku 1 „Next step” działa").toBeEnabled();

  for (let i = 0; i < LICZBA_KROKOW_PRZYKLADU; i++) {
    await kroki.nth(i).click();
    await expect(kroki.nth(i), `krok ${i + 1} wybrany`).toHaveAttribute("aria-pressed", "true");
    for (let j = 0; j < LICZBA_KROKOW_PRZYKLADU; j++) {
      if (j !== i) {
        await expect(kroki.nth(j), `przy kroku ${i + 1} krok ${j + 1} nie jest wybrany`).toHaveAttribute(
          "aria-pressed",
          "false",
        );
      }
    }
    await expect(tytul, `panel pokazuje tytuł kroku ${i + 1}`).toHaveText(dokladnie(e.steps[i].title));
  }

  // Granica na końcu: krok 8 wybrany, „Next step” wyłączony.
  await expect(nastepny, "na kroku 8 „Next step” jest wyłączony").toBeDisabled();
  await expect(poprzedni, "na kroku 8 „Previous step” działa").toBeEnabled();

  // Strzałki przechodzą o jeden krok.
  await poprzedni.click();
  await expect(kroki.nth(LICZBA_KROKOW_PRZYKLADU - 2)).toHaveAttribute("aria-pressed", "true");
  await expect(tytul).toHaveText(dokladnie(e.steps[LICZBA_KROKOW_PRZYKLADU - 2].title));
  await nastepny.click();
  await expect(kroki.nth(LICZBA_KROKOW_PRZYKLADU - 1)).toHaveAttribute("aria-pressed", "true");
  await expect(tytul).toHaveText(dokladnie(e.steps[LICZBA_KROKOW_PRZYKLADU - 1].title));
});

test("krok 8 — podgląd aplikacji obiadowej i reset", async ({ page }) => {
  const p = c.example.preview;
  const grupa = page.getByRole("group", { name: c.example.stepLabel, exact: true });
  const panel = page.locator("#example-panel");
  const pokaz = panel.getByRole("button", { name: p.button });
  const reset = panel.getByRole("button", { name: p.reset });
  const wynik = panel.getByRole("status");

  await grupa.getByRole("button").nth(KROK_PODGLADU - 1).click();
  await expect(panel.getByRole("heading", { level: 3 })).toHaveText(dokladnie(c.example.steps[KROK_PODGLADU - 1].title));
  await expect(pokaz, "stan początkowy: przycisk pokazania podglądu").toBeVisible();
  await expect(wynik, "stan początkowy: bez wyniku").toBeHidden();

  await pokaz.click();
  await expect(wynik, "po pokazaniu jest wynik").toBeVisible();
  await expect(wynik, "wynik nie jest pusty").toHaveText(/\S/);
  await expect(wynik, "wynik pokazuje posiłek").toContainText(p.resultTitle);
  await expect(reset, "po pokazaniu jest przycisk resetu").toBeVisible();
  await expect(pokaz, "po pokazaniu nie ma przycisku pokazania").toHaveCount(0);

  await reset.click();
  await expect(pokaz, "po resecie wraca przycisk pokazania").toBeVisible();
  await expect(reset, "po resecie nie ma przycisku resetu").toHaveCount(0);
  await expect
    .poll(
      async () => {
        if ((await wynik.count()) === 0 || !(await wynik.isVisible())) return "ukryty";
        return (await wynik.innerText()).trim() === "" ? "pusty" : "widoczny z treścią";
      },
      { message: "po resecie wynik jest pusty albo ukryty" },
    )
    .not.toBe("widoczny z treścią");
});

test("krok 9 — każde pytanie FAQ otwiera się i zamyka", async ({ page }) => {
  const pytania = page.locator("#faq details");
  await expect(pytania).toHaveCount(c.faq.items.length);
  expect(c.faq.items.length, "FAQ ma pytania").toBeGreaterThan(0);

  for (let i = 0; i < c.faq.items.length; i++) {
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

test("krok 10 — formularz-demo: błędy, podgląd i brak żądań", async ({ page }) => {
  const w = c.waitlist;
  await poFontach(page);
  // Zapis żądań od chwili, gdy strona jest załadowana.
  const zapis = zapisuj(page);

  const sekcja = page.locator("#waitlist");
  const pole = sekcja.getByLabel(w.label, { exact: true });
  const wyslij = sekcja.getByRole("button", { name: w.button });
  const komunikat = sekcja.getByRole("status");

  await expect(komunikat).toHaveAttribute("id", "waitlist-status");
  await expect(komunikat, "komunikat jest ogłaszany czytnikom ekranu").toHaveAttribute(
    "aria-live",
    /^(polite|assertive)$/,
  );
  await expect(pole, "stan początkowy: pole nie jest błędne").not.toHaveAttribute("aria-invalid", "true");

  // 1. Puste pole.
  await pole.fill("");
  await wyslij.click();
  await expect(pole, "puste pole oznaczone jako błędne").toHaveAttribute("aria-invalid", "true");
  await expect(komunikat, "puste pole: komunikat błędu").toHaveText(/\S/);

  // 2. Adres bez „@”.
  await pole.fill("adres-bez-malpy.example.com");
  await wyslij.click();
  await expect(pole, "adres bez @ oznaczony jako błędny").toHaveAttribute("aria-invalid", "true");
  await expect(komunikat, "adres bez @: komunikat błędu").toHaveText(/\S/);

  // 3. Poprawny adres.
  await pole.fill("osoba@example.com");
  await wyslij.click();
  await expect(komunikat, "poprawny adres: komunikat podglądu").toHaveText(dokladnie(w.success));
  await expect(pole, "poprawny adres: pole nie jest błędne").not.toHaveAttribute("aria-invalid", "true");

  expect(
    zapis.zadania.map((z) => `${z.method()} ${z.url()}`),
    "żądania przeglądarki przy trzech wysyłkach formularza",
  ).toEqual([]);
});
