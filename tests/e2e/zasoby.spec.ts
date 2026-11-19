import { expect, test } from "@playwright/test";
import { ADRES_STRONY, PREFIKS, otworzStrone, poFontach, sciezka } from "./pomoc";

const TYPY_ZASOBOW = ["font", "stylesheet", "script", "image"] as const;

test("krok 14 — strona i zasoby pod prefiksem /www-maestro", async ({ page }) => {
  const { odpowiedz, zapis } = await otworzStrone(page);
  expect(odpowiedz?.status(), `status ${ADRES_STRONY}`).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await poFontach(page);

  for (const typ of TYPY_ZASOBOW) {
    await expect
      .poll(() => zapis.odpowiedzi.filter((o) => o.request().resourceType() === typ).length, {
        message: `co najmniej jedna odpowiedź typu ${typ}`,
      })
      .toBeGreaterThan(0);
  }

  const zasoby = zapis.odpowiedzi.filter((o) =>
    (TYPY_ZASOBOW as readonly string[]).includes(o.request().resourceType()),
  );
  for (const zasob of zasoby) {
    const opis = `${zasob.request().resourceType()} ${zasob.url()}`;
    expect(zasob.status(), opis).toBeLessThan(400);
    expect(sciezka(zasob.url()), opis).toMatch(new RegExp(`^${PREFIKS}/`));
  }
  expect(
    zapis.nieudane.map((z) => `${z.url()} ${z.failure()?.errorText ?? ""}`),
    "żądania zakończone błędem",
  ).toEqual([]);

  const ikona = await page.locator('link[rel~="icon"]').first().getAttribute("href");
  expect(ikona, "href ikony").toMatch(new RegExp(`^${PREFIKS}/`));
  const odpowiedzIkony = await page.request.get(ikona ?? "");
  expect(odpowiedzIkony.status(), `status ${ikona}`).toBe(200);

  const bezPrefiksu = await page.request.get("/");
  expect(bezPrefiksu.status(), "status / bez prefiksu").toBe(404);
});
