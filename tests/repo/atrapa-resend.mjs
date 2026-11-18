// Atrapa Resend dla testu `tests/repo/na-zywo.spec.ts`, ładowana tylko w teście: `node --import <ten plik>`.
// Gra Resend dla `fetch` (https://api.resend.com/) i dla `request` z `node:https` (host api.resend.com),
// oznacza się w `globalThis.ATRAPY_NA_ZYWO` i odrzuca każdy inny host niż 127.0.0.1, więc test biegnie bez sieci.
//
// Zmienne czyta tylko atrapa, nie skrypt:
// - ATRAPA_RESEND_SCENARIUSZ: `sukces` (403 `error code: 1010` bez `User-Agent`; kontaktu nie ma, dopóki
//   `POST /contacts` z `User-Agent` go nie doda, potem e-mail i stan `delivered`), `kontakt-istnieje` (jak `sukces`,
//   ale kontakt jest od początku, a `POST /contacts` z `User-Agent` dostaje 409 „already exists”) albo
//   `klucz-tylko-wysylka` (każde `/contacts` dostaje 401 `restricted_api_key` z adresem w `message`);
// - ATRAPA_RESEND_ZAPIS: plik, do którego każde wywołanie trafia jako linia JSON (droga, metoda, ścieżka, czy był
//   `User-Agent`).

import { appendFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";
import { Readable } from "node:stream";

const SCENARIUSZ = process.env.ATRAPA_RESEND_SCENARIUSZ || "sukces";
const ZAPIS = process.env.ATRAPA_RESEND_ZAPIS || "";
const HOST = "api.resend.com";
const ID_KONTAKTU = "atrapa-kontakt";
const ID_EMAILA = "atrapa-email";

globalThis.ATRAPY_NA_ZYWO = [HOST];

let kontaktJest = SCENARIUSZ === "kontakt-istnieje";

const json = (status, dane) => ({ status, typ: "application/json", tresc: JSON.stringify(dane) });

// Adres z treści (`{"email": …}`) albo ze ścieżki `/contacts/{adres}`.
function adresZadania(sciezka, tresc) {
  try {
    const email = JSON.parse(tresc || "{}").email;
    if (typeof email === "string") return email;
  } catch {
    // treść bez JSON
  }
  const dopasowanie = /^\/contacts\/(.+)$/.exec(sciezka);
  return dopasowanie ? decodeURIComponent(dopasowanie[1]) : "brak";
}

function odpowiedzResend(droga, metoda, sciezka, maUserAgent, tresc) {
  if (ZAPIS) appendFileSync(ZAPIS, `${JSON.stringify({ droga, metoda, sciezka, userAgent: maUserAgent })}\n`);
  if (SCENARIUSZ === "klucz-tylko-wysylka" && sciezka.startsWith("/contacts")) {
    const adres = adresZadania(sciezka, tresc);
    return json(401, {
      statusCode: 401,
      name: "restricted_api_key",
      message: `This API key is restricted to only send emails (konto ${adres}, ${adres.toLowerCase()}, ${encodeURIComponent(adres)})`,
    });
  }
  if (!maUserAgent) return { status: 403, typ: "text/plain; charset=UTF-8", tresc: "error code: 1010" };
  if (metoda === "POST" && sciezka === "/contacts") {
    if (kontaktJest) return json(409, { statusCode: 409, name: "conflict", message: "Contact already exists" });
    kontaktJest = true;
    return json(201, { object: "contact", id: ID_KONTAKTU });
  }
  if (metoda === "GET" && sciezka.startsWith("/contacts/")) {
    if (!kontaktJest) return json(404, { statusCode: 404, name: "not_found", message: "Contact not found" });
    return json(200, { object: "contact", id: ID_KONTAKTU, email: adresZadania(sciezka, "") });
  }
  if (metoda === "POST" && sciezka === "/emails") return json(200, { id: ID_EMAILA });
  if (metoda === "GET" && sciezka === `/emails/${ID_EMAILA}`) {
    return json(200, { object: "email", id: ID_EMAILA, last_event: "delivered" });
  }
  return json(404, { statusCode: 404, name: "not_found", message: "atrapa: nieznana ścieżka" });
}

const oryginalnyFetch = globalThis.fetch;
globalThis.fetch = async (wejscie, init) => {
  const zadanie = new Request(wejscie, init);
  const url = new URL(zadanie.url);
  if (url.hostname === "127.0.0.1") return oryginalnyFetch(wejscie, init);
  if (url.hostname !== HOST) throw new TypeError(`atrapa Resend: żądanie poza 127.0.0.1 i ${HOST} (${url.hostname})`);
  const { status, typ, tresc } = odpowiedzResend(
    "fetch",
    zadanie.method,
    url.pathname,
    zadanie.headers.has("user-agent"),
    await zadanie.text(),
  );
  return new Response(tresc, { status, headers: { "Content-Type": typ } });
};

https.request = function request(...argumenty) {
  let opcje = {};
  let wywolanieZwrotne;
  for (const argument of argumenty) {
    if (typeof argument === "function") wywolanieZwrotne = argument;
    else if (typeof argument === "string" || argument instanceof URL) {
      const url = new URL(argument);
      opcje = { ...opcje, hostname: url.hostname, path: `${url.pathname}${url.search}` };
    } else if (argument) opcje = { ...opcje, ...argument };
  }
  const host = opcje.hostname ?? String(opcje.host ?? "").split(":")[0];
  const zadanie = new EventEmitter();
  const czesci = [];
  zadanie.setTimeout = () => zadanie;
  zadanie.destroy = (blad) => {
    if (blad) process.nextTick(() => zadanie.emit("error", blad));
    return zadanie;
  };
  zadanie.write = (czesc) => {
    czesci.push(Buffer.from(czesc));
    return true;
  };
  if (wywolanieZwrotne) zadanie.once("response", wywolanieZwrotne);
  zadanie.end = (czesc) => {
    if (czesc) czesci.push(Buffer.from(czesc));
    process.nextTick(() => {
      if (host !== HOST) {
        zadanie.emit("error", Object.assign(new Error(`atrapa Resend: żądanie poza ${HOST} (${host})`), { code: "EATRAPA" }));
        return;
      }
      const naglowki = Object.keys(opcje.headers ?? {}).map((nazwa) => nazwa.toLowerCase());
      const { status, typ, tresc } = odpowiedzResend(
        "https",
        String(opcje.method ?? "GET").toUpperCase(),
        String(opcje.path ?? "/").split("?")[0],
        naglowki.includes("user-agent"),
        Buffer.concat(czesci).toString("utf8"),
      );
      const odpowiedz = Readable.from([Buffer.from(tresc)]);
      odpowiedz.statusCode = status;
      odpowiedz.headers = { "content-type": typ };
      zadanie.emit("response", odpowiedz);
    });
    return zadanie;
  };
  return zadanie;
};
syncBuiltinESMExports();
