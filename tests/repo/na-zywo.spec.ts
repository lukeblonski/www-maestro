import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

// Skrypt ścieżki na żywo `zapis-na-liste` (scripts/na-zywo.mjs) bez sieci: proces potomny z atrapą Resend
// ładowaną przez `node --import` (tests/repo/atrapa-resend.mjs), w katalogu tymczasowym z własnym CLAUDE.md,
// którego `## Dostępy` wskazuje pliki z atrapowymi wartościami. Test nie czyta plików z `## Dostępy` repo.

const KORZEN = resolve(__dirname, "..", "..");
const SKRYPT = join(KORZEN, "scripts", "na-zywo.mjs");
const ATRAPA = pathToFileURL(join(__dirname, "atrapa-resend.mjs")).href;
const START = join(KORZEN, "context", "foundation", "start.md");
const KLUCZ = "klucz-atrapy-na-zywo";
const WLASCICIEL = "Wlasciciel@Example.com";

type Wynik = {
  sciezka?: unknown;
  adres?: unknown;
  atrapy?: unknown;
  uslugi?: unknown;
  stan_koncowy?: unknown;
  dowod?: unknown;
  wynik?: unknown;
  powod?: unknown;
};
type WywolanieAtrapy = { droga: string; metoda: string; sciezka: string; userAgent: boolean };
type Przebieg = {
  kod: number | null;
  stdout: string;
  stderr: string;
  plikWyniku: string;
  wynik: Wynik | null;
  adres: string;
  wywolania: WywolanieAtrapy[];
};

function wolnyPort(): Promise<number> {
  return new Promise((rozwiaz, odrzuc) => {
    const serwer = createServer();
    serwer.once("error", odrzuc);
    serwer.listen(0, "127.0.0.1", () => {
      const adres = serwer.address();
      serwer.close(() => (typeof adres === "object" && adres ? rozwiaz(adres.port) : odrzuc(new Error("brak portu"))));
    });
  });
}

// Stan końcowy linii `zapis-na-liste` z `## Ścieżki na żywo` w start.md (tekst po `stan końcowy: ` do ` · `).
function stanKoncowyZeStartu(): string {
  const linia = readFileSync(START, "utf8")
    .split("\n")
    .find((tekst) => tekst.startsWith("- zapis-na-liste:"));
  const dopasowanie = /· stan końcowy: (.*?) · /.exec(linia ?? "");
  expect(dopasowanie, "linia zapis-na-liste ze stanem końcowym w start.md").not.toBeNull();
  return (dopasowanie?.[1] ?? "").trim();
}

