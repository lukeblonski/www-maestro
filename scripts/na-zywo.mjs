// node scripts/na-zywo.mjs — ścieżka na żywo `zapis-na-liste` (CLAUDE.md, „## Sprawdzenie na żywo”).
// Uruchamia go tylko skrypt autopilota, w świeżym worktree, bez powłoki; kroki agenta go nie uruchamiają,
// a test `tests/repo/na-zywo.spec.ts` biegnie na atrapie Resend (`tests/repo/atrapa-resend.mjs`, `node --import`).
//
// - Wejście: PORT, NA_ZYWO_ADRES (http://127.0.0.1:<PORT>), NA_ZYWO_WYNIK (plik wyniku), NA_ZYWO_SCIEZKA.
//   Z folderu roboczego czyta CLAUDE.md (ścieżki klucza Resend i adresu właściciela z „## Dostępy”) i
//   context/foundation/start.md (stan końcowy z „## Ścieżki na żywo”).
// - Kroki: (1) diagnostyka: `POST /contacts` przez `node:https` bez nagłówka `User-Agent`, jak funkcja w Workers
//   przed poprawką; (2) obserwator wywołań funkcji do Resend (odpowiedzi bez zmian); (3) funkcja z `worker/index.ts`
//   na 127.0.0.1:<PORT>; (4) zapis adresem właściciela z `Origin` strony; (5) kontakt w Resend; (6) stan e-maila.
// - Wynik: plik NA_ZYWO_WYNIK (sciezka, adres, atrapy, uslugi, stan_koncowy, dowod, wynik, powod) i na stdout
//   jedna linia na każde wywołanie Resend oraz końcowa linia `wynik: <wynik> — <powod>`. Kod 0 tylko przy `przeszło`.
//   `zablokowane` tylko przy odmowie Resend za kluczem albo kontem; brak pliku, linii albo wartości to `nie przeszło`.
// - Każdy wypisany i zapisany tekst przechodzi przez `scrub()`: bez klucza, adresu właściciela i innych adresów e-mail.

import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { format } from "node:util";

const PRZESZLO = "przeszło";
const NIE_PRZESZLO = "nie przeszło";
const ZABLOKOWANE = "zablokowane";

