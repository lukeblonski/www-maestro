// Funkcja zapisu na listę oczekujących (Cloudflare Workers).
//
// Przyjmuje jedno żądanie POST ze strony (treść: JSON `{ email, website }` jako napis),
// sprawdza po kolei: metodę, `Origin` strony, treść JSON, pole-pułapkę `website`,
// format adresu, ustawienia funkcji, limit zapisów z jednego IP (5 na minutę i 10 na dobę)
// i wspólny dobowy limit wszystkich zapisów (90, poniżej 100 e-maili dziennie Resend Free),
// oba w obiektach `LimitZapisow`.
// Dopiero potem dodaje adres do kontaktów Resend i wysyła właścicielowi e-mail.
// Klucz Resend i adres odbiorcy pochodzą tylko z sekretów funkcji (`env`), nigdy z kodu.
//
// Plik nie importuje `cloudflare:workers`, bo testy (`tests/repo/funkcja-zapisu.spec.ts`)
// uruchamiają go w Node; typy wiązań Cloudflare są więc zdefiniowane tutaj.

const ORIGIN_STRONY = "https://lukeblonski.github.io";
// Ten sam wzorzec sprawdza formularz strony (`lib/waitlist.ts`).
const WZORZEC_ADRESU = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAJDLUZSZY_ADRES = 254;
const MINUTA_MS = 60_000;
const DOBA_MS = 86_400_000;
const LIMIT_ZAPISOW = 5;
const LIMIT_ZAPISOW_DOBA_IP = 10;
const LIMIT_ZAPISOW_DOBA_WSZYSTKIE = 90;
const KLUCZ_BEZ_IP = "brak-ip";
const KLUCZ_WSZYSTKICH = "wszystkie-zapisy";
const RESEND = "https://api.resend.com";
const NADAWCA = "Maestro waitlist <onboarding@resend.dev>";
const TEMAT = "New sign-up on the Maestro waiting list";

export interface IdObiektuLimitu {
  toString(): string;
}

export interface ObiektLimitu {
  fetch(adres: string): Promise<Response>;
}

export interface PrzestrzenLimitu {
  idFromName(nazwa: string): IdObiektuLimitu;
  get(id: IdObiektuLimitu): ObiektLimitu;
}

export interface StanObiektuLimitu {
  storage: {
    get<T>(klucz: string): Promise<T | undefined>;
    put<T>(klucz: string, wartosc: T): Promise<void>;
  };
}

export type Env = {
  RESEND_API_KEY: string;
  OWNER_EMAIL: string;
  LIMIT: PrzestrzenLimitu;
};

// Durable Object: znaczniki czasu zapisów z ostatniej doby dla jednego klucza.
// Limity podaje adres wywołania: `?minuta=<n>` (zapisy w 60 s) i `?doba=<n>` (zapisy w 24 h);
// bez parametrów działa tylko limit 5 zapisów na minutę.
export class LimitZapisow {
  private readonly stan: StanObiektuLimitu;

  constructor(stan: StanObiektuLimitu, _env?: unknown) {
    this.stan = stan;
  }

  async fetch(zadanie?: Request): Promise<Response> {
    const parametry = new URL(zadanie?.url ?? "https://limit/").searchParams;
    const bezLimitow = !parametry.has("minuta") && !parametry.has("doba");
    const naMinute = parametry.has("minuta")
      ? Number(parametry.get("minuta"))
      : bezLimitow
        ? LIMIT_ZAPISOW
        : Infinity;
    const naDobe = parametry.has("doba") ? Number(parametry.get("doba")) : Infinity;
    const teraz = Date.now();
    const zapisy = ((await this.stan.storage.get<number[]>("zapisy")) ?? []).filter(
      (czas) => teraz - czas < DOBA_MS,
    );
    const wMinucie = zapisy.filter((czas) => teraz - czas < MINUTA_MS).length;
    // Odmowa niczego nie zapisuje, więc nadmiar żądań nie kosztuje zapisów do storage.
    if (wMinucie >= naMinute || zapisy.length >= naDobe) return new Response(null, { status: 429 });
    zapisy.push(teraz);
    await this.stan.storage.put("zapisy", zapisy);
    return new Response(null, { status: 200 });
  }
}

// Wywołanie obiektu limitu; wyjątek obiektu daje 500, żeby odpowiedź miała nagłówki CORS.
async function sprawdzLimit(env: Env, klucz: string, adres: string): Promise<number> {
  try {
    return (await env.LIMIT.get(env.LIMIT.idFromName(klucz)).fetch(adres)).status;
  } catch {
    return 500;
  }
}

