import { expect, test } from "@playwright/test";
import funkcja, { LimitZapisow, type Env, type StanObiektuLimitu } from "../../worker/index";

// Funkcja zapisu (worker/index.ts) bez sieci: Resend to atrapa globalnego `fetch`,
// a limit z jednego IP to prawdziwa klasa `LimitZapisow` na pamięci (`Map`).

const ORIGIN_STRONY = "https://lukeblonski.github.io";
const ADRES_FUNKCJI = "https://maestro-waitlist.atrapa.invalid/";
const ADRES = "anna@example.com";

type Wywolanie = { url: string; tresc: Record<string, unknown>; naglowki: Headers; metoda: string };
type Atrapa = { wywolania: Wywolanie[]; odpowiedz: (url: string, metoda: string) => Response | Promise<Response> };

const oryginalnyFetch = globalThis.fetch;
let atrapa: Atrapa;

test.beforeEach(() => {
  atrapa = { wywolania: [], odpowiedz: () => Response.json({ id: "atrapa" }) };
  globalThis.fetch = (async (wejscie: RequestInfo | URL, init?: RequestInit) => {
    const url = String(wejscie instanceof Request ? wejscie.url : wejscie);
    if (!url.startsWith("https://api.resend.com/")) throw new Error(`nieoczekiwane żądanie: ${url}`);
    atrapa.wywolania.push({
      url,
      tresc: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
      naglowki: new Headers(init?.headers),
      metoda: init?.method ?? "GET",
    });
    return atrapa.odpowiedz(url, init?.method ?? "GET");
  }) as typeof fetch;
});

test.afterEach(() => {
  globalThis.fetch = oryginalnyFetch;
});

function stanNaMapie(): StanObiektuLimitu {
  const pamiec = new Map<string, unknown>();
  return {
    storage: {
      get: async <T,>(klucz: string) => pamiec.get(klucz) as T | undefined,
      put: async <T,>(klucz: string, wartosc: T) => {
        pamiec.set(klucz, wartosc);
      },
    },
  };
}

function srodowisko(zmiany: Partial<Env> = {}): Env {
  const obiekty = new Map<string, LimitZapisow>();
  return {
    RESEND_API_KEY: "klucz-atrapy",
    OWNER_EMAIL: "wlasciciel@example.com",
    LIMIT: {
      idFromName: (nazwa) => nazwa,
      get: (id) => {
        const nazwa = String(id);
        let obiekt = obiekty.get(nazwa);
        if (!obiekt) {
          obiekt = new LimitZapisow(stanNaMapie(), {});
          obiekty.set(nazwa, obiekt);
        }
        const limit = obiekt;
        return { fetch: (adres: string) => limit.fetch(new Request(adres)) };
      },
    },
    ...zmiany,
  };
}

function zapis(
  tresc: unknown,
  { origin = ORIGIN_STRONY, ip = "203.0.113.7" }: { origin?: string | null; ip?: string | null } = {},
): Request {
  const naglowki = new Headers();
  if (origin !== null) naglowki.set("Origin", origin);
  if (ip !== null) naglowki.set("CF-Connecting-IP", ip);
  return new Request(ADRES_FUNKCJI, {
    method: "POST",
    headers: naglowki,
    body: typeof tresc === "string" ? tresc : JSON.stringify(tresc),
  });
}

test("funkcja zapisu — poprawny zapis dodaje kontakt i wysyła e-mail właścicielowi", async () => {
  const odpowiedz = await funkcja.fetch(zapis({ email: ` ${ADRES} `, website: "" }), srodowisko());

  expect(odpowiedz.status).toBe(200);
  expect(await odpowiedz.json()).toEqual({ ok: true });
  expect(odpowiedz.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN_STRONY);
  expect(odpowiedz.headers.get("Vary")).toBe("Origin");

  expect(atrapa.wywolania.map((w) => w.url)).toEqual([
    "https://api.resend.com/contacts",
    "https://api.resend.com/emails",
  ]);
  const [kontakt, email] = atrapa.wywolania;
  expect(kontakt.tresc).toEqual({ email: ADRES });
  expect(email.tresc.to).toEqual(["wlasciciel@example.com"]);
  expect(String(email.tresc.text)).toContain(ADRES);
  for (const w of atrapa.wywolania) {
    expect(w.naglowki.get("Authorization")).toBe("Bearer klucz-atrapy");
    expect(w.naglowki.get("Content-Type")).toBe("application/json");
  }
});

