# Stan Scribe pages as an extension of the App Store listing

Date: 2026-11-12. The owner asked for four fixes and reviewed a mockup in Plannotator the same day
(`.superpowers/plannotator/stanscribe-listing.html`). This spec records his picks and the design they lead to.
It replaces parts of `2026-10-23-stanscribe-page-design.md`. Each section says which parts.

## What the owner asked for

1. The preview shown when someone shares `stanscribe.devinhunt.com` is out of date and does not show what
   the app is.
2. The Stan Scribe sentence on `devinhunt.com` is out of date.
3. The bands with faded sides slow the page down. Use one full-width card as the portfolio pages do:
   contours behind the title and subtitle, then a slightly see-through card over the contours. Keep the
   colour blends between sections, done cheaply.
4. The page reads as information, not as an extension of the App Store listing. Shorten the words, add
   icons, and turn Privacy and Questions and answers into lists whose rows open on a click.

## His picks from the mockup

- Share card A: the name beside the phones.
- Homepage line X.
- The section heading "Made to be read across the table" becomes "Features".
- How it works gains a fourth step, "View conversations".
- The speakers fact in the hero mentions names.
- The comparison table needs column dividers that a reader who is not technical can see at once.
- Add a caption demo that plays when the reader scrolls to it, as a faux render if that is cheap.
- Ask the app repo to retake the screenshots with words that fit each section of the page.

He marked nothing against the rest of the drawing, so the spec builds it as drawn. The list under
"Open points" names the parts that go beyond his request, so he can strike any of them here.

He then reviewed this spec and asked for three changes, which are made below: a caption demo in which
the reader watches three other people talk, "curated" in the themes line, and a note that the slowness
is in the browser on his computer and, less, on his phone.

## 1. The share preview

**The card.** `public/images/stanscribe/stan-scribe-social.jpg` stays at the same address and size
(1200 x 630), so nothing that links it changes. Its new drawing is option A:

- the night ground (`#111517`) with the contour plate faint behind it;
- at the left the app icon, "Stan Scribe" in Newsreader, "Live captions for every voice." under it, and
  one muted line, "Offline · No account · iPhone and iPad";
- at the right the three-phone hero image, running off the bottom edge.

No italics, and no warm colours.