// Grupy adresu IPv6 po rozwinięciu „::” (8 grup), albo null, gdy adres jest nieczytelny.
function grupyIPv6(adres: string): string[] | null {
  const czesci = adres.toLowerCase().split("::");
  if (czesci.length > 2) return null;
  const naGrupy = (tekst: string): string[] | null => {
    if (tekst === "") return [];
    const grupy: string[] = [];
    for (const kawalek of tekst.split(":")) {
      if (kawalek.includes(".")) {
        // Końcówka IPv4 (np. ::ffff:192.0.2.1) to dwie grupy.
        const bajty = kawalek.split(".").map(Number);
        if (bajty.length !== 4 || bajty.some((b) => !Number.isInteger(b) || b < 0 || b > 255)) return null;
        grupy.push(((bajty[0] << 8) | bajty[1]).toString(16), ((bajty[2] << 8) | bajty[3]).toString(16));
      } else {
        if (!/^[0-9a-f]{1,4}$/.test(kawalek)) return null;
        grupy.push(parseInt(kawalek, 16).toString(16));
      }
    }
    return grupy;
  };
  const poczatek = naGrupy(czesci[0]);
  const koniec = czesci.length === 2 ? naGrupy(czesci[1]) : [];
  if (!poczatek || !koniec) return null;
  if (czesci.length === 1) return poczatek.length === 8 ? poczatek : null;
  const brakujace = 8 - poczatek.length - koniec.length;
  if (brakujace < 1) return null;
  return [...poczatek, ...Array<string>(brakujace).fill("0"), ...koniec];
}

// Klucz limitu: sieć /64 dla IPv6, pełny adres dla IPv4 (także zapisanego jako IPv6
// `::ffff:a.b.c.d`), wspólny klucz bez nagłówka.
export function kluczLimitu(ip: string | null): string {
  const adres = ip?.trim() ?? "";
  if (adres === "") return KLUCZ_BEZ_IP;
  if (!adres.includes(":")) return adres;
  const grupy = grupyIPv6(adres);
  if (!grupy) return adres.toLowerCase();
  if (grupy.slice(0, 5).every((g) => g === "0") && grupy[5] === "ffff") {
    const [gora, dol] = [parseInt(grupy[6], 16), parseInt(grupy[7], 16)];
    return [gora >> 8, gora & 255, dol >> 8, dol & 255].join(".");
  }
  return grupy.slice(0, 4).join(":");
}

function odpowiedz(status: number, ok: boolean, cors: Record<string, string>): Response {
  return new Response(JSON.stringify({ ok }), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

async function wywolajResend(sciezka: string, klucz: string, tresc: unknown): Promise<boolean> {
  try {
    const wynik = await fetch(`${RESEND}${sciezka}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${klucz}`, "Content-Type": "application/json" },
      body: JSON.stringify(tresc),
    });
    return wynik.ok;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors: Record<string, string> =
      origin === ORIGIN_STRONY ? { "Access-Control-Allow-Origin": ORIGIN_STRONY, Vary: "Origin" } : {};

    if (request.method !== "POST") return odpowiedz(405, false, cors);
    if (origin !== ORIGIN_STRONY) return odpowiedz(403, false, cors);

    let dane: unknown;
    try {
      dane = JSON.parse(await request.text());
    } catch {
      return odpowiedz(400, false, cors);
    }
    if (typeof dane !== "object" || dane === null || Array.isArray(dane)) return odpowiedz(400, false, cors);
    const { email, website } = dane as { email?: unknown; website?: unknown };

    // Pole-pułapka: wypełnia je tylko bot; dostaje odpowiedź jak sukces, bez zapisu.
    if (website !== undefined && website !== null && String(website) !== "") return odpowiedz(200, true, cors);

    const adres = typeof email === "string" ? email.trim() : "";
    if (adres.length > NAJDLUZSZY_ADRES || !WZORZEC_ADRESU.test(adres)) return odpowiedz(400, false, cors);

    if (!env.RESEND_API_KEY || !env.OWNER_EMAIL) return odpowiedz(500, false, cors);

    // Najpierw limit z jednego IP, potem wspólny limit doby: odmowa z jednego IP
    // nie zużywa wspólnego limitu.
    const klucz = kluczLimitu(request.headers.get("CF-Connecting-IP"));
    const limity: [string, string][] = [
      [klucz, `https://limit/?minuta=${LIMIT_ZAPISOW}&doba=${LIMIT_ZAPISOW_DOBA_IP}`],
      [KLUCZ_WSZYSTKICH, `https://limit/?doba=${LIMIT_ZAPISOW_DOBA_WSZYSTKIE}`],
    ];
    for (const [nazwa, adresLimitu] of limity) {
      const status = await sprawdzLimit(env, nazwa, adresLimitu);
      if (status === 429) return odpowiedz(429, false, cors);
      if (status < 200 || status > 299) return odpowiedz(500, false, cors);
    }

    const kontakt = await wywolajResend("/contacts", env.RESEND_API_KEY, { email: adres });
    if (!kontakt) return odpowiedz(502, false, cors);

    const powiadomienie = await wywolajResend("/emails", env.RESEND_API_KEY, {
      from: NADAWCA,
      to: [env.OWNER_EMAIL],
      subject: TEMAT,
      text: `Email: ${adres}`,
    });
    if (!powiadomienie) return odpowiedz(502, false, cors);

    return odpowiedz(200, true, cors);
  },
};
