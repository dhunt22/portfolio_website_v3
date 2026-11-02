# Stan Scribe product pages — design

Date: 2026-10-23. Approved in chat by the owner the same day.

Source brief and copy (authoritative for every word and rule):
`/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/README.md` and `copy.md`.
Mockups: `…/stanscribe-page/mockups/`. Generated legal pages: `/Users/dhunt/dev/transcript_stan/site/`.

## Goal

Ship `/stanscribe/` (Stan Scribe + Light, the Support and Marketing URL in App Store Connect) and
`/stanscribe-light/` (Light's Support and Marketing URL) on devinhunt.com, plus the six generated
legal pages, plus a featured panel on the homepage linking to `/stanscribe/`. The pages adopt the
site's design language (contour backdrop, Newsreader display, mono eyebrows, hairline panels) at
larger reading sizes for an older, hard-of-hearing audience.

## Owner decisions (2026-10-23)

- Pre-launch: "Coming soon to the App Store" for both apps, plus Stan Scribe's public TestFlight
  link (`https://testflight.apple.com/join/ejNyaGqJ`). Light shows Coming soon only (its beta link
  is not live).
- Homepage: a featured panel between the hero and Professional Expertise. No nav changes.
- Type: the site's fonts (Newsreader headings, Hanken body), body at 18–20px.
- FAQ: omit the optional EU-availability answer.

## Architecture

- Next routes `app/stanscribe/page.tsx` and `app/stanscribe-light/page.tsx`, inside the root layout
  (site header, footer, theme toggle).
- `trailingSlash` stays `false`. A post-export script `scripts/stanscribe-index.mjs` copies
  `out/stanscribe.html` → `out/stanscribe/index.html` and `out/stanscribe-light.html` →
  `out/stanscribe-light/index.html`, so the trailing-slash URLs App Store Connect uses resolve to
  real files on Netlify (which otherwise falls through `/* /index.html 200` to the homepage).
  Wired into both `build` and `netlify-build`. The script fails the build if a source file is
  missing.
- `scripts/sync-stanscribe-legal.mjs` copies only `privacy/`, `terms/`, `acknowledgements/` for each
  app from `../transcript_stan/site/` into `public/stanscribe/` and `public/stanscribe-light/`. It
  never copies the generated `index.html`. Files are copied byte-for-byte (never hand-edited).
  Re-run whenever the app session regenerates legal text. The copied files are committed.
- `lib/stanscribe.ts`: `RELEASED` flag (false), App Store URLs, TestFlight URL, support email,
  legal link sets per app, the language list, image metadata (src, width, height, alt from copy.md).
- `components/stanscribe/`: `DownloadBlock` (Coming soon / beta link, or App Store badge when
  `RELEASED`), `ComparisonTable`, `HelpBlock`, `LegalLinks`, `PhoneShot` (plain `next/image` with
  intrinsic width/height so there is no layout shift).
- Images: copy only the mockups used into `public/images/stanscribe/`, plus a 1200×630 JPEG social
  card made from `both-apps.webp`.
- When `RELEASED` flips to true, the download block links to the App Store pages with Apple's
  official badge (`public/images/stanscribe/app-store-badge-{black,white}.svg`, fetched from Apple's
  marketing tools; if unreachable now, the flag stays false and the launch-day steps say to add it).

## `/stanscribe/` sections (copy.md order, words unchanged)

1. Hero — eyebrow "For iPhone and iPad", h1 "Stan Scribe", tagline, intro, two download tiles, hero
   image (eager, the only non-lazy image).
2. Story — large serif quote panel, "— Devin".
3. How it works — three numbered steps beside `stan-scribe-live-graphite`.
4. What you get — feature cards interleaved with `stan-scribe-live-large`, `stan-scribe-conversation`
   + `stan-scribe-library`, and the full-width `stan-scribe-painted-themes` (painted art only inside
   the app frame).
5. Privacy — checklist panel, a separate accent-edged consent callout, Privacy Policy link.
6. Stan Scribe Light (`id="light"`) — `light-black-and-white`, copy, Coming soon, comparison table
   (real `<th scope>`; "Yes" text), "Not sure?" line.
7. Languages — 25 chips beside `stan-scribe-languages`; Apple Intelligence line.
8. Questions — all answers visible (no accordions), two columns on desktop.
9. Help and fine print — support email large, legal links for both apps, © line, Apple trademark line.

## `/stanscribe-light/`

Light hero (h1 "Stan Scribe Light", "The simple edition. Free.", Light copy, Coming soon), the Help
block directly after the hero (App Review must find a contact without scrolling past unrelated
content), `light-black-and-white`, the comparison table, a link to `/stanscribe/`, and Light's three
legal links plus the support email in the fine print.

## Homepage panel

Between the hero and Professional Expertise, `.panel`, two columns on md+: eyebrow "An app for my
grandpa", h2 "Stan Scribe", one sentence, "Meet Stan Scribe →" link (`/stanscribe/`), `both-apps`
image (lazy).

## Rules carried from the brief (enforced by tests where possible)

- Required on `/stanscribe/`: `stanscribe@devinhunt.com` (mailto), links to `/stanscribe/privacy/`,
  `/stanscribe/terms/`, `/stanscribe/acknowledgements/`; same for Light on `/stanscribe-light/`.
- Visible: "captions can be wrong" (FAQ, always open) and "Ask before you caption people".
- Banned anywhere (text, alt, metadata, file names): "Whisper" (any case); model or model-company
  names (NVIDIA, Moondream, Parakeet, Sortformer); prices / `$`; "tip", "donate"; "subscription"
  except as "No subscription"/"no … subscriptions"; "transcription"/"transcribe" in headings;
  "lite", "trial", "crippled" for Light.
- Accessibility: alt text from copy.md on every image; body ≥18px using `text-ink-body` or stronger
  (≥7:1 in both themes, verified: light 10.3:1, dark 9.5:1 on page / 7.8:1 on card); muted text only
  for small print (≥4.5:1); one h1, headings in order; visible focus ring (existing global);
  reduced motion (existing global); works at 320px and 200% zoom with no horizontal scroll.
- Privacy of the web page: no analytics, cookies, third-party requests. Fonts are already self-hosted
  by `next/font`. No new external origins.

## Testing

- Jest (`__tests__/stanscribe/`): render both pages; assert required elements, alt text, table
  headers, heading order, `#light`; scan rendered text + alt + exported metadata for banned terms.
- Script test: the legal sync copies exactly the six folders and never an `index.html`.
- Build check: `npm run build`; `out/stanscribe/index.html` contains "Live captions for every voice."
  and all six `out/stanscribe*/{privacy,terms,acknowledgements}/index.html` exist.
- Browser: 320px, 200% zoom, light/dark, keyboard, network tab shows only the local origin.

## Out of scope

Header/footer nav changes, new contour plates, editing generated legal text, the EU FAQ line.

## Layout update (2026-10-28)

The owner asked for a polish of these pages with less left-anchoring. The words, the two faces, the
18px floor and the 7:1 rule are unchanged. The pages now have their own header (Stan Scribe, Stan
Scribe Light, Help, theme toggle) and a one-line footer ("Made by Devin Hunt") instead of the portfolio's
chrome. Each page is one centred sheet with centred section headings; the hero is centred, the download
tiles lost their boxes, the consent note lost its accent edge, and the comparison table lost its frame.
On `/stanscribe-light/` the download line shows only the status, since the h1 and tagline already name
the app and its offer. DESIGN.md › Scope has the details.

## Colour and URL update (2026-11-01)

The warm paper palette is gone: the pages take the Working Map's colours through the root tokens in
`app/globals.css`, on a white (night #1c2429) sheet, and keep their own type. The 7:1 rule still holds
(`__tests__/stanscribe/palette.test.ts`). The header gains a "Devin Hunt" link to the portfolio, beside
the name that leads back to the main Stan Scribe page. The pages stay at `devinhunt.com/stanscribe/` and
`/stanscribe-light/`; there is no separate subdomain.

## Legal pages move here (2026-11-01)

The six legal pages are no longer byte-for-byte copies of the app repo's generated HTML in `public/`. They are
routes on the Stan Scribe sheet, with its header, footer and theme toggle, at the same URLs. Their words stay
written in the app repo, because the apps bundle the same text. `npm run sync:stanscribe-legal` fetches that
repo's `origin/main`, drops each generated page's styles and nav, and writes the words to
`content/stanscribe-legal/`. This replaces the sync described under Architecture.
