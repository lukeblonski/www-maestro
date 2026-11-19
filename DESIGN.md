---
name: Maestro
description: White paper, blue-grey accents, thin rules, and one quiet chapter index.
colors:
  bg: "#ffffff"
  ink: "#111111"
  muted: "#55606b"
  quiet: "#646d76"
  line: "#e3e7ea"
  sky: "#c6d3df"
  sky-soft: "#eef2f6"
  slate: "#25303a"
  slate-muted: "#4d5964"
  accent: "#3f6a92"
  on-ink: "#ffffff"
  button-line: "#c9ced3"
  field-line: "#9fb0bf"
  field-focus: "#d6e0e9"
  placeholder: "#4d5964"
  error: "#8a2a1f"
  close-rule: "#a9bac8"
typography:
  display:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "clamp(1.85rem, 3.5vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.08em"
  word:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "min(26.4vw, 349px)"
    fontWeight: 600
    lineHeight: 0.8
    letterSpacing: "-0.055em"
rounded:
  focus: "4px"
  control: "10px"
  tag: "30px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  nav: "68px"
  nav-mobile: "60px"
  frame: "1320px"
  index: "250px"
components:
  button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  tag-soon:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.tag}"
    padding: "3px 10px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.slate}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  close:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.slate}"
---

# Design System: Maestro

## Overview

**Creative North Star: "White paper, blue-grey accents, thin rules"**

The page is one long, calm sheet: a full-screen hero, five chapters with a sticky index on the left, a two-column comparison, an FAQ and a blue-grey closing block with the only sign-up form. Structure comes from one-pixel rules and generous space, not from cards, icons or shadows.

The pattern is the mockup accepted for the change `przebudowa-strony` (`context/changes/przebudowa-strony/makieta/makieta.html`; the change folder moves to `context/archive/` once the change is archived). The page follows it with the deviations listed in that change’s plan ("Odstępstwa od makiety"): darker `quiet` and placeholder colors for contrast, no highlight of the Maestro column, the existing sign-up form, the skip link, and fonts and the hero image as files.

**Key Characteristics:**
- One light theme: white page, near-black ink, blue-grey accents.
- Host Grotesk for all text, JetBrains Mono only for small uppercase labels.
- Thin rules and a framed column instead of cards; no icons or drawings in the chapters.
- Movement limited to smooth scrolling and the chapter index transitions.

`app/globals.css` is the runtime source of truth; the frontmatter records its values. Markup lives in `app/page.tsx`, interactions in `components/interactive.tsx`, the logo in `components/brand.tsx`, and all copy in `lib/content.ts`.

## Colors

The CSS custom properties in `:root` are `--bg`, `--ink`, `--muted`, `--quiet`, `--line`, `--sky`, `--sky-soft`, `--slate`, `--slate-muted` and `--accent`, with the values above. `ink` carries headings, main copy and filled buttons; `muted` carries leads, point texts and the builders column; `quiet` is the softer first part of chapter and FAQ headings and the idle chapter index; `line` draws every rule and the frame; `accent` colors the mono labels, the "coming soon" lines and the focus outline. `sky-soft` is the background of the "After launch" chapter and the hover of the outline button. The closing block uses `sky` with `slate` text, `slate-muted` for the footer line and a darker `close-rule`; the email field uses `field-line`, `field-focus` and `placeholder`; `error` marks an invalid field and a failed sign-up.

There is a single theme. The root declares `color-scheme: light`, there is no theme attribute, no toggle and no stored preference, and the system dark setting does not change the page.

**The Contrast Rule.** Every text color pair is at least 4.5:1 (WCAG AA), measured on the real background by step 13. This is why `quiet` is `#646d76` (5.26:1 on white, 4.68:1 on `sky-soft`) and the placeholder `#4d5964` (4.71:1 on `sky`) instead of the lighter mockup values. A new color pair has to pass the same check.

## Typography

Host Grotesk (weights 300–800) and JetBrains Mono (weights 100–800) are self-hosted variable fonts, latin subset, from `public/fonts/host-grotesk-latin-wght-normal.woff2` and `public/fonts/jetbrains-mono-latin-wght-normal.woff2`, with `font-display: swap` and system fallbacks; their SIL Open Font License texts sit next to them (`public/fonts/OFL-*.txt`). The CSS refers to them as `url("../public/fonts/…")`, so the build serves them under the page’s base path.

