// Funkcja zapisu na listę oczekujących (Cloudflare Workers).
//
// Przyjmuje jedno żądanie POST ze strony (treść: JSON `{ email, website }` jako napis),
// sprawdza po kolei: metodę, `Origin` strony, treść JSON, pole-pułapkę `website`,
// format adresu, ustawienia funkcji, limit zapisów z jednego IP (5 na minutę i 10 na dobę)
// i wspólny dobowy limit wszystkich zapisów (90, poniżej 100 e-maili dziennie Resend Free),
// oba w obiektach `LimitZapisow`.
// Dopiero potem dodaje adres do kontaktów Resend i wysyła właścicielowi e-mail.
// Gdy Resend odmówi dodania kontaktu, funkcja pyta o kontakt z tym adresem: istniejący
// kontakt (ponowny zapis) nie jest niepowodzeniem i e-mail idzie dalej.
// Każda odmowa Resend i każdy wyjątek sieci przy wywołaniu Resend zostawia jeden wpis
// `console.error` (Workers Logs) ze ścieżką, statusem i błędem Resend, bez klucza i adresów.
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
// Resend wymaga nagłówka `User-Agent`, a workerd go sam nie dodaje (bez niego Cloudflare
// przed API Resend odpowiada 403, kod 1010).
const USER_AGENT = "maestro-waitlist/1.0";
// Adres e-mail w dowolnym tekście, także zakodowany w adresie URL (`%40`).
const WZORZEC_ADRESU_W_TEKSCIE = /[^\s@"'<>()[\]{},;:]+(?:@|%40)[^\s@"'<>()[\]{},;:/?#&]+/gi;
const NAJDLUZSZA_TRESC_W_LOGU = 300;

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

// Wynik wywołania Resend: odpowiedź HTTP (treść JSON w `dane` albo null, gdy to nie JSON)
// albo wyjątek sieci z nazwą błędu.
type WynikResend = { status: number; ok: boolean; dane: unknown; tekst: string } | { blad: string };

async function wywolajResend(metoda: string, sciezka: string, klucz: string, tresc?: unknown): Promise<WynikResend> {
  const naglowki: Record<string, string> = { Authorization: `Bearer ${klucz}`, "User-Agent": USER_AGENT };
  if (tresc !== undefined) naglowki["Content-Type"] = "application/json";
  try {
    const odpowiedzResend = await fetch(`${RESEND}${sciezka}`, {
      method: metoda,
      headers: naglowki,
      body: tresc === undefined ? undefined : JSON.stringify(tresc),
    });
    const tekst = await odpowiedzResend.text();
    let dane: unknown = null;
    try {
      dane = JSON.parse(tekst);
    } catch {
      dane = null;
    }
    return { status: odpowiedzResend.status, ok: odpowiedzResend.ok, dane, tekst };
  } catch (blad) {
    return { blad: blad instanceof Error ? blad.name : typeof blad };
  }
}

// Zastępuje dokładny klucz znacznikiem `<klucz>`, a każdy adres e-mail (z `@` albo `%40`) znacznikiem `<adres>`.
function ukryj(tekst: string, klucz: string): string {
  return tekst.split(klucz).join("<klucz>").replace(WZORZEC_ADRESU_W_TEKSCIE, "<adres>");
}

// Jedyne miejsce, które loguje niepowodzenie wywołania Resend: jeden wpis `console.error`
// ze ścieżką, statusem, `name` i `message` Resend (albo początkiem treści, gdy to nie JSON),
// bez klucza i adresów.
function zalogujOdmowe(sciezka: string, wynik: WynikResend, klucz: string): void {
  if ("blad" in wynik) {
    console.error(ukryj(`Resend niedostępny: ${sciezka} ${wynik.blad}`, klucz));
    return;
  }
  const { name, message } = (typeof wynik.dane === "object" && wynik.dane !== null ? wynik.dane : {}) as {
    name?: unknown;
    message?: unknown;
  };
  const opis =
    typeof name === "string" || typeof message === "string"
      ? `${String(name ?? "")}: ${String(message ?? "")}`
      : ukryj(wynik.tekst, klucz).replace(/\s+/g, " ").trim().slice(0, NAJDLUZSZA_TRESC_W_LOGU);
  console.error(ukryj(`Resend odmówił: ${sciezka} ${wynik.status} ${opis}`, klucz));
}

// Po nieudanym `POST /contacts`: kontakt istnieje tylko przy 200 z tym samym adresem
// (bez rozróżniania wielkości liter), bez względu na to, jak Resend odmówił dodania.
async function kontaktIstnieje(adres: string, klucz: string): Promise<boolean> {
  const wynik = await wywolajResend("GET", `/contacts/${encodeURIComponent(adres)}`, klucz);
  if ("blad" in wynik || wynik.status !== 200) return false;
  const email = (typeof wynik.dane === "object" && wynik.dane !== null ? wynik.dane : {}) as { email?: unknown };
  return typeof email.email === "string" && email.email.toLowerCase() === adres.toLowerCase();
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

    const kluczResend = env.RESEND_API_KEY;
    const kontakt = await wywolajResend("POST", "/contacts", kluczResend, { email: adres });
    if ("blad" in kontakt) {
      zalogujOdmowe("/contacts", kontakt, kluczResend);
      return odpowiedz(502, false, cors);
    }
    // Ponowny zapis: odmowa dodania istniejącego kontaktu nie jest niepowodzeniem zapisu.
    if (!kontakt.ok && !(await kontaktIstnieje(adres, kluczResend))) {
      zalogujOdmowe("/contacts", kontakt, kluczResend);
      return odpowiedz(502, false, cors);
    }

    const powiadomienie = await wywolajResend("POST", "/emails", kluczResend, {
      from: NADAWCA,
      to: [env.OWNER_EMAIL],
      subject: TEMAT,
      text: `Email: ${adres}`,
    });
    if ("blad" in powiadomienie || !powiadomienie.ok) {
      zalogujOdmowe("/emails", powiadomienie, kluczResend);
      return odpowiedz(502, false, cors);
    }

    return odpowiedz(200, true, cors);
  },
};
