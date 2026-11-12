// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe.ts
// One source for the Stan Scribe pages: launch state, links, screenshots and the copy both pages share.
// Words come from transcript_stan/docs/marketing/stanscribe-page/copy.md; README.md beside it has the rules.

/**
 * Launch switch. Both apps release the same day. To launch:
 * 1. Download Apple's black "Download on the App Store" badge (SVG) from
 *    https://developer.apple.com/app-store/marketing/guidelines/ and save it as
 *    public/images/stanscribe/app-store-badge.svg.
 * 2. Check the Apple trademark line in components/stanscribe/HelpBlock.tsx against the wording on
 *    Apple's badge page.
 * 3. Set RELEASED to true. Every download tile becomes a badge link to the App Store, and the
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
  /** Its route in this repo, and its folder in content/stanscribe-legal/. */
  route: string;
  /** Its path on stanscribe.devinhunt.com. netlify.toml rewrites this to the route's exported files. */
  path: string;
  /** The line under the name in its download tile. */
  offer: string;
  appStoreUrl: string;
  /** Public TestFlight link, shown before release. Light's is not live yet. */
  betaUrl?: string;
}

export const LEGAL_PAGES = [
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms of Use' },
  { slug: 'acknowledgements', label: 'Acknowledgements' },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]['slug'];

/** Stan Scribe's own address. Every canonical URL is here. */
export const STANSCRIBE_ORIGIN = 'https://stanscribe.devinhunt.com';

/** True in the production build alone: netlify.toml sets the variable for that build, and Next inlines it. */
const onSubdomain = (): boolean => process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN === 'true';

const PLACES: Record<AppKey, Pick<AppInfo, 'route' | 'path'>> = {
  scribe: { route: 'stanscribe', path: '/' },
  light: { route: 'stanscribe-light', path: '/light/' },
};

/** A page's address on stanscribe.devinhunt.com: an app's main page, or one of its legal pages. */
export const pageUrl = (app: AppKey, legal?: LegalSlug): string => `${STANSCRIBE_ORIGIN}${PLACES[app].path}${legal ? `${legal}/` : ''}`;

/** What a link to that page says in this build. */
export const pageHref = (app: AppKey, legal?: LegalSlug): string =>
  onSubdomain() ? pageUrl(app, legal) : `/${PLACES[app].route}${legal ? `/${legal}/` : ''}`;

/** The way to the portfolio, which is on another domain in production. */
export const portfolioHref = (): string => (onSubdomain() ? 'https://devinhunt.com/' : '/');

/**
 * Which app a path belongs to, and whether it is that app's main page. A page is built at its route in this
 * repo (/stanscribe-light/terms) and opened at its path on the subdomain (/light/terms), and the header must
 * render the same at both, so this reads either.
 */
export function locate(pathname: string): { app: AppKey; main: boolean } {
  const [first, ...rest] = pathname.split('/').filter(Boolean);
  if (first === PLACES.light.route || `/${first}/` === PLACES.light.path) return { app: 'light', main: rest.length === 0 };
  if (first === PLACES.scribe.route) return { app: 'scribe', main: rest.length === 0 };
  return { app: 'scribe', main: first === undefined };
}

/** One app's Privacy Policy, Terms of Use and Acknowledgements. */
export const legalLinks = (app: AppKey): LegalLink[] => LEGAL_PAGES.map(({ slug, label }) => ({ label, href: pageHref(app, slug) }));

export const APPS: Record<AppKey, AppInfo> = {
  scribe: {
    name: 'Stan Scribe',
    ...PLACES.scribe,
    offer: 'Pay once. No subscription.',
    appStoreUrl: 'https://apps.apple.com/app/id6822377139',
    betaUrl: 'https://testflight.apple.com/join/ejNyaGqJ',
  },
  light: {
    name: 'Stan Scribe Light',
    ...PLACES.light,
    offer: 'Free. The simple edition.',
    appStoreUrl: 'https://apps.apple.com/app/id6824796578',
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
  url: `${STANSCRIBE_ORIGIN}/images/stanscribe/stan-scribe-social.jpg`,
  width: 1200,
  height: 630,
  alt: 'Stan Scribe and Stan Scribe Light on two iPhones, showing live captions in color.',
};

/** The /stanscribe-light/ page's intro. */
export const LIGHT_SUMMARY =
  'Stan Scribe Light has the same live captions and speaker colors as Stan Scribe. With their permission, you can teach it the voices of the people you talk with. It is simpler: one speech model, a black or a white page, and calm motion. That also makes it a smaller download. If you want plain captions, turn speaker colors off.';

/** Above the comparison table, which lists only the differences. */
export const BOTH_APPS_SHARE =
  'Both apps have live captions that work offline, speaker colors and names, voices it knows, 25 languages, big text, and saved conversations you can search and export. Neither has in-app purchases.';

/** Follows a bold "Not sure?". */
export const LIGHT_NOT_SURE =
  'Start with Light. If you want the Advanced speech model, the painted themes or themes from your own photos, choose Stan Scribe.';

export const LANGUAGES = [
  'Bulgarian', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Finnish', 'French',
  'German', 'Greek', 'Hungarian', 'Italian', 'Latvian', 'Lithuanian', 'Maltese', 'Polish',
  'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish', 'Ukrainian',
];
