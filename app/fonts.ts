import { Newsreader, Hanken_Grotesk, JetBrains_Mono, Public_Sans } from 'next/font/google';

export const newsreader = Newsreader({
  subsets: ['latin'], style: ['normal', 'italic'],
  weight: ['400', '500', '600'], variable: '--font-display', display: 'swap',
});
export const hanken = Hanken_Grotesk({
  subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap',
});
export const jetbrains = JetBrains_Mono({
  subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap',
});

/** The portfolio's one typeface (DESIGN.md). Exposed as --font-site; .site maps the other font tokens to it. */
export const publicSans = Public_Sans({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-site', display: 'swap',
});