test("funkcja zapisu — inny Origin, brak Origin i błędny adres dają odmowę bez Resend", async () => {
  const odmowy = [
    zapis({ email: ADRES }, { origin: "https://atrapa.invalid" }),
    zapis({ email: ADRES }, { origin: null }),
    zapis({ email: "anna.example.com" }),
    zapis({ email: "anna@gmail" }),
    zapis({ email: "" }),
    zapis({}),
    zapis("to nie jest JSON"),
  ];
  for (const zadanie of odmowy) {
    const odpowiedz = await funkcja.fetch(zadanie, srodowisko());
    expect(odpowiedz.status, `${zadanie.headers.get("Origin")}`).toBeGreaterThanOrEqual(400);
    expect(odpowiedz.status).toBeLessThan(500);
  }
  expect(atrapa.wywolania).toEqual([]);
});

test("funkcja zapisu — wypełnione pole-pułapka daje sukces bez Resend", async () => {
  const odpowiedz = await funkcja.fetch(zapis({ email: ADRES, website: "https://spam.invalid" }), srodowisko());

  expect(odpowiedz.status).toBe(200);
  expect(await odpowiedz.json()).toEqual({ ok: true });
  expect(atrapa.wywolania).toEqual([]);
});

test("funkcja zapisu — szósty zapis z jednego IP w minucie dostaje 429 bez Resend", async () => {
  const env = srodowisko();
  const statusy: number[] = [];
  for (let i = 0; i < 6; i++) {
    statusy.push((await funkcja.fetch(zapis({ email: ADRES }, { ip: "203.0.113.7" }), env)).status);
  }

  expect(statusy).toEqual([200, 200, 200, 200, 200, 429]);
  expect(atrapa.wywolania).toHaveLength(10);

  // Inny adres IPv4 ma własny licznik.
  expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "203.0.113.8" }), env)).status).toBe(200);
});

test("funkcja zapisu — sześć adresów IPv6 z jednej sieci /64 dzieli limit", async () => {
  const env = srodowisko();
  const statusy: number[] = [];
  for (let i = 1; i <= 6; i++) {
    statusy.push((await funkcja.fetch(zapis({ email: ADRES }, { ip: `2001:db8:1:2::${i}` }), env)).status);
  }

  expect(statusy).toEqual([200, 200, 200, 200, 200, 429]);
  expect(atrapa.wywolania).toHaveLength(10);

  // Ta sama sieć zapisana pełniej też trafia w limit, a inna sieć /64 nie.
  expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "2001:0db8:0001:0002:0:0:0:9" }), env)).status).toBe(
    429,
  );
  expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "2001:db8:1:3::1" }), env)).status).toBe(200);
});

test("funkcja zapisu — adres IPv4 zapisany jako IPv6 dzieli limit z tym adresem IPv4", async () => {
  const env = srodowisko();
  for (let i = 0; i < 5; i++) {
    expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "203.0.113.7" }), env)).status).toBe(200);
  }
  expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "::ffff:203.0.113.7" }), env)).status).toBe(429);
  expect((await funkcja.fetch(zapis({ email: ADRES }, { ip: "::ffff:203.0.113.9" }), env)).status).toBe(200);
});

