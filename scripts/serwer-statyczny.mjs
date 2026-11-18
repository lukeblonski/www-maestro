// Podaje zbudowane out/ tak jak GitHub Pages: tylko pod /www-maestro/, reszta to 404.
// Uruchamia go `webServer` z playwright.config.ts. Bez zależności.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const PREFIKS = "/www-maestro";
const port = Number(process.env.E2E_PORT ?? 3100);
const katalog = resolve(process.cwd(), "out");

if (!existsSync(join(katalog, "index.html"))) {
  console.error(
    "Brak out/index.html. Zbuduj stronę: NEXT_PUBLIC_BASE_PATH=/www-maestro npm run build",
  );
  process.exit(1);
}

const TYPY = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function nieZnaleziono(odpowiedz) {
  odpowiedz.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  odpowiedz.end("404\n");
}

function plikDla(sciezka) {
  const cel = resolve(katalog, "." + sciezka);
  if (cel !== katalog && !cel.startsWith(katalog + sep)) return null;
  if (!existsSync(cel)) return null;
  const stan = statSync(cel);
  if (stan.isDirectory()) {
    const indeks = join(cel, "index.html");
    return existsSync(indeks) ? indeks : null;
  }
  return stan.isFile() ? cel : null;
}

const serwer = createServer((zadanie, odpowiedz) => {
  let sciezka;
  try {
    sciezka = decodeURIComponent(new URL(zadanie.url ?? "/", "http://127.0.0.1").pathname);
  } catch {
    nieZnaleziono(odpowiedz);
    return;
  }
  if (sciezka === PREFIKS) {
    odpowiedz.writeHead(301, { location: `${PREFIKS}/` });
    odpowiedz.end();
    return;
  }
  if (!sciezka.startsWith(`${PREFIKS}/`)) {
    nieZnaleziono(odpowiedz);
    return;
  }
  const plik = plikDla(sciezka.slice(PREFIKS.length));
  if (!plik) {
    nieZnaleziono(odpowiedz);
    return;
  }
  odpowiedz.writeHead(200, {
    "content-type": TYPY[extname(plik).toLowerCase()] ?? "application/octet-stream",
  });
  if (zadanie.method === "HEAD") {
    odpowiedz.end();
    return;
  }
  createReadStream(plik).pipe(odpowiedz);
});

serwer.listen(port, "127.0.0.1", () => {
  console.log(`Strona z out/ pod http://127.0.0.1:${port}${PREFIKS}/`);
});
