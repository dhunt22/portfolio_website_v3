import { Public_Sans } from 'next/font/google';

/** The portfolio's one typeface (DESIGN.md). Exposed as --font-site; .site maps the other font tokens to it. */
export const publicSans = Public_Sans({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-site', display: 'swap',
});
