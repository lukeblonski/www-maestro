<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Prawdziwa lista oczekujących z powiadomieniem właściciela

- **Plan**: context/changes/lista-oczekujacych/plan.md
- **Scope**: Phases 1–4 of 4 (pełny plan), zakres `05d47d9..aba2eaa`
- **Date**: 2026-11-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 1 warning, 8 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | WARNING |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Punkty przeglądu z prośby

- **(1) Sekrety w CI — przechodzi.** Gałąź nie zmienia `.github/workflows/` (`git diff --quiet 5e4dcac -- .github/workflows/pages.yml` → exit 0). Zmienia za to `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml`. Trzy sekrety (`CLOUDFLARE_API_TOKEN`, `RESEND_API_KEY`, `OWNER_EMAIL`) występują tylko w `with:` i `env:` kroku „Publish sign-up function” z `uses: cloudflare/wrangler-action@v4` (`pages.yml:26-38`). To jedyne narzędzie z pola „narzędzia z sekretami” w `## Wdrożenie` w `CLAUDE.md`. Joby `build` i `deploy` nie dostają sekretów, a `NEXT_PUBLIC_WAITLIST_URL` to wyjście joba, nie sekret. `autopilot.ci_secret_problems(…, ['cloudflare/wrangler-action'])` → `[]`. Pliku `context/foundation/infrastructure.md` nie ma w repo, więc porównanie oparło się tylko na polu z `CLAUDE.md`. Innego użycia sekretu nie ma, więc nie ma uwagi.
- **(2) Migracje bazy — przechodzi.** Jedyna migracja to migracja Durable Object w `worker/wrangler.toml:14-16` (`tag = "v1"`, `new_sqlite_classes = ["LimitZapisow"]`). Tworzy nową klasę i niczego nie usuwa: nie ma `deleted_classes` ani `renamed_classes`. Jest pierwsza, więc jest wstecznie zgodna. Innych migracji baz gałąź nie dodaje, więc nie ma bramki.

## Kryteria

- L1: spełnione — `npm run test:e2e -- --grep "krok 10\b"` (tytuł „krok 10 — formularz zapisu: błędy bez żądań, wysyłanie, zapisano i niepowodzenie”) przechodzi na `telefon-360` i `komputer-1280`; dokładnie jedno `POST` pod `ADRES_FUNKCJI` z adresem w treści (`tests/e2e/interakcje.spec.ts:197-203`).
- L2: spełnione — ten sam przebieg `krok 10`: odpowiedź 500 i przerwane żądanie dają `w.failure`, a adres zostaje w polu (`interakcje.spec.ts:206-218`).
- L3: spełnione — ten sam przebieg `krok 10`: pusty adres, adres bez „@” i `anna@gmail` dają `w.error`, `aria-invalid="true"` i zero żądań (`interakcje.spec.ts:173-185`).
- L4: spełnione — ten sam przebieg `krok 10`: brak obu TODO i „Form preview only” (`interakcje.spec.ts:160`); `lib/content.ts:400-407` nie ma `demoNote` ani `todos`.
- L5: spełnione — `npm run test:e2e -- --grep "krok 11\b"` przechodzi w obu projektach.
- L6: spełnione — `npm run test:e2e -- --grep "krok 13\b"` przechodzi; mierzy kontrast komunikatu błędu, sukcesu i niepowodzenia w obu motywach (`tests/e2e/motyw-siec-dostepnosc.spec.ts:156-190`).
- L7: spełnione — `npm run verify` → exit 0; „funkcja zapisu — poprawny zapis dodaje kontakt i wysyła e-mail właścicielowi” przechodzi.
- L8: spełnione — `npm run verify` → exit 0; „funkcja zapisu — inny Origin, brak Origin i błędny adres dają odmowę bez Resend” przechodzi.
- L9: spełnione — `npm run verify` → exit 0; „funkcja zapisu — wypełnione pole-pułapka daje sukces bez Resend” przechodzi.
- L10: spełnione — `npm run verify` → exit 0; testy szóstego zapisu z jednego IP i z jednej sieci IPv6 `/64` dają 429 bez Resend.
- L11: spełnione — `npm run verify` → exit 0; „funkcja zapisu — błąd Resend daje 5xx” przechodzi, a strona pokazuje niepowodzenie (L2).
- L12: spełnione — `npm run verify` → exit 0: „zbudowana strona — bez adresu Resend i nazwy klucza” przechodzi, a `gitleaks` dwa razy zwraca „no leaks found”. Weryfikator: odbiorca to tylko `to: [env.OWNER_EMAIL]` (`worker/index.ts:166`), a brak `OWNER_EMAIL` daje 500 bez wartości domyślnej (`:154`). `grep -rnE` adresów e-mail w `worker/` znajduje tylko `onboarding@resend.dev`; w `lib/`, `README.md`, `.github/workflows/` i `chronione/` nie znajduje żadnego (poza placeholderem `you@example.com`). Workflow bierze adres z `secrets.OWNER_EMAIL` (`pages.yml:38`).
- L13: spełnione — `npm run verify` → exit 0; „krok 16 — kod strony i konfiguracja budowy jak w 5e4dcac” przechodzi z pięcioma plikami `PLIKI_ZMIAN` (`tests/repo/zakres-przejecia.spec.ts:22-31`).
- L14: spełnione — weryfikator: job `worker` publikuje funkcję krokiem `cloudflare/wrangler-action@v4` (`pages.yml:26-38`), z sekretami tylko w `with:`/`env:` tego kroku. Job `build` ma `needs: worker` i `NEXT_PUBLIC_WAITLIST_URL: ${{ needs.worker.outputs.url }}` (`:41`, `:49`) oraz sprawdzenie `test -n` (`:68-69`). Job `deploy` z krokiem „Deploy to GitHub Pages” jest bez zmian. Wyjście `deployment-url` i tag `v4` istnieją w `cloudflare/wrangler-action` (`action.yml` na `v4`, sprawdzone w źródle 2026-11-18).
- L15: spełnione — weryfikator: `README.md:62-82` opisuje przepływ (formularz → funkcja w Cloudflare Workers → kontakty Resend i e-mail do właściciela), kod w `worker/index.ts` i `worker/wrangler.toml`, publikację jobem `worker` w `.github/workflows/pages.yml` oraz trzy sekrety z nazwy, bez wartości.
- L16: spełnione — `npm ci && npm run verify && npm run test:e2e && python3 ~/.claude/skills/10x-impl-review/scripts/validate_change.py lista-oczekujacych --rules 6` → exit 0 (verify: 9 passed, no leaks found; e2e: 28 passed; krok 15: 1 passed; `OK: lista-oczekujacych: rules 6 passed`).
- L17: spełnione — weryfikator: cztery teksty z `lib/content.ts:403-406` („Joining…”, sukces, niepowodzenie, błąd) są dosłownie w `makieta/makieta.html`. Stany `idle | invalid | sending | success | failed` w `components/interactive.tsx:279-348`, z nieaktywnym przyciskiem „Joining…” w czasie wysyłki, odpowiadają stanom makiety.