const SCIEZKA = "zapis-na-liste";
const ORIGIN_STRONY = "https://lukeblonski.github.io";
const RESEND_HOST = "api.resend.com";
const RESEND = `https://${RESEND_HOST}`;
const USER_AGENT = "maestro-waitlist/1.0";
const LINIA_KLUCZA = "klucz API Resend";
const LINIA_WLASCICIELA = "adres e-mail właściciela";
const ODPYTYWANIE_CO_MS = 3_000;
const ODPYTYWANIE_DO_MS = 90_000;
const LIMIT_ZADANIA_MS = 30_000;
const LIMIT_SKRYPTU_MS = 10 * 60_000;
const NAJDLUZSZA_TRESC = 300;
// Adres e-mail w dowolnym tekście, także zakodowany w adresie URL (`%40`), jak w `worker/index.ts`.
const WZORZEC_ADRESU_W_TEKSCIE = /[^\s@"'<>()[\]{},;:]+(?:@|%40)[^\s@"'<>()[\]{},;:/?#&]+/gi;

const sciezka = process.env.NA_ZYWO_SCIEZKA || SCIEZKA;
const port = Number(process.env.PORT || 8787);
const adres = process.env.NA_ZYWO_ADRES || `http://127.0.0.1:${port}`;
const plikWyniku = process.env.NA_ZYWO_WYNIK || "";

let klucz = "";
let wlasciciel = "";
let stanKoncowy = "";
let serwer = null;
let zakonczone = false;
const dowod = [];

const doWzorca = (tekst) => tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function scrub(tekst) {
  let wynik = String(tekst ?? "");
  if (klucz) wynik = wynik.split(klucz).join("<klucz>");
  for (const forma of new Set([wlasciciel, encodeURIComponent(wlasciciel)])) {
    if (forma) wynik = wynik.replace(new RegExp(doWzorca(forma), "gi"), "<adres>");
  }
  return wynik.replace(WZORZEC_ADRESU_W_TEKSCIE, "<adres>");
}

// Wszystko, co proces wypisuje przez `console` (także wpisy `console.error` funkcji), idzie przez `scrub()`.
for (const nazwa of ["log", "info", "warn", "error"]) {
  const pierwotna = console[nazwa].bind(console);
  console[nazwa] = (...argumenty) => pierwotna(scrub(format(...argumenty)));
}

function finish(wynik, powod) {
  if (zakonczone) return;
  zakonczone = true;
  if (serwer) {
    serwer.closeAllConnections?.();
    serwer.close();
    serwer = null;
  }
  const atrapy = Array.isArray(globalThis.ATRAPY_NA_ZYWO) ? globalThis.ATRAPY_NA_ZYWO.map(String) : [];
  const tresc = {
    sciezka,
    adres,
    atrapy,
    uslugi: [RESEND_HOST],
    stan_koncowy: wynik === PRZESZLO ? stanKoncowy : "",
    dowod: scrub(dowod.length ? dowod.join("\n") : "brak dowodu: przebieg skończył się przed pierwszym wywołaniem"),
    wynik,
    powod: scrub(powod),
  };
  if (plikWyniku) {
    try {
      fs.mkdirSync(path.dirname(plikWyniku), { recursive: true });
      fs.writeFileSync(plikWyniku, `${JSON.stringify(tresc, null, 2)}\n`);
    } catch (blad) {
      console.error(`nie da się zapisać pliku wyniku NA_ZYWO_WYNIK: ${nazwaBledu(blad)}`);
    }
  } else {
    console.error("brak zmiennej NA_ZYWO_WYNIK: plik wyniku nie powstał");
  }
  console.log(`wynik: ${wynik} — ${powod}`);
  process.exit(wynik === PRZESZLO && plikWyniku ? 0 : 1);
}

for (const sygnal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sygnal, () => finish(NIE_PRZESZLO, `przerwane sygnałem ${sygnal}`));
}
process.on("uncaughtException", (blad) => finish(NIE_PRZESZLO, `błąd skryptu: ${nazwaBledu(blad)} ${blad?.message ?? ""}`));
process.on("unhandledRejection", (blad) => finish(NIE_PRZESZLO, `błąd skryptu: ${nazwaBledu(blad)} ${String(blad?.message ?? blad)}`));
setTimeout(() => finish(NIE_PRZESZLO, `przekroczony limit czasu skryptu ${LIMIT_SKRYPTU_MS / 60_000} min`), LIMIT_SKRYPTU_MS).unref();

function nazwaBledu(blad) {
  if (!(blad instanceof Error)) return typeof blad;
  const kod = blad.code ?? blad.cause?.code;
  return kod ? `${blad.name} ${kod}` : blad.name;
}

// Linie `- <nazwa>: <wartość>` sekcji `naglowek` (do następnego `## `).
function linieSekcji(tekst, naglowek) {
  const linie = [];
  let wSekcji = false;
  for (const linia of tekst.split(/\r?\n/)) {
    if (linia.startsWith("## ")) {
      wSekcji = linia.trim() === naglowek;
      continue;
    }
    if (wSekcji && linia.startsWith("- ")) linie.push(linia);
  }
  return linie;
}

function wartoscLinii(linie, nazwa) {
  for (const linia of linie) {
    const dwukropek = linia.indexOf(":");
    if (dwukropek > 2 && linia.slice(2, dwukropek).trim() === nazwa) return linia.slice(dwukropek + 1).trim();
  }
  return undefined;
}

function czytaj(plik) {
  try {
    return fs.readFileSync(plik, "utf8");
  } catch {
    return undefined;
  }
}

// Wartość pliku z linii `nazwa` w „## Dostępy” albo powód braku, bez treści pliku.
function dostep(claude, nazwa) {
  const sciezkaPliku = wartoscLinii(linieSekcji(claude, "## Dostępy"), nazwa)?.replace(/^`(.*)`$/, "$1").trim();
  if (!sciezkaPliku) return { brak: `brak linii „${nazwa}” ze ścieżką w ## Dostępy w CLAUDE.md` };
  const tresc = czytaj(sciezkaPliku);
  if (tresc === undefined) return { brak: `pliku z linii „${nazwa}” w ## Dostępy nie da się odczytać` };
  const wartosc = tresc.trim();
  return wartosc ? { wartosc } : { brak: `plik z linii „${nazwa}” w ## Dostępy jest pusty` };
}

