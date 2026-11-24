// node scripts/strona-na-zywo.mjs — sprawdzenia na żywo `teksty-sekcji`, `teksty-porownania`, `coming-soon` i
// `faq-strony` (CLAUDE.md, „## Sprawdzenie na żywo”). Uruchamia go tylko skrypt autopilota, bez powłoki; kroki agenta
// i testy go nie uruchamiają. Bez zależności i bez plików z „## Dostępy”.
//
// - Wejście: NA_ZYWO_SCIEZKA (nazwa sprawdzenia), NA_ZYWO_MIEJSCE, NA_ZYWO_ADRES, NA_ZYWO_WYNIK (plik wyniku) i PORT
//   (tylko przed publikacją).
// - `przed-publikacja` i `galaz-glowna` (worktree commitu): `npm ci`, gdy nie ma node_modules, `npm run build` z
//   prefiksem /www-maestro (bez adresu funkcji zapisu: sprawdzenia nie używają formularza), `out/` podane przez
//   scripts/serwer-statyczny.mjs na 127.0.0.1:$PORT i jedno czytanie $NA_ZYWO_ADRES/www-maestro/; serwer zatrzymany
//   przed zapisem wyniku.
// - `po-publikacji`: niczego nie instaluje ani nie uruchamia; czyta $NA_ZYWO_ADRES z parametrem omijającym pamięć
//   podręczną co CZEKANIE_CO_MS, aż strona ma wszystkie teksty sprawdzenia, najwyżej CZEKANIE_DO_MS.
// - Sprawdza zwykły HTML odpowiedzi, bez przeglądarki: bez skryptów, stylów i komentarzy, tekst bez znaczników
//   i z rozkodowanymi encjami; pogrubienie w samym HTML odpowiedzi o koszcie.
// - Wynik: plik NA_ZYWO_WYNIK i ta sama linia JSON na stdout. Kod 0 tylko przy `przeszło`. Sprawdzenie tylko czyta
//   stronę, więc niczego nie tworzy i niczego nie sprząta.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";

const PRZESZLO = "przeszło";
const NIE_PRZESZLO = "nie przeszło";
const PRZED = "przed-publikacja";
const GALAZ = "galaz-glowna";
const PO = "po-publikacji";
const PREFIKS = "/www-maestro";
const CZEKANIE_CO_MS = 15_000;
const CZEKANIE_DO_MS = 15 * 60_000;
const SERWER_DO_MS = 30_000;
const LIMIT_ZADANIA_MS = 30_000;

// Stany końcowe z pól `stan końcowy:` podpunktów scenariusza w change.md zmiany poprawki-tresci-strony, znak w znak.
const STANY = {
  "teksty-sekcji":
    "opublikowana strona pod adresem z ## Wdrożenie podaje teksty pięciu sekcji z Oczekiwanego efektu, w tym „Guardrails built in.”, „Setting your own guardrails coming soon”, „What works keeps working.”, „lets you know every time it does” i „Maestro is always on.”, i nie podaje już „Your server. Always on.”",
  "teksty-porownania":
    "opublikowana strona podaje etykietę „Why Maestro” i sześć wierszy porównania z Oczekiwanego efektu, a nie podaje „Flat learning curve”",
  "coming-soon":
    "opublikowana strona podaje „Coming soon” przy sekcji „After launch”, przy wierszu porównania „After launch” i w pytaniu FAQ o utrzymanie",
  "faq-strony":
    "opublikowana strona podaje 11 pytań FAQ w kolejności z Oczekiwanego efektu, z trzema nowymi odpowiedziami, a odpowiedź „What will it cost?” ma zdanie „We don’t charge you anything for Maestro.” w elemencie strong",
};

