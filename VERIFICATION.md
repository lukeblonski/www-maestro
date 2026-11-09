# Verification

- TypeScript check and production static export pass.
- Visual inspection: 1440px and 1280px desktop, 360px mobile; light and dark themes.
- At 360px, the document width equals the viewport width; the comparison table has its own horizontal scrolling region.
- All internal anchors resolve to existing sections.
- Theme switching and persistence after reload work; browser storage contains only the theme preference.
- The header has no section navigation or menu on desktop or mobile. It retains the logo and theme toggle, plus a CTA above the mobile breakpoint.
- The conversation approval and replay controls work.
- All eight example stages are selectable. Previous/next controls respect the endpoints. The video mockup toggles an explicitly illustrative result.
- FAQ opens and closes with native disclosure controls.
- Empty email submission shows an accessible error; a valid preview email shows the explicit no-send/no-save message.
- No application warnings or errors observed in the local browser console.
- Main text color pairs exceed WCAG AA 4.5:1 in both themes. Reduced-motion CSS removes animation and smooth scrolling.
- Independent review of the code and screenshots found no material issue.

This is not an exhaustive accessibility certification, assistive-technology test or cross-browser audit. The form deliberately has no backend. No application code includes analytics or tracking services; fonts are served locally.