function stanKoncowyZeStartu(start) {
  const linia = linieSekcji(start, "## Ścieżki na żywo").find((tekst) => tekst.slice(2).split(":")[0].trim() === SCIEZKA);
  if (!linia) return undefined;
  for (const pole of linia.slice(linia.indexOf(":") + 1).split(" · ")) {
    const dwukropek = pole.indexOf(":");
    if (dwukropek > 0 && pole.slice(0, dwukropek).trim() === "stan końcowy") return pole.slice(dwukropek + 1).trim();
  }
  return undefined;
}

// Odpowiedź HTTP: status, treść JSON (`dane`, null, gdy to nie JSON) i tekst.
function wynikHttp(status, tekst) {
  let dane = null;
  try {
    dane = JSON.parse(tekst);
  } catch {
    dane = null;
  }
  return { status, dane: typeof dane === "object" ? dane : null, tekst };
}

// Krótki opis wyniku wywołania: status i `name: message` Resend albo początek treści, gdy to nie JSON.
function opis(wynik) {
  if (wynik.blad) return `błąd sieci ${wynik.blad}`;
  if (wynik.dane) {
    const { name, message } = wynik.dane;
    if (typeof name === "string" || typeof message === "string") return `${wynik.status} ${name ?? ""}: ${message ?? ""}`;
    return String(wynik.status);
  }
  const poczatek = wynik.tekst.replace(/\s+/g, " ").trim().slice(0, NAJDLUZSZA_TRESC);
  return poczatek ? `${wynik.status} ${poczatek}` : String(wynik.status);
}

// Ścieżka wywołania bez adresu: `/contacts/<adres>` zamiast `/contacts/{email}`.
const sciezkaBezAdresu = (sciezkaUrl) => sciezkaUrl.replace(/^\/contacts\/.+$/, "/contacts/<adres>");

const udane = (wynik) => !wynik.blad && wynik.status >= 200 && wynik.status <= 299;

// Odmowa za kluczem albo kontem (działanie człowieka w panelu Resend): 401, 403 albo 429 z JSON Resend (`name`)
// i 400 z `message` o kluczu API. 403 bez JSON (Cloudflare 1010) to błąd kodu, nie odmowa Resend.
function odmowaResend(wynik) {
  if (wynik.blad || !wynik.dane) return false;
  if ([401, 403, 429].includes(wynik.status) && typeof wynik.dane.name === "string") return true;
  return wynik.status === 400 && typeof wynik.dane.message === "string" && /api key/i.test(wynik.dane.message);
}

const opisOdmowy = (wywolanie) => `Resend odmówił: ${wywolanie.metoda} ${wywolanie.sciezka} ${opis(wywolanie)}`;

// (1) Diagnostyka przez `node:https`, który nie dodaje `User-Agent`: tylko `Authorization` i `Content-Type`.
function diagnostyka() {
  return new Promise((rozwiaz) => {
    const tresc = JSON.stringify({ email: wlasciciel });
    let zadanie;
    try {
      zadanie = https.request(
        {
          hostname: RESEND_HOST,
          path: "/contacts",
          method: "POST",
          headers: { Authorization: `Bearer ${klucz}`, "Content-Type": "application/json" },
          timeout: LIMIT_ZADANIA_MS,
        },
        (odpowiedz) => {
          const czesci = [];
          odpowiedz.on("data", (czesc) => czesci.push(Buffer.from(czesc)));
          odpowiedz.on("end", () => rozwiaz(wynikHttp(odpowiedz.statusCode ?? 0, Buffer.concat(czesci).toString("utf8"))));
          odpowiedz.on("error", (blad) => rozwiaz({ blad: nazwaBledu(blad) }));
        },
      );
    } catch (blad) {
      rozwiaz({ blad: nazwaBledu(blad) });
      return;
    }
    zadanie.on("timeout", () => zadanie.destroy(Object.assign(new Error("limit czasu"), { code: "ETIMEDOUT" })));
    zadanie.on("error", (blad) => rozwiaz({ blad: nazwaBledu(blad) }));
    zadanie.end(tresc);
  });
}

