// The Stan Scribe pages read the root tokens in globals.css (they sit outside .site): cool, not the June
// 2026 paper, and PRODUCT.md's 7:1 for body text and links in both themes.

import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');

const tokens = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  return css.slice(start, css.indexOf('}', start));
};

const hex = (block: string, name: string) => {
  const value = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!value) throw new Error(`${name} is not a hex colour`);
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
};

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe.each([[':root'], ['.dark']])('%s', (selector) => {
  const block = tokens(selector);

  test.each(['--surface-page', '--surface-card', '--surface-sunken', '--text-strong', '--text-body', '--text-muted', '--text-link', '--text-link-hover', '--border-hairline', '--border-default'])(
    '%s has no warm cast',
    (name) => {
      const [r, , b] = hex(block, name);
      expect(b).toBeGreaterThanOrEqual(r);
    },
  );

  test.each(['--text-strong', '--text-body', '--text-link-hover'])('%s clears 7:1 on the page and on the sheet', (name) => {
    expect(contrast(hex(block, name), hex(block, '--surface-page'))).toBeGreaterThanOrEqual(7);
    expect(contrast(hex(block, name), hex(block, '--surface-card'))).toBeGreaterThanOrEqual(7);
  });
});