test("funkcja zapisu — jedenasty zapis z jednego IP w dobie i 91. zapis doby dostają 429 bez Resend", async () => {
  const oryginalnyCzas = Date.now;
  let teraz = oryginalnyCzas();
  Date.now = () => teraz;
  try {
    // Jeden IP: po jednym zapisie co 61 s, więc limit minutowy nie działa, a dobowy tak.
    const env = srodowisko();
    const statusy: number[] = [];
    for (let i = 0; i < 11; i++) {
      statusy.push((await funkcja.fetch(zapis({ email: ADRES }, { ip: "203.0.113.7" }), env)).status);
      teraz += 61_000;
    }
    expect(statusy).toEqual([...Array<number>(10).fill(200), 429]);
    expect(atrapa.wywolania).toHaveLength(20);

    // Wiele adresów IP: wspólny limit doby zatrzymuje 91. zapis.
    atrapa.wywolania = [];
    const wspolne = srodowisko();
    const wyniki: number[] = [];
    for (let i = 1; i <= 91; i++) {
      wyniki.push((await funkcja.fetch(zapis({ email: ADRES }, { ip: `198.51.100.${i}` }), wspolne)).status);
    }
    expect(wyniki.slice(0, 90).every((s) => s === 200)).toBe(true);
    expect(wyniki[90]).toBe(429);
    expect(atrapa.wywolania).toHaveLength(180);
  } finally {
    Date.now = oryginalnyCzas;
  }
});

test("funkcja zapisu — błąd obiektu limitu daje 500 z nagłówkiem CORS bez Resend", async () => {
  const env = srodowisko({
    LIMIT: {
      idFromName: (nazwa) => nazwa,
      get: () => ({
        fetch: async () => {
          throw new Error("atrapa: obiekt limitu niedostępny");
        },
      }),
    },
  });
  const odpowiedz = await funkcja.fetch(zapis({ email: ADRES }), env);
  expect(odpowiedz.status).toBe(500);
  expect(odpowiedz.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN_STRONY);
  expect(atrapa.wywolania).toEqual([]);
});

test("funkcja zapisu — błąd Resend daje 5xx", async () => {
  for (const zla of ["https://api.resend.com/contacts", "https://api.resend.com/emails"]) {
    atrapa.wywolania = [];
    atrapa.odpowiedz = (url) =>
      url === zla ? Response.json({ message: "atrapa błędu" }, { status: 500 }) : Response.json({ id: "atrapa" });
    const odpowiedz = await funkcja.fetch(zapis({ email: ADRES }), srodowisko());
    expect(odpowiedz.status, zla).toBeGreaterThanOrEqual(500);
    expect(await odpowiedz.json()).toEqual({ ok: false });
    expect(odpowiedz.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN_STRONY);
  }

  atrapa.odpowiedz = () => {
    throw new TypeError("atrapa: brak sieci");
  };
  const odpowiedz = await funkcja.fetch(zapis({ email: ADRES }), srodowisko());
  expect(odpowiedz.status).toBeGreaterThanOrEqual(500);
});

test("funkcja zapisu — brak ustawień funkcji daje 500 bez Resend", async () => {
  for (const zmiany of [{ RESEND_API_KEY: "" }, { OWNER_EMAIL: "" }]) {
    const odpowiedz = await funkcja.fetch(zapis({ email: ADRES }), srodowisko(zmiany));
    expect(odpowiedz.status).toBe(500);
  }
  expect(atrapa.wywolania).toEqual([]);
});

// Nowe testy (naprawa-listy-oczekujacych): log odmów Resend, User-Agent, istniejący kontakt.

const KONTAKTY = "https://api.resend.com/contacts";
const EMAILE = "https://api.resend.com/emails";
const KONTAKT_ADRESU = "https://api.resend.com/contacts/anna%40example.com";
// Wartości, których wpis logu nie może zawierać: klucz, adres odwiedzającego i właściciela.
const SEKRETY = ["klucz-atrapy", "anna@example.com", "wlasciciel@example.com", "anna%40example.com"];

// Zbiera wpisy `console.error` na czas działania i zawsze przywraca oryginał.
async function zWpisami<T>(dzialanie: () => Promise<T>): Promise<{ wynik: T; wpisy: string[] }> {
  const oryginalny = console.error;
  const wpisy: string[] = [];
  console.error = (...argumenty: unknown[]) => {
    wpisy.push(argumenty.map(String).join(" "));
  };
  try {
    return { wynik: await dzialanie(), wpisy };
  } finally {
    console.error = oryginalny;
  }
}