async function przebieg(scenariusz: string, { bezKlucza = false }: { bezKlucza?: boolean } = {}): Promise<Przebieg> {
  const katalog = mkdtempSync(join(tmpdir(), "na-zywo-"));
  try {
    const plikKlucza = join(katalog, "resend-api-key");
    const plikWlasciciela = join(katalog, "owner-email");
    writeFileSync(plikKlucza, `${KLUCZ}\n`);
    writeFileSync(plikWlasciciela, `${WLASCICIEL}\n`);
    const linie = [
      "# Projekt atrapy",
      "",
      "## Dostępy",
      "",
      ...(bezKlucza ? [] : [`- klucz API Resend: \`${plikKlucza}\``]),
      `- adres e-mail właściciela: ${plikWlasciciela}`,
      "",
      "## Wdrożenie",
      "",
      "- adres: https://atrapa.invalid/",
      "",
    ];
    writeFileSync(join(katalog, "CLAUDE.md"), linie.join("\n"));
    mkdirSync(join(katalog, "context", "foundation"), { recursive: true });
    copyFileSync(START, join(katalog, "context", "foundation", "start.md"));

    const port = await wolnyPort();
    const adres = `http://127.0.0.1:${port}`;
    const plikWyniku = join(katalog, "wynik", "na-zywo.json");
    const zapisAtrapy = join(katalog, "atrapa.jsonl");
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PORT: String(port),
      NA_ZYWO: "1",
      NA_ZYWO_ADRES: adres,
      NA_ZYWO_WYNIK: plikWyniku,
      NA_ZYWO_SCIEZKA: "zapis-na-liste",
      ATRAPA_RESEND_SCENARIUSZ: scenariusz,
      ATRAPA_RESEND_ZAPIS: zapisAtrapy,
    };
    delete env.NODE_OPTIONS;
    delete env.NA_ZYWO_POSREDNIK;
    const proces = spawnSync(process.execPath, ["--import", ATRAPA, SKRYPT], {
      cwd: katalog,
      env,
      encoding: "utf8",
      timeout: 45_000,
    });
    const tekstWyniku = existsSync(plikWyniku) ? readFileSync(plikWyniku, "utf8") : "";
    const wywolania = existsSync(zapisAtrapy)
      ? readFileSync(zapisAtrapy, "utf8")
          .split("\n")
          .filter(Boolean)
          .map((linia) => JSON.parse(linia) as WywolanieAtrapy)
      : [];
    return {
      kod: proces.status,
      stdout: proces.stdout ?? "",
      stderr: proces.stderr ?? "",
      plikWyniku: tekstWyniku,
      wynik: tekstWyniku ? (JSON.parse(tekstWyniku) as Wynik) : null,
      adres,
      wywolania,
    };
  } finally {
    rmSync(katalog, { recursive: true, force: true });
  }
}

// N6: stdout, stderr i plik wyniku bez klucza i adresu właściciela (w każdej wielkości liter i w postaci `%40`).
function bezSekretow(p: Przebieg): void {
  for (const [nazwa, tekst] of [
    ["stdout", p.stdout],
    ["stderr", p.stderr],
    ["plik wyniku", p.plikWyniku],
  ]) {
    const male = tekst.toLowerCase();
    expect(tekst, `${nazwa} bez klucza`).not.toContain(KLUCZ);
    expect(male, `${nazwa} bez adresu właściciela`).not.toContain(WLASCICIEL.toLowerCase());
    expect(male, `${nazwa} bez adresu właściciela z %40`).not.toContain(encodeURIComponent(WLASCICIEL).toLowerCase());
  }
}

test.setTimeout(60_000);

test("skrypt na żywo — zapis przez funkcję do stanu końcowego daje przeszło w kontrakcie autopilota", async () => {
  const p = await przebieg("sukces");
  const opis = `stdout:\n${p.stdout}\nstderr:\n${p.stderr}`;

  expect(p.kod, opis).toBe(0);
  expect(p.wynik, opis).not.toBeNull();
  const wynik = p.wynik as Wynik;
  expect(wynik.wynik, opis).toBe("przeszło");
  expect(wynik.sciezka).toBe("zapis-na-liste");
  expect(wynik.adres).toBe(p.adres);
  expect(wynik.uslugi).toContain("api.resend.com");
  // Oznaczenie pochodzi z kodu atrapy (`globalThis.ATRAPY_NA_ZYWO`), a nie ze skryptu.
  expect(wynik.atrapy).toEqual(["api.resend.com"]);
  expect(wynik.stan_koncowy).toBe(stanKoncowyZeStartu());
  expect(typeof wynik.dowod).toBe("string");
  expect(String(wynik.dowod)).toContain("diagnostyka");
  expect(String(wynik.dowod)).toContain("1010");
  expect(p.stdout).toMatch(/^diagnostyka \(jak w Workers, bez User-Agent\): POST \/contacts 403 error code: 1010$/m);

  // Najpierw sprawdzenie kontaktu przed zapisem, potem diagnostyka przez node:https bez User-Agent;
  // wywołania funkcji i skryptu przez fetch mają User-Agent.
  const [przed, diagnostyczne, ...reszta] = p.wywolania;
  expect(przed).toEqual({ droga: "fetch", metoda: "GET", sciezka: `/contacts/${encodeURIComponent(WLASCICIEL)}`, userAgent: true });
  expect(diagnostyczne).toEqual({ droga: "https", metoda: "POST", sciezka: "/contacts", userAgent: false });
  expect(reszta.length).toBeGreaterThan(0);
  for (const wywolanie of reszta) expect(wywolanie, JSON.stringify(wywolanie)).toMatchObject({ droga: "fetch", userAgent: true });
  expect(reszta.map((w) => `${w.metoda} ${w.sciezka}`)).toEqual([
    "POST /contacts",
    "POST /emails",
    `GET /contacts/${encodeURIComponent(WLASCICIEL)}`,
    "GET /emails/atrapa-email",
  ]);
  expect(p.stdout).toMatch(/^kontakt przed zapisem: GET \/contacts\/<adres> 404 not_found: .* — nie było$/m);
  expect(p.stdout).toMatch(/^funkcja → Resend: POST \/contacts 201$/m);
  expect(String(wynik.powod)).not.toContain("ponowny zapis");
  expect(p.stdout).toMatch(/^funkcja → Resend: POST \/emails 200$/m);
  expect(p.stdout).toMatch(/^wynik: przeszło — /m);
  bezSekretow(p);
});

