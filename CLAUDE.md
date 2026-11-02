# devinhunt.com

This repo holds Devin Hunt's portfolio and the Stan Scribe app pages.
Next.js 16 App Router (Turbopack) with static export, React 19, Tailwind 4, Jest 30 and TypeScript 7, on Node 24.

## Before any UI work

- Read `DESIGN.md` (the Working Map system and its decision log) and `PRODUCT.md`.
- The portfolio lives in `app/(site)/`. It is styled under the `.site` scope in `app/globals.css`.
- Stan Scribe lives in `app/(stanscribe)/` and keeps its own system. Its copy rules are in
  `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md`, enforced by `__tests__/stanscribe/`.
- The Stan Scribe legal pages are routes here, but their words are written in the app repo, which bundles the same
  text. To pull updates, run `npm run sync:stanscribe-legal` (it fetches `transcript_stan`'s `origin/main`), then
  review and commit `content/stanscribe-legal/`. Never edit those files by hand.
- Stan Scribe must not pick up portfolio styles: no `.site`, `components/site/` or `text-site-*` there.
  It shares only the colours, through the root tokens in `app/globals.css`.
- Route groups do not change URLs. The 404 (`app/not-found.tsx`) wraps itself in `SiteChrome`.
- Netlify serves `out/` as plain files and answers unknown paths with `404.html`. Do not add a catch-all
  rewrite to `/index.html`. App Store Connect links `/stanscribe/` and `/stanscribe-light/`:
  `scripts/stanscribe-index.mjs` copies each page to `<route>/index.html`, and `netlify.toml` rewrites those
  two URLs to the copies, or Netlify's pretty URLs would 301 them to the slashless page. The legal pages'
  slash URLs are in the apps: the same script moves each to `<page>/index.html`, so no `<page>.html` is left to
  redirect to.
- Do not invent claims, metrics or testimonials. Use what PRODUCT.md › Evidence on Hand lists.

## Verify

1. `npx jest --ci`
2. `npm run build` (static export to `out/`)
3. Check the change in a browser at 1440 and 390 wide, in light and dark.

`next build` type-checks every file tsconfig includes, tests too. There is no linter (`next lint` is gone in
Next 16, and Next's ESLint rules don't support TypeScript 7 yet).

## Styles

- Tailwind 4 keeps its theme in `app/globals.css` as `@theme inline`. Keep it `inline`: the tokens point at
  variables that `.site` and `.dark` remap, and a plain `@theme` would freeze them at `:root`.
- Rules that override third-party CSS (MapLibre) stay outside `@layer`. Unlayered CSS beats every layer in
  Tailwind 4, whatever its specificity.
- A rule in `@layer base` or `@layer components` never beats a utility on the same element, whatever its
  specificity. To override a utility, write the look as utilities or put the rule outside the layers.

## Skills

Skills are project-scoped in `.claude/skills/` (gitignored, so local only).

- Impeccable (`.claude/skills/impeccable/`) handles critique and the DESIGN.md format.
- Taste-Skill's `.claude/skills/design-taste-frontend/scripts/inspect.mjs` is the render check.
