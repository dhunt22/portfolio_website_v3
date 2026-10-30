import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import SiteLayout from '@/app/(site)/layout';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));

const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('}', start));
};

test('the .site scope remaps the semantic tokens to the Working Map palette', () => {
  const site = block('.site');
  expect(site).toContain('--site-ground: #eef1f3');
  expect(site).toContain('--surface-page: var(--site-ground)');
  expect(site).toContain('--text-body: #0d1114');
  expect(site).toContain('--font-display: var(--font-site)');
  expect(block('.dark .site')).toContain('--site-ground: #111517');
});

test('Public Sans is loaded as --font-site', () => {
  const fonts = fs.readFileSync(path.join(process.cwd(), 'app/fonts/site.ts'), 'utf8');
  expect(fonts).toMatch(/Public_Sans\(/);
  expect(fonts).toMatch(/variable: '--font-site'/);
});

test('portfolio pages render inside the .site scope', () => {
  const { container } = render(createElement(SiteLayout, null, createElement('p', null, 'page')));
  expect(container.querySelector('.site')).not.toBeNull();
});

test('printing from either theme resets the portfolio tokens to a clean light document', () => {
  const print = css.slice(css.indexOf('@media print'));
  expect(print).toContain('--text-link: #1c5a85');
  expect(print).toContain('--site-worked: #e6eef4');
});

/** True when `rule` sits at the top level of globals.css, outside every @layer and @media block. */
const unlayered = (rule: string) => {
  const at = css.indexOf(rule);
  const before = css.slice(0, at).replace(/\/\*[\s\S]*?\*\//g, '');
  return at >= 0 && (before.match(/\{/g) ?? []).length === (before.match(/\}/g) ?? []).length;
};

test('the portfolio ground behind the page beats the body utility, so it sits outside the layers', () => {
  // In Tailwind 4 every utility outranks a rule in @layer base, whatever its specificity.
  expect(unlayered('body:has(.site) {')).toBe(true);
  expect(unlayered('.dark body:has(.site) {')).toBe(true);
  expect(css).toMatch(/body:has\(\.site\) \{ background-color: #eef1f3;/);
});

test('every focus ring on a portfolio page is Water Blue: skip link, map and MapLibre buttons', () => {
  expect(css).toMatch(/body:has\(\.site\) \{[^}]*--ring-focus: #1c5a85/);
  expect(css).toMatch(/\.dark body:has\(\.site\) \{[^}]*--ring-focus: #6fb1de/);
  expect(css).toMatch(/:where\([^)]*\[role="application"\]\[tabindex\][^)]*\):focus-visible \{ outline: 2px solid var\(--ring-focus\); outline-offset: 3px; \}/);
  expect(css).toMatch(/\.site \.maplibregl-map \.maplibregl-ctrl button:focus-visible \{ outline: 2px solid var\(--ring-focus\)/);
  // The map surface is clipped by its frame, so its ring sits inside the edge.
  expect(css).toMatch(/\.site :is\(\[role="application"\], \.maplibregl-canvas\):focus-visible \{ outline-offset: -4px; \}/);
});

test('the map attribution reads as ink on a light label in both themes', () => {
  expect(css).toMatch(/\.site \.maplibregl-map \.maplibregl-ctrl\.maplibregl-ctrl-attrib \{ background-color: rgb\(255 255 255 \/ 0\.88\); color: #0d1114; \}/);
});

test('headings balance and paragraphs avoid orphans inside .site', () => {
  expect(css).toContain('.site :is(h1, h2, h3, h4, .entry-name) { text-wrap: balance; }');
  expect(css).toContain('.site p { text-wrap: pretty; }');
});

test('on portfolio pages the skip link wears Public Sans, square and light over the strip, not the legacy card', () => {
  const { container } = render(createElement(SiteLayout, null, createElement('p', null, 'page')));
  const skip = container.querySelector('a[href="#main"]')!;
  expect(skip).toHaveClass('font-site', 'text-site-body', 'bg-site-strip-ink', 'text-site-strip');
  expect(skip.className).not.toMatch(/rounded|shadow|border/);
});

test('portfolio scrollbars take the palette, not the legacy stone', () => {
  expect(css).toContain('html:has(.site) { scrollbar-color: #9aa7b1 #eef1f3; }');
  expect(css).toContain('html.dark:has(.site) { scrollbar-color: #4d5962 #111517; }');
});

test('a page title too wide for a narrow phone hyphenates rather than overflowing', () => {
  expect(css).toMatch(/@media \(max-width: 380px\) \{\s*\.site h1 \{ -webkit-hyphens: auto; hyphens: auto; hyphenate-limit-chars: 12 6 6; overflow-wrap: anywhere; \}/);
});
