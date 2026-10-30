---
name: devinhunt.com
description: The working portfolio of a water resources engineer who builds AI tools, set as an instrument over his own contour drawings.
colors:
  ground: "#eef1f3"
  ground-night: "#111517"
  ink: "#0d1114"
  ink-night: "#e9edef"
  soft: "#4d5962"
  soft-night: "#a2adb5"
  basin: "#ffffff"
  basin-night: "#1c2429"
  basin-edge: "#cdd6dd"
  basin-edge-night: "#3a4851"
  worked: "#c6dcec"
  worked-night: "#1f3a4f"
  selected: "#1c5a85"
  selected-night: "#6fb1de"
  strip: "#0d1114"
  strip-night: "#06090b"
  strip-ink: "#e6eaed"
  strip-label: "#9aa7b1"
  speaker-blue: "#2f7ed8"
  speaker-orange: "#d9822b"
  speaker-green: "#2e9a68"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 2rem + 5vw, 6.25rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.15rem + 0.8vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.45vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\" 1"
rounded:
  none: "0px"
spacing:
  margin: "clamp(16px, 3vw, 40px)"
  column: "75rem"
  section: "clamp(64px, 9vw, 128px)"
  item: "22px"
  stack-sm: "8px"
  stack-md: "24px"
  stack-lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  readout-strip:
    backgroundColor: "{colors.strip}"
    textColor: "{colors.strip-ink}"
    padding: "9px {spacing.margin}"
    typography: "{typography.label}"
  project-item:
    textColor: "{colors.ink}"
    padding: "{spacing.item} 0"
  project-glyph:
    backgroundColor: "{colors.worked}"
    textColor: "{colors.ink}"
    size: "72px"
  highlight-glyph:
    backgroundColor: "{colors.worked}"
    textColor: "{colors.ink}"
    size: "108px"
  link:
    textColor: "{colors.selected}"
---

# Design System: devinhunt.com

Approved 2026-10-25 after three rounds of prototypes (round 3, "C3"). Reference prototypes:
`.taste-skill/proto/c3/` (gitignored) and the decision page
https://claude.ai/artifact/NKpPGPwhhGFPPXEC1eN8GV. Product truth lives in `PRODUCT.md`.

**Scope.** This system governs the portfolio pages: home, portfolio, résumé, project pages, outdoors,
404. The Stan Scribe pages keep their own system (`components/stanscribe/type.ts`, Newsreader and
Hanken, the legacy paper tokens, which are not renamed) as a separate product. Since 2026-10-28 they
have their own header and footer (`StanScribeHeader`, `StanScribeFooter`: the name, Stan Scribe Light,
Help, the theme toggle; "Made by Devin Hunt") instead of the June 2026 portfolio chrome, and each page
is one centred `.panel` sheet (`SHEET` in `components/stanscribe/Section.tsx`) whose sections are
chapters with centred serif h2s, separated by space. Prose sits in a centred 42rem column with its lines
set left; nothing is boxed inside the sheet.

## Overview

**Creative North Star: "The Working Map"**

The site is an instrument laid over terrain. Behind every page is one of Devin's own contour plates,
drawn from elevation data, breathing slowly as bands of lines fade out and return. On top sits a calm,
exact interface: one typeface, ink on a cool grey, a readout strip pinned to the top that reports what
the visitor is pointing at, and projects drawn as their places. It reads as technical writing with one
streak of art: the contours are the art, and everything else stays out of their way.