## Findings

### F1 — Jedno źródło może wyczerpać dzienny limit e-maili Resend

- **Severity**: ⚠️ WARNING
- **Dimension**: Safety & Quality
- **Location**: worker/index.ts:16-17, 156-170
- **Detail**: Jedynym limitem jest 5 zapisów na 60 s z jednego IP (albo sieci `/64`). Nagłówek `Origin` może podać każdy skrypt (curl), a pole-pułapkę omija każdy, kto woła funkcję wprost. Z jednego adresu IPv4 wychodzi więc 300 zapisów na godzinę, a każdy z nich to e-mail. Limit 100 e-maili dziennie na planie Resend Free kończy się po około 20 minutach. Od tej chwili do końca doby każdy prawdziwy odwiedzający dostaje 502 i „Your sign-up didn't go through”, mimo że `/contacts` już dodał jego adres, a skrzynka i lista kontaktów właściciela zapełniają się śmieciowymi adresami. D-013 opisuje limit 100 dziennie tylko dla zwykłego ruchu, a nie dla celowego nadużycia.
- **Fix A ⭐ Recommended**: Dodać w `LimitZapisow` drugie okno, 24 h, z niskim limitem na klucz (np. 10), i wspólny dzienny licznik w jednym obiekcie (np. `idFromName("dzien")`, najwyżej 90 zapisów na dobę). Oba sprawdzane przed wywołaniem Resend, z odpowiedzią 429 i testem w `tests/repo/funkcja-zapisu.spec.ts`.
  - Strength: Zapisy ponad limit nie zużywają już kontaktów ani e-maili Resend, a wspólny licznik zatrzymuje też atak z wielu adresów IP.
  - Tradeoff: Drugie wywołanie Durable Object na zapis i nowy przypadek odmowy. Po wyczerpaniu wspólnego licznika prawdziwy odwiedzający też dostaje niepowodzenie, ale to samo zrobiłby wtedy Resend.
  - Confidence: MED — zmiana jest w jednym pliku, ale konkretne progi to wybór na oko.
  - Blind spot: Limity Resend Free (100 dziennie) podaje D-013 i plan; nie sprawdziłem ich dziś w źródle.
  - Intent: changes Ograniczenia (limit „najwyżej 5 na minutę” dostaje drugi, dzienny limit)
