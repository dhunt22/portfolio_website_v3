# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two products share this repository today, with different audiences.

**devinhunt.com (the portfolio).** Three audiences, none ranked above the others:

- Employers and recruiters hiring for water resources or AI roles, reading the resume and portfolio.
  Devin's ideal next position is in AI development and company operations (confirmed 2026-10-25).
- Water agencies, districts and firms evaluating project work.
- Peers and community: other engineers, the AI Innovators forum, and people curious about the work and
  interests.

These pages advertise Devin: they make the case for him as a practitioner.

**Stan Scribe (the app's site).** Older, hard-of-hearing people and their families, plus Apple App
Review checking the support and legal pages. Last in priority for the site as a whole, but these pages
must be the most accessible on it.

## Product Purpose

devinhunt.com presents Devin Hunt as a water resources engineer who builds AI tools, and backs that
with real projects, a resume and his interests outside work.

Stan Scribe is a live-captioning app for iPhone and iPad that Devin built for his grandpa Stan, who is
hard of hearing. Its site explains the app and its free edition (Stan Scribe Light), says how to get
it, and carries support and legal pages.

## Positioning

Water and AI as one practice: California groundwater work (SGMA Groundwater Sustainability Plans, IWFM
modeling, recharge and well studies, geospatial analysis) together with the AI tools he builds on top of
it (AIIWFM, tested Python automation for IWFM workflows, the firm's AI Innovators forum) and outside it
(Stan Scribe). A conventional water engineer or a generalist AI developer can claim one half, not both.

## Operating Context

- Portfolio work comes from consulting at Woodard & Curran and research at the Geospatial Centroid at
  Colorado State University (`lib/portfolio-data.ts`, nine projects).
- The resume is also a PDF (`public/data/Resume_DevinHunt_Jun2026.pdf`), and the page prints cleanly.
- Contact routes that exist: contact@devinhunt.com, LinkedIn, GitHub. Stan Scribe support:
  stanscribe@devinhunt.com.

## Capabilities and Constraints

- Next.js 14 App Router, static export (`output: 'export'`), Tailwind 3 on CSS-variable tokens,
  light and dark themes. The live site is served by Netlify (`netlify.toml`); a GitHub Pages workflow
  also runs on pushes to `main`.
- The EEJ project page carries a live MapLibre map with filters; it must keep working. The portfolio
  index draws projects as glyphs and has no map.
- Factual copy (projects, roles, dates, the Stan Scribe story) is not rewritten or extended with new
  claims without asking.
- **Decided: Stan Scribe becomes its own product site at `stanscribe.devinhunt.com`**, with its own
  routes (privacy, terms, help and so on). Open: where and how it is hosted and deployed, the redirects
  from today's `devinhunt.com/stanscribe/` and `/stanscribe-light/` (currently the App Store Connect
  Support and Marketing URLs, pre-launch), the path names (`/terms` vs `/tos`), and where Light lives.
- Stan Scribe copy rules (banned words, required links and phrases) are in
  `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md` and enforced by tests in
  `__tests__/stanscribe/`. Its pages make no analytics, cookie or third-party requests.
- Open: the single action the portfolio most wants a visitor to take (contact, resume, a project).
- ZBudget Dashboards (coming soon): "A fast, powerful IWFM model diagnostic and results viewing
  dashboard with interactive map and charts. Streamlining model review and report generation." (owner's
  words, 2026-10-25; project in `~/dev/ZBudget_dashboard`).
- Geometry on hand: DWR Bulletin 118 polygons for Cuyama Valley (3-013) and North/South Yuba
  (5-021.60/.61) in `public/data/cuyama_subbasin.geojson` and `yuba_subbasins.geojson` (restored
  from git history); California HUC8 watersheds; EEJ prison points. Not on hand: B118 polygons for
  Antelope Valley (6-044) and South American (5-021.65).

## Brand Commitments

- The portfolio introduces Devin as water and AI combined, not one or the other.
- The résumé title may mix the two and should include "AI Specialist" (owner, 2026-10-25). The page
  reads "AI Specialist and Groundwater Modeler"; the PDF still reads "AI Automation Engineer and
  Groundwater Modeler".
- Stan Scribe is presented as its own product, not a page of the portfolio. Its voice is plain and says
  each thing once.

## Evidence on Hand

- Devin's own photographs: headshot (`public/images/devin_businessCasualCrag.webp`), exploration,
  fishing, mycology, photography, bicycle kitchen (`public/images/`).
- Real project figures and maps: Antelope Valley, Modesto infiltration, Yuba recharge suitability,
  vacancy fee, Sacramento water purveyors, Cuyama Valley SRTM (`public/images/`).
- Real data: NASA EEJ prison points and polygons, California HUC8 watersheds (`public/data/`).
- Contour plates generated from real terrain (`public/images/plates/`, `scripts/build-plates.mjs`).
- Stan Scribe: real app screenshots (`public/images/stanscribe/`), a public TestFlight link, legal pages
  synced from `../transcript_stan/site/`.
- Absent, and not to be invented: testimonials, client logos, metrics, press, awards.

## Product Principles

1. Every claim about skill points at a real project, map, figure or tool.
2. Water and AI read as one practice, never as two careers.
3. Self-promotion stays honest: proof is shown, never invented.
4. On Stan Scribe, the reader's ease beats the style: accessibility wins every conflict.

## Accessibility & Inclusion

- Stan Scribe: the most accessible surface. Body text 18px or more; body text and links at 7:1 or
  better in both themes; one type scale; nothing depends on motion; works at 320px wide and at 200% zoom
  with no horizontal scroll.
- Portfolio: WCAG 2.2 AA, visible focus, reduced motion respected.
