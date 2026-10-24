# Stan Scribe Product Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/stanscribe/`, `/stanscribe-light/`, the six generated legal pages, and a homepage panel linking to Stan Scribe, on devinhunt.com.

**Architecture:** Two Next.js app-router pages inside the existing root layout (site header/footer/theme), built from small components in `components/stanscribe/` and one data module `lib/stanscribe.ts`. The generated legal pages are copied byte-for-byte into `public/` by a sync script. A post-export script copies `out/<route>.html` to `out/<route>/index.html` so the trailing-slash URLs App Store Connect uses resolve to real files on Netlify (`trailingSlash` stays `false`).

**Tech Stack:** Next.js 14 (static export), React 18, Tailwind 3.4 with the site's CSS-variable tokens, Jest 29 + Testing Library (jsdom), Node 20 scripts (`.mjs`), Python/PIL for the one-off social card.

**Spec:** `docs/superpowers/specs/2026-10-23-stanscribe-page-design.md`. The words and rules come from `/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/copy.md` and `README.md` (read README's "Rules for every word on the page" before touching copy).

## Global Constraints

- Copy is used exactly as in copy.md (typographic apostrophes `’` in JSX text are fine). Never add claims.
- Never anywhere (text, alt, metadata, file names): "Whisper" (any case), model or model-company names (NVIDIA, Moondream, Parakeet, Sortformer, FluidInference), prices or `$`, "tip", "donate", "lite", "trial", "crippled", "transcription"/"transcribe". "subscription" only as a denial ("No subscription", "Neither has … subscriptions") or the FAQ question "Is there a subscription?".
- `/stanscribe/` shows `stanscribe@devinhunt.com` as a mailto link and links to `/stanscribe/privacy/`, `/stanscribe/terms/`, `/stanscribe/acknowledgements/` (and Light's three). `/stanscribe-light/` shows the email and Light's three links.
- "can be wrong" (FAQ) and "Ask before you caption people." stay visible: no `<details>`, no modal.
- Body text ≥18px (`text-lg`) in `text-ink-body` or `text-ink-strong`; `text-ink-muted` only for small print. All reading text sits on `.panel` / `bg-card` / `bg-muted` surfaces except the hero (same as the homepage hero).
- One `h1` per page; headings never skip a level going down.
- Every `<img>` has real alt text from copy.md. Legal links are plain `<a>` (static files outside the Next router). In-site navigation uses `next/link` with no trailing slash (`/stanscribe`).
- No new external origins: no analytics, embeds, remote fonts or remote images.
- File header style: `// Copyright (c) 2026 Devin Hunt contact@devinhunt.com`, then `// <path>`, then a one-line purpose comment (matches the rest of the repo).
- Generated legal HTML is never hand-edited.

**User decisions (already made):**
- "Coming soon + beta link": both apps show "Coming soon to the App Store"; Stan Scribe also links its public TestFlight (`https://testflight.apple.com/join/ejNyaGqJ`); Light has no beta link.
- "Featured panel": homepage panel between the hero and Professional Expertise; no header/footer nav change.
- "Site fonts, larger": Newsreader headings, Hanken body, body 18–20px.
- "Omit it": no EU-availability FAQ answer.
- Approach 1 (Next routes + post-export index copy), not site-wide `trailingSlash`.
- Contour backdrop reuses the `interests` plate.

---

## File map

| File | Responsibility |
|---|---|
| `lib/stanscribe.ts` | Launch flag, support email, per-app links, screenshot metadata + alt text, social image, languages, shared Light copy |
| `test-utils/stanscribe.ts` | Brief's word rules as `findCopyViolations`, `pageText`, `headingLevels` (outside `__tests__` so Jest doesn't run it as a suite) |
| `public/images/stanscribe/*` | 9 mockups + generated 1200×630 social card |
| `scripts/sync-stanscribe-legal.mjs` | Copy six legal folders from the app repo; never `index.html` |
| `scripts/stanscribe-index.mjs` | Post-export: `out/<route>.html` → `out/<route>/index.html` |
| `public/stanscribe{,-light}/{privacy,terms,acknowledgements}/index.html` | Generated legal pages (synced, committed) |
| `components/stanscribe/Section.tsx` | Panel section with eyebrow + h2 (`SECTION_TITLE`) |
| `components/stanscribe/PhoneShot.tsx` | Framed screenshot at intrinsic size |
| `components/stanscribe/DownloadBlock.tsx` | Coming soon / beta, or App Store badge when `RELEASED` |
| `components/stanscribe/ComparisonTable.tsx` | The two apps compared, real `<th scope>` |
| `components/stanscribe/LegalLinks.tsx` | One app's three legal links |
| `components/stanscribe/HelpBlock.tsx` | Help section: email + fine print + legal links |
| `app/stanscribe/page.tsx` | Main product page |
| `app/stanscribe-light/page.tsx` | Light page |
| `app/page.tsx` | Homepage panel (modify) |
| `package.json`, `.github/workflows/nextjs.yml` | Wire the post-export script |

---

### Task 1: Data module, images, social card, copy-rule helpers

**Goal:** `lib/stanscribe.ts`, the copied mockups and social card, and the test helpers exist and are proven consistent (files exist, sizes match, alt text obeys the brief).

**Files:**
- Create: `lib/stanscribe.ts`
- Create: `test-utils/stanscribe.ts`
- Create: `public/images/stanscribe/` (9 `.webp` + `stan-scribe-social.jpg`)
- Test: `__tests__/stanscribe/lib.test.ts`

**Acceptance Criteria:**
- [ ] Every `SHOTS` entry's file exists under `public/` and its width/height equal the real image size (via `sharp`).
- [ ] `public/images/stanscribe/stan-scribe-social.jpg` exists at 1200×630.
- [ ] `findCopyViolations` returns `[]` for every alt text and every image path; `LANGUAGES.length === 25`.
- [ ] `findCopyViolations` flags "Whisper", "$4.99", "transcription", "tip", and "Monthly subscription", and allows "No subscription." / "Is there a subscription?".
- [ ] If `RELEASED` is true, `public/images/stanscribe/app-store-badge.svg` exists.

**Verify:** `npx jest __tests__/stanscribe/lib.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Copy the mockups**

```bash
mkdir -p public/images/stanscribe
M=/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/mockups
for f in hero-stan-scribe both-apps light-black-and-white stan-scribe-live-graphite stan-scribe-live-large stan-scribe-conversation stan-scribe-library stan-scribe-painted-themes stan-scribe-languages; do cp "$M/$f.webp" public/images/stanscribe/; done
ls public/images/stanscribe | wc -l   # → 9
```

- [ ] **Step 2: Generate the social card** (phones on the site's dark page color, title in Georgia)

```bash
python3 - <<'EOF'
from PIL import Image, ImageDraw, ImageFont
src = Image.open('/Users/dhunt/dev/transcript_stan/docs/marketing/stanscribe-page/mockups/both-apps.webp').convert('RGBA')
W, H = 1200, 630
card = Image.new('RGBA', (W, H), (26, 24, 20, 255))  # stone-950, the site's dark page
phones = src.copy(); phones.thumbnail((10000, 590))
card.alpha_composite(phones, (W - phones.width - 40, (H - phones.height) // 2))
d = ImageDraw.Draw(card)
F = '/System/Library/Fonts/Supplemental/'
d.text((72, 200), 'Stan Scribe', font=ImageFont.truetype(F + 'Georgia.ttf', 84), fill=(243, 241, 232))
d.text((72, 312), 'Live captions for every voice.', font=ImageFont.truetype(F + 'Georgia Italic.ttf', 34), fill=(196, 189, 169))
d.text((72, 392), 'FOR IPHONE AND IPAD', font=ImageFont.truetype(F + 'Georgia.ttf', 22), fill=(203, 154, 89))
card.convert('RGB').save('public/images/stanscribe/stan-scribe-social.jpg', quality=88, optimize=True)
print(card.size)
EOF
```
Then open the JPEG with the Read tool and confirm the text does not overlap the phones. If it does, lower the italic line's font size by 2 and regenerate.

- [ ] **Step 3: Write the failing test** `__tests__/stanscribe/lib.test.ts`

```ts
/** @jest-environment node */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { APP_STORE_BADGE, LANGUAGES, RELEASED, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { findCopyViolations } from '@/test-utils/stanscribe';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('lib/stanscribe', () => {
  test.each(Object.entries(SHOTS))('%s exists at its stated size', async (_key, shot) => {
    const file = join(PUBLIC, shot.src);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([shot.width, shot.height]);
  });

  test('alt text and file names follow the brief', () => {
    for (const shot of Object.values(SHOTS)) {
      expect(shot.alt.length).toBeGreaterThan(20);
      expect(findCopyViolations(`${shot.alt} ${shot.src}`)).toEqual([]);
    }
    expect(findCopyViolations(`${SOCIAL_IMAGE.alt} ${SOCIAL_IMAGE.url}`)).toEqual([]);
  });

  test('the social card is 1200×630', async () => {
    const file = join(PUBLIC, new URL(SOCIAL_IMAGE.url).pathname);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  test('25 caption languages', () => {
    expect(LANGUAGES).toHaveLength(25);
  });

  test('a released build has the App Store badge to show', () => {
    if (RELEASED) expect(existsSync(join(PUBLIC, APP_STORE_BADGE.src))).toBe(true);
  });
});

describe('findCopyViolations', () => {
  test.each(['Built on Whisper.', 'Only $4.99.', 'Fast transcription.', 'Leave a tip.', 'Monthly subscription.'])(
    'flags %p',
    (text) => expect(findCopyViolations(text)).not.toEqual([]),
  );

  test('allows the copy’s own denials and the FAQ question', () => {
    expect(findCopyViolations('Pay once. No subscription. Is there a subscription? No.')).toEqual([]);
  });
});
```

- [ ] **Step 4: Run it to see it fail**

Run: `npx jest __tests__/stanscribe/lib.test.ts`
Expected: FAIL, `Cannot find module '@/lib/stanscribe'`.

- [ ] **Step 5: Write `lib/stanscribe.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe.ts
// One source for the Stan Scribe pages: launch state, links, screenshots and the copy both pages share.
// Words come from transcript_stan/docs/marketing/stanscribe-page/copy.md; README.md beside it has the rules.

/**
 * Launch switch. Both apps release the same day. To launch:
 * 1. Download Apple's black "Download on the App Store" badge (SVG) from
 *    https://developer.apple.com/app-store/marketing/guidelines/ and save it as
 *    public/images/stanscribe/app-store-badge.svg.
 * 2. Set RELEASED to true. Every download tile becomes a badge link to the App Store, and the
 *    TestFlight link goes away.
 */
export const RELEASED = false;

export const SUPPORT_EMAIL = 'stanscribe@devinhunt.com';

/** Apple's badge, used as supplied (no recoloring); 40px tall is Apple's on-screen minimum. */
export const APP_STORE_BADGE = { src: '/images/stanscribe/app-store-badge.svg', width: 120, height: 40 };

export type AppKey = 'scribe' | 'light';

export interface LegalLink {
  label: string;
  href: string;
}

export interface AppInfo {
  name: string;
  /** The line under the name in its download tile. */
  offer: string;
  appStoreUrl: string;
  /** Public TestFlight link, shown before release. Light's is not live yet. */
  betaUrl?: string;
  legal: LegalLink[];
}

const legalLinks = (base: string): LegalLink[] => [
  { label: 'Privacy Policy', href: `${base}privacy/` },
  { label: 'Terms of Use', href: `${base}terms/` },
  { label: 'Acknowledgements', href: `${base}acknowledgements/` },
];

export const APPS: Record<AppKey, AppInfo> = {
  scribe: {
    name: 'Stan Scribe',
    offer: 'Pay once. No subscription.',
    appStoreUrl: 'https://apps.apple.com/app/id6822377139',
    betaUrl: 'https://testflight.apple.com/join/ejNyaGqJ',
    legal: legalLinks('/stanscribe/'),
  },
  light: {
    name: 'Stan Scribe Light',
    offer: 'Free. The simple edition.',
    appStoreUrl: 'https://apps.apple.com/app/id6824796578',
    legal: legalLinks('/stanscribe-light/'),
  },
};

export interface ShotImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const shot = (file: string, width: number, height: number, alt: string): ShotImage => ({
  src: `/images/stanscribe/${file}.webp`,
  width,
  height,
  alt,
});

/** Framed screenshots from the app repo's mockups/, with copy.md's alt text. */
export const SHOTS = {
  hero: shot('hero-stan-scribe', 1800, 1795, "Three iPhones showing Stan Scribe's live captions. Each speaker's words are labeled Person 1, 2 or 3 in blue, orange or green. Large buttons along the bottom read Smaller, Larger, Save and Stop."),
  bothApps: shot('both-apps', 1600, 1690, 'Stan Scribe and Stan Scribe Light on two iPhones, showing live captions in color.'),
  liveGraphite: shot('stan-scribe-live-graphite', 900, 1679, "Stan Scribe listening for 4 minutes 20 seconds. Three speakers' lines in blue, orange and green, the newest in bright white."),
  liveLarge: shot('stan-scribe-live-large', 900, 1679, 'Captions in very large text, two short lines filling the screen.'),
  conversation: shot('stan-scribe-conversation', 900, 1679, "A saved conversation titled Dinner with Alex at Rosa's Cafe, with a short summary, its topic and place, and one highlighted line."),
  library: shot('stan-scribe-library', 900, 1679, 'Saved conversations, with a calendar of October and a search field.'),
  paintedThemes: shot('stan-scribe-painted-themes', 2000, 1411, 'Five iPhones showing captions over painted landscapes: ducks over a marsh, birch trees, a fisherman at a lake, a windmill and a forest.'),
  languages: shot('stan-scribe-languages', 900, 1679, 'Live captions in German, Polish, Czech, Maltese, Russian and Greek, one line each, from three speakers.'),
  lightBlackAndWhite: shot('light-black-and-white', 1600, 1690, 'Stan Scribe Light on two iPhones, one with a black page and one with a white page, both showing live captions with colored speaker names.'),
} satisfies Record<string, ShotImage>;

/** Link-preview card (absolute URL: the root layout sets no metadataBase). */
export const SOCIAL_IMAGE = {
  url: 'https://devinhunt.com/images/stanscribe/stan-scribe-social.jpg',
  width: 1200,
  height: 630,
  alt: 'Stan Scribe and Stan Scribe Light on two iPhones, showing live captions in color.',
};

/** Shared by the #light section of /stanscribe/ and the /stanscribe-light/ page. */
export const LIGHT_SUMMARY =
  'Stan Scribe Light has the same live captions, speaker colors and voices it knows, in a simpler package: one speech model, a black or a white page, and calm motion, so it is a smaller download. Want plain captions? Turn speaker colors off.';

/** Follows a bold "Not sure?". */
export const LIGHT_NOT_SURE =
  'Start with Light. If you want the Advanced speech model, the painted themes or themes from your own photos, choose Stan Scribe.';

export const LANGUAGES = [
  'Bulgarian', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Finnish', 'French',
  'German', 'Greek', 'Hungarian', 'Italian', 'Latvian', 'Lithuanian', 'Maltese', 'Polish',
  'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish', 'Ukrainian',
];
```

- [ ] **Step 6: Write `test-utils/stanscribe.ts`**

```ts
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// test-utils/stanscribe.ts
// The Stan Scribe brief's word rules (transcript_stan/docs/marketing/stanscribe-page/README.md) as
// checks the page tests run over rendered text, alt text and metadata. Lives outside __tests__ so
// Jest doesn't collect it as a suite.

const BANNED: [RegExp, string][] = [
  [/whisper/i, 'never name the speech model'],
  [/\b(nvidia|moondream|parakeet|sortformer|fluidinference|fluid inference|openai)\b/i, 'no model or model-company names'],
  [/transcri/i, 'say "captions", not transcription'],
  [/\$|\b\d+\.\d\d\b/, 'no prices'],
  [/\b(tip|tips|tipping|donate|donation)\b/i, 'never "tip" or "donate"'],
  [/\b(lite|trial|crippled)\b/i, 'Light is "the simple edition"'],
  [/nothing ever leaves/i, 'that privacy claim needs its qualifier'],
];

/** Every way `text` breaks the brief's word rules; empty when it follows them. */
export function findCopyViolations(text: string): string[] {
  const found = BANNED.filter(([re]) => re.test(text)).map(([re, why]) => `${why}: "${text.match(re)?.[0]}"`);
  // "subscription" only as a denial ("No subscription", "Neither has ... subscriptions") or the FAQ question.
  for (const sentence of text.split(/[.?!]\s+/)) {
    if (/subscription/i.test(sentence) && !/\b(no|neither|is there)\b/i.test(sentence)) {
      found.push(`"subscription" outside a denial: "${sentence.trim()}"`);
    }
  }
  return found;
}

/** Text nodes plus alt / aria-label / title, space-separated so sentences stay apart. */
export function pageText(root: HTMLElement): string {
  const parts: string[] = [];
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) parts.push(node.textContent ?? '');
  Array.from(root.querySelectorAll('[alt], [aria-label], [title]')).forEach((el) => {
    ['alt', 'aria-label', 'title'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value) parts.push(value);
    });
  });
  return parts.join(' ').replace(/\s+/g, ' ');
}

/** Heading levels in document order, e.g. [1, 2, 3, 3, 2]. */
export function headingLevels(root: HTMLElement): number[] {
  return Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => Number(h.tagName[1]));
}
```

- [ ] **Step 7: Run the test to see it pass**

Run: `npx jest __tests__/stanscribe/lib.test.ts`
Expected: PASS (all tests).

- [ ] **Step 8: Commit**

```bash
git add lib/stanscribe.ts test-utils/stanscribe.ts public/images/stanscribe __tests__/stanscribe/lib.test.ts
git commit -m "feat(stanscribe): data module, screenshots, social card and copy-rule test helpers"
```

```json:metadata
{"files": ["lib/stanscribe.ts", "test-utils/stanscribe.ts", "public/images/stanscribe/", "__tests__/stanscribe/lib.test.ts"], "verifyCommand": "npx jest __tests__/stanscribe/lib.test.ts", "acceptanceCriteria": ["Every SHOTS file exists with matching width/height (sharp)", "stan-scribe-social.jpg is 1200x630", "findCopyViolations returns [] for alt texts and paths; LANGUAGES has 25", "findCopyViolations flags Whisper, $4.99, transcription, tip, Monthly subscription and allows the copy's denials", "If RELEASED, app-store-badge.svg exists"], "modelTier": "mechanical"}
```

---

### Task 2: Legal sync, post-export index script, build wiring

**Goal:** The six generated legal pages are in `public/`, copied by a re-runnable script that never copies the generated `index.html`, and every build gives `/stanscribe/` and `/stanscribe-light/` a real `index.html`.

**Files:**
- Create: `scripts/sync-stanscribe-legal.mjs`
- Create: `scripts/stanscribe-index.mjs`
- Create: `public/stanscribe/{privacy,terms,acknowledgements}/index.html`, `public/stanscribe-light/{privacy,terms,acknowledgements}/index.html` (by running the sync)
- Modify: `package.json` (`scripts`)
- Modify: `.github/workflows/nextjs.yml` (after "Build with Next.js")
- Test: `__tests__/stanscribe/scripts.test.ts`

**Acceptance Criteria:**
- [ ] Sync copies the six `index.html` files byte-for-byte and never `stanscribe/index.html` or `stanscribe-light/index.html`; with one page missing it exits 1, names the file, and copies nothing.
- [ ] Index script copies `out/stanscribe.html` → `out/stanscribe/index.html` (and Light) without touching `out/stanscribe/privacy/`; a missing export exits 1 naming the file.
- [ ] `public/stanscribe*/{privacy,terms,acknowledgements}/index.html` are byte-identical to `/Users/dhunt/dev/transcript_stan/site/…` and `public/stanscribe/index.html` does not exist.
- [ ] `build`, `export` and `netlify-build` all run `node scripts/stanscribe-index.mjs` after `next build`; the GitHub workflow runs it after its build step.

**Verify:** `npx jest __tests__/stanscribe/scripts.test.ts && diff -r /Users/dhunt/dev/transcript_stan/site/stanscribe/privacy public/stanscribe/privacy` → tests pass, no diff output

**Steps:**

- [ ] **Step 1: Write the failing test** `__tests__/stanscribe/scripts.test.ts`

```ts
/** @jest-environment node */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const APPS = ['stanscribe', 'stanscribe-light'];
const PAGES = ['privacy', 'terms', 'acknowledgements'];

const run = (script: string, args: string[]) =>
  spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], { encoding: 'utf8' });

