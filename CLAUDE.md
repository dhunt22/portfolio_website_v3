# devinhunt.com

This repo holds Devin Hunt's portfolio and the Stan Scribe app pages.
Next.js 14 App Router with static export, Tailwind 3 and Jest 29.

## Before any UI work

- Read `DESIGN.md` (the Working Map system and its decision log) and `PRODUCT.md`.
- The portfolio lives in `app/(site)/`. It is styled under the `.site` scope in `app/globals.css`.
- Stan Scribe lives in `app/(stanscribe)/` and keeps its own system. Its copy rules are in
  `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md`, enforced by `__tests__/stanscribe/`.
- Stan Scribe must not pick up portfolio styles: no `.site`, `components/site/` or `text-site-*` there.
- Route groups do not change URLs. The 404 (`app/not-found.tsx`) wraps itself in `SiteChrome`.
- Do not invent claims, metrics or testimonials. Use what PRODUCT.md › Evidence on Hand lists.

## Verify

1. `npx jest --ci`
2. `npm run build` (static export to `out/`)
3. Check the change in a browser at 1440 and 390 wide, in light and dark.

Never run `npm run build` while `next dev` is running. They share `.next`.

## Skills

Skills are project-scoped in `.claude/skills/` (gitignored, so local only).

- Impeccable (`.claude/skills/impeccable/`) handles critique and the DESIGN.md format.
- Taste-Skill's `.claude/skills/design-taste-frontend/scripts/inspect.mjs` is the render check.
