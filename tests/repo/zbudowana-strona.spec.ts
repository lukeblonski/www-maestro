import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { expect, test } from "@playwright/test";

// L12 na stronie zbudowanej przez `npm run verify` (NEXT_PUBLIC_WAITLIST_URL = adres atrapy):
// out/ nie zna adresu Resend ani nazwy zmiennej z kluczem, a zna adres funkcji zapisu.

const KORZEN = resolve(__dirname, "..", "..");
const OUT = join(KORZEN, "out");
const ADRES_ATRAPY = "https://zapis.atrapa.invalid/";
const ZAKAZANE = ["api.resend.com", "RESEND_API_KEY"];

function pliki(katalog: string): string[] {
  return readdirSync(katalog, { withFileTypes: true }).flatMap((wpis) => {
    const sciezka = join(katalog, wpis.name);
    return wpis.isDirectory() ? pliki(sciezka) : [sciezka];
  });
}

test("zbudowana strona — bez adresu Resend i nazwy klucza", () => {
  expect(() => statSync(OUT).isDirectory(), "brak katalogu out/ — uruchom budowę z `npm run verify`").not.toThrow();
  const wszystkie = pliki(OUT);
  expect(wszystkie.length, "liczba plików w out/").toBeGreaterThan(0);

  const trafienia: string[] = [];
  let zAdresemAtrapy = 0;
  for (const plik of wszystkie) {
    const tresc = readFileSync(plik).toString("latin1");
    for (const zakazany of ZAKAZANE) {
      if (tresc.includes(zakazany)) trafienia.push(`${relative(KORZEN, plik)}: ${zakazany}`);
    }
    if (tresc.includes(ADRES_ATRAPY)) zAdresemAtrapy += 1;
  }
  expect(trafienia, "pliki out/ z adresem Resend albo nazwą klucza").toEqual([]);
  expect(zAdresemAtrapy, `pliki out/ z adresem funkcji ${ADRES_ATRAPY} (dowód budowy w verify)`).toBeGreaterThan(0);
});