- **Fix B**: Zostawić kod i dopisać przypadek celowego nadużycia do D-013, z warunkiem powrotu „pierwszy dzień z błędami 502 albo śmieciowymi zapisami”.
  - Strength: Nie zmienia zachowania funkcji ani obietnic intencji.
  - Tradeoff: Atak pozostaje możliwy przez całą dobę po premierze.
  - Confidence: HIGH — to tylko wpis w rejestrze.
  - Blind spot: Nie wiadomo, jak szybko właściciel zauważy taki atak.
  - Intent: within
- **Decision**: AUTO-FIX (bezpieczeństwo B): Zabezpieczyłem dzienny limit e-maili i kontaktów Resend przed wyczerpaniem z jednego źródła albo z wielu adresów IP, stosując w `LimitZapisow` drugie, dobowe okno limitu na klucz IP i wspólny dobowy licznik w jednym obiekcie; oba są sprawdzane przed wywołaniem Resend, przekroczenie daje odpowiedź 429, a poprawka ma test w `tests/repo/funkcja-zapisu.spec.ts`. · Option: Fix A · commit 64e93d2

### F2 — Błąd wywołania Durable Object daje odpowiedź bez nagłówka CORS

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: worker/index.ts:157
- **Detail**: `env.LIMIT.get(...).fetch(...)` nie jest w `try/catch`. Wyjątek (przeciążony obiekt, błąd storage) daje odpowiedź platformy 500 bez `Access-Control-Allow-Origin`, więc przeglądarka widzi błąd sieci. Strona i tak pokazuje niepowodzenie, więc odwiedzający niczego nie traci.
- **Fix**: Otoczyć wywołanie `try/catch` i zwracać `odpowiedz(500, false, cors)`.
- **Decision**: AUTO-FIX (bezpieczeństwo B): razem z F1: Zabezpieczyłem odpowiedź funkcji przy błędzie Durable Object, stosując w tej samej poprawce `try/catch` wokół wywołań `LimitZapisow` z odpowiedzią `odpowiedz(500, false, cors)` z nagłówkiem CORS. · Option: Fix A · commit 64e93d2

### F3 — Brak limitu rozmiaru treści żądania

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: worker/index.ts:141
- **Detail**: `request.text()` i `JSON.parse` czytają treść dowolnej wielkości. Duża treść z podrobionym `Origin` może przekroczyć 10 ms CPU planu Free (błąd 1102). Nie zużywa przy tym limitów Resend.
- **Fix**: Odrzucać treść dłuższą niż ok. 1 KB (413) przed `JSON.parse`.
- **Decision**: AUTO-LIMIT (przypadek szczególny): Duża treść z podrobionym `Origin` przerywa tylko żądanie, które ją wysłało, i nie zużywa limitów Resend, a w `change.md` nie ma modelu zagrożenia, więc przyjmuję „przypadkowy błąd agenta, nie celowe obejście” i to nie jest ani zwykłe używanie, ani atak z „Chroni przed”. · Return when: logi funkcji w Cloudflare pokażą błędy 1102 (przekroczony limit CPU) albo zmiana dotknie odczytu treści żądania (`request.text()` / `JSON.parse`) w `worker/index.ts`. · D-014

### F4 — Szczegóły licznika zapisów

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: worker/index.ts:57-69, 102-107
- **Detail**: Ścieżka 429 dalej zapisuje do `storage` (`:63`), więc każda odmowa to jeden zapis. Obiekt każdego klucza trzyma `zapisy` na zawsze (najwyżej 5 liczb na każdy widziany adres IP). Adres IPv4 zapisany jako IPv6 (`::ffff:a.b.c.d`) dałby wspólny klucz `0:0:0:0`, ale `CF-Connecting-IP` zwykle podaje zwykły IPv4.
- **Fix**: Pomijać zapis przy 429, a dla prefiksu `::ffff:` brać jako klucz wbudowany adres IPv4.
- **Decision**: AUTO-FIX (bezpieczeństwo B): razem z F1: Zabezpieczyłem licznik `LimitZapisow`, stosując w tej samej poprawce dwie rzeczy: odmowa 429 nie zapisuje już nic do `storage`, a adres z prefiksem `::ffff:` dostaje jako klucz wbudowany adres IPv4 w `kluczLimitu`. · Option: Fix A · commit 64e93d2