**A script builds it.** `scripts/stanscribe-social.mjs` (run as `npm run build:stanscribe-social`) fills
an HTML template in `scripts/stanscribe-social/`, renders it at 1200 x 630 in a Chromium browser installed on the
Mac (Brave, on the owner's), and writes the JPEG with `sharp`. It reads Newsreader and Hanken from the last `npm run build`, so
the card uses the page's fonts. The October card was a one-off Python drawing. The script matters because
the screenshots will change (section 6), and the card must be redrawn when they do. The JPEG is committed.
The Netlify build does not run the script.

**The words around the card.**

- `og:site_name` becomes "Stan Scribe" on both pages and the six legal pages. It says "Devin Hunt" today.
- The title and description stay as they are.
- The image's alt text becomes "The name Stan Scribe and its tagline beside three iPhones showing live
  captions in color."

**The icon.** The Stan Scribe pages show the portfolio's favicon in the tab and as the touch icon, which
some link previews use. They get the app's own icon (the three caption bars), copied from the app repo's
`AppIcon.png` at 32, 180 and 512 pixels into `public/images/stanscribe/`. The root layout hard-codes two
`<link>` icon tags for every route. Those move into `metadata.icons`, where the Stan Scribe layout can
override them. The portfolio's pages keep `favicon.svg`.

## 2. The line on devinhunt.com

`lib/portfolio-data.ts`, the `stan-scribe` entry's `summary`:

> An iPhone and iPad app I built for my grandpa Stan, who is hard of hearing: live captions of the
> conversation at the table, a color for each speaker, with no internet and no subscription.

The entry's longer `content`, its `meta` and its readout do not change.

## 3. One full-width card in place of the faded bands

This replaces "Bands in place of the sheet (2026-11-12)" in the October spec.

**What changes.**

- The hero has no fill. The contours show behind the icon, the title, the tagline, the facts and the
  download blocks, as they show behind the name on the portfolio's home page.
- Everything under the hero is one card the full width of the window, down to the footer. Its fill is
  slightly see-through, at the portfolio band's strength (92% by day, 90% at night).
- The two tones still take turns, the card colour and the page ground, and each band still blends in
  from the tone above it over 80px. The first band blends in from nothing, so the card has no hard top
  edge.
- The side fades go. The contours no longer show in the side margins, except faintly through the card.
  This reverses the owner's 2026-11-12 choice, at his request. It matches the portfolio and the CSS is
  simpler. The traces below do not show that it is faster.
- The page-coloured veil over the contours drops from 60% to 40%, so the contours read behind the hero.
  The mockup drew 30%. At 30% a link in the hero that crosses a contour line measures 6.6:1 by day and
  6.9:1 at night, under the 7:1 rule. At 40% the worst cases are 7.06:1 and 7.5:1. The lines are the plate's own cream (night) and
  brown (day), not the blue the mockup tinted them.

**How it is built.** Today each section and the footer paints its fill on a `::before` layer with a
`mask-image`, inside its own stacking context. The new rule is one plain background per section:

```css
.bands > section { background: linear-gradient(to bottom, var(--band-from) 0, var(--band-to) var(--band-blend)); }
```

There is no pseudo-element, no mask and no `isolation`. `--band-a` and `--band-b` become the two tones
with their alpha. The hero is the first section and has `background: none`. The footer (`.band-foot`)
and the legal pages' single band (`.band-only`) take the same plain rule. `BANDS`, `BAND` and
`BAND_COLUMN` in `Section.tsx` keep their names.

**Tone order.** The first card band is the lighter tone, so the card reads as a card against the hero.
The main page has eight sections (hero, then seven bands) and Light has four, so Help stays on the
lighter tone and each page still ends on it, as the tests in `Bands.test.tsx` require.

**Contrast.** Body text and links stay at 7:1 or better. `palette.test.ts` will composite each
see-through tone over the ground and over a contour line at the new veil strength, and check the worst
case in both themes.

**What I measured.** The owner sees the slowness in the browser on his computer, and less on his phone.
His desktop browser is Brave, so I traced the live page there, on his Mac, with a temporary profile and
real wheel input (`Input.synthesizeScrollGesture`, the whole page at 1,500px a second). The trace counts
the frames the compositor presents, so it sees work on the GPU side as well as on the main thread.

Verdict: no measurable difference, and no slowness to explain.

| State of the page | Runs | Frames presented in about 5.7 s | Dropped-frame events per run |
|---|---|---|---|
| As shipped | 3 | 689 to 692 | 1 to 3 |
| Masks off | 3 | 687 to 689 | 0 to 6 |
| The build this spec proposes (plain fills) | 3 | 689 to 690 | 1 to 3 |
| Glow off, masks on | 3 | 685 | 10 |

Every run scrolled the full 8,548px and presented 120 frames a second, the display's refresh rate, with
no blank tiles. The display is the limit in every state, not the page. The runs were interleaved. Two
more rounds at an emulated 2560 x 1440 window and one round in the day theme gave the same result for
the shipped and proposed states. An earlier test inside his own Brave profile, timing main-thread frames,
also held 120 a second. Two page loads showed one long task between them, of 51 ms.

So I have not reproduced the slowness, and I cannot say the masks cause it. Two costs do show in the
traces, and both are shared with the portfolio's pages:

- The page downloads three contour files of about 466 KB each over the wire (1.7 MB each unpacked): the
  plate for the current theme, the glow, and the other theme's plate, fetched ahead for the toggle.
- While the glow runs, the main thread produces a frame on every refresh, 120 a second, for as long as
  the page is open. With the glow off, half of those frames are not needed.

Neither is fixed by this spec. Open point 1 asks what the owner sees, so the cause can be found before
anything is changed for speed.

## 4. The page

This replaces the section list in the October spec and the layout notes after it. The copy rules there
(banned words, required links, no em dashes, 7:1, 18px body text, one type scale) all stand.

Sections of `/stanscribe`, in order. Anchors keep their ids.

**Hero** (over the contours). The app icon at 104px, the h1 "Stan Scribe", the tagline "Live captions for
every voice.", then four facts, each an icon tile with a label, as on the first page of the app's tour:

- Live captions
- A color and a name for each speaker
- Works offline
- No account needed

Then the two download blocks, unchanged, and the three-phone image, which sits across the card's top
edge. The intro paragraph and the row of jump links are cut. The header still links Help.

**How it works** (`#how-it-works`). Four steps, each with a tile:

1. Tap Start. Captions begin as people speak. They never start on their own.
2. Follow along. Each speaker gets a color and a name.
3. Tap Stop. The conversation is saved as text. No audio is kept.
4. View conversations. Find any conversation later by date, by person or by any word.

Start is the app's green tile and Stop its red one. The caption demo (section 5) sits beside the steps
from 768px up and under them on a phone. It takes the place of the single-phone screenshot that sits
there today.

**Built for my grandpa Stan** (`#story`). Three short paragraphs, all in words the owner has approved:

> My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.
>
> With live captions he could keep up and answer, instead of pretending he had heard. The app my parents
> tried charged a monthly fee and needed the internet, so I built this one. Stan uses it every day at
> dinner.
>
> Devin

Under them, "Read the whole story" opens the other three paragraphs: the cost and the two editions, the
doctor's appointment, and what comes next.

**Features** (`#features`). Six rows, each an icon tile, a name and one line:

| Name | Line |
|---|---|
| Speakers in color | A color and a name for each speaker. |
| Voices it knows | Teach it the people you talk with most, with their permission. |
| Big text, clear buttons | Every button says what it does: Smaller, Larger, Save, Stop. |
| Keeps listening | Lock your iPhone and captions keep going until you tap Stop. |
| Conversations you keep | Find any one by date, person or word. Export it, or back it up to your own iCloud. |
| Choose how it looks | 28 themes I curated, or make your own from your photos. |

Then five screens in a row, each with a short label: Speakers in color, Text as big as you need, Saved
as text, Find any conversation, 25 languages. They are a grid, five across on a wide window and two
across on a phone. They are not a sideways scroller, which older readers often miss. Then the painted
themes image under the line "Something you use every day should not look clinical."

**Privacy** (`#privacy`). Five rows in the tour's style. The label is always visible. A click opens the
words that are on the page today.

| Label | Opens to |
|---|---|
| Everything stays on your iPhone or iPad | The speech models are built into the app, so captions work in airplane mode. |
| No account. No ads. No tracking. | The app never connects to the internet. |
| No audio is saved | The app turns sound into captions as you listen and keeps none of the sound. It saves only the words of conversations you keep, on your device. |
| Your words leave only when you send them | That is when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud. |
| Ask before you caption people | The app hears everyone nearby. In some places, everyone in a conversation must agree before it is captured, so tell people the app is on. Set up someone's voice only with their permission. |

Then "Read the Privacy Policy." The consent note loses its own column. Its heading is now the fifth
label, so "Ask before you caption people" stays visible, as the brief requires.

**Which one is for you?** (`#light`). One lead line, used on both pages: "Both caption offline, with
speaker colors and names, in 25 languages. Neither has in-app purchases." Then the comparison table,
then "Not sure? Start with Light."

The table changes so its columns are plain to see:

- a frame around it, and a rule between every column as well as every row;
- a filled header row, with each app's icon above its name;
- four rows: Price, Speech models, Looks, Download. Speaker colors and Motion come out as fine detail.

It stays a real table with `th scope`, and still fits 320px.

**Questions and answers** (`#questions`). The same rows as Privacy, without icons, in one column. Every
question and answer keeps its approved words, and the `FAQPage` JSON-LD is unchanged. "How accurate are
the captions?" starts open on both pages. The brief says "captions can be wrong" must be visible on the
page and never hidden, and that answer is where the line is.

**Help** (`#help`). Unchanged.

**The row component.** `components/stanscribe/Disclosure.tsx` is a native `<details>` with a `<summary>`
that holds an optional icon tile, the label as an `h3`, and a chevron that turns when the row is open. It
uses no JavaScript. Browsers open a closed row when find-in-page matches its words. Each summary is at
least 64px tall, and the global focus ring already covers `summary`.

**Icons.** Lucide (`lucide-react`, ISC licence), rendered on the server as plain SVG. The app's tour
uses Apple's SF Symbols, which Apple licenses for apps on its platforms and not for websites, so the
page uses the nearest Lucide drawing for each. The speaker dots and the Start and Stop tiles are drawn
here, in the app's colours.

**Stan Scribe Light.** The same hero pattern with Light's own icon: h1, "The simple edition. Free.", one
line in place of today's paragraph ("The same live captions and speaker colors as Stan Scribe, made
simpler: one speech model, a black or a white page, and a smaller download."), the download line, and
its two-phone image across the card's edge. Then Help, the comparison with the new table, and its seven
questions as rows.

**The legal pages** change only in their band, which is now full width.

## 5. The caption demo

`components/stanscribe/CaptionDemo.tsx`, a client component, in How it works.

- It is a drawing of the app's live screen: a dark panel with the "Listening" line, the captions, and
  the Smaller, Larger, Save and Stop bar. The bar is a picture. Its buttons are not controls and are
  hidden from screen readers.
- It plays a short scripted conversation. Each speaker's name appears in their colour, then their words
  arrive a few at a time at speaking pace. The newest line is the brightest, as in the app.
- It starts once, when half of it is on screen, and stops on the finished conversation. A button under
  it reads "Pause" while it plays and "Play again" after. WCAG 2.2.2 asks for that control on anything
  that moves for more than five seconds.
- With reduced motion, or with JavaScript off, the whole conversation is there from the start and
  nothing moves. The server renders every word. The script only changes each word's opacity, so a
  screen reader reads the whole conversation at any moment and the layout never shifts.
- Its cost is one timer and about twenty small updates over about eight seconds. It has no video, no
  GIF and no canvas.
- It is dark in both themes, as a phone screen is. The speaker colours are brightened until each name
  clears 7:1 on the panel. `palette.test.ts` checks them.

The script. The reader watches three other people make a plan, and nobody is spoken to by a name that
differs from their label:

> **Alex** Are we still on for Saturday?
> **Rosa** Yes. Come at six, and bring the salad.
> **Person 3** I will bring dessert.

Alex and Rosa are fictional names from the app's own demo. "Person 3" is the label the app gives a
speaker before anyone names them, so the demo shows both kinds. The demo runs about eight seconds.

## 6. A request to the app repo for new screenshots

The screenshots show the app's built-in demo, a conversation about packing a car. The owner wants each
image's words to fit the section it sits in. Only the app repo can make them. Its debug builds draw the
demo from scripts in `SessionController.swift`, and `shots.sh` photographs them. So this work writes a
request, `docs/marketing/stanscribe-page/screenshot-request.md` in `transcript_stan`, and commits it
there for the app session. It does not change the app.

The request asks for the same files at the same sizes, so each new image replaces the old one with no
code change. It gives a script for each:

| Image | Where it sits | Script |
|---|---|---|
| `hero-stan-scribe`, `both-apps`, `light-black-and-white` | Heroes, share card | The Saturday plan from the caption demo, continued for a full screen. |
| `stan-scribe-live-large` | "Text as big as you need" | Two short lines at the largest size: "Dinner is ready. / Come and sit down." |
| `stan-scribe-live-graphite` | "Speakers in color" | Three speakers, two of them named, about who is driving on Saturday. |
| `stan-scribe-painted-themes` | "Should not look clinical" | The Saturday plan. |
| `stan-scribe-conversation`, `stan-scribe-library`, `stan-scribe-languages` | Features | No change. They already show their feature. |

One rule for every script: the speakers talk about dinner, plans and each other, and never about the
app. The owner's example had a speaker say "This app is a relationship saver. Thank you." Printed in a
screenshot, that line is a testimonial from a person who does not exist, and PRODUCT.md rules out
invented testimonials. A scene from the table the app was built for makes the same point without the
claim.

When the new images arrive: copy them in, check each alt text in `lib/stanscribe.ts` against what the
image now shows, and run `npm run build:stanscribe-social`. Until then the page and the card use today's
images.

## Open points for the owner

1. **What do you see when the page is slow?** I could not reproduce it in Brave on your Mac (section 3).
   Tell me what happens and when: stutter while you scroll, a slow first load, a pause a few seconds
   after loading, or the fans. Tell me the display too, if it is an external one. Until the cause is
   found, the full-width card is a change of look and not a speed fix. If you would keep the faded sides
   on those terms, say so.
2. **Parts drawn beyond your request**, which stand unless you strike them:
   - the hero's intro paragraph and jump links are cut;
   - Features no longer mentions Start Captions on the Lock Screen and Control Center, or Obsidian by
     name;
   - the comparison loses its Speaker colors and Motion rows, and "Not sure?" is one sentence;
   - the accuracy answer starts open;
   - the tab icon becomes the app's icon.
3. **The screenshot scripts** in section 6 are my drafts, and so is the third speaker's label in the demo. Change any line.

## Files

| File | Change |
|---|---|
| `app/globals.css` | `.bands`, `.band-foot`, `.band-only`: plain backgrounds, see-through tones, no masks |
| `components/ui/ContourBackdrop.tsx` | the `quiet` veil at 40% |
| `components/stanscribe/Section.tsx` | comments only; the names stay |
| `components/stanscribe/Disclosure.tsx`, `IconTile.tsx`, `CaptionDemo.tsx` | new |
| `components/stanscribe/Faq.tsx`, `ComparisonTable.tsx` | rows that open; the framed table |
| `app/(stanscribe)/stanscribe/page.tsx`, `stanscribe-light/page.tsx` | the sections above |
| `app/(stanscribe)/layout.tsx`, `app/layout.tsx`, `lib/site/metadata.ts` | icons through metadata; `og:site_name` |
| `lib/stanscribe.ts` | the shared lines, the icon files, the card's alt text |
| `lib/portfolio-data.ts` | line X |
| `scripts/stanscribe-social.mjs`, `scripts/stanscribe-social/` | the card's script and template |
| `scripts/scroll-trace.mjs` | the trace harness from section 3, kept so the measurement can be repeated |
| `public/images/stanscribe/` | the new card; the app icons |
| `package.json` | `lucide-react`; `build:stanscribe-social` |
| `__tests__/stanscribe/` | see Testing |
| `DESIGN.md`, the October spec | the card, the rows, the demo; a pointer to this spec |
| `transcript_stan/docs/marketing/stanscribe-page/screenshot-request.md` | the request, in the app repo |

## Testing

Tests come first, as the repo's TDD rule asks.

- `Bands.test.tsx`: no `mask-image`, no `::before` fill and no `isolation` in the band rules; the two
  tones are see-through; the blend is 80px; the hero has no fill; the tone order and the Help rule hold.
- `palette.test.ts`: 7:1 for body text and links on each see-through tone, composited over the ground
  and over a contour line under the 40% veil, in both themes; 7:1 for the demo's speaker names.
- `StanScribePage.test.tsx` and `StanScribeLightPage.test.tsx`: the four facts; four steps; "Features";
  six feature rows; five privacy rows whose labels are visible with the row closed; "Ask before you
  caption people" visible; the accuracy answer open; the story's three paragraphs with the rest inside
  the disclosure; the required email and legal links; heading order; the copy rules over every word,
  the closed rows included.
- `Faq.test.tsx`: every item is a `<details>`; the JSON-LD still equals the page's words.
- `Disclosure.test.tsx`: `summary` holds an `h3`; `open` passes through; the icon is optional.
- `CaptionDemo.test.tsx`: the server render holds the whole conversation; with reduced motion nothing
  is hidden and there is no button; with motion the words appear in order, Pause holds them, and Play
  again restarts.
- `ComparisonTable` tests: four rows; `th scope`; the frame and column rules.
- `lib.test.ts` and the metadata tests: the card is 1200 x 630 at the same address; `og:site_name` is
  "Stan Scribe"; the Stan Scribe pages link the app icon and the portfolio pages link `favicon.svg`.
- `npx jest --ci`, then `npm run build`.
- In a browser at 1440 and 390 wide, light and dark, and at 320px and 200% zoom with no sideways scroll.
  Keyboard: every row opens with Enter and Space, and the demo's button works. Taste-Skill's
  `inspect.mjs` over both pages.
- Speed: the trace harness from section 3 runs against the deploy preview and the live page, interleaved,
  five runs a side, to show the new build is no slower. The slowness the owner reported is a separate
  open item until it is reproduced.
- The share card: read the built page's tags, and paste the deploy preview's address into Messages.

## Out of scope

The screenshots themselves (the app repo's work), App Store Connect, the legal words, and the
portfolio's own pages apart from the one line.