function bezSekretow(wpis: string): void {
  for (const sekret of SEKRETY) expect(wpis.toLowerCase(), wpis).not.toContain(sekret.toLowerCase());
}

const odmowa401 = () =>
  Response.json(
    {
      statusCode: 401,
      name: "restricted_api_key",
      message:
        "This API key klucz-atrapy is restricted to only send emails from wlasciciel@example.com, not anna@example.com (anna%40example.com)",
    },
    { status: 401 },
  );

test("funkcja zapisu — odmowa Resend na /contacts i /emails daje 502 i jeden wpis logu bez klucza i adresów", async () => {
  for (const [zla, sciezka] of [
    [KONTAKTY, "/contacts"],
    [EMAILE, "/emails"],
  ] as const) {
    atrapa.wywolania = [];
    atrapa.odpowiedz = (url, metoda) => {
      if (url === zla && metoda === "POST") return odmowa401();
      if (url === KONTAKT_ADRESU)
        return Response.json({ statusCode: 404, name: "not_found", message: "Contact not found" }, { status: 404 });
      return Response.json({ id: "atrapa" });
    };
    const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));

    expect(odpowiedz.status, sciezka).toBe(502);
    expect(await odpowiedz.json()).toEqual({ ok: false });
    expect(wpisy, sciezka).toHaveLength(1);
    const [wpis] = wpisy;
    expect(wpis).toContain(sciezka);
    expect(wpis).toContain("401");
    expect(wpis).toContain("restricted_api_key");
    expect(wpis).toContain("<adres>");
    bezSekretow(wpis);
  }

  // Treść, która nie jest JSON (strona Cloudflare 1010 przed API Resend).
  atrapa.wywolania = [];
  atrapa.odpowiedz = (url, metoda) =>
    url === KONTAKTY && metoda === "POST"
      ? new Response("<html>\n  <title>Access denied</title>\n  error code: 1010\n</html>", {
          status: 403,
          headers: { "Content-Type": "text/html" },
        })
      : url === KONTAKT_ADRESU
        ? new Response("error code: 1010", { status: 403 })
        : Response.json({ id: "atrapa" });
  const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));
  expect(odpowiedz.status).toBe(502);
  expect(wpisy).toHaveLength(1);
  expect(wpisy[0]).toContain("/contacts");
  expect(wpisy[0]).toContain("403");
  expect(wpisy[0]).toContain("1010");
  bezSekretow(wpisy[0]);
  expect(atrapa.wywolania.map((w) => `${w.metoda} ${w.url}`)).not.toContain(`POST ${EMAILE}`);
});

test("funkcja zapisu — wpis logu ukrywa dokładny adres odwiedzającego, którego ogólny wzorzec nie obejmuje", async () => {
  // Formularz przyjmuje `"anna"@example.com`, a ogólny wzorzec adresu zatrzymuje się na cudzysłowie.
  const adres = '"Anna"@example.com';
  atrapa.wywolania = [];
  atrapa.odpowiedz = (url, metoda) =>
    url === KONTAKTY && metoda === "POST"
      ? Response.json(
          { statusCode: 422, name: "validation_error", message: `Invalid contact "anna"@example.com, ${encodeURIComponent(adres)}` },
          { status: 422 },
        )
      : url.startsWith(`${KONTAKTY}/`)
        ? Response.json({ statusCode: 404, name: "not_found", message: "Contact not found" }, { status: 404 })
        : Response.json({ id: "atrapa" });
  const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: adres }), srodowisko()));

  expect(odpowiedz.status).toBe(502);
  expect(wpisy).toHaveLength(1);
  expect(wpisy[0]).toContain("validation_error");
  expect(wpisy[0]).toContain("<adres>");
  expect(wpisy[0].toLowerCase()).not.toContain('"anna"');
  expect(wpisy[0].toLowerCase()).not.toContain(encodeURIComponent(adres).toLowerCase());
  bezSekretow(wpisy[0]);
});