// Teksty z Oczekiwanego efektu change.md, wpisane dosłownie (te same co w testach kroków 1, 7, 8 i 9).
const PUNKTY_SEKCJI = [
  ["observer", "It remembers.", "Its entire memory is stored on your server, so nothing gets lost between sessions."],
  ["control", "Every question comes with a recommendation.", "tells you which answer it recommends and why, so you can make informed decisions."],
  ["control", "Guardrails built in.", "Maestro works inside built-in safeguards. It keeps away from your passwords and keys, never changes files you protect, and never bends a test just to make a change pass."],
  ["deploy", "What works keeps working.", "Before any change reaches your users, Maestro checks that the main things your product already does still work, the way your users use them."],
  ["after-launch", "It looks after your product.", "Maestro keeps watching your product and, when something goes wrong, proactively fixes it, and lets you know every time it does."],
  ["after-launch", "It helps your product grow.", "Maestro helps you shape a product strategy, gathers feedback from your users and your tools, and implements changes, improvements and new features, while asking as little of your time as possible."],
  ["ownership", "You never touch the code.", "You don’t need to know what a PR, a merge, a ticket, an API, a skill or an md file is. All you need is the will to create!"],
  ["ownership", "Maestro is always on.", "Maestro runs 24/7 on a separate server, so it has no access to the data on your computer."],
  ["ownership", "No new app to learn.", "You talk to Maestro in the Claude app on your computer or phone. Not another clunky drag-and-drop tool or cluttered interface."],
  ["ownership", "Your own subscription.", "Maestro runs the official Claude Code on your own server, signed in with your own Claude plan. No extra AI fees: Maestro only uses what your Claude subscription already includes."],
];
const ZAPOWIEDZ_ZABEZPIECZEN = "Setting your own guardrails coming soon";
const WIERSZE_POROWNANIA = [
  ["Made for", "Anyone who wants to build an app by chatting with AI", "Anyone who has an idea for a product but doesn’t want to deal with the build details"],
  ["What you need to know", "How to prompt, maintain and grow", "The thing you want to build. Maestro helps you with the rest"],
  ["Who steers the build", "You, prompt by prompt", "Maestro. You decide what your product does"],
  ["How it talks to you", "Prompt, answer, prompt", "Like a partner who remembers everything you agreed, discussed and decided, in plain language without technical jargon"],
  ["Where your product lives", "Often on the builder’s platform", "On your own server. The code, documentation and knowledge are yours"],
  ["After launch", "Optional monitoring and AI fixes on some plans, which you need to oversee on your own", "Fixes issues and helps your product grow. You approve its decisions and add your input when you want"],
];
const PYTANIA_FAQ = [
  "Do I need to know how to code?",
  "What do I need to start?",
  "What will it cost?",
  "When can I start?",
  "Does Maestro do anything without asking me?",
  "Where are my data, code and project history?",
  "Can Maestro work on a product I already have?",
  "What’s under the hood?",
  "What happens if I stop using Maestro?",
  "Will it tell me whether my idea is worth building?",
  "Does the first release maintain my application automatically?",
];
const NOWE_ODPOWIEDZI = [
  ["What do I need to start?", "The Claude app, an active Claude subscription and a server. The installer guides you through setting up the server."],
  ["Can Maestro work on a product I already have?", "Yes. Maestro can take over an existing project: it learns how your product works, protects what already works with checks, and then keeps building with you."],
  ["What’s under the hood?", "Maestro is the official Claude Code running on your own server. Behind it, a set of steps turns what you agree on into a written plan, builds it with AI agents, reviews and tests every change, and deploys it. Maestro is the one you talk to: it keeps your project’s memory, asks you only what needs your decision, and explains everything in plain language."],
];
const PYTANIE_O_KOSZCIE = "What will it cost?";
const ZDANIE_O_KOSZCIE = "We don’t charge you anything for Maestro.";
const PYTANIE_O_UTRZYMANIE = "Does the first release maintain my application automatically?";
const COMING_SOON = "Coming soon";

const sciezka = process.env.NA_ZYWO_SCIEZKA ?? "";
const miejsce = process.env.NA_ZYWO_MIEJSCE ?? "";
const adres = process.env.NA_ZYWO_ADRES ?? "";
const plikWyniku = process.env.NA_ZYWO_WYNIK ?? "";

// --- HTML bez przeglądarki ---

const ENCJE = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function rozkoduj(tekst) {
  return tekst.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (calosc, nazwa) => {
    if (nazwa[0] === "#") {
      const kod = nazwa[1] === "x" || nazwa[1] === "X" ? parseInt(nazwa.slice(2), 16) : parseInt(nazwa.slice(1), 10);
      return Number.isFinite(kod) ? String.fromCodePoint(kod) : calosc;
    }
    return ENCJE[nazwa.toLowerCase()] ?? calosc;
  });
}