/** A fake app-repo site/ folder, optionally missing one "<app>/<page>". */
function makeSite(skip?: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'legal-src-'));
  for (const app of APPS) {
    mkdirSync(join(dir, app), { recursive: true });
    writeFileSync(join(dir, app, 'index.html'), `plain generated index for ${app}`);
    for (const page of PAGES) {
      if (`${app}/${page}` === skip) continue;
      mkdirSync(join(dir, app, page));
      writeFileSync(join(dir, app, page, 'index.html'), `<!doctype html>${app} ${page}`);
    }
  }
  return dir;
}

describe('sync-stanscribe-legal', () => {
  test('copies the six legal pages byte for byte, never the generated index.html', () => {
    const dest = mkdtempSync(join(tmpdir(), 'legal-dest-'));
    const result = run('sync-stanscribe-legal.mjs', ['--src', makeSite(), '--dest', dest]);
    expect(result.status).toBe(0);
    for (const app of APPS) {
      expect(existsSync(join(dest, app, 'index.html'))).toBe(false);
      for (const page of PAGES) {
        expect(readFileSync(join(dest, app, page, 'index.html'), 'utf8')).toBe(`<!doctype html>${app} ${page}`);
      }
    }
  });

  test('copies nothing when a generated page is missing', () => {
    const dest = mkdtempSync(join(tmpdir(), 'legal-dest-'));
    const result = run('sync-stanscribe-legal.mjs', ['--src', makeSite('stanscribe-light/terms'), '--dest', dest]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe-light\/terms\/index\.html/);
    expect(existsSync(join(dest, 'stanscribe'))).toBe(false);
  });
});