async function glowny() {
  const claude = czytaj(path.join(process.cwd(), "CLAUDE.md"));
  if (claude === undefined) return finish(NIE_PRZESZLO, "brak CLAUDE.md w folderze roboczym");
  const zKlucza = dostep(claude, LINIA_KLUCZA);
  if (zKlucza.brak) return finish(NIE_PRZESZLO, zKlucza.brak);
  klucz = zKlucza.wartosc;
  const zWlasciciela = dostep(claude, LINIA_WLASCICIELA);
  if (zWlasciciela.brak) return finish(NIE_PRZESZLO, zWlasciciela.brak);
  wlasciciel = zWlasciciela.wartosc;

  const start = czytaj(path.join(process.cwd(), "context", "foundation", "start.md"));
  if (start === undefined) return finish(NIE_PRZESZLO, "brak context/foundation/start.md w folderze roboczym");
  stanKoncowy = stanKoncowyZeStartu(start) ?? "";
  if (!stanKoncowy) {
    return finish(NIE_PRZESZLO, `brak stanu końcowego linii „${SCIEZKA}” w ## Ścieżki na żywo w context/foundation/start.md`);
  }
  if (sciezka !== SCIEZKA) return finish(NIE_PRZESZLO, `skrypt zna tylko ścieżkę ${SCIEZKA}, a NA_ZYWO_SCIEZKA to ${sciezka}`);
  if (!plikWyniku) return finish(NIE_PRZESZLO, "brak zmiennej NA_ZYWO_WYNIK");
  if (!Number.isInteger(port) || port <= 0) return finish(NIE_PRZESZLO, `zły port w zmiennej PORT: ${process.env.PORT}`);
  // `worker/index.ts` ładuje się bez zależności tylko w Node z obsługą typów (mise.toml: Node 22, od 22.18).
  if (!process.features?.typescript) {
    return finish(NIE_PRZESZLO, `Node ${process.version} nie ładuje plików .ts (process.features.typescript); potrzebny Node z mise.toml`);
  }

  // (1) Diagnostyka przed zapisem: gdy utworzy kontakt, zapis funkcji sprawdza ponowny zapis (N3).
  const wynikDiagnostyki = await diagnostyka();
  const liniaDiagnostyki = `diagnostyka (jak w Workers, bez User-Agent): POST /contacts ${opis(wynikDiagnostyki)}`;
  console.log(liniaDiagnostyki);
  dowod.push(liniaDiagnostyki);

  // (2) Obserwator wywołań funkcji do Resend: przepuszcza żądanie i odpowiedź bez zmian, zapisuje klon.
  const fetchBezObserwatora = globalThis.fetch;
  const wywolania = [];
  globalThis.fetch = async (wejscie, init) => {
    const url = new URL(wejscie instanceof Request ? wejscie.url : String(wejscie));
    if (url.hostname !== RESEND_HOST) return fetchBezObserwatora(wejscie, init);
    const wywolanie = {
      metoda: String(init?.method ?? (wejscie instanceof Request ? wejscie.method : "GET")).toUpperCase(),
      sciezka: sciezkaBezAdresu(url.pathname),
    };
    wywolania.push(wywolanie);
    try {
      const odpowiedz = await fetchBezObserwatora(wejscie, init);
      Object.assign(wywolanie, wynikHttp(odpowiedz.status, await odpowiedz.clone().text()));
      return odpowiedz;
    } catch (blad) {
      wywolanie.blad = nazwaBledu(blad);
      throw blad;
    } finally {
      const linia = `funkcja → Resend: ${wywolanie.metoda} ${wywolanie.sciezka} ${opis(wywolanie)}`;
      console.log(linia);
      dowod.push(linia);
    }
  };

  // (3) Funkcja z `worker/index.ts` na 127.0.0.1:<PORT>, z limitem zapisów na pamięci (`Map`).
  const { default: funkcja, LimitZapisow } = await import("../worker/index.ts");
  const obiekty = new Map();
  const stanNaMapie = () => {
    const pamiec = new Map();
    return {
      storage: {
        get: async (nazwa) => pamiec.get(nazwa),
        put: async (nazwa, wartosc) => void pamiec.set(nazwa, wartosc),
      },
    };
  };
  const env = {
    RESEND_API_KEY: klucz,
    OWNER_EMAIL: wlasciciel,
    LIMIT: {
      idFromName: (nazwa) => nazwa,
      get: (id) => {
        const nazwa = String(id);
        if (!obiekty.has(nazwa)) obiekty.set(nazwa, new LimitZapisow(stanNaMapie(), {}));
        const obiekt = obiekty.get(nazwa);
        return { fetch: (adresLimitu) => obiekt.fetch(new Request(adresLimitu)) };
      },
    },
  };
  const POMIJANE_NAGLOWKI = new Set(["host", "connection", "content-length", "transfer-encoding", "keep-alive"]);
  serwer = http.createServer(async (zadanie, odpowiedz) => {
    try {
      const czesci = [];
      for await (const czesc of zadanie) czesci.push(czesc);
      const naglowki = new Headers();
      for (const [nazwa, wartosc] of Object.entries(zadanie.headers)) {
        if (wartosc !== undefined && !POMIJANE_NAGLOWKI.has(nazwa)) {
          naglowki.set(nazwa, Array.isArray(wartosc) ? wartosc.join(", ") : wartosc);
        }
      }
      const metoda = zadanie.method ?? "GET";
      const request = new Request(`http://127.0.0.1:${port}${zadanie.url ?? "/"}`, {
        method: metoda,
        headers: naglowki,
        body: metoda === "GET" || metoda === "HEAD" ? undefined : Buffer.concat(czesci),
      });
      const wynik = await funkcja.fetch(request, env);
      odpowiedz.writeHead(wynik.status, Object.fromEntries(wynik.headers));
      odpowiedz.end(Buffer.from(await wynik.arrayBuffer()));
    } catch (blad) {
      console.error(`błąd instancji funkcji: ${nazwaBledu(blad)}`);
      odpowiedz.writeHead(500);
      odpowiedz.end();
    }
  });
  await new Promise((rozwiaz, odrzuc) => {
    serwer.once("error", odrzuc);
    serwer.listen(port, "127.0.0.1", rozwiaz);
  });

  // (4) Jeden zapis adresem właściciela z `Origin` strony.
  let status;
  let tekst;
  try {
    const wynikZapisu = await fetchBezObserwatora(adres, {
      method: "POST",
      headers: { Origin: ORIGIN_STRONY, "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ email: wlasciciel, website: "" }),
      signal: AbortSignal.timeout(LIMIT_ZADANIA_MS * 3),
    });
    status = wynikZapisu.status;
    tekst = await wynikZapisu.text();
  } catch (blad) {
    return finish(NIE_PRZESZLO, `zapis na ${adres} nie dostał odpowiedzi funkcji: ${nazwaBledu(blad)}`);
  }
  const liniaZapisu = `funkcja odpowiedziała: ${status} ${tekst.replace(/\s+/g, " ").trim().slice(0, NAJDLUZSZA_TRESC)}`;
  console.log(liniaZapisu);
  dowod.push(liniaZapisu);
  let sukces = false;
  try {
    sukces = status === 200 && JSON.parse(tekst)?.ok === true;
  } catch {
    sukces = false;
  }
  if (!sukces) {
    // Wywołanie, przez które funkcja odmówiła: ostatnie nieudane poza sprawdzeniem istniejącego kontaktu.
    const nieudane = wywolania.filter((wywolanie) => !udane(wywolanie));
    const przyczyna =
      nieudane.filter((wywolanie) => !(wywolanie.metoda === "GET" && wywolanie.sciezka.startsWith("/contacts/"))).at(-1) ??
      nieudane.at(-1);
    if (przyczyna && odmowaResend(przyczyna)) return finish(ZABLOKOWANE, opisOdmowy(przyczyna));
    const zResend = przyczyna
      ? przyczyna.blad
        ? `Resend niedostępny: ${przyczyna.metoda} ${przyczyna.sciezka} ${przyczyna.blad}`
        : opisOdmowy(przyczyna)
      : "bez nieudanego wywołania Resend";
    return finish(NIE_PRZESZLO, `funkcja odpowiedziała ${status} zamiast 200 {"ok":true}; ${zResend}`);
  }

  // Własne zapytania skryptu do Resend, z `User-Agent`, poza obserwatorem.
  const resend = async (sciezkaResend) => {
    const wywolanie = { metoda: "GET", sciezka: sciezkaBezAdresu(sciezkaResend.split("?")[0]) };
    try {
      const wynik = await fetchBezObserwatora(`${RESEND}${sciezkaResend}`, {
        headers: { Authorization: `Bearer ${klucz}`, "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(LIMIT_ZADANIA_MS),
      });
      Object.assign(wywolanie, wynikHttp(wynik.status, await wynik.text()));
    } catch (blad) {
      wywolanie.blad = nazwaBledu(blad);
    }
    return wywolanie;
  };

  // (5) Kontakt z adresem właściciela w Resend.
  const kontakt = await resend(`/contacts/${encodeURIComponent(wlasciciel)}`);
  const emailKontaktu = typeof kontakt.dane?.email === "string" ? kontakt.dane.email : "";
  const jestKontakt = kontakt.status === 200 && emailKontaktu.toLowerCase() === wlasciciel.toLowerCase();
  const liniaKontaktu = `kontakt w Resend: GET ${kontakt.sciezka} ${opis(kontakt)}${jestKontakt ? " — kontakt z adresem właściciela jest" : ""}`;
  console.log(liniaKontaktu);
  dowod.push(liniaKontaktu);
  if (odmowaResend(kontakt)) return finish(ZABLOKOWANE, opisOdmowy(kontakt));
  if (!jestKontakt) return finish(NIE_PRZESZLO, `Resend nie ma kontaktu z adresem właściciela (GET ${kontakt.sciezka} ${opis(kontakt)})`);

  // (6) Stan e-maila do właściciela: `id` z odpowiedzi Resend na `POST /emails` funkcji.
  const wyslany = wywolania.filter((wywolanie) => wywolanie.metoda === "POST" && wywolanie.sciezka === "/emails" && udane(wywolanie)).at(-1);
  const id = typeof wyslany?.dane?.id === "string" ? wyslany.dane.id : "";
  if (!id) return finish(NIE_PRZESZLO, "funkcja odpowiedziała 200, ale obserwator nie widział udanego POST /emails z id");
  const koniec = Date.now() + ODPYTYWANIE_DO_MS;
  for (;;) {
    const email = await resend(`/emails/${encodeURIComponent(id)}`);
    const zdarzenie = typeof email.dane?.last_event === "string" ? email.dane.last_event : "";
    const liniaEmaila = `e-mail w Resend: GET ${email.sciezka} ${opis(email)} last_event=${zdarzenie || "brak"}`;
    console.log(liniaEmaila);
    if (odmowaResend(email)) {
      dowod.push(liniaEmaila);
      return finish(ZABLOKOWANE, opisOdmowy(email));
    }
    if (zdarzenie === "sent" || zdarzenie === "delivered") {
      dowod.push(liniaEmaila);
      break;
    }
    if (zdarzenie === "bounced" || zdarzenie === "failed") {
      dowod.push(liniaEmaila);
      return finish(ZABLOKOWANE, `e-mail do właściciela ma w Resend stan ${zdarzenie} (GET ${email.sciezka})`);
    }
    if (Date.now() + ODPYTYWANIE_CO_MS > koniec) {
      dowod.push(liniaEmaila);
      return finish(NIE_PRZESZLO, `e-mail do właściciela nie ma w Resend stanu sent ani delivered po ${ODPYTYWANIE_DO_MS / 1000} s (ostatni: ${zdarzenie || "brak"})`);
    }
    await new Promise((rozwiaz) => setTimeout(rozwiaz, ODPYTYWANIE_CO_MS));
  }

  return finish(PRZESZLO, "stan końcowy osiągnięty: funkcja 200 {\"ok\":true}, kontakt w Resend, e-mail wysłany albo dostarczony");
}

glowny().catch((blad) => finish(NIE_PRZESZLO, `błąd skryptu: ${nazwaBledu(blad)} ${blad?.message ?? ""}`));