### F5 — Akcja z sekretami przypięta tagiem, a nie SHA

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml:28
- **Detail**: `cloudflare/wrangler-action@v4` dostaje token Cloudflare, klucz Resend i adres właściciela, a jest przypięta ruchomym tagiem. Tag `v4` i wyjście `deployment-url` istnieją (sprawdzone w źródle). `wrangler secret bulk` tworzy przy pierwszej publikacji szkic funkcji (`createDraftWorker` w `packages/wrangler/src/secret/index.ts`), więc kolejność „najpierw sekrety, potem publikacja” działa. Pozostałe akcje w pliku też są przypięte tagami, zgodnie z wzorcem repo.
- **Fix**: Przypiąć `cloudflare/wrangler-action` do SHA commita tagu `v4` z komentarzem `# v4`.
- **Decision**: AUTO-FIX (bezpieczeństwo A): Zabezpieczyłem token Cloudflare, klucz Resend i adres e-mail właściciela przed podmianą ruchomego tagu akcji, stosując przypięcie `cloudflare/wrangler-action` w `context/changes/lista-oczekujacych/chronione/.github/workflows/pages.yml` do SHA commita tagu `v4` z komentarzem `# v4`. · Option: Fix · commit 64e93d2

### F6 — „krok 16” trwale wyłącza z ochrony całe pliki formularza

- **Severity**: 👁 OBSERVATION
- **Dimension**: Safety & Quality
- **Location**: tests/repo/zakres-przejecia.spec.ts:22-31
- **Detail**: Wyjątki obejmują całe `components/interactive.tsx`, `lib/content.ts` i `app/globals.css`, czyli wszystkie interakcje, teksty i style strony. Od teraz zmiana nagłówka, FAQ albo demo przejdzie „krok 16”. Tak brzmi L13, ale ochrona jest dużo słabsza niż przed zmianą.
- **Fix**: Po scaleniu porównywać te pliki z commitem scalenia tej zmiany zamiast pomijać je całkiem (osobna zmiana).
- **Decision**: AUTO-LIMIT (przypadek szczególny): Wyjątki „krok 16” na całe pliki formularza są dokładnie tym, czego wymagają L13 i „Ograniczenia”, a słabsza ochrona zacznie mieć znaczenie dopiero przy kolejnej zmianie tych plików, nie przy zwykłym używaniu strony. · Return when: zmiana dotknie `components/interactive.tsx`, `lib/content.ts` albo `app/globals.css` poza sekcją `#waitlist` albo zmieni listę `PLIKI_ZMIAN` w `tests/repo/zakres-przejecia.spec.ts`. · D-015

### F7 — Opisy w fundamentach mówią dalej o formularzu-demo

- **Severity**: 👁 OBSERVATION
- **Dimension**: Scope Discipline
- **Location**: context/foundation/test-plan.md:46, 48, 54, 156; context/foundation/streszczenie.md:38
- **Detail**: LEFTOVER tej zmiany. `streszczenie.md:38` mówi „formularz niczego nie wysyła. Żadne dane nie trafiają do obcych usług”. `test-plan.md:54` mówi, że nadużycie zasobów „nie ma powierzchni (brak zaplecza)”, a `:48` traktuje wyjście e-maila do sieci jako błąd. Po tej zmianie wszystkie trzy zdania są nieprawdziwe.
- **Fix**: Poprawić te zdania na opis formularza, który wysyła adres do funkcji zapisu (Resend, Cloudflare).
- **Decision**: AUTO-SKIP (styl): To nieaktualny opis w dokumentach fundamentów (`streszczenie.md`, `test-plan.md`), bez wpływu na działanie strony, funkcji ani kryteriów akceptacji.

### F8 — README nazywa wyjątki „krok 16” plikami formularza

- **Severity**: 👁 OBSERVATION
- **Dimension**: Plan Adherence
- **Location**: README.md:41
- **Detail**: „poza plikami formularza wymienionymi w teście z nazwy”. Wśród wyjątków jest też `.github/workflows/pages.yml`, który nie jest plikiem formularza; `CLAUDE.md` mówi poprawnie „plikami zmiany lista-oczekujacych”.
- **Fix**: Zmienić na „poza plikami zmiany lista-oczekujacych wymienionymi w teście z nazwy”.
- **Decision**: AUTO-SKIP (styl): To niedokładne sformułowanie w README o wyjątkach testu „krok 16”, czyli sam opis, bez wpływu na zachowanie i testy.

### F9 — Etykieta pola-pułapki wpisana w komponencie

- **Severity**: 👁 OBSERVATION
- **Dimension**: Pattern Consistency
- **Location**: components/interactive.tsx:326
- **Detail**: Etykieta „Website” jest w kodzie komponentu, a README mówi, że cała treść strony jest w `lib/content.ts`. Pole jest ukryte (`aria-hidden`), więc nikt jej nie widzi.
- **Fix**: Przenieść etykietę do `content.waitlist` albo zostawić z komentarzem, że to pole dla botów.
- **Decision**: AUTO-SKIP (styl): Etykieta ukrytego pola-pułapki wpisana w komponencie to sprawa miejsca tekstu w kodzie, a nikt jej nie widzi (`aria-hidden`).
