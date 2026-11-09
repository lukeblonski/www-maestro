---
name: Maestro
description: Warm paper, botanical green, precise rules, and readable product conversations.
colors:
  light-paper: "#fafbf7"
  light-surface: "#fff"
  light-soft: "#f0f3eb"
  light-ink: "#202b23"
  light-muted: "#5c675e"
  light-line: "#dce2d8"
  light-green: "#286447"
  light-forest: "#153c2f"
  light-forest-muted: "#bfcec4"
  light-accent-soft: "#e8f1df"
  dark-paper: "#121b17"
  dark-surface: "#19241e"
  dark-soft: "#202d25"
  dark-ink: "#edf3e8"
  dark-muted: "#b2beb4"
  dark-line: "#35453a"
  dark-green: "#b2d98b"
  dark-forest: "#203e30"
  dark-forest-muted: "#c5d2c9"
  dark-accent-soft: "#2c422f"
  lime: "#d5f680"
  on-forest: "#f3f7ee"
  primary-label: "#1e3c23"
  primary-hover: "#e2ffa2"
  forest-hover: "#27583e"
  forest-line: "#577060"
  selection-label: "#173b2c"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(3rem, 5.45vw, 5.3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(2rem, 3.65vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.45
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  tag: "5px"
  reply: "6px"
  control: "8px"
  avatar: "10px"
  conversation: "14px"
  surface: "16px"
spacing:
  gap-small: "8px"
  control-block: "12px"
  inset-small: "16px"
  bento-gap: "20px"
  mobile-gutter: "24px"
  card-inset: "32px"
  desktop-gutter: "48px"
  section-mobile: "70px"
  section-tablet: "85px"
  section-desktop: "112px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.primary-label}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-ink-light:
    backgroundColor: "{colors.light-ink}"
    textColor: "{colors.light-paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-ink-dark:
    backgroundColor: "{colors.dark-ink}"
    textColor: "{colors.dark-paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-forest-light:
    backgroundColor: "{colors.light-forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-forest-dark:
    backgroundColor: "{colors.dark-forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-forest-hover:
    backgroundColor: "{colors.forest-hover}"
  input-light:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  input-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  tag:
    rounded: "{rounded.tag}"
    padding: "5px 10px"
  bento-light:
    backgroundColor: "{colors.light-soft}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.surface}"
    padding: "32px"
  bento-dark:
    backgroundColor: "{colors.dark-soft}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.surface}"
    padding: "32px"
---

# Design System: Maestro

## Overview

**Creative North Star: "Warm paper, botanical green, precise rules"**

The implemented interface combines generous headlines with compact, readable conversations. Warm pale surfaces and quiet rules establish structure; forest panels and a lime action color give decisions and progress more emphasis. The dark theme keeps the same hierarchy with lighter green text and deeper surfaces.

**Key Characteristics:**
- One botanical green accent family, from forest to lime.
- Self-hosted DM Sans throughout, with large, tightly spaced headings.
- Open sections, asymmetric bento surfaces, and visible conversational examples.
- Restrained movement that never hides essential content.

This is an implementation snapshot of `app/globals.css`, `components/interactive.tsx`, `components/brand.tsx`, `app/layout.tsx`, and `app/page.tsx`. The frontmatter records existing values; the sidecar supplies responsive behavior, motion, and component specimens. CSS remains the runtime source of truth. The sidecar’s tonal ramps are derived swatch previews, not additional application colors.

## Colors

### Primary

Green is the only accent family. `green` colors emphasized text, icons, focus outlines, and progress. `lime` fills primary actions and highlights content on forest surfaces. `forest` is used for the status bar, selected step, notification, principles, and release panel; `accent-soft` is the quieter green surface behind supporting content. These are tonal roles within one family, not separate brand accents.

### Neutral

The `paper`, `surface`, `soft`, `ink`, `muted`, and `line` roles control the page, raised conversation, alternating sections, main copy, supporting copy, and dividers. Each `light-*` and `dark-*` frontmatter token maps to its corresponding CSS property, for example `dark-paper` becomes `--paper` under `[data-theme=dark]`. Shared `lime` and `on-forest` values remain constant across themes.

The initial theme follows saved `maestro-theme`, then the system preference when no preference is saved. The header toggle updates the document theme and saves the selection. Forest surfaces use `on-forest` and `forest-muted`, rather than the normal page text roles.

**The One Accent Rule.** Reuse the existing green family for actions, emphasis, and status; communicate errors and progress with text, icons, and semantic state as well as color.

## Typography

DM Sans is self-hosted from `public/fonts/dm-sans-regular.ttf` and `public/fonts/dm-sans-semibold.ttf`, with `font-display: swap` and a sans-serif fallback. The CSS declares weight ranges 400–500 and 550–800 on these two font files. There is no separate display or monospace family.

The frontmatter defines the base heading and body hierarchy. The hero preserves three authored lines. Headings balance their wrapping; paragraphs use pretty wrapping and break long words. Supporting copy is typically 13–17px, with compact product labels at 9–12px. Example messages use 20–22px; step numbers use tabular numerals. The hero description is limited to 48ch and walkthrough description to 60ch.

At 700px and below, the hero uses `clamp(42px, 8.5vw, 63px)` and a 1.08 line height; at 390px and below it is 42px. Most section headings become 36px at 700px, then 33px at 390px. Preserve these responsive rules when extending the current landing page.

## Layout

The centered container has a 1280px maximum width including gutters. Default gutters are 48px; they reduce to 32px at 1100px, 24px at 700px, and 20px at 390px. Section padding changes from 112px to 85px at 900px, then 70px at 700px.

The desktop hero uses a 1.1:0.9 grid with a 62px gap. The walkthrough pairs a 370px step list with a flexible panel. Maestro cards use a 1.15:1 bento grid and a 20px gap; the conversation spans two rows. Large sections alternate open content, soft surfaces, and forest panels.

| Breakpoint | Implemented change |
| --- | --- |
| Minimum 1450px | Hero gap increases to 85px and vertical space to 100px/90px. |
| Maximum 1100px | Narrower gutters and gaps; walkthrough list becomes 310px; form stacks. |
| Maximum 900px | Ownership becomes two columns; walkthrough list becomes 270px. |
| Maximum 700px | Header reduces from 85px to 72px and its CTA is hidden; hero, bento, major paired sections, and walkthrough stack; steps become a two-column grid. |
| Maximum 390px | Tightest gutters and type adjustments; form stacks again. |

The comparison remains a real table in a horizontally scrollable, keyboard-focusable region. Its minimum width is 720px on larger screens and 690px at 700px and below. The ownership grid retains two columns on mobile. The 360px minimum is a product requirement, not an additional CSS breakpoint.

## Elevation & Depth

Most surfaces are flat, separated by tone and one-pixel rules. The hero conversation alone uses the reusable `--shadow`: `0 22px 60px -25px #1a392b38` in light mode and `0 22px 60px -25px #0008` in dark mode. Its soft green backing plate is rotated 3 degrees. Buttons move upward 2px on hover; cards have no generic lift effect.

Scroll reveals move visible content upward from a 16px offset over 0.7s with `cubic-bezier(.16,1,.3,1)`. The hero uses 0.9s. Approval and mockup results enter over 0.25s with `ease-out`. Reduced-motion preferences disable animations, transitions, and smooth scrolling. Content is visible before IntersectionObserver runs and when JavaScript is unavailable.

## Shapes

The primary surface radius is the CSS `--radius` represented by `rounded.surface`. Controls, fields, tags, reply buttons, avatars, and the conversation window use the smaller radii recorded above. The user's chat bubble has an asymmetric `12px 12px 3px 12px` shape. Status dots are circular; section dividers remain straight. The inline brand mark is a rounded, stroked double arch with a crossbar; it inherits its surrounding text color.

## Components

- **Buttons:** primary lime, ink, and forest treatments share compact typography and an 8px radius. Default buttons have a 51px minimum height; the header variant has a 42px minimum height, 10px/15px padding, and 12px type. Hover transitions take 0.2s. Icon buttons are 42px square; pagination uses 35px and replay uses 28px. Disabled pagination dims to 0.35 opacity.
- **Fields:** the email field uses a visible label, surface fill, one-pixel line border, 51px minimum height, and muted placeholder. Invalid input receives a two-pixel green outline and an explicit message. Submission currently returns a clearly disclosed preview state; it neither sends nor stores an address.
- **Header:** the header is sticky, opaque, and separated by a rule. It contains the logo, theme toggle, and desktop CTA. At 700px and below, only the logo and theme toggle remain. The one-page site has no section menu or navigation at any viewport size.
- **Tags:** compact, outlined, semibold labels. They annotate release and planning status and are not interactive filters.
- **Bento cards:** soft, forest, and accent-soft surfaces use the shared surface radius. Default inset is 32px, changing to 27px at 900px and 28px at 700px. The forest notification uses the forest text roles.
- **Conversation:** an explicitly illustrative figure contains a user bubble, Maestro reply, recommendation rule, approval button, and four-stage status track. Approval updates both the reply and progress, with a replay action. The reply area announces changes politely.
- **Walkthrough:** eight native buttons expose the selected state through `aria-pressed` and control a named panel. Selected steps use forest with lime numbering. Panel copy is a polite atomic live region; previous/next buttons disable at the ends. The third step has a clearly illustrative, reversible check-result preview.
- **FAQ:** native `details` and `summary`, divided by rules; a chevron rotates when open. No custom accordion keyboard model is required.

All links, buttons, inputs, summaries, and explicitly focusable regions receive a three-pixel green focus outline with a five-pixel offset. A skip link reaches the main content. The page declares English, uses semantic landmarks and table headers, names icon controls, and keeps state messages in live regions. These are implemented supports, not a claim that every WCAG criterion has been independently audited.

## Do's and Don'ts

### Do:
- **Do** reuse semantic CSS colors so both themes remain coherent.
- **Do** preserve visible labels, keyboard focus, state text, and reduced-motion behavior.
- **Do** keep illustrative conversations and mockups explicitly identified as examples.
- **Do** use the existing DM Sans hierarchy, open rules, and restrained surface depth.

### Don't:
- **Don't** introduce a second accent family or use color as the only state signal.
- **Don't** hide essential content behind scroll animations.
- **Don't** turn every section into a shadowed card or add generic hover lift to cards.
- **Don't** present the current waitlist preview as a successful subscription.
