import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

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