describe('stanscribe-index', () => {
  test('gives each page a real index.html beside its legal folders', () => {
    const out = mkdtempSync(join(tmpdir(), 'out-'));
    writeFileSync(join(out, 'stanscribe.html'), 'scribe page');
    writeFileSync(join(out, 'stanscribe-light.html'), 'light page');
    mkdirSync(join(out, 'stanscribe', 'privacy'), { recursive: true });
    writeFileSync(join(out, 'stanscribe', 'privacy', 'index.html'), 'policy');
    const result = run('stanscribe-index.mjs', ['--out', out]);
    expect(result.status).toBe(0);
    expect(readFileSync(join(out, 'stanscribe', 'index.html'), 'utf8')).toBe('scribe page');
    expect(readFileSync(join(out, 'stanscribe-light', 'index.html'), 'utf8')).toBe('light page');
    expect(readFileSync(join(out, 'stanscribe', 'privacy', 'index.html'), 'utf8')).toBe('policy');
  });

  test('fails the build when a page was not exported', () => {
    const out = mkdtempSync(join(tmpdir(), 'out-'));
    writeFileSync(join(out, 'stanscribe.html'), 'scribe page');
    const result = run('stanscribe-index.mjs', ['--out', out]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe-light\.html/);
  });
});

describe('synced legal pages in public/', () => {
  test.each(APPS.flatMap((app) => PAGES.map((page) => [app, page])))('%s/%s is the generated page', (app, page) => {
    const html = readFileSync(join(ROOT, 'public', app, page, 'index.html'), 'utf8');
    expect(html).toContain('Generated by Scripts/legal.py');
  });

  test.each(APPS)('public/%s has no index.html to shadow the page', (app) => {
    expect(existsSync(join(ROOT, 'public', app, 'index.html'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx jest __tests__/stanscribe/scripts.test.ts`
Expected: FAIL, script exit status not 0 (`Cannot find module …/scripts/sync-stanscribe-legal.mjs`), and `ENOENT` for the public legal pages.

- [ ] **Step 3: Write `scripts/sync-stanscribe-legal.mjs`**

```js
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/sync-stanscribe-legal.mjs
// Copies Stan Scribe's generated legal pages (Scripts/legal.py in the app repo) into public/, byte
// for byte. Only privacy/, terms/ and acknowledgements/ — never the generated plain index.html,
// which would shadow the designed page. Never hand-edit the copies; regenerate in the app repo.
//
// Usage: node scripts/sync-stanscribe-legal.mjs [--src ../transcript_stan/site] [--dest public]

import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const APPS = ['stanscribe', 'stanscribe-light'];
const PAGES = ['privacy', 'terms', 'acknowledgements'];

const { values } = parseArgs({
  options: {
    src: { type: 'string', default: '../transcript_stan/site' },
    dest: { type: 'string', default: 'public' },
  },
});
const src = resolve(values.src);
const dest = resolve(values.dest);

// Check everything first so a half-generated site never lands half-copied.
const missing = APPS.flatMap((app) => PAGES.map((page) => join(src, app, page, 'index.html'))).filter(
  (file) => !existsSync(file),
);
if (missing.length > 0) {
  console.error(`sync-stanscribe-legal: missing generated pages:\n  ${missing.join('\n  ')}`);
  console.error('Run `python3 Scripts/legal.py` in the app repo first.');
  process.exit(1);
}

for (const app of APPS) {
  for (const page of PAGES) {
    const to = join(dest, app, page);
    rmSync(to, { recursive: true, force: true }); // drop files an earlier sync left behind
    cpSync(join(src, app, page), to, { recursive: true });
    console.log(`synced ${app}/${page}/`);
  }
}
```

- [ ] **Step 4: Write `scripts/stanscribe-index.mjs`**

```js
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/stanscribe-index.mjs
// Runs after `next build`. With trailingSlash off, Next exports out/stanscribe.html, but App Store
// Connect links /stanscribe/ and /stanscribe-light/ — paths Netlify would otherwise send to the SPA
// fallback (the homepage). Copying each page to <route>/index.html makes those URLs real files.
//
// Usage: node scripts/stanscribe-index.mjs [--out out]

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const ROUTES = ['stanscribe', 'stanscribe-light'];

const { values } = parseArgs({ options: { out: { type: 'string', default: 'out' } } });
const out = resolve(values.out);

for (const route of ROUTES) {
  const page = join(out, `${route}.html`);
  if (!existsSync(page)) {
    console.error(`stanscribe-index: ${page} not found. Did next build export it?`);
    process.exit(1);
  }
  mkdirSync(join(out, route), { recursive: true });
  copyFileSync(page, join(out, route, 'index.html'));
  console.log(`${route}.html -> ${route}/index.html`);
}
```

- [ ] **Step 5: Sync the real legal pages**

```bash
node scripts/sync-stanscribe-legal.mjs
diff -r /Users/dhunt/dev/transcript_stan/site/stanscribe/privacy public/stanscribe/privacy && \
diff -r /Users/dhunt/dev/transcript_stan/site/stanscribe-light/acknowledgements public/stanscribe-light/acknowledgements && echo identical
ls public/stanscribe public/stanscribe-light   # → acknowledgements privacy terms (no index.html)
```

- [ ] **Step 6: Wire the build.** In `package.json` `scripts`, set:

```json
"build": "next build && node scripts/stanscribe-index.mjs",
"export": "next build && node scripts/stanscribe-index.mjs",
"netlify-build": "next build && node scripts/stanscribe-index.mjs",
"sync:stanscribe-legal": "node scripts/sync-stanscribe-legal.mjs",
```
(keep `dev`, `start`, `lint`, `test`, `build:plates` as they are). In `.github/workflows/nextjs.yml`, directly after the `Build with Next.js` step, add:

```yaml
      - name: Give the Stan Scribe pages index.html
        run: node scripts/stanscribe-index.mjs
```

- [ ] **Step 7: Run the tests to see them pass**

Run: `npx jest __tests__/stanscribe/scripts.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add scripts/sync-stanscribe-legal.mjs scripts/stanscribe-index.mjs public/stanscribe public/stanscribe-light package.json .github/workflows/nextjs.yml __tests__/stanscribe/scripts.test.ts
git commit -m "feat(stanscribe): sync the generated legal pages and give both pages a real index.html after export"
```

```json:metadata
{"files": ["scripts/sync-stanscribe-legal.mjs", "scripts/stanscribe-index.mjs", "public/stanscribe/", "public/stanscribe-light/", "package.json", ".github/workflows/nextjs.yml", "__tests__/stanscribe/scripts.test.ts"], "verifyCommand": "npx jest __tests__/stanscribe/scripts.test.ts && diff -r /Users/dhunt/dev/transcript_stan/site/stanscribe/privacy public/stanscribe/privacy", "acceptanceCriteria": ["Sync copies six legal index.html files byte-for-byte, never the generated index.html; missing page exits 1 naming it and copies nothing", "Index script copies out/<route>.html to out/<route>/index.html without touching legal folders; missing export exits 1", "public legal pages byte-identical to the app repo; no public/stanscribe/index.html", "build, export, netlify-build and the GH workflow run stanscribe-index.mjs after next build"], "modelTier": "mechanical"}
```

---

### Task 3: Shared components

**Goal:** The six components both pages use exist, with the download tile proven in both launch states.

**Files:**
- Create: `components/stanscribe/Section.tsx`, `PhoneShot.tsx`, `DownloadBlock.tsx`, `ComparisonTable.tsx`, `LegalLinks.tsx`, `HelpBlock.tsx`
- Test: `__tests__/stanscribe/DownloadBlock.test.tsx`, `__tests__/stanscribe/DownloadBlock.released.test.tsx`, `__tests__/stanscribe/HelpBlock.test.tsx`

**Acceptance Criteria:**
- [ ] Before release, Stan Scribe's tile shows "Pay once. No subscription.", "Coming soon to the App Store" and a link to `https://testflight.apple.com/join/ejNyaGqJ`; Light's tile shows "Free. The simple edition." and Coming soon with no TestFlight link; neither links to apps.apple.com.
- [ ] With `RELEASED` mocked true, the tile is a link named "Download Stan Scribe on the App Store" to `https://apps.apple.com/app/id6822377139`, with no Coming soon and no TestFlight link.
- [ ] `HelpBlock apps={['light']}` renders a mailto link to `stanscribe@devinhunt.com`, Light's three legal hrefs, and no Stan Scribe legal hrefs.
- [ ] `ComparisonTable` has 2 column headers ("Stan Scribe", "Stan Scribe Light") and 14 row headers.

**Verify:** `npx jest __tests__/stanscribe/DownloadBlock __tests__/stanscribe/HelpBlock` → all pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

`__tests__/stanscribe/DownloadBlock.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';

describe('DownloadBlock before release', () => {
  test('Stan Scribe: coming soon, with the public beta', () => {
    const { container } = render(<DownloadBlock app="scribe" />);
    expect(screen.getByText('Pay once. No subscription.')).toBeInTheDocument();
    expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /public beta/i })).toHaveAttribute('href', 'https://testflight.apple.com/join/ejNyaGqJ');
    expect(container.querySelector('a[href^="https://apps.apple.com"]')).toBeNull();
  });

  test('Light: coming soon, no beta link yet', () => {
    const { container } = render(<DownloadBlock app="light" />);
    expect(screen.getByText('Free. The simple edition.')).toBeInTheDocument();
    expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
    expect(container.querySelector('a[href*="testflight"]')).toBeNull();
    expect(container.querySelector('a[href^="https://apps.apple.com"]')).toBeNull();
  });
});
```

`__tests__/stanscribe/DownloadBlock.released.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';

jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: true }));

test('after release the tile is the App Store badge link', () => {
  const { container } = render(<DownloadBlock app="scribe" />);
  expect(screen.getByRole('link', { name: 'Download Stan Scribe on the App Store' })).toHaveAttribute(
    'href',
    'https://apps.apple.com/app/id6822377139',
  );
  expect(screen.queryByText('Coming soon to the App Store')).toBeNull();
  expect(container.querySelector('a[href*="testflight"]')).toBeNull();
});
```

`__tests__/stanscribe/HelpBlock.test.tsx`:
```tsx
import { render, screen, within } from '@testing-library/react';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { APPS } from '@/lib/stanscribe';

test('HelpBlock shows the support email and only the named apps’ legal links', () => {
  const { container } = render(<HelpBlock apps={['light']} />);
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of APPS.light.legal) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  for (const { href } of APPS.scribe.legal) expect(container.querySelector(`a[href="${href}"]`)).toBeNull();
});

test('ComparisonTable has real column and row headers', () => {
  render(<ComparisonTable />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
    expect.arrayContaining(['Stan Scribe', 'Stan Scribe Light']),
  );
  expect(within(table).getAllByRole('rowheader')).toHaveLength(14);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx jest __tests__/stanscribe/DownloadBlock __tests__/stanscribe/HelpBlock`
Expected: FAIL, `Cannot find module '@/components/stanscribe/DownloadBlock'`.

- [ ] **Step 3: Write `components/stanscribe/Section.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Section.tsx
// A Stan Scribe page section on a solid panel (text keeps its 7:1 contrast over the contour
// backdrop), with a mono eyebrow and a large serif h2 that labels the section for screen readers.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The section heading size, shared with anything that sits at h2 rank on these pages. */
export const SECTION_TITLE =
  'font-display text-[clamp(1.875rem,4vw,2.75rem)] font-medium leading-tight tracking-display text-ink-strong';

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('panel scroll-mt-24 md:p-10', className)}>
      <p className="eyebrow-mono mb-4">{eyebrow}</p>
      <h2 id={`${id}-title`} className={SECTION_TITLE}>
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Write `components/stanscribe/PhoneShot.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/PhoneShot.tsx
// A framed app screenshot at its intrinsic size (no layout shift), scaled to its container.

import Image from 'next/image';
import type { ShotImage } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface PhoneShotProps {
  image: ShotImage;
  className?: string;
  /** Only the hero loads eagerly; every other shot is lazy. */
  priority?: boolean;
}

export function PhoneShot({ image, className, priority = false }: PhoneShotProps) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  );
}
```

- [ ] **Step 5: Write `components/stanscribe/DownloadBlock.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/DownloadBlock.tsx
// One app's download tile: name and offer, then "Coming soon" (plus the public beta, where there is
// one) before launch, or Apple's badge after. RELEASED in lib/stanscribe.ts flips every tile at once.

import { APPS, APP_STORE_BADGE, RELEASED, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface DownloadBlockProps {
  app: AppKey;
  className?: string;
}

export function DownloadBlock({ app, className }: DownloadBlockProps) {
  const info = APPS[app];
  return (
    <div className={cn('panel flex flex-col items-start gap-3 rounded-lg md:p-6', className)}>
      <p className="font-display text-2xl leading-tight text-ink-strong">{info.name}</p>
      <p className="text-lg text-ink-body">{info.offer}</p>
      {RELEASED ? (
        <a href={info.appStoreUrl} aria-label={`Download ${info.name} on the App Store`} className="mt-1 inline-block rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- Apple's badge is used exactly as supplied */}
          <img src={APP_STORE_BADGE.src} alt="" width={APP_STORE_BADGE.width} height={APP_STORE_BADGE.height} className="h-10 w-auto" />
        </a>
      ) : (
        <>
          <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-input px-3 py-1.5 text-base font-medium text-ink-strong">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            Coming soon to the App Store
          </p>
          {info.betaUrl && (
            <a href={info.betaUrl} className="inline-block py-1 text-lg text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
              Try the public beta on TestFlight
            </a>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Write `components/stanscribe/ComparisonTable.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/ComparisonTable.tsx
// "Which one is for you?": the two apps side by side as a real table (th scope), "Yes" as text.
// Rows are copy.md's table verbatim. Cells hyphenate so the table fits 320px; the focusable region
// is the keyboard fallback if a very large text size still overflows.

import { cn } from '@/lib/utils';

const ROWS: [feature: string, scribe: string, light: string][] = [
  ['Price', 'Pay once', 'Free'],
  ['Live captions, offline', 'Yes', 'Yes'],
  ['Speaker colors and names', 'Yes', 'Yes, or turn them off'],
  ['Voices it knows', 'Yes', 'Yes'],
  ['25 languages', 'Yes', 'Yes'],
  ['Big text and labeled buttons', 'Yes', 'Yes'],
  ['Keeps listening in the background', 'Yes', 'Yes'],
  ['Saved conversations, search, summaries', 'Yes', 'Yes'],
  ['Export, Obsidian, iCloud backup', 'Yes', 'Yes'],
  ['Speech models', 'Advanced and Basic', 'Basic'],
  ['Looks', '28 themes, painted ones, and your own photos', 'Black or white'],
  ['Motion', "Follows your iPhone's Reduce Motion setting", 'Always calm'],
  ['Download', 'Larger', 'Smaller'],
  ['In-app purchases', 'None', 'None'],
];

const CELL = 'p-3 align-top hyphens-auto md:px-5 md:py-4';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div
      role="region"
      aria-labelledby="compare-caption"
      tabIndex={0}
      className={cn('overflow-x-auto rounded-lg border border-border bg-card', className)}
    >
      <table className="w-full border-collapse text-left text-base md:text-lg">
        <caption id="compare-caption" className="sr-only">
          Stan Scribe and Stan Scribe Light compared
        </caption>
        <thead className="bg-muted">
          <tr>
            <td className={CELL} />
            <th scope="col" className={cn(CELL, 'font-display text-lg font-medium text-ink-strong md:text-xl')}>
              Stan Scribe
            </th>
            <th scope="col" className={cn(CELL, 'font-display text-lg font-medium text-ink-strong md:text-xl')}>
              Stan Scribe Light
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, scribe, light]) => (
            <tr key={feature} className="border-t border-border">
              <th scope="row" className={cn(CELL, 'font-medium text-ink-strong')}>
                {feature}
              </th>
              <td className={cn(CELL, 'text-ink-body')}>{scribe}</td>
              <td className={cn(CELL, 'text-ink-body')}>{light}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 7: Write `components/stanscribe/LegalLinks.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalLinks.tsx
// One app's Privacy Policy, Terms of Use and Acknowledgements. Plain <a>: these are static pages
// generated in the app repo (synced into public/), outside the Next router.

import { APPS, type AppKey } from '@/lib/stanscribe';

export function LegalLinks({ app }: { app: AppKey }) {
  const info = APPS[app];
  return (
    <nav aria-label={`${info.name} legal`} className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5">
      <span className="font-medium text-ink-strong">{info.name}:</span>
      <ul className="flex flex-wrap gap-x-5">
        {info.legal.map(({ label, href }) => (
          <li key={href}>
            <a href={href} className="inline-block py-1.5 text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 8: Write `components/stanscribe/HelpBlock.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/HelpBlock.tsx
// Help and fine print: the support email App Review looks for, large, then each app's legal links,
// the copyright line and Apple's trademark line (copy.md section 9).

import { LegalLinks } from '@/components/stanscribe/LegalLinks';
import { Section } from '@/components/stanscribe/Section';
import { SUPPORT_EMAIL, type AppKey } from '@/lib/stanscribe';

export function HelpBlock({ apps }: { apps: AppKey[] }) {
  return (
    <Section id="help" eyebrow="Support" title="Help">
      <p className="text-xl leading-relaxed text-ink-body">Questions, problems or ideas? Email</p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="mt-1 inline-block max-w-full font-display text-[clamp(1.5rem,5vw,2.5rem)] text-link underline decoration-1 underline-offset-[0.18em] transition-colors [overflow-wrap:anywhere] hover:text-link-hover"
      >
        {SUPPORT_EMAIL}
      </a>
      <div className="mt-12 space-y-4 border-t border-border pt-8 text-base leading-relaxed text-ink-muted">
        {apps.map((app) => (
          <LegalLinks key={app} app={app} />
        ))}
        <p>© 2026 Devin Hunt. Stan Scribe is an independent app.</p>
        <p>
          Apple, the Apple logo, iPhone, iPad and iCloud are trademarks of Apple Inc., registered in the U.S. and other
          countries and regions. App Store is a service mark of Apple Inc.
        </p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 9: Run the tests to see them pass**

Run: `npx jest __tests__/stanscribe/DownloadBlock __tests__/stanscribe/HelpBlock`
Expected: PASS (3 suites).

- [ ] **Step 10: Commit**

```bash
git add components/stanscribe __tests__/stanscribe/DownloadBlock.test.tsx __tests__/stanscribe/DownloadBlock.released.test.tsx __tests__/stanscribe/HelpBlock.test.tsx
git commit -m "feat(stanscribe): section, screenshot, download tile, comparison table and help components"
```

```json:metadata
{"files": ["components/stanscribe/Section.tsx", "components/stanscribe/PhoneShot.tsx", "components/stanscribe/DownloadBlock.tsx", "components/stanscribe/ComparisonTable.tsx", "components/stanscribe/LegalLinks.tsx", "components/stanscribe/HelpBlock.tsx", "__tests__/stanscribe/DownloadBlock.test.tsx", "__tests__/stanscribe/DownloadBlock.released.test.tsx", "__tests__/stanscribe/HelpBlock.test.tsx"], "verifyCommand": "npx jest __tests__/stanscribe/DownloadBlock __tests__/stanscribe/HelpBlock", "acceptanceCriteria": ["Pre-release: Stan Scribe tile has offer, Coming soon and TestFlight link; Light tile has offer, Coming soon, no TestFlight; no apps.apple.com links", "RELEASED mocked true: link named 'Download Stan Scribe on the App Store' to apps.apple.com/app/id6822377139, no Coming soon, no TestFlight", "HelpBlock(['light']) has mailto link and only Light's three legal hrefs", "ComparisonTable has 2 column headers and 14 row headers"], "modelTier": "mechanical"}
```

---

### Task 4: `/stanscribe/` page

**Goal:** The main product page renders every copy.md section in the approved layout and passes the brief's rules.

**Files:**
- Create: `app/stanscribe/page.tsx`
- Test: `__tests__/stanscribe/StanScribePage.test.tsx`

**Acceptance Criteria:**
- [ ] Mailto link to `stanscribe@devinhunt.com`; links to all six legal hrefs (both apps).
- [ ] "can be wrong" text and the "Ask before you caption people." heading render, neither inside `<details>`.
- [ ] `#light` contains the h2 "Stan Scribe Light" and the comparison table; "Coming soon to the App Store" appears at least 3 times (two hero tiles + Light section); the TestFlight link is present.
- [ ] Every `<img>` has non-empty alt; exactly one h1; heading levels never jump down by more than one.
- [ ] `findCopyViolations(pageText(container) + JSON.stringify(metadata))` is `[]`; `metadata.title` is "Stan Scribe: live captions for every voice"; canonical is `https://devinhunt.com/stanscribe/`.

**Verify:** `npx jest __tests__/stanscribe/StanScribePage.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Write the failing test** `__tests__/stanscribe/StanScribePage.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react';
import StanScribePage, { metadata } from '@/app/stanscribe/page';
import { APPS } from '@/lib/stanscribe';
import { findCopyViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

// The backdrop fetches SVG and GSAP needs matchMedia; neither matters to the page's content.
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribePage />).container;

test('support email and both apps’ legal links (App Store Connect Support URL)', () => {
  const page = renderPage();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of [...APPS.scribe.legal, ...APPS.light.legal]) {
    expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
});

test('the accuracy and consent lines are visible, not tucked away', () => {
  renderPage();
  const accuracy = screen.getByText(/they can be wrong/i);
  const consent = screen.getByRole('heading', { name: 'Ask before you caption people.' });
  expect(accuracy.closest('details')).toBeNull();
  expect(consent.closest('details')).toBeNull();
});

test('presents both apps, with Light at #light', () => {
  const page = renderPage();
  const light = page.querySelector<HTMLElement>('#light');
  expect(light).not.toBeNull();
  expect(within(light!).getByRole('heading', { level: 2, name: 'Stan Scribe Light' })).toBeInTheDocument();
  expect(within(light!).getByRole('table')).toBeInTheDocument();
  expect(screen.getAllByText('Coming soon to the App Store').length).toBeGreaterThanOrEqual(3);
  expect(screen.getByRole('link', { name: /public beta/i })).toHaveAttribute('href', APPS.scribe.betaUrl);
});

test('images have alt text and headings are in order', () => {
  const page = renderPage();
  const images = Array.from(page.querySelectorAll('img'));
  expect(images.length).toBeGreaterThanOrEqual(9);
  for (const img of images) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('words follow the brief, metadata included', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.title).toBe('Stan Scribe: live captions for every voice');
  expect(metadata.alternates?.canonical).toBe('https://devinhunt.com/stanscribe/');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx jest __tests__/stanscribe/StanScribePage.test.tsx`
Expected: FAIL, `Cannot find module '@/app/stanscribe/page'`.

- [ ] **Step 3: Write `app/stanscribe/page.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/stanscribe/page.tsx
// Stan Scribe and Stan Scribe Light: the product page, and both apps' Support and Marketing URL in
// App Store Connect. Words come from transcript_stan/docs/marketing/stanscribe-page/copy.md; the
// rules they follow (no prices, no model names, privacy wording) are in README.md beside it.

import type { Metadata } from 'next';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { Section } from '@/components/stanscribe/Section';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { APPS, LANGUAGES, LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe: live captions for every voice';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = 'https://devinhunt.com/stanscribe/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', url: PAGE_URL, siteName: 'Devin Hunt', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

interface Feature {
  title: string;
  body: string;
}

const STEPS: Feature[] = [
  { title: 'Tap Start.', body: 'Captions begin as soon as people speak. They never start on their own.' },
  { title: 'Follow along.', body: 'Each speaker gets their own color and name. Make the words as big as you need.' },
  { title: 'Tap Stop.', body: 'The conversation is saved as text, ready to read, search or share. No audio is kept.' },
];

const READING: Feature[] = [
  { title: 'Speakers in color.', body: 'A color and a name for each speaker, so you can tell who said what.' },
  { title: 'Voices it knows.', body: 'Teach it the people you talk with most, with their permission, and it labels them by name.' },
  { title: 'Big text you control.', body: 'Make the words as large as you like with the A+ and A− buttons, and choose a text style: Standard, Rounded or Extra clear.' },
  { title: 'Buttons with words.', body: 'Every control is large and says what it does: Smaller, Larger, Save, Stop. No guessing at icons.' },
];

const LISTENING: Feature[] = [
  { title: 'Keeps listening.', body: 'Switch to another app or lock your iPhone, and captions keep going until you tap Stop. A Captioning card on the Lock Screen shows that captions are on, and it never shows the words.' },
  { title: 'Start Captions from the Lock Screen.', body: 'Add Start Captions to your Lock Screen or Control Center, and captions are one tap away.' },
  { title: 'Save a moment.', body: 'One tap on Save highlights the last 30 seconds, so you can find it later.' },
];

const KEEPING: Feature[] = [
  { title: 'Your conversations, kept tidy.', body: 'A calendar, a filter by person, search for any word, and smart titles. On iPhones with Apple Intelligence, a short summary too, written on your iPhone.' },
  { title: 'Take it with you.', body: 'Export a conversation as text or Markdown, send it to a notes folder such as Obsidian, or back it up to your own iCloud.' },
];

const MAKE_IT_YOURS: Feature[] = [
  { title: 'Make it yours.', body: '28 color themes, including a gallery of painted ones, plus as many themes as you like from your own photos.' },
];

const PRIVACY: Feature[] = [
  { title: 'Everything happens on your iPhone or iPad.', body: 'The speech models are built into the app, so captions work in airplane mode.' },
  { title: 'No account. No ads. No tracking.', body: 'The app never connects to the internet.' },
  { title: 'No audio is saved.', body: 'Sound is turned into captions as you listen, then gone. Only the words of conversations you keep are saved, on your device.' },
  { title: 'Your words leave only when you send them:', body: 'when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud.' },
  { title: 'Voice profiles stay on your device.', body: 'They are never backed up or sent anywhere, and you can delete any of them at any time.' },
];

const QUESTIONS: Feature[] = [
  { title: 'Does it need the internet?', body: 'No. The speech models are built into the app, and captions work in airplane mode. The first caption after installing takes a little longer while your iPhone prepares the speech model.' },
  { title: 'Does it record audio?', body: 'No. The app turns sound into captions a few seconds at a time, in memory, and never saves it. Only the words of conversations you keep are saved, on your device.' },
  { title: 'How accurate are the captions?', body: 'They’re automatic, so they can be wrong, especially with background noise, accents, people talking over each other, and names. Please don’t rely on them for emergencies, or for medical, legal or safety decisions. Stan Scribe is not a medical device and doesn’t replace a professional interpreter or captioner.' },
  { title: 'Do I need to ask people first?', body: 'Yes. Tell people the app is on. In some places, everyone in a conversation must agree before it is captured. Set up someone’s voice only with their permission.' },
  { title: 'What do I need?', body: 'An iPhone or iPad with iOS 18 or later.' },
  { title: 'Is there a subscription?', body: 'No. Stan Scribe is a one-time purchase, and Stan Scribe Light is free. Neither has in-app purchases, ads or subscriptions, and every theme comes with Stan Scribe.' },
  { title: 'Where are my conversations kept?', body: 'On your device, until you delete them. If you turn on iCloud backup, a copy of the text goes to your own iCloud, so your other devices can import it. I can’t see it.' },
  { title: 'Can I delete everything?', body: 'Yes. Delete a conversation or a voice in the app, or delete the app to remove everything it kept on your device.' },
];

const JUMP_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#light', label: 'Stan Scribe Light' },
  { href: '#questions', label: 'Questions' },
  { href: '#help', label: 'Help' },
];

const LINK = 'text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover';

/** Feature cards: a hairline above each, serif title, body at reading size. */
function FeatureList({ items, className }: { items: Feature[]; className?: string }) {
  return (
    <ul className={cn('grid gap-x-10 gap-y-8', className)}>
      {items.map(({ title, body }) => (
        <li key={title} className="border-t border-border pt-5">
          <h3 className="font-display text-2xl leading-snug text-ink-strong">{title}</h3>
          <p className="mt-2 text-lg leading-relaxed text-ink-body">{body}</p>
        </li>
      ))}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="mt-1 h-6 w-6 text-primary">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function StanScribePage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" />

      <div className="container relative z-10 mx-auto space-y-8 px-6 pb-8 text-lg md:space-y-12">
        {/* 1. Hero */}
        <section aria-labelledby="stanscribe-title" className="grid items-center gap-12 py-12 md:py-16 lg:min-h-[78svh] lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6">For iPhone and iPad</p>
            <h1 id="stanscribe-title" className="display mb-4 text-[clamp(3rem,7vw,5.25rem)]">
              Stan Scribe
            </h1>
            <p className="mb-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] italic leading-snug text-ink-strong">
              Live captions for every voice.
            </p>
            <p className="mb-10 max-w-[34rem] text-xl leading-relaxed text-ink-body">
              Put your iPhone on the table and tap Start. The words appear as people talk: big, clear, and in a different
              color for each person. It all happens on your iPhone, with no internet and no account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <DownloadBlock app="scribe" />
              <DownloadBlock app="light" />
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base">
              {JUMP_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={cn(LINK, 'inline-block py-1')}>
                  {label}
                </a>
              ))}
            </nav>
          </HeroLoadIn>
          <PhoneShot image={SHOTS.hero} priority className="mx-auto max-w-[34rem] lg:max-w-none" />
        </section>

        {/* 2. The story */}
        <Section id="story" eyebrow="Why it exists" title="Built as a scribe for my grandpa Stan">
          <div className="max-w-[44rem] space-y-5 font-display text-[clamp(1.375rem,2.6vw,1.75rem)] leading-relaxed text-ink-strong">
            <p>
              My grandpa is hard of hearing. At the table, the conversation moves faster than he can catch it. So I made
              him an app: put the iPhone down, tap Start, and the words appear as people talk, in big text, with a
              different color for each person.
            </p>
            <p>Now it’s here for anyone who needs the same thing.</p>
          </div>
          <p className="mt-6 font-mono text-sm uppercase tracking-caps text-eyebrow">— Devin</p>
        </Section>

        {/* 3. How it works */}
        <Section id="how-it-works" eyebrow="Three steps" title="How it works">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_minmax(0,17rem)] lg:gap-20">
            <ol className="space-y-8">
              {STEPS.map(({ title, body }, i) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span aria-hidden="true" className="pt-2 font-mono text-base text-eyebrow">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-ink-strong md:text-3xl">{title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-ink-body md:text-xl">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <PhoneShot image={SHOTS.liveGraphite} className="mx-auto max-w-[17rem]" />
          </div>
        </Section>

        {/* 4. What you get */}
        <Section id="features" eyebrow="What you get" title="Made to be read across the table">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,17rem)] lg:gap-16">
            <FeatureList items={READING} className="sm:grid-cols-2" />
            <PhoneShot image={SHOTS.liveLarge} className="mx-auto max-w-[17rem]" />
          </div>
          <FeatureList items={LISTENING} className="mt-12 md:grid-cols-3" />
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <FeatureList items={KEEPING} />
            <div className="mx-auto grid max-w-[30rem] grid-cols-2 gap-4">
              <PhoneShot image={SHOTS.conversation} />
              <PhoneShot image={SHOTS.library} />
            </div>
          </div>
          <div className="mt-16">
            <PhoneShot image={SHOTS.paintedThemes} className="mx-auto max-w-[56rem]" />
            <FeatureList items={MAKE_IT_YOURS} className="mx-auto mt-8 max-w-[40rem]" />
          </div>
        </Section>

        {/* 5. Privacy */}
        <Section id="privacy" eyebrow="Privacy" title="Private by design">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-16">
            <ul className="space-y-6">
              {PRIVACY.map(({ title, body }) => (
                <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <CheckIcon />
                  <p className="text-lg leading-relaxed text-ink-body md:text-xl">
                    <strong className="font-semibold text-ink-strong">{title}</strong> {body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="self-start border-l-4 border-accent bg-muted p-6 md:p-8">
              <h3 className="font-display text-2xl text-ink-strong">Ask before you caption people.</h3>
              <p className="mt-3 text-lg leading-relaxed text-ink-body">
                The app hears everyone nearby. In some places, everyone in a conversation must agree before it is
                captured, so tell people the app is on. Set up someone’s voice only with their permission.
              </p>
            </div>
          </div>
          <p className="mt-10 text-lg text-ink-body">
            Read the <a href={APPS.scribe.legal[0].href} className={LINK}>Privacy Policy</a>.
          </p>
        </Section>

        {/* 6. Stan Scribe Light */}
        <Section id="light" eyebrow="Two apps" title="Stan Scribe Light">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
            <div>
              <p className="font-display text-[clamp(1.5rem,3vw,2rem)] italic text-ink-strong">The simple edition. Free.</p>
              <p className="mt-5 max-w-[38rem] text-xl leading-relaxed text-ink-body">{LIGHT_SUMMARY}</p>
              <DownloadBlock app="light" className="mt-8 max-w-sm" />
            </div>
            <PhoneShot image={SHOTS.lightBlackAndWhite} className="mx-auto max-w-[26rem]" />
          </div>
          <h3 className="mt-16 font-display text-2xl text-ink-strong md:text-3xl">Which one is for you?</h3>
          <ComparisonTable className="mt-6" />
          <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-ink-body md:text-xl">
            <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
          </p>
        </Section>

        {/* 7. Languages */}
        <Section id="languages" eyebrow="Languages" title="25 languages">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,17rem)] lg:gap-16">
            <div>
              <p className="max-w-[38rem] text-xl leading-relaxed text-ink-body">
                Captions work in English and 24 other European languages. Choose one in Settings, or leave it on Auto.
              </p>
              <ul aria-label="Caption languages" className="mt-8 flex flex-wrap gap-2.5">
                {LANGUAGES.map((language) => (
                  <li key={language} className="rounded-full border border-input px-4 py-1.5 text-base text-ink-strong">
                    {language}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-[38rem] text-lg leading-relaxed text-ink-body">
                Smart titles name conversations by topic in English, and in more languages on iPhones with Apple
                Intelligence.
              </p>
            </div>
            <PhoneShot image={SHOTS.languages} className="mx-auto max-w-[17rem]" />
          </div>
        </Section>

        {/* 8. Questions — every answer open, so "they can be wrong" is never hidden */}
        <Section id="questions" eyebrow="FAQ" title="Questions">
          <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
            {QUESTIONS.map(({ title, body }) => (
              <div key={title}>
                <h3 className="font-display text-2xl leading-snug text-ink-strong">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-ink-body">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 9. Help and fine print */}
        <HelpBlock apps={['scribe', 'light']} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to see it pass**

Run: `npx jest __tests__/stanscribe/StanScribePage.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/stanscribe/page.tsx __tests__/stanscribe/StanScribePage.test.tsx
git commit -m "feat(stanscribe): /stanscribe product page"
```

```json:metadata
{"files": ["app/stanscribe/page.tsx", "__tests__/stanscribe/StanScribePage.test.tsx"], "verifyCommand": "npx jest __tests__/stanscribe/StanScribePage.test.tsx", "acceptanceCriteria": ["mailto stanscribe@devinhunt.com and all six legal hrefs present", "'can be wrong' and 'Ask before you caption people.' render outside <details>", "#light holds h2 'Stan Scribe Light' and the table; Coming soon appears >=3 times; TestFlight link present", "every img has alt; one h1; no heading level skips", "findCopyViolations over page text + metadata is []; title and canonical exact"], "modelTier": "standard"}
```

---

### Task 5: `/stanscribe-light/` page

**Goal:** Light's own Support/Marketing page: hero, Help directly after it, comparison, link back to Stan Scribe.

**Files:**
- Create: `app/stanscribe-light/page.tsx`
- Test: `__tests__/stanscribe/StanScribeLightPage.test.tsx`

**Acceptance Criteria:**
- [ ] h1 "Stan Scribe Light"; mailto link to `stanscribe@devinhunt.com`; Light's three legal hrefs present.
- [ ] The Help section (`#help`) comes before the comparison section (`#compare`) in document order.
- [ ] A link to `/stanscribe`; images have alt; one h1; no heading skips.
- [ ] `findCopyViolations(pageText + JSON.stringify(metadata))` is `[]`; canonical is `https://devinhunt.com/stanscribe-light/`.

**Verify:** `npx jest __tests__/stanscribe/StanScribeLightPage.test.tsx` → all pass

**Steps:**

- [ ] **Step 1: Write the failing test** `__tests__/stanscribe/StanScribeLightPage.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import StanScribeLightPage, { metadata } from '@/app/stanscribe-light/page';
import { APPS } from '@/lib/stanscribe';
import { findCopyViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribeLightPage />).container;

test('Light’s Support URL: email and Light’s legal links', () => {
  const page = renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Stan Scribe Light' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of APPS.light.legal) expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
});

test('Help comes right after the hero, before the comparison', () => {
  const page = renderPage();
  const help = page.querySelector('#help')!;
  const compare = page.querySelector('#compare')!;
  expect(help.compareDocumentPosition(compare) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('links back to Stan Scribe; alt text and heading order', () => {
  const page = renderPage();
  expect(page.querySelector('a[href="/stanscribe"]')).not.toBeNull();
  for (const img of Array.from(page.querySelectorAll('img'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('words follow the brief, metadata included', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.alternates?.canonical).toBe('https://devinhunt.com/stanscribe-light/');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx jest __tests__/stanscribe/StanScribeLightPage.test.tsx`
Expected: FAIL, `Cannot find module '@/app/stanscribe-light/page'`.

- [ ] **Step 3: Write `app/stanscribe-light/page.tsx`**

```tsx
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/stanscribe-light/page.tsx
// Stan Scribe Light's Support and Marketing URL in App Store Connect. App Review opens it looking
// for a contact, so Help sits directly under the hero. Copy is copy.md's Light section.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { Section } from '@/components/stanscribe/Section';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';

const TITLE = 'Stan Scribe Light: live captions, the simple edition';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. The simple edition of Stan Scribe, free. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = 'https://devinhunt.com/stanscribe-light/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', url: PAGE_URL, siteName: 'Devin Hunt', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

export default function StanScribeLightPage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" />

      <div className="container relative z-10 mx-auto space-y-8 px-6 pb-8 text-lg md:space-y-12">
        <section aria-labelledby="light-page-title" className="grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6">For iPhone and iPad</p>
            <h1 id="light-page-title" className="display mb-4 text-[clamp(2.75rem,6.5vw,4.75rem)]">
              Stan Scribe Light
            </h1>
            <p className="mb-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] italic leading-snug text-ink-strong">
              The simple edition. Free.
            </p>
            <p className="mb-10 max-w-[34rem] text-xl leading-relaxed text-ink-body">{LIGHT_SUMMARY}</p>
            <DownloadBlock app="light" className="max-w-sm" />
          </HeroLoadIn>
          <PhoneShot image={SHOTS.lightBlackAndWhite} priority className="mx-auto max-w-[22rem] lg:max-w-[30rem]" />
        </section>

        <HelpBlock apps={['light']} />

        <Section id="compare" eyebrow="Two apps" title="Which one is for you?">
          <ComparisonTable />
          <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-ink-body md:text-xl">
            <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
          </p>
          <Link href="/stanscribe" className="mt-8 inline-block py-1 text-lg text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
            See everything in Stan Scribe <span aria-hidden="true">→</span>
          </Link>
        </Section>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to see it pass**

Run: `npx jest __tests__/stanscribe/StanScribeLightPage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/stanscribe-light/page.tsx __tests__/stanscribe/StanScribeLightPage.test.tsx
git commit -m "feat(stanscribe): /stanscribe-light page with help directly under the hero"
```

```json:metadata
{"files": ["app/stanscribe-light/page.tsx", "__tests__/stanscribe/StanScribeLightPage.test.tsx"], "verifyCommand": "npx jest __tests__/stanscribe/StanScribeLightPage.test.tsx", "acceptanceCriteria": ["h1 'Stan Scribe Light', mailto link, Light's three legal hrefs", "#help precedes #compare in document order", "link to /stanscribe; alt on every img; one h1; no heading skips", "findCopyViolations over text + metadata is []; canonical exact"], "modelTier": "standard"}
```

---

### Task 6: Homepage panel

**Goal:** The homepage links to Stan Scribe with a featured panel between the hero and Professional Expertise.

**Files:**
- Modify: `app/page.tsx` (insert after the hero `</section>`, before the "Professional Expertise" section; that section's `pt-6` becomes `pt-4`)
- Test: `__tests__/stanscribe/HomePanel.test.tsx`

**Acceptance Criteria:**
- [ ] The homepage has an h2 "Stan Scribe" whose section contains a link named "Meet Stan Scribe" to `/stanscribe` and the `both-apps.webp` image with its alt text.
- [ ] The panel's h2 comes before the "Professional Expertise" h2.

**Verify:** `npx jest __tests__/stanscribe/HomePanel.test.tsx` → pass

**Steps:**

- [ ] **Step 1: Write the failing test** `__tests__/stanscribe/HomePanel.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react';
import Home from '@/app/page';
import { SHOTS } from '@/lib/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

test('the homepage features Stan Scribe above Professional Expertise', () => {
  render(<Home />);
  const heading = screen.getByRole('heading', { level: 2, name: 'Stan Scribe' });
  const panel = heading.closest('section')!;
  expect(within(panel).getByRole('link', { name: /Meet Stan Scribe/ })).toHaveAttribute('href', '/stanscribe');
  expect(within(panel).getByAltText(SHOTS.bothApps.alt)).toBeInTheDocument();
  const expertise = screen.getByRole('heading', { level: 2, name: 'Professional Expertise' });
  expect(heading.compareDocumentPosition(expertise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx jest __tests__/stanscribe/HomePanel.test.tsx`
Expected: FAIL, `Unable to find role="heading" … name "Stan Scribe"`.

- [ ] **Step 3: Edit `app/page.tsx`.** Add `import { PhoneShot } from '@/components/stanscribe/PhoneShot';` and `import { SHOTS } from '@/lib/stanscribe';` after the existing imports. Change the Professional Expertise wrapper from `<section className="pt-6 pb-0">` to `<section className="pt-4 pb-0">`, and insert this directly before it:

```tsx
        <section aria-labelledby="stanscribe-feature-title" className="pt-6 pb-0">
          <div className="panel">
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:gap-12">
              <div>
                <p className="eyebrow-mono mb-4">An app for my grandpa</p>
                <h2 id="stanscribe-feature-title" className="section-title mb-4">Stan Scribe</h2>
                <p className="mb-6 max-w-[34rem] leading-relaxed text-ink-body">
                  Live captions for the conversation in front of you, with a color for each speaker. Built for my
                  grandpa Stan, who is hard of hearing.
                </p>
                <Link href="/stanscribe" className="link-quiet-mono">
                  Meet Stan Scribe <span aria-hidden="true">→</span>
                </Link>
              </div>
              <PhoneShot image={SHOTS.bothApps} className="mx-auto max-w-[15rem]" />
            </div>
          </div>
        </section>
```

- [ ] **Step 4: Run the test to see it pass**

Run: `npx jest __tests__/stanscribe/HomePanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx __tests__/stanscribe/HomePanel.test.tsx
git commit -m "feat(home): featured Stan Scribe panel"
```

```json:metadata
{"files": ["app/page.tsx", "__tests__/stanscribe/HomePanel.test.tsx"], "verifyCommand": "npx jest __tests__/stanscribe/HomePanel.test.tsx", "acceptanceCriteria": ["h2 'Stan Scribe' section holds a 'Meet Stan Scribe' link to /stanscribe and the both-apps image with its alt", "the panel precedes Professional Expertise"], "modelTier": "mechanical"}
```

---

### Task 7: Build and browser verification

**Goal:** The exported site serves both pages and all six legal pages at their App Store Connect URLs, and the pages hold up at 320px, 200% zoom, light/dark and keyboard, with only same-origin requests.

**Files:**
- Modify: only files needed to fix problems found (each fix gets its own test where one is possible)

**Acceptance Criteria:**
- [ ] `npm test` passes in full; `npm run build` exits 0.
- [ ] `out/stanscribe/index.html` and `out/stanscribe-light/index.html` contain "Live captions for every voice." / "The simple edition. Free."; all six `out/stanscribe*/{privacy,terms,acknowledgements}/index.html` contain "Generated by Scripts/legal.py".
- [ ] Served from `out/` (`npx serve out` or `python3 -m http.server -d out`), `/stanscribe/`, `/stanscribe-light/` and `/stanscribe/privacy/` return the right pages.
- [ ] In Chrome at 320px wide: `document.documentElement.scrollWidth <= 320` on both pages; at 200% zoom on 1280px the same holds; light and dark themes both readable; Tab reaches every link with a visible focus ring.
- [ ] Network log on `/stanscribe/` shows only the local origin.
- [ ] `grep -ri whisper out/stanscribe* out/images/stanscribe` → no matches.

**Verify:** `npm test && npm run build && ls out/stanscribe out/stanscribe-light` → tests pass, build exits 0, each lists `acknowledgements index.html privacy terms`

**Steps:**

- [ ] **Step 1:** `npm test` → all suites pass.
- [ ] **Step 2:** `npm run build` → exit 0; then `grep -c "Live captions for every voice." out/stanscribe/index.html` (≥1), `grep -c "The simple edition. Free." out/stanscribe-light/index.html` (≥1), `grep -L "Generated by Scripts/legal.py" out/stanscribe*/*/index.html` (prints nothing).
- [ ] **Step 3:** `grep -ril whisper out/stanscribe* out/images/stanscribe` → no output.
- [ ] **Step 4:** Serve `out/` locally and check `/stanscribe/`, `/stanscribe-light/`, `/stanscribe/privacy/` with curl.
- [ ] **Step 5:** Chrome: at 320px and at 1280px with 200% zoom, run `document.documentElement.scrollWidth` on both pages; toggle the theme; Tab through the hero; read the network requests for `/stanscribe/`; screenshot the hero, the Light section and the Help block in both themes.
- [ ] **Step 6:** Fix anything found, re-run `npm test`, commit fixes with messages naming what they fix.

```json:metadata
{"files": [], "verifyCommand": "npm test && npm run build && ls out/stanscribe out/stanscribe-light", "acceptanceCriteria": ["npm test passes; npm run build exits 0", "out/stanscribe/index.html and out/stanscribe-light/index.html hold the designed pages; six legal pages carry the generator marker", "served out/ returns the right pages at /stanscribe/, /stanscribe-light/, /stanscribe/privacy/", "scrollWidth <= viewport at 320px and at 200% zoom; both themes readable; visible focus on Tab", "only same-origin network requests on /stanscribe/", "no 'whisper' in exported Stan Scribe files"], "modelTier": "frontier"}
```

---

## Launch day (not a task; recorded for the owner)

1. Save Apple's black "Download on the App Store" SVG as `public/images/stanscribe/app-store-badge.svg`.
2. Set `RELEASED = true` in `lib/stanscribe.ts`. `npm test` (the lib test now requires the badge) and deploy.
3. When the app session regenerates legal text: `npm run sync:stanscribe-legal`, commit, deploy.
