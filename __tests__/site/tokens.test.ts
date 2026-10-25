import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import SiteLayout from '@/app/(site)/layout';

jest.mock('@/components/layout/Header', () => () => null);
jest.mock('@/components/layout/Footer', () => () => null);

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
  const fonts = fs.readFileSync(path.join(process.cwd(), 'app/fonts.ts'), 'utf8');
  expect(fonts).toMatch(/Public_Sans\(/);
  expect(fonts).toMatch(/variable: '--font-site'/);
});

test('portfolio pages render inside the .site scope', () => {
  const { container } = render(createElement(SiteLayout, null, createElement('p', null, 'page')));
  expect(container.querySelector('.site')).not.toBeNull();
});
