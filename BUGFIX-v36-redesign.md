# v36 follow-up — Bug fixes + full visual redesign

## Bugs fixed

1. **Deleting a user login crashed the request.**
   `routes/auth.js` called the shared `tryDelete()` helper (used by six
   other route files for friendly foreign-key-constraint messages) but
   never imported it from `middleware/auth.js`. Any Super Admin deleting
   a user account would hit `ReferenceError: tryDelete is not defined`.
   Fixed by adding `tryDelete` to the destructured import.

2. **"On Leave" attendance badges had no background color.**
   `.status-leave` in `theme.css` referenced `var(--info-bg)`, a CSS
   variable that was never defined in either the light or dark theme
   token blocks. The badge rendered with a transparent background,
   inconsistent with the other status badges. Added proper `--info` /
   `--info-bg` tokens to both themes and fixed the rule to use them.

3. **People Operations (HR) module ignored dark mode.**
   The HR/People Ops section of `theme.css` had accumulated **three**
   separate layers of CSS ("HR Command Center", "HR 2.0", "PEOPLE
   OPERATIONS — FINAL") stacked on top of each other with hardcoded hex
   colors and `!important`, each overriding the last. Because none of
   them used the theme's CSS variables, that whole module always
   rendered light/white regardless of the light/dark theme toggle.
   Consolidated all three into a single block built on the shared design
   tokens, so it now respects the theme like the rest of the app.

Static verification performed (no network/native-module access was
available to actually run `npm install` / the app / the Node test
suite in this environment): every backend file passed `node --check`,
and the entire frontend was bundled end-to-end with esbuild (imports,
JSX, and CSS) with zero errors.

## Redesign

Replaced the warm rustic "amber/gold cafe" visual language with a new
cool violet/cyan "Aurora" system:

- New color tokens (light + dark) — violet primary, cyan secondary,
  cool neutral surfaces instead of warm cream/terracotta.
- New typeface pairing: Sora (display) + Inter (body), replacing Space
  Grotesk + Inter.
- Pill-shaped buttons and a redesigned sidebar active-link treatment
  (left accent bar + soft tint instead of a solid filled block).
- Login page rebuilt from scratch as a split-screen layout (brand panel
  with feature highlights on the left, sign-in form on the right, with
  a show/hide password toggle) instead of the previous centered card on
  a gradient background. Collapses to a single centered form on narrow
  screens.
- The People Operations redesign above uses the same new tokens, so the
  new look is consistent across the whole app, not just the login page.