/** HTML bez skryptów, stylów i komentarzy (także `<!-- -->` Reacta). */
function oczysc(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/** Tekst fragmentu HTML: bez znaczników, z rozkodowanymi encjami i pojedynczymi spacjami. */
function tekst(html) {
  return rozkoduj(html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Fragment od `id="<od>"` do najbliższego po nim znacznika z `koniec` (albo do końca HTML). */
function wycinek(html, od, ...koniec) {
  const start = html.indexOf(`id="${od}"`);
  if (start < 0) return null;
  let stop = html.length;
  for (const znacznik of koniec) {
    const i = html.indexOf(znacznik, start + 1);
    if (i >= 0 && i < stop) stop = i;
  }
  return html.slice(start, stop);
}

const sekcja = (html, id) => wycinek(html, id, "<section", "</main>");
const elementy = (html, nazwa) =>
  Array.from(html.matchAll(new RegExp(`<${nazwa}\\b[^>]*>([\\s\\S]*?)</${nazwa}>`, "gi")), (m) => m[1]);
const skrot = (t, n = 90) => (t.length > n ? `${t.slice(0, n)}…` : t);

function punkt(html, id, tytul) {
  const czesc = sekcja(html, id);
  if (!czesc) return null;
  return elementy(czesc, "li").find((li) => elementy(li, "h3").some((h) => tekst(h) === tytul)) ?? null;
}

function pytaniaFaq(html) {
  const czesc = wycinek(html, "faq", "</main>");
  if (!czesc) return [];
  return elementy(czesc, "details").map((d) => ({
    pytanie: tekst(elementy(d, "summary")[0] ?? ""),
    html: elementy(d, "p")[0] ?? "",
  }));
}

function wierszePorownania(html) {
  const czesc = wycinek(html, "why", 'id="faq"');
  if (!czesc) return [];
  return czesc
    .split(/(?=<div\b[^>]*role="row")/)
    .slice(1)
    .map((w) => ({
      naglowek: tekst((w.match(/role="rowheader"[^>]*>([\s\S]*?)<\/span>/) ?? [])[1] ?? ""),
      komorki: w.split(/role="cell"[^>]*>/).slice(1).map(tekst),
      html: w,
    }))
    .filter((w) => w.naglowek);
}

// --- sprawdzenia: lista brakujących rzeczy (pusta = przeszło) i znalezione fragmenty ---

function tekstySekcji(html) {
  const braki = [];
  const znalezione = [];
  for (const [id, tytul, zdanie] of PUNKTY_SEKCJI) {
    const li = punkt(html, id, tytul);
    const akapit = li ? tekst(elementy(li, "p")[0] ?? "") : "";
    if (!li) braki.push(`#${id} bez punktu „${tytul}”`);
    else if (!akapit.includes(zdanie)) braki.push(`#${id} „${tytul}” bez „${skrot(zdanie)}”`);
    else znalezione.push(`#${id} „${tytul}”: „${skrot(akapit)}”`);
  }
  const zabezpieczenia = punkt(html, "control", "Guardrails built in.");
  if (zabezpieczenia && elementy(zabezpieczenia, "p").some((p) => tekst(p) === ZAPOWIEDZ_ZABEZPIECZEN)) {
    znalezione.push(`#control „Guardrails built in.”: „${ZAPOWIEDZ_ZABEZPIECZEN}”`);
  } else braki.push(`#control „Guardrails built in.” bez „${ZAPOWIEDZ_ZABEZPIECZEN}”`);
  if (tekst(html).includes("Your server. Always on.")) braki.push("strona nadal podaje „Your server. Always on.”");
  else znalezione.push("bez „Your server. Always on.”");
  return { braki, znalezione };
}

function tekstyPorownania(html) {
  const braki = [];
  const znalezione = [];
  const czesc = wycinek(html, "why", 'id="faq"') ?? "";
  const etykieta = (czesc.match(/<p class="mono"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1];
  if (etykieta !== undefined && tekst(etykieta) === "Why Maestro") znalezione.push("#why: etykieta „Why Maestro”");
  else braki.push(`#why bez etykiety „Why Maestro” (jest „${etykieta === undefined ? "brak" : tekst(etykieta)}”)`);
  const wiersze = wierszePorownania(html);
  if (wiersze.length !== WIERSZE_POROWNANIA.length) braki.push(`#why ma ${wiersze.length} wierszy zamiast 6`);
  WIERSZE_POROWNANIA.forEach(([naglowek, kreatory, maestro], i) => {
    const w = wiersze[i];
    if (!w || w.naglowek !== naglowek) braki.push(`wiersz ${i + 1} to „${w?.naglowek ?? "brak"}”, a nie „${naglowek}”`);
    else if (!(w.komorki[0] ?? "").includes(kreatory)) braki.push(`wiersz „${naglowek}” bez „${kreatory}”`);
    else if (!(w.komorki[1] ?? "").includes(maestro)) braki.push(`wiersz „${naglowek}” bez „${maestro}”`);
    else znalezione.push(`wiersz „${naglowek}”: „${skrot(kreatory, 40)}” | „${skrot(maestro, 50)}”`);
  });
  if (tekst(html).includes("Flat learning curve")) braki.push("strona nadal podaje „Flat learning curve”");
  else znalezione.push("bez „Flat learning curve”");
  return { braki, znalezione };
}

function comingSoon(html) {
  const braki = [];
  const znalezione = [];
  const odznaka = (fragment) =>
    Array.from(fragment.matchAll(/<span class="soon"[^>]*>([\s\S]*?)<\/span>/g)).some((m) => tekst(m[1]) === COMING_SOON);
  const poStarcie = sekcja(html, "after-launch");
  if (poStarcie && odznaka(poStarcie)) znalezione.push("#after-launch: „Coming soon”");
  else braki.push("#after-launch bez „Coming soon”");
  const wiersz = wierszePorownania(html).find((w) => w.naglowek === "After launch");
  if (wiersz && odznaka(wiersz.html)) znalezione.push("wiersz porównania „After launch”: „Coming soon”");
  else braki.push("wiersz porównania „After launch” bez „Coming soon”");
  const utrzymanie = pytaniaFaq(html).find((p) => p.pytanie === PYTANIE_O_UTRZYMANIE);
  const odpowiedz = utrzymanie ? tekst(utrzymanie.html) : "";
  if (odpowiedz.toLowerCase().includes("coming soon")) znalezione.push(`FAQ „${PYTANIE_O_UTRZYMANIE}”: „${skrot(odpowiedz)}”`);
  else braki.push(`FAQ „${PYTANIE_O_UTRZYMANIE}” bez „coming soon”`);
  return { braki, znalezione };
}

function faqStrony(html) {
  const braki = [];
  const znalezione = [];
  const pytania = pytaniaFaq(html);
  const lista = pytania.map((p) => p.pytanie);
  if (JSON.stringify(lista) === JSON.stringify(PYTANIA_FAQ)) znalezione.push(`${lista.length} pytań FAQ w kolejności`);
  else braki.push(`pytania FAQ to ${JSON.stringify(lista)}`);
  for (const [pytanie, odpowiedz] of NOWE_ODPOWIEDZI) {
    const p = pytania.find((x) => x.pytanie === pytanie);
    if (p && tekst(p.html) === odpowiedz) znalezione.push(`FAQ „${pytanie}”: „${skrot(odpowiedz, 60)}”`);
    else braki.push(`FAQ „${pytanie}” bez odpowiedzi „${skrot(odpowiedz, 60)}”`);
  }
  const koszt = pytania.find((p) => p.pytanie === PYTANIE_O_KOSZCIE);
  if (koszt && elementy(koszt.html, "strong").some((s) => tekst(s) === ZDANIE_O_KOSZCIE)) {
    znalezione.push(`FAQ „${PYTANIE_O_KOSZCIE}”: <strong>${ZDANIE_O_KOSZCIE}</strong>`);
  } else braki.push(`FAQ „${PYTANIE_O_KOSZCIE}” bez <strong>${ZDANIE_O_KOSZCIE}</strong>`);
  return { braki, znalezione };
}

const SPRAWDZENIA = {
  "teksty-sekcji": tekstySekcji,
  "teksty-porownania": tekstyPorownania,
  "coming-soon": comingSoon,
  "faq-strony": faqStrony,
};

// --- strona: budowa, serwer i pobieranie ---

async function pobierz(url) {
  const znak = url.includes("?") ? "&" : "?";
  const odpowiedz = await fetch(`${url}${znak}t=${Date.now()}`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(LIMIT_ZADANIA_MS),
  });
  if (!odpowiedz.ok) throw new Error(`${url} odpowiada ${odpowiedz.status}`);
  return odpowiedz.text();
}

const czekaj = (ms) => new Promise((gotowe) => setTimeout(gotowe, ms));

function uruchom(polecenie, argumenty, env) {
  const wynik = spawnSync(polecenie, argumenty, { stdio: ["ignore", "inherit", "inherit"], env });
  if (wynik.status !== 0) {
    throw new Error(`${polecenie} ${argumenty.join(" ")} zakończyło się kodem ${wynik.status ?? wynik.signal ?? wynik.error}`);
  }
}

async function przedPublikacja(sprawdz) {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`brak poprawnego PORT (${process.env.PORT ?? "brak"})`);
  if (!fs.existsSync("node_modules")) uruchom("npm", ["ci"], process.env);
  const envBudowy = { ...process.env, NEXT_PUBLIC_BASE_PATH: PREFIKS, NEXT_TELEMETRY_DISABLED: "1" };
  delete envBudowy.NEXT_PUBLIC_WAITLIST_URL;
  uruchom("npm", ["run", "build"], envBudowy);

  const serwer = spawn(process.execPath, ["scripts/serwer-statyczny.mjs"], {
    stdio: ["ignore", "inherit", "inherit"],
    env: { ...process.env, E2E_PORT: String(port) },
  });
  let zakonczony = null;
  serwer.on("exit", (kod) => {
    zakonczony = kod;
  });
  try {
    const url = `${adres.replace(/\/+$/, "")}${PREFIKS}/`;
    const koniec = Date.now() + SERWER_DO_MS;
    let ostatni = null;
    while (Date.now() < koniec) {
      if (zakonczony !== null) throw new Error(`scripts/serwer-statyczny.mjs zakończył się kodem ${zakonczony}`);
      try {
        const html = await pobierz(url);
        return { url, ...sprawdz(oczysc(html)) };
      } catch (blad) {
        ostatni = blad;
        await czekaj(500);
      }
    }
    throw new Error(`strona pod ${url} nie odpowiedziała w ${SERWER_DO_MS / 1000} s: ${ostatni?.message ?? "brak odpowiedzi"}`);
  } finally {
    serwer.kill();
  }
}

async function poPublikacji(sprawdz) {
  const url = adres;
  const koniec = Date.now() + CZEKANIE_DO_MS;
  for (;;) {
    let stan;
    try {
      stan = { url, ...sprawdz(oczysc(await pobierz(url))) };
    } catch (blad) {
      stan = { url, braki: [`błąd odczytu: ${blad.message}`], znalezione: [] };
    }
    if (stan.braki.length === 0 || Date.now() + CZEKANIE_CO_MS > koniec) return stan;
    console.log(`czekam na publikację (${stan.braki.length} braków, np. ${stan.braki[0]})`);
    await czekaj(CZEKANIE_CO_MS);
  }
}

function zapisz(wynik) {
  const linia = JSON.stringify(wynik);
  if (plikWyniku) fs.writeFileSync(plikWyniku, `${linia}\n`, "utf8");
  console.log(linia);
}

async function main() {
  const wynik = {
    sciezka,
    miejsce,
    adres,
    ustawienia: "docelowe",
    atrapy: [],
    uslugi: [],
    stan_koncowy: STANY[sciezka] ?? "",
    dowod: "",
    sprzatanie: { usuniete: [], wynik: "nic nie tworzy" },
    wynik: NIE_PRZESZLO,
    powod: "",
  };
  const sprawdz = Object.hasOwn(SPRAWDZENIA, sciezka) ? SPRAWDZENIA[sciezka] : null;
  try {
    if (!sprawdz) throw new Error(`nieznane sprawdzenie ${JSON.stringify(sciezka)}`);
    if (!adres) throw new Error("brak NA_ZYWO_ADRES");
    let stan;
    if (miejsce === PRZED || miejsce === GALAZ) stan = await przedPublikacja(sprawdz);
    else if (miejsce === PO) stan = await poPublikacji(sprawdz);
    else throw new Error(`nieznane miejsce ${JSON.stringify(miejsce)}`);
    wynik.dowod = `strona pod ${stan.url}: ${stan.znalezione.join("; ")}`;
    if (stan.braki.length === 0) {
      wynik.wynik = PRZESZLO;
      wynik.powod = `strona ma wszystkie teksty sprawdzenia ${sciezka}`;
    } else {
      wynik.powod = stan.braki.join("; ");
    }
  } catch (blad) {
    wynik.powod = blad instanceof Error ? blad.message : String(blad);
  }
  zapisz(wynik);
  return wynik.wynik === PRZESZLO ? 0 : 1;
}

process.exitCode = await main();
