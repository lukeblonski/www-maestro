# Verification

What the tests check on the current page (the layout from the accepted mockup of the change `przebudowa-strony`). Steps 1–14 run in Chromium on the page built as for publication (`NEXT_PUBLIC_BASE_PATH=/www-maestro`, a stub sign-up function), at 360px (`telefon-360`) and 1280px (`komputer-1280`); `npm test` runs them all (see README, `## Testy`).

- **Step 1** — the tab title, the hero, the five chapters (`#observer`, `#control`, `#deploy`, `#after-launch`, `#ownership`), the comparison `#why`, the FAQ `#faq` and the closing `#waitlist` with `#first-release` appear in this order with their headings; `#waitlist` is the only footer, after `main`; none of the removed texts (release date, 2027 vision, the old tagline) is on the page; no console or page errors.
- **Step 2** — every `#` link resolves to an existing element; both "Join the first release" links lead to `#waitlist`, "See how it’s different" to `#why`; the hero button scrolls to the form.
- **Step 3** — no horizontal scrolling of the document or the comparison; at 1280px the comparison has two named columns and 6 rows side by side, at 360px each row is a block with visible column labels.
- **Step 4** — the header holds only the logo (back to `#top`) and "Join the first release", with no buttons, menu or navigation; the only navigation on the page is the chapter index.
- **Step 5** — one light theme with the system set to light or dark, also when a theme saved by the earlier page is in the browser; the page neither reads nor writes `localStorage`, `sessionStorage` stays empty and there are no cookies.
- **Step 6** — at 1280px the chapter index has five items in order and marks (`aria-current`) the chapter whose top edge passed 35% of the window, scrolling forward and back; clicking an item brings its chapter into view; at 360px the index is hidden.
- **Step 7** — the comparison has the columns "Prompt-to-app builders" and "Maestro" and the six row labels, no footnote, no third-party product names on the page, and both columns share the same cell background.
- **Step 8** — "Coming soon" in "After launch", the "Codex … coming soon" lines in "On your terms" and "coming soon" in the FAQ answer about maintenance.
- **Step 9** — the FAQ has the 8 questions in order; each opens on the first click and closes on the second.
- **Step 10** — empty and invalid addresses show an announced error without any request; a valid address sends one request to the sign-up function, shows "Joining…" and then the success or failure message; the page has one form and one email field.
- **Step 11** — every request goes to the page’s own origin (fonts and the hero image included).
- **Step 12** — with reduced motion, no smooth scrolling, no running animations and no transitions in the chapter index.
- **Step 13** — text contrast is at least 4.5:1 with the system set to light and to dark, including the quiet heading parts, the index items on focus, the email placeholder and every form message.
- **Step 14** — the page and its fonts, styles, scripts and images load under `/www-maestro`.
- **Step 15** — README has the run command and one command for all tests, and that command passes.
- **Step 16** — the page code, the build configuration and the publication workflow match commit `5e4dcac`, except the files of the changes `lista-oczekujacych` and `przebudowa-strony` listed in the test; `package.json` differs only in test entries.

`npm run verify` also tests the sign-up function in `worker/` against a Resend stub (no network) and checks that the built `out/` contains neither the Resend address nor the name of its key.

This is not an exhaustive accessibility certification, assistive-technology test or cross-browser audit: the browser tests run in Chromium only. No application code includes analytics or tracking services; fonts and the hero image are served from the page’s own address.