Headings use weight 500 with tight negative letter spacing and balanced wrapping. The hero heading is two lines (`h1` with two blocks). Chapter and FAQ headings start with a `quiet` part. Mono labels are 12px uppercase with 0.08em spacing; the "Coming soon" tag, the column labels on mobile and the FAQ "+"/"−" sign also use the mono family. The closing word "maestro" is a decorative giant word, hidden from assistive technology.

## Layout

The content sits in a 1320px frame with one-pixel side rules; gutters are `clamp(20px, 4vw, 56px)` and respect safe-area insets. The header is sticky, 68px high (60px at 640px and below), with a bottom rule. The hero fills the screen below the header, centered, with the line drawing `public/hero-lines.webp` at its bottom edge, blended with `multiply` and faded by masks.

The chapters form a grid of a 250px sticky index and the content; each chapter is at least one screen high and separated by rules. The index marks the chapter whose top edge has passed 35% of the window height. The comparison is a three-column grid (label, builders, Maestro in 3:4:5); the FAQ pairs its heading (5) with the question list (6).

| Breakpoint | Implemented change |
| --- | --- |
| Maximum 980px | The chapter index disappears, chapters become one column without a minimum height, the FAQ stacks. |
| Maximum 640px | Body text 16px, shorter header and smaller header button, hero buttons stack, comparison rows become blocks with column labels, the email field stacks over its button. |

The 360px minimum is a product requirement, not an additional CSS breakpoint: neither the document nor the comparison scrolls sideways at that width.

## Elevation & Depth

All surfaces are flat. Depth comes only from tone (`sky-soft` in "After launch", `sky` in the closing block) and from rules. There are no shadows and no hover lift; buttons only change opacity or background on hover.

Movement is smooth scrolling (`scroll-behavior: smooth`), a 0.25s transition of the index line width and label opacity, and 0.2s button hover transitions. With reduced motion, smooth scrolling, transitions and animations are off.

## Shapes

Buttons and the email field have a 10px radius; the "Coming soon" tag is a pill. The focus outline is 2px `accent` with a 3px offset and a 4px radius. The brand mark is a stroked double arch with a crossbar (stroke widths 3.2 and 2.1) and inherits the text color; the tab icon `public/icon.svg` draws the same mark in white on `#111111`.

## Components

- **Header:** the logo (back to `#top`) and "Join the first release" (to `#waitlist`) at every width; no menu, theme toggle or other navigation. A skip link to `#main` appears only on focus.
- **Hero:** mono mission line, two-line heading, lead, a filled and an outline button, the line drawing.
- **Chapter index:** `nav` named "Chapters" with one link per chapter; idle items show a short rule, the current one (class `on`, `aria-current="true"`) a longer, thicker rule and its label. Labels of other items show on hover and focus.
- **Chapters:** mono label, optional "Coming soon" tag, heading, optional lead and a list of points divided by rules; "coming soon" lines under a point use the mono accent style.
- **Comparison:** a `div` grid with table roles (`table`, `row`, `columnheader`, `rowheader`, `cell`); the Maestro column header shows the brand mark. Both columns share the page background.
- **FAQ:** native `details` and `summary` divided by rules, with a "+" that turns into "−" when open.
- **Closing block:** `footer#waitlist` with the heading, lead, the sign-up form, the giant word and the footer line (mark, tagline, "Back to top"). The form keeps a visible label, a hidden trap field, `aria-invalid` on a bad address and a polite `role=status` message.

These are implemented supports, not a claim that every WCAG criterion has been independently audited.

## Do's and Don'ts

### Do:
- **Do** take colors from the CSS custom properties and check new pairs against the 4.5:1 rule.
- **Do** keep structure in rules and space, and copy in `lib/content.ts`.
- **Do** keep visible labels, keyboard focus, state text and reduced-motion behavior.

### Don't:
- **Don't** add a second theme, a theme toggle or anything stored in the browser.
- **Don't** add cards, icons, shadows or hover lift to the chapters.
- **Don't** highlight one column of the comparison or name other products in it.
- **Don't** load fonts or images from another address.