test("funkcja zapisu — wyjątek sieci przy Resend daje 502 i jeden wpis logu z rodzajem błędu", async () => {
  for (const [zla, sciezka] of [
    [KONTAKTY, "/contacts"],
    [EMAILE, "/emails"],
  ] as const) {
    atrapa.wywolania = [];
    atrapa.odpowiedz = (url) => {
      if (url === zla) throw new TypeError("atrapa: brak sieci do anna@example.com z kluczem klucz-atrapy");
      return Response.json({ id: "atrapa" });
    };
    const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));

    expect(odpowiedz.status, sciezka).toBe(502);
    expect(wpisy, sciezka).toHaveLength(1);
    expect(wpisy[0]).toContain(sciezka);
    expect(wpisy[0]).toContain("TypeError");
    bezSekretow(wpisy[0]);
  }
  // Wyjątek na `POST /contacts` nie prowadzi do `GET /contacts/{adres}`.
  atrapa.wywolania = [];
  atrapa.odpowiedz = (url) => {
    if (url === KONTAKTY) throw new TypeError("atrapa: brak sieci");
    return Response.json({ id: "atrapa" });
  };
  await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));
  expect(atrapa.wywolania.map((w) => `${w.metoda} ${w.url}`)).toEqual([`POST ${KONTAKTY}`]);
});

test("funkcja zapisu — ponowny zapis istniejącego kontaktu wysyła e-mail i daje 200", async () => {
  for (const status of [409, 422]) {
    atrapa.wywolania = [];
    atrapa.odpowiedz = (url, metoda) => {
      if (url === KONTAKTY && metoda === "POST")
        return Response.json(
          { statusCode: status, name: "already_exists", message: "Contact already exists" },
          { status },
        );
      if (url === KONTAKT_ADRESU && metoda === "GET")
        return Response.json({ object: "contact", id: "kontakt-atrapy", email: "Anna@Example.com" });
      return Response.json({ id: "atrapa" });
    };
    const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));

    expect(odpowiedz.status, String(status)).toBe(200);
    expect(await odpowiedz.json()).toEqual({ ok: true });
    expect(atrapa.wywolania.map((w) => `${w.metoda} ${w.url}`)).toEqual([
      `POST ${KONTAKTY}`,
      `GET ${KONTAKT_ADRESU}`,
      `POST ${EMAILE}`,
    ]);
    expect(atrapa.wywolania[2].tresc.to).toEqual(["wlasciciel@example.com"]);
    expect(wpisy).toEqual([]);
  }

  // Kontakt o innym adresie nie jest istniejącym kontaktem: 502 i jeden wpis.
  atrapa.wywolania = [];
  atrapa.odpowiedz = (url, metoda) => {
    if (url === KONTAKTY && metoda === "POST")
      return Response.json(
        { statusCode: 409, name: "already_exists", message: "Contact already exists" },
        { status: 409 },
      );
    if (url === KONTAKT_ADRESU) return Response.json({ object: "contact", id: "inny", email: "ktos@example.com" });
    return Response.json({ id: "atrapa" });
  };
  const { wynik: odpowiedz, wpisy } = await zWpisami(() => funkcja.fetch(zapis({ email: ADRES }), srodowisko()));
  expect(odpowiedz.status).toBe(502);
  expect(wpisy).toHaveLength(1);
  expect(wpisy[0]).toContain("/contacts");
  expect(wpisy[0]).toContain("409");
  bezSekretow(wpisy[0]);
  expect(atrapa.wywolania.map((w) => `${w.metoda} ${w.url}`)).not.toContain(`POST ${EMAILE}`);
});

test("funkcja zapisu — oba wywołania Resend mają nagłówek User-Agent", async () => {
  const odpowiedz = await funkcja.fetch(zapis({ email: ADRES, website: "" }), srodowisko());

  expect(odpowiedz.status).toBe(200);
  expect(atrapa.wywolania).toHaveLength(2);
  for (const w of atrapa.wywolania) expect(w.naglowki.get("User-Agent"), w.url).toBe("maestro-waitlist/1.0");
});
