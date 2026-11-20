import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import LabelsPage, { metadata } from '@/app/(stanscribe)/stanscribe/labels/page';
import { generateStaticParams as legalParams } from '@/app/(stanscribe)/stanscribe/[page]/page';
import { labelsUrl, legalLinks } from '@/lib/stanscribe';
import { labelsParts } from '@/lib/stanscribe-legal';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const words = fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-site/labels.html'), 'utf8');

/** One app's part of the page: its heading and everything up to the next heading. */
const partUnder = (heading: HTMLElement): string => {
  const texts: string[] = [];
  for (let el = heading.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) texts.push(el.textContent ?? '');
  return texts.join(' ');
};

test('the page is one legal page: its title and date on the contours, the words on the card', () => {
  const { container } = render(<LabelsPage />);
  const [hero, card, ...rest] = Array.from(container.querySelectorAll('section'));
  expect(rest).toHaveLength(0);
  expect(within(hero).getByRole('heading', { level: 1, name: 'Labels and Markings' })).toBeInTheDocument();
  expect(hero.textContent).toMatch(/^Labels and Markings\s*Updated [A-Z][a-z]+ \d{1,2}, \d{4}\s*$/);
  expect(card.querySelector('h1')).toBeNull();
});

test('both apps are on the one page, each under its own heading, Stan Scribe first', () => {
  render(<LabelsPage />);
  const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
  expect(headings.slice(0, 2)).toEqual(['Stan Scribe', 'Stan Scribe Light']);
});

test('the address App Store Connect is given for Light scrolls to Light’s part of the page', () => {
  expect(labelsUrl('scribe')).toBe('https://stanscribe.devinhunt.com/labels/');
  expect(labelsUrl('light')).toBe('https://stanscribe.devinhunt.com/labels/#light');
  const { container } = render(<LabelsPage />);
  const target = container.querySelector(new URL(labelsUrl('light')).hash);
  expect(target?.tagName).toBe('H2');
  expect(target?.textContent).toBe('Stan Scribe Light');
});

test.each(['Stan Scribe', 'Stan Scribe Light'])('%s’s part says what the owner approved, and names that app', (name) => {
  render(<LabelsPage />);
  const part = partUnder(screen.getByRole('heading', { level: 2, name }));
  expect(part).toContain(`${name} is software for iOS. It is available only as a download on the App Store, and it has no packaging and no physical parts.`);
  expect(part).toContain(`No label or marking required by European Union law applies to ${name}. It carries no CE marking.`);
  expect(part).toContain(`${name} is not a medical device. It shows captions of speech and does not diagnose, treat or monitor any condition.`);
});

test('questions go to the Stan Scribe address, and the page links nowhere else in its words', () => {
  const { head, body } = labelsParts();
  expect(head + body).toBe(words);
  const links = Array.from(words.matchAll(/href="([^"]+)"/g), (m) => m[1]);
  expect(links).toEqual(['mailto:stanscribe@devinhunt.com']);
});

test('the words follow the Stan Scribe copy rules and hold no page frame', () => {
  expect(words).toMatch(/^<h1>Labels and Markings<\/h1>\n<p>Updated /);
  expect(words).not.toMatch(/<(html|head|body|main|nav|style|script)\b/i);
  expect(words).not.toMatch(/[–—]/);
  expect(words).not.toMatch(/transcri/i);
  expect(words).not.toMatch(/[$€£]\s?\d/);
});

test('Stan Scribe’s legal pages are linked under the words, and Labels is not one of the three', () => {
  const { container } = render(<LabelsPage />);
  for (const { href } of legalLinks('scribe')) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(legalLinks('scribe').map((l) => l.label)).not.toContain('Labels and Markings');
  expect(legalParams().map(({ page }) => page)).not.toContain('labels');
});

test('the page names its one address on the subdomain, and the site in link previews', () => {
  expect(metadata.title).toBe('Labels and Markings · Stan Scribe');
  expect(metadata.description).toBe('Labels and markings for Stan Scribe and Stan Scribe Light under European Union law.');
  expect(metadata.alternates?.canonical).toBe('https://stanscribe.devinhunt.com/labels/');
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe', url: 'https://stanscribe.devinhunt.com/labels/' });
});

test('a heading the address scrolls to stops a little below the top of the window, as the main page’s sections do', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');
  expect(css).toMatch(/\.legal h2\[id\] \{ @apply scroll-mt-8; \}/);
});