Density is moderate and content-first. The first screen of each page carries one large thing (the
name, a page title, or the résumé's watershed map) and the full content follows on calm bands. Colour
is rare and always means something: water-blue marks data, selection and links; the contour plates
keep their own earth tones. Photos are not the main focus; projects are represented by spatial glyphs
made from their own geometry or from the thing they measured. Photos belong on the Outdoors page.

Rejected in the review rounds, by the owner: stacked bordered cards; framed figures with title blocks
and photo-led project presentation (direction A); a half-screen sticky plate (direction B); a table of
projects; the interactive map in the home hero.

**Key Characteristics:**
- One typeface, Public Sans, held to six roles. No monospace, no tracked capitals, no eyebrow labels.
- The page's own contour plate behind everything, cleared behind the hero words like a map label.
- A single dark readout strip at the top of every page: the site's only chrome and its signature.
- Projects drawn as glyphs: a watershed or subbasin outline, the project's data points, or a drawing of
  what it measured.
- Square corners, no shadows at rest, no gradients, no boxes around content.

## Colors

Ink on a cool grey paper, with water-blue reserved for data and the contour plates supplying the only
other colour.

### Primary
- **Water Blue** (#1c5a85; night #6fb1de): links, the selected watershed or pin, the hovered glyph,
  "Coming soon" labels. Never a background for text, never decoration.

### Secondary
- **Worked Tint** (#c6dcec; night #1f3a4f): the fill of watersheds and glyphs that hold Devin's work.

### Neutral
- **Cool Paper** (#eef1f3; night #111517): the page ground, and the colour the breathing glow erases
  lines into (`--surface-page`).
- **Field Ink** (#0d1114; night #e9edef): all running text, headings, the primary button.
- **Survey Grey** (#4d5962; night #a2adb5): secondary text only: meta, sub-lines, captions. 7.0:1 on
  Cool Paper; never for running text.
- **Basin White** (#ffffff; night #1c2429) with **Basin Edge** (#cdd6dd; night #3a4851): the fill and
  edges of the watershed map.
- **Strip** (#0d1114; night #06090b) with **Strip Ink** (#e6eaed) and **Strip Label** (#9aa7b1): the
  readout strip.

### Data colours
- **Speaker Blue / Orange / Green** (#2f7ed8, #d9822b, #2e9a68): Stan Scribe's own speaker colours, used
  only in its caption glyph.
- **Contour plates:** the per-page plate SVGs in `public/images/plates/` keep their baked earth tones and
  opacity (light plates stay as faint as they are; owner decision 2026-10-25).

### Named Rules
**The Data Colour Rule.** Blue means data, selection or a link. If it is decoration, it is wrong.

**The One Strip Rule.** The readout strip is the only dark band on a page. Nothing else inverts.

**The Band Rule.** Below the first screen, content sits on a full-width band of the ground colour at
92% (night 90%) so the plate shows only faintly. Bands are never boxed, bordered or inset.

## Typography

**Display Font:** Public Sans (with system-ui, sans-serif)
**Body Font:** Public Sans
**Label Font:** Public Sans with tabular figures

**Character:** The U.S. Web Design System's public-service sans: plain, sturdy and exact, set large and
tight for names and loose for reading. One family keeps the art in the contours, not the type.

### Hierarchy
- **Display** (700, clamp(3.5rem, 2rem + 5vw, 6.25rem), 0.95, -0.035em): the page's h1 only (name or page title).
- **Headline** (700, clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem), 1.1, -0.02em): section h2s; the lead project's name.
- **Title** (600, clamp(1.375rem, 1.15rem + 0.8vw, 1.875rem), 1.15, -0.02em): project and tool names, résumé roles.
- **Lead** (400, clamp(1.25rem, 1.1rem + 0.45vw, 1.4375rem), 1.45): the opening statement; max 30ch beside the display.
- **Body** (400, 1.0625rem, 1.55): running text, max 56–70ch.
- **Label** (400–500, 0.9375rem, tabular figures): the readout, meta lines (place · years), filters, captions.

### Named Rules
**The Six Roles Rule.** No size outside these six. A new need maps onto an existing role.

**The Label Halo Rule.** Text that sits over contours (hero only) gets the ground-coloured halo
`text-shadow: 0 0 3px var(--ground), 0 0 10px var(--ground)`, the way a map haloes its labels. Never on
filled buttons, never below the first screen.

**The Plain Words Rule.** Sentence case everywhere. Coordinates and numbers in tabular figures. No
monospace (it was the June 2026 site's eyebrow costume).

**The Even Lines Rule.** Headings and project names balance their lines (`text-wrap: balance`);
paragraphs avoid a one-word last line (`text-wrap: pretty`). A page title too wide for a narrow phone
hyphenates rather than pushing the page sideways.

## Layout

- **Frame:** one centred column, 75rem (1200px) wide, with equal margins on both sides
  (`px-frame`: the `clamp(16px, 3vw, 40px)` gutter on small screens, then whatever centres the column).
  The strip, header, hero, bands and footer all use it; bands and the strip still run full width behind
  it. Each page's first screen (name or title, statement, actions) is centred in the frame (`HERO` in
  `components/site/type.ts`), its lines balanced. Section headings, lists, entries and running text stay
  set left inside the column. The résumé's opening is the exception: it sits left of its map.
- **Measures:** statement 30ch, body text 56–70ch, lists and the résumé up to 72–76rem wide.
- **Section rhythm:** bands are separated by `clamp(64px, 9vw, 128px)`; list entries by 22px of padding
  and 8px gaps. Space separates things, not lines.
- **The clearing:** the fixed backdrop is masked so contours fade out behind the hero text. Desktop,
  centred under the centred hero: `radial-gradient(44% 62% at 50% 34%, transparent 34%, #000 78%)`; the
  résumé (`data-clearing="left"`) keeps `radial-gradient(50% 78% at 18% 40%, transparent 30%, #000 74%)`.
  Phones (≤860px): `linear-gradient(to bottom, transparent 0 34%, #000 62%)`.
- **Breakpoints:** 860px (two columns collapse to one, list meta moves under the name, readout drops its
  wide fields), 520px (the header's Email button hides; email stays in the footer and actions).

### Page blueprints
- **Home:** strip · header · centred hero (display name, lead statement, "See the work" + "Résumé") on
  the clearing · band "Selected work": the lead project (Environmental Justice for Prisons, drawn large
  from its prison points, 7/5 split with its text) then a two-column list of four highlights (Yuba
  Subbasins Recharge Analysis, AIIWFM, ZBudget Dashboards "Coming soon", Stan Scribe) · footer. No map.
- **Portfolio:** display title "Where the work is", lead line · band "Projects": its filters (All, Water
  resources, Geospatial, Research, with counts), then every project as a glyph entry · band "Tools".
  Project detail pages (EEJ) keep their working MapLibre map.
- **Résumé:** header row with the résumé's opening (display name, title, contact, summary, "Download
  PDF") beside the interactive California watershed map with project pins; the strip follows the map ·
  band "Experience" and the rest of the résumé as entries. Prints clean (no plate, no strip).
- **Outdoors (Interests):** the one page where photographs lead; same type, bands and strip.

## Elevation & Depth

Flat. Depth comes from the plate: the contours sit behind everything, clear behind the hero words and
show faintly through the 92% bands. Nothing at rest has a shadow. Only things that truly float may:
map controls and a dropdown menu, with `0 1px 2px rgba(13,17,20,.08), 0 8px 24px rgba(13,17,20,.12)`.

**The Flat Rule.** If it does not float above the page, it has no shadow and no border.

## Shapes

Square corners everywhere (`0px`), including buttons. No outlined boxes, no hairline dividers between
sections, no rounded cards. The recurring forms are the glyphs: closed outlines filled with Worked Tint
and stroked in ink at 1.1px (non-scaling), dots at 1–1.5px radius, and the model mesh.

## Components

### Readout strip (signature)
Sticky at the top of every page, `var(--strip)` ground, label type, tabular figures, one row,
overflow hidden. Fields are `Label value` pairs with the label in Strip Label. Default content is the
page's plate ("Plate · Big Sur, California · Lat · Lon", right side "Contours drawn by Devin Hunt"); on
the résumé, "Home base · Sacramento". Pointing at or focusing a project, watershed or pin replaces it
with that place's Lat, Lon, Watershed (or Subbasin) and code; leaving, or following a link to another
page, restores the default. Not a live
region (`aria-live="off"`): the same facts are on the page in text. Hidden in print.

### Navigation
Wordmark "Devin Hunt" (700, 1.125rem) at left; three plain links (Portfolio, Résumé, Outdoors) in body
type, on the page's centre line from 640px (a `1fr auto 1fr` grid); the current page underlined 2px at
0.35em offset; the theme toggle (square, ink icon) and one primary "Email me" button at right. No dropdowns. Below 640px the three links take their own row under the
wordmark and the theme toggle, still on one line; the button hides under 520px.

### Buttons and links
- **Primary button:** Field Ink fill, Cool Paper text, square, 44px tall, 0 20px padding; hover drops to
  88% opacity; visible 2px Water Blue focus ring at 3px offset. One per screen region.
- **Links:** Water Blue, underlined, 0.2em offset; hover thickens the underline. Arrow suffixes are
  `aria-hidden`.

### Project entry (glyph list)
A row spanning the page: 72px glyph (52px on phones) · name in Title · meta in Label (place · years,
right-aligned on desktop, under the name on phones) · one line of Body, max 56ch. Hover or focus
underlines the name (2px) and fills the glyph with Water Blue at 45%, and updates the strip. Coming-soon
entries carry a Water Blue "Coming soon" label after the name and no link target until they launch. On the portfolio each entry is a disclosure: the row is its summary, and opening it shows the full description, any figure and the links. On the home page the highlights are links to their entries, and their glyphs are half again the size, 108px (78px on phones), since home shows only four (owner, 2026-10-28). A "Coming soon" label is an inline-block, so a narrow line breaks before it.

### Glyphs
Each project is drawn from its own geometry or from the thing it measured, in a 72×72 box:
- **Subbasin outline:** DWR Bulletin 118 polygon where one exists (Cuyama Valley 3-013; North and South
  Yuba 5-021.60/.61). Until Antelope Valley (6-044) and South American (5-021.65, Harvest Water) are
  added, those use their HUC8 watershed and say "watershed" in the strip.
- **All watersheds:** the statewide project (Watershed Hub).
- **Points:** the project's own data (Environmental Justice for Prisons: prison locations).
- **Drawn subjects:** boreholes with the restricting layer marked (infiltration study), six wells across
  groundwater contours with the gradient arrow (quarterly reports), households on a grid with seasonal
  ones filled (urban water use).
- **Model family (tools):** the IWFM mesh (AIIWFM), the mesh split into three zones (ZBudget
  Dashboards), a subset of the mesh filled with the rest as faint outline (IWFM workflow suite), and a
  1:1 calibration plot (PyPEST).
- **Captions:** three caption bars with speaker-colour dots (Stan Scribe).
Glyphs are `aria-hidden`; the entry's text carries the meaning.

### Watershed map (résumé header)
California's 140 HUC8 watersheds from `public/data/HUC8_CA_simple.geojson`, equirectangular at 37.5°N,
Basin White fills at 94% so the plate ghosts through, Worked Tint where work happened, Water Blue at
45% for the selection. Pins: 5px ink dots with 15px labels haloed in the ground colour, sized in screen
pixels at any scale; Sacramento as an open ring (home). Pins are focusable buttons; focus draws the
site's 2px Water Blue ring around the dot at 3px; Enter or Space selects; the caption under the map names
the selected project. The map is the résumé's header only.

### Lead project (home)
The Environmental Justice for Prisons points drawn large (about 640×380) beside its text in a 7/5
split; the dots turn Water Blue on hover or focus. The text reads name (Headline), meta (Label), one
paragraph and the link, in the order every entry uses; the meta never sits above the name as an eyebrow.

### Backdrop
`ContourBackdrop` / `AnimatedContourBackground` are kept: per-page plates, pre-paint height pin,
load-gated fade-in, deferred glow. Added: the clearing mask and the ground-coloured bands. The glow's
breathe stays as is: 9 bands, fade in 2.2s, hold 1.2s, fade out 2.2s, a band every 2s, opacity only,
never under reduced motion.

### Footer
One quiet line on a band: "Devin Hunt · Sacramento, California", email, GitHub, LinkedIn. No sitemap,
no labels.

## Do's and Don'ts

### Do:
- **Do** set every size from the six roles and every colour from the tokens above.
- **Do** draw a new project as a glyph from its own geometry or measurement before reaching for a photo.
- **Do** keep text on the clearing or on a band; contours never run behind body text.
- **Do** keep the strip truthful: it reports only real coordinates, names and codes.
- **Do** keep focus visible (2px Water Blue, 3px offset) and give every map pin a keyboard path.
- **Do** keep motion to the breathe and 120–200ms state changes, and drop both under reduced motion.

### Don't:
- **Don't** box content: no cards, panels, bordered sections or tables for projects.
- **Don't** put the interactive map on the home page.
- **Don't** use monospace, tracked capitals, eyebrows or a second typeface.
- **Don't** put a shadow, gradient or rounded corner on anything at rest.
- **Don't** use photos as the main presentation of work; they live on Outdoors and project pages.
- **Don't** invent locations, metrics or claims; approximate coordinates are labelled approximate until
  replaced by real boundaries.

## Implementation map

| Piece | Decision |
| --- | --- |
| `app/(site)/`, `app/(stanscribe)/` | Route groups (no URL change). `app/(site)/layout.tsx` wraps home, `portfolio/`, `portfolio/environmental-justice-prisons/`, `resume/` and `interests/` in `SiteChrome`. `app/(stanscribe)/layout.tsx` gives `stanscribe/` and `stanscribe-light/` their own `StanScribeHeader` and `StanScribeFooter`; the legacy `components/layout/Header.tsx` and `Footer.tsx` are deleted. |
| `app/layout.tsx` | Root layout: `ThemeProvider` and `ErrorBoundary` around each group's frame. It loads no fonts, has no header, footer or skip link; each group's frame (and the 404) renders its own skip link and `<main id="main">`. |
| `app/not-found.tsx` | The 404 sits outside both route groups, so it wraps itself in `SiteChrome` and uses the `notFound` plate. |
| `app/fonts/site.ts`, `app/fonts/stanscribe.ts` | Two modules so a route group preloads only its own fonts (one woff2 on portfolio pages and the 404; three on Stan Scribe, Newsreader and Hanken plus Public Sans, which comes with the root 404 that Next puts in every route's tree). `site.ts`: `publicSans` loads Public Sans as `--font-site`; `SiteChrome` puts its `.variable` on the `.site` div. `stanscribe.ts`: `newsreader` (`--font-display`, upright only: the pages use no italics) and `hanken` (`--font-sans`); `app/(stanscribe)/layout.tsx` puts their `.variable` classes and `font-sans` on a wrapper div. JetBrains Mono is removed. The skip link now lives in each frame (`SiteChrome`, the Stan Scribe layout) as the first focusable element. |
| `app/globals.css` | `.site` (and `.dark .site`) adds the `--site-*` tokens and remaps the legacy semantic tokens (`--surface-*`, `--text-*`, `--brand-*`, `--border-*`, `--ring-focus`, and `--font-display`/`--font-sans`/`--font-mono` to `--font-site`), so the glow and the reused components follow this system inside the portfolio while Stan Scribe keeps the legacy values. `body:has(.site)` and `html:has(.site)` reach what sits outside the wrapper: the page ground, the Water Blue focus ring and the scrollbars. `body:has(.site)` sits outside `@layer`, or the root layout's `bg-background` utility would win. The skip link, inside `.site`, carries its own utilities in `SiteChrome` (a square, light label over the strip). The same file holds `.band`, `.halo`, the clearing mask on `[data-contour-plate]`, the Even Lines rules, the `.glyph` tones, the résumé map's basins and pins, the MapLibre controls and the print reset. `.eyebrow`, `.link-quiet`, `.eyebrow-mono`, `.link-quiet-mono`, `.section-title`, `.display`, `.lead` and `.focus-ring` are removed; `.panel` stays for the Stan Scribe sheet. |
| `app/globals.css` › `@theme inline` | Tailwind 4's theme (it replaced `tailwind.config.js`): the `site` colours (`site-band`, `site-basin`, `site-edge`, `site-worked`, `site-selected`, `site-strip`, `site-strip-ink`, `site-strip-label`), `font-site`, the six `text-site-*` roles and `gutter`/`frame`/`section` spacing (`frame` centres the 75rem column). `inline`, because the tokens point at variables `.site` and `.dark` remap. The MapLibre overrides sit outside `@layer`, since MapLibre's own stylesheet is unlayered. |
| `lib/site/metadata.ts` | `pageMetadata(title, description, path)`: a portfolio page's title, description and share cards. Next replaces `openGraph` and `twitter` whole rather than merging them with the root's, so every page (and the root, for home) builds both here. The card is `summary`: the portfolio has no share image. |
| `lib/utils.ts` | `cn()` uses `extendTailwindMerge` so tailwind-merge keeps the `text-site-*` sizes. Without it they read as colours and get dropped. |
| `components/site/SiteChrome.tsx` | `SiteChrome`: the `.site` wrapper around `ReadoutProvider`, `ReadoutStrip`, `SiteHeader`, `<main id="main">` and `SiteFooter`. |
| `components/site/Readout.tsx` | `ReadoutProvider`, `useReadout`, `ReadoutStrip` (the sticky strip), `ReadoutDefault` (sets a page's resting reading) and `useReadingHandlers` (pointer and focus handlers). A route change clears back to the resting reading. |
| `components/site/SiteHeader.tsx`, `SiteFooter.tsx` | `SiteHeader`: wordmark, Portfolio/Résumé/Outdoors, `ThemeToggle` (now takes a `className`) and Email me; no dropdown. `SiteFooter`: one line on a band. |
| `components/site/type.ts` | `SITE_TYPE` (the six roles), `HERO` (a page's centred first screen), `SITE_BUTTON`, `SITE_LINK`, `SITE_SOON`. |
| `components/site/Glyph.tsx` | `Glyph`: draws a `GlyphShape` as an `aria-hidden` SVG. |
| `components/site/Highlights.tsx` | Home's Selected work: `LeadProject` (the EEJ prison points drawn large, 7/5 split) and `HighlightList` (108px glyphs, 78px on phones, each beside one text block). |
| `components/site/ProjectsIndex.tsx`, `WorkList.tsx` | `ProjectsIndex`: the portfolio filters (All, Water resources, Geospatial, Research, with counts) over a `WorkList`. `WorkList`: glyph entries, each a `<details>` disclosure, or a plain row when there is nothing more to show (a tool that is coming soon). Entry links go through `EntryLink` (`components/site/EntryLink.tsx`), which navigates portfolio routes in place and loads Stan Scribe as a page of its own. They replace `components/portfolio/ProjectIndex.tsx` and `components/ui/tabs.tsx`, both deleted. |
| `components/site/WatershedMap.tsx` | `WatershedMap`: the résumé header map, pins as focusable `role="button"` groups. `basinAcross` assigns the slivers between simplified basins to a neighbour. |
| `lib/site/work.ts`, `map.ts`, `geodata.ts` | Server only: `geodata.ts` reads `public/data` with `node:fs` at build time, and the other two import it. Client components import only their types. `geodata.ts`: `huc8Features`, `b118Features`, `contiguousPrisonPoints`. `work.ts`: `WorkEntry`, `glyphFor`, `formatYears`, `projectEntries`, `toolEntries`, `highlightEntries`, `prisonsFigure`. `map.ts`: `resumeMap` (basins, pins, viewBox). |
| `lib/site/geo.ts`, `glyphs.ts`, `reading.ts` | Pure, safe on the client. `geo.ts`: the projection at 37.5°N, point-in-polygon, `fitTo`, `pathData`. `glyphs.ts`: `outlineGlyph`, `pointsGlyph`, `meshGlyph`, `calibrationGlyph`, `captionsGlyph`, `boreholesGlyph`, `wellsGlyph`, `householdsGlyph`. `reading.ts`: `Reading`, `placeReading`, `labelReading`, `plateReading`, `PLATES`, `HOME`, `HOME_BASE`, `formatLat`, `formatLon`. |
| `app/(site)/page.tsx` | The home blueprint: hero, then `LeadProject` and `HighlightList`. `HeroLoadIn` and the panels are gone from home. |
| `app/(site)/portfolio/page.tsx` | `ProjectsIndex` over `projectEntries()`, then a `WorkList` of `toolEntries()`. No map on the index. |
| `app/(site)/portfolio/environmental-justice-prisons/page.tsx`, `IndicatorBrowser`, `LazyProjectMap`, `ProjectMap`, `MapControls` | The EEJ page keeps its MapLibre map (`IndicatorBrowser` → `LazyProjectMap` → `ProjectMap` with `MapControls`), restyled to the six roles; the controls carry the one float shadow. It is the only MapLibre map on the site. |
| `app/(site)/resume/page.tsx`, `components/resume/*` | The résumé opening beside `WatershedMap` (fed by `resumeMap()`), then the rest on a band. `ResumeSection`, `ExperienceItem` and `SkillsList` are restyled to entries. |
| `app/(site)/interests/page.tsx`, `InterestSection` | Restyled to bands; photos stay. The nav label is Outdoors; the URL stays `/interests`. |
| `ContourBackdrop`, `AnimatedContourBackground`, plates, `useThemeBackground` | Kept unchanged; each page passes its plate. The clearing mask and the bands live in `globals.css` under `.site`. |
| `lib/portfolio-data.ts` | Each project gained `summary`, `place`, `glyph` (`GlyphSpec`), and a `location` (approximate) or a `readout`. Adds `TOOLS` and `HIGHLIGHTS`. |
| `public/data/` | `cuyama_subbasin.geojson` and `yuba_subbasins.geojson` (B118) restored from git history. |
| `__tests__/site/` | Tests for the chrome, each portfolio page, the readout, geometry, glyphs, entries, the map, `cn()` and the tokens; `tokens.test.ts` reads `globals.css` and `app/fonts/site.ts`. |
| Stan Scribe pages and components | Their own system (Scope). `Section.tsx` exports `SHEET`, `COLUMN` and `INTRO` (a hero intro, centred from 768px, set left below); `DownloadBlock` has no box and takes `withName={false}` where the page's h1 and tagline already name the app; `ComparisonTable` has no box, a rule under the app names and between rows, and equal app columns; the consent note is a heading and paragraph, not an accent-edged callout. `lib/stanscribe.ts`, `HeroLoadIn` and `ContourBackdrop`'s `quiet` veil are unchanged, except that `HeroLoadIn` shows the hero if its animation chunk fails to load. |

## Decision log

What the critique pass of 2026-10-25 (Task 13) kept on purpose. "Inspector" is Taste-Skill's
`inspect.mjs`; "detector" is Impeccable's `detect`. After the pass the detector reports no findings on
any portfolio page at 1280 and 390, so there are no detector ignores. The inspector has no persistent
ignore; its remaining findings are listed here.

| Finding | Where | Decision and reason |
| --- | --- | --- |
| Inspector `text-shadow` (FAIL) | Hero words on every page | The Label Halo Rule: text over contours gets a ground-coloured halo, the way a map haloes its labels. It is not a legibility scrim and never appears below the first screen or on filled buttons. |
| Inspector `few-pictures` (FAIL), `no-footage` (WARN) | Home, portfolio, résumé, EEJ, 404 | The owner rejected photo-led project presentation. Work is drawn as glyphs from its own geometry; there is no video by choice. Outdoors is the one page where photographs lead, and project figures open inside portfolio entries. |
| Inspector `still-page` (FAIL) | Every page | Motion is the plate's breathe plus 120-200ms state changes (Backdrop; Do's). No entrance animations, by design. |
| Inspector `off-centre` | Every page | Resolved 2026-10-28: the owner disliked the strong left-anchoring, so the pages share one centred 75rem column and centred first screens (Layout › Frame). What remains is a WARN on home at 1440 (120px left, 140px right): the right highlight's text ends at its 56ch measure short of the column edge. |
| Inspector `off-centre` (FAIL) | Stan Scribe Light at 1440 | A reading artifact: the inspector takes the 2nd and 98th percentiles of text edges, and on a page of centred text in a 42rem column the header's right-hand links are the only text near the right. Measured: the sheet sits 144px from each edge and the h1's midpoint is 720 of 1440. |
| Inspector `outlined-box`, `hairline`, `palette-cream` (WARN) | Stan Scribe pages | The one sheet keeps the panel's 1px edge so the veiled contours stop cleanly at it (owner's "solid panels" for contrast); the one rule separates the support email from the legal fine print; cream is the Stan Scribe pages' own paper palette (Scope). |
| Inspector `first-action`, `headline-lines`, `mixed-font-headline` | Stan Scribe pages | Pre-launch there is no App Store button, only "Coming soon" and the TestFlight link. The other two read each numbered step (number, h3, paragraph) as one headline. |
| Inspector `first-action` (WARN at 390) | Portfolio, Outdoors, EEJ | The header's Email me button hides under 520px (Navigation); these pages have no hero action. Email stays in the footer. |
| Inspector `shadow` (FAIL) | EEJ map: MapLibre control group, toolbar, legend, percentile menu | They float over the map, so they carry the one float shadow (Elevation & Depth). Nothing at rest has one. |
| Inspector `small-text` (WARN, 3 blocks) | EEJ map attribution | MapLibre's attribution keeps its compact 12px so the legal line stays one row over the map. It is third-party chrome, now ink on a light label in both themes; the six roles govern the site's own text. |
| Inspector `headline-lines` (FAIL at 390) | EEJ h1 | "Environmental Justice For Prisons" is the project's name; it takes three lines at the Display size on phones. Copy and the role stay; below 380px the title hyphenates (Even Lines Rule) so it never pushes the page sideways. |
| Inspector `eyebrow` (FAIL, false positive) | Résumé skills | The last item of a two-column skills list sits within 72px above the next section heading. It is a list item, not a label. |
| Body text over contours (DESIGN.md › Do: 'contours never run behind body text') | Résumé header summary, most visible on phones | Kept as approved: the C3 résumé the owner approved sets the summary over the plate, and the Label Halo keeps it legible. Raised with the owner as an open question, not resolved here. |
| Map focus ring drawn inside the edge | EEJ map surface | The map sits in a clipping frame, so its 2px Water Blue ring is drawn 4px inside the edge instead of 3px outside; every other stop keeps the 3px offset. |
| Lead project meta under the name | Home | The C3 prototype set the lead's meta above its name. That is an eyebrow, so the lead now uses the entry order (name, meta, paragraph, link). |
| Stan Scribe link stays a plain link | Home highlights | Portfolio routes navigate in place; Stan Scribe is its own product and is moving to its own site (owner decision, PRODUCT.md › Capabilities and Constraints: stanscribe.devinhunt.com), so it loads as a page of its own. |
| Phone plate position | Inspector shots at 390 | Not a defect: headless Chrome reports the host screen (1440x900), so the phone height pin makes the plate 1440px tall and the clearing sits low. With a phone-sized screen the plate sits where C3 put it. |
| Serif fallback after `--font-display` | `.site` | Not a defect: `--font-site` already carries next/font's metric-matched fallback, so the serif names after it are never reached, and no element inside `.site` uses `font-display`, `font-sans` or `font-mono` (tests guard the EEJ components). |
| Wordmark at 1.125rem | `SiteHeader` | The one named size outside the six roles; Navigation sets it (700, 1.125rem). It is a logotype, not text in a role. |
| EEJ map popups keep pre-redesign styling | `lib/maps/mapUtils.ts` | The popups keep their inline sizes and greys. They are out of scope for this redesign and listed for a later pass. |
| EEJ resting strip is a label | EEJ page | The strip rests on the label "Prisons · 1,865 across the United States" rather than the page's plate, because the page is about that dataset. A second exception beside the résumé's Home base. |
