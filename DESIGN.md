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
  worked-deep: "#9cc1dc"
  worked-deep-night: "#2f5a7a"
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
  link:
    textColor: "{colors.selected}"
---

# Design System: devinhunt.com

Approved 2026-10-25 after three rounds of prototypes (round 3, "C3"). Reference prototypes:
`.taste-skill/proto/c3/` (gitignored) and the decision page
https://claude.ai/artifact/NKpPGPwhhGFPPXEC1eN8GV. Product truth lives in `PRODUCT.md`.

**Scope.** This system governs the portfolio pages: home, portfolio, résumé, project pages, outdoors,
404. The Stan Scribe pages keep their current system (`components/stanscribe/type.ts`, Newsreader and
Hanken, `.panel`) until they get their own direction as a separate product; the legacy tokens they use
stay in place and are not renamed.

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
- **Worked Tint** (#c6dcec; night #1f3a4f): the fill of watersheds and glyphs that hold Devin's work;
  **Worked Deep** (#9cc1dc; night #2f5a7a) is its second step, used only inside glyphs that need zones.

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

## Layout

- **Frame:** one pair of outer margins, `clamp(16px, 3vw, 40px)`, on every element that touches an edge
  (strip, header, hero, bands, footer). Content columns start on that margin; nothing is centred except
  inside the map.
- **Measures:** statement 30ch, body text 56–70ch, lists and the résumé up to 72–76rem wide.
- **Section rhythm:** bands are separated by `clamp(64px, 9vw, 128px)`; list entries by 22px of padding
  and 8px gaps. Space separates things, not lines.
- **The clearing:** the fixed backdrop is masked so contours fade out behind the hero text. Desktop:
  `radial-gradient(50% 78% at 18% 40%, transparent 30%, #000 74%)`. Phones (≤860px):
  `linear-gradient(to bottom, transparent 0 34%, #000 62%)`.
- **Breakpoints:** 860px (two columns collapse to one, list meta moves under the name, readout drops its
  wide fields), 520px (the header's Email button hides; email stays in the footer and actions).

### Page blueprints
- **Home:** strip · header · hero (display name, lead statement, "See the work" + "Résumé") on the
  clearing · band "Selected work": the lead project (Environmental Justice for Prisons, drawn large
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
with that place's Lat, Lon, Watershed (or Subbasin) and code; leaving restores the default. Not a live
region (`aria-live="off"`): the same facts are on the page in text. Hidden in print.

### Navigation
Wordmark "Devin Hunt" (700, 1.125rem) at left; three plain links (Portfolio, Résumé, Outdoors) in body
type; the current page underlined 2px at 0.35em offset; the theme toggle (square, ink icon) and one
primary "Email me" button at right. No dropdowns. Below 640px the three links take their own row under the
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
entries carry a Water Blue "Coming soon" label after the name and no link target until they launch. On the portfolio each entry is a disclosure: the row is its summary, and opening it shows the full description, any figure and the links. On the home page the highlights are links to their entries.

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
| `ContourBackdrop`, `AnimatedContourBackground`, plates, `useThemeBackground` | Keep. Add the clearing mask and bands. |
| `app/(site)/`, `app/(stanscribe)/` | Route groups (no URL change): the portfolio pages get `SiteChrome`; Stan Scribe keeps the legacy `Header`/`Footer`. |
| `app/fonts.ts` | Add Public Sans as `--font-site`. Keep Newsreader and Hanken for Stan Scribe; drop JetBrains Mono once nothing uses it. |
| `app/globals.css`, `tailwind.config.js` | A `.site` scope adds `--site-*` tokens and remaps the existing semantic tokens (`--surface-page`, `--text-*`, `--font-*`…) to this system, so existing components and the glow follow it inside the portfolio while Stan Scribe keeps the legacy values. Tailwind gains `site` colours, `font-site`, `text-site-*` roles, `gutter`/`section` spacing. Remove `.eyebrow-mono`, `.link-quiet-mono`, `.section-title` once unused. |
| `components/site/SiteHeader.tsx`, `SiteFooter.tsx`, `SiteChrome.tsx`, `Readout.tsx` | New: readout strip, wordmark + Portfolio/Résumé/Outdoors + theme toggle + Email me (no dropdown), one-line footer. The legacy `components/layout/Header.tsx` and `Footer.tsx` stay for Stan Scribe. |
| `app/page.tsx` | Rebuild to the home blueprint. Remove `HeroLoadIn` and the panels. |
| `app/portfolio/page.tsx`, `ProjectIndex`, `ProjectMap` | Replace the index with glyph entries and filters; the EEJ map stays on its project page. |
| `app/resume/page.tsx`, `components/resume/*` | Restyle to entries; add the watershed map header (new `WatershedMap`). |
| `app/interests/page.tsx`, `InterestSection` | Restyle to bands; photos stay. Rename the nav label to Outdoors. |
| `lib/portfolio-data.ts` | Add glyph type, place, coordinates or boundary per project; add the tools. |
| `public/data/` | Restore `cuyama_subbasin.geojson` and `yuba_subbasins.geojson` (B118) from git history. |
| Stan Scribe pages and components | Untouched until their own direction. |