test("skrypt na żywo — istniejący kontakt właściciela daje przeszło z odpowiedzią POST /contacts funkcji w powodzie", async () => {
  const p = await przebieg("kontakt-istnieje");
  const opis = `stdout:\n${p.stdout}\nstderr:\n${p.stderr}`;

  expect(p.kod, opis).toBe(0);
  const wynik = p.wynik as Wynik;
  expect(wynik.wynik, opis).toBe("przeszło");
  expect(p.stdout).toMatch(/^kontakt przed zapisem: GET \/contacts\/<adres> 200 — był$/m);
  expect(p.stdout).toMatch(/^funkcja → Resend: POST \/contacts 409 conflict: Contact already exists$/m);
  const powod = String(wynik.powod);
  expect(powod).toContain("ponowny zapis istniejącego kontaktu");
  expect(powod).toContain("POST /contacts funkcji 409 conflict");
  expect(String(wynik.dowod)).toContain("ponowny zapis istniejącego kontaktu");
  bezSekretow(p);
});

test("skrypt na żywo — odmowa Resend za kluczem daje zablokowane z powodem bez adresów", async () => {
  const p = await przebieg("klucz-tylko-wysylka");
  const opis = `stdout:\n${p.stdout}\nstderr:\n${p.stderr}`;

  expect(p.kod, opis).not.toBe(0);
  expect(p.wynik, opis).not.toBeNull();
  const wynik = p.wynik as Wynik;
  expect(wynik.wynik, opis).toBe("zablokowane");
  expect(wynik.sciezka).toBe("zapis-na-liste");
  expect(wynik.stan_koncowy).toBe("");
  const powod = String(wynik.powod);
  for (const fragment of ["/contacts", "401", "restricted_api_key", "<adres>"]) expect(powod).toContain(fragment);
  expect(p.stdout).toMatch(/^funkcja → Resend: POST \/contacts 401 restricted_api_key: .*<adres>.*$/m);
  expect(p.stdout).toMatch(/^wynik: zablokowane — .+$/m);
  bezSekretow(p);
});

test("skrypt na żywo — brak linii klucza Resend w ## Dostępy daje nie przeszło", async () => {
  const p = await przebieg("sukces", { bezKlucza: true });
  const opis = `stdout:\n${p.stdout}\nstderr:\n${p.stderr}`;

  expect(p.kod, opis).not.toBe(0);
  expect(p.wynik, opis).not.toBeNull();
  expect((p.wynik as Wynik).wynik).toBe("nie przeszło");
  expect(String((p.wynik as Wynik).powod)).toContain("klucz API Resend");
  expect(p.wywolania).toEqual([]);
  bezSekretow(p);
});
