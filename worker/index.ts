// Funkcja zapisu na listę oczekujących (Cloudflare Workers).
//
// Przyjmuje jedno żądanie POST ze strony (treść: JSON `{ email, website }` jako napis),
// sprawdza po kolei: metodę, `Origin` strony, treść JSON, pole-pułapkę `website`,
// format adresu, ustawienia funkcji i limit zapisów z jednego IP (obiekt `LimitZapisow`).
// Dopiero potem dodaje adres do kontaktów Resend i wysyła właścicielowi e-mail.
// Klucz Resend i adres odbiorcy pochodzą tylko z sekretów funkcji (`env`), nigdy z kodu.
//
// Plik nie importuje `cloudflare:workers`, bo testy (`tests/repo/funkcja-zapisu.spec.ts`)
// uruchamiają go w Node; typy wiązań Cloudflare są więc zdefiniowane tutaj.

const ORIGIN_STRONY = "https://lukeblonski.github.io";
// Ten sam wzorzec sprawdza formularz strony (`lib/waitlist.ts`).
const WZORZEC_ADRESU = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAJDLUZSZY_ADRES = 254;
const OKNO_LIMITU_MS = 60_000;
const LIMIT_ZAPISOW = 5;
const KLUCZ_BEZ_IP = "brak-ip";
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

// Durable Object: znaczniki czasu zapisów z ostatnich 60 s dla jednego klucza IP.
export class LimitZapisow {
  private readonly stan: StanObiektuLimitu;

  constructor(stan: StanObiektuLimitu, _env?: unknown) {
    this.stan = stan;
  }

  async fetch(_zadanie?: Request): Promise<Response> {
    const teraz = Date.now();
    const zapisy = ((await this.stan.storage.get<number[]>("zapisy")) ?? []).filter(
      (czas) => teraz - czas < OKNO_LIMITU_MS,
    );
    if (zapisy.length >= LIMIT_ZAPISOW) {
      await this.stan.storage.put("zapisy", zapisy);
      return new Response(null, { status: 429 });
    }
    zapisy.push(teraz);
    await this.stan.storage.put("zapisy", zapisy);
    return new Response(null, { status: 200 });
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

// Klucz limitu: sieć /64 dla IPv6, pełny adres dla IPv4, wspólny klucz bez nagłówka.
export function kluczLimitu(ip: string | null): string {
  const adres = ip?.trim() ?? "";
  if (adres === "") return KLUCZ_BEZ_IP;
  if (!adres.includes(":")) return adres;
  const grupy = grupyIPv6(adres);
  return grupy ? grupy.slice(0, 4).join(":") : adres.toLowerCase();
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

    const klucz = kluczLimitu(request.headers.get("CF-Connecting-IP"));
    const limit = await env.LIMIT.get(env.LIMIT.idFromName(klucz)).fetch("https://limit/");
    if (limit.status === 429) return odpowiedz(429, false, cors);
    if (!limit.ok) return odpowiedz(500, false, cors);

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
