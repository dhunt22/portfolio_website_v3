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

// The hero has no fill and the band's tone is see-through, so words can cross a contour line. The plate draws
// its lines at its group's opacity times a path's own, the veil covers them, and the band's tone covers both.

const parseHex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const over = (under: number[], top: number[], alpha: number) => under.map((c, i) => c * (1 - alpha) + top[i] * alpha);

/** Every line colour in a plate, and the strongest opacity any line is drawn at. */
const plate = (theme: 'light' | 'dark') => {
  const svg = fs.readFileSync(path.join(process.cwd(), `public/images/plates/interests_${theme}_plate.svg`), 'utf8');
  const group = Number(svg.match(/<g[^>]*opacity="([.0-9]+)"/)?.[1] ?? 1);
  const strongest = Math.max(...Array.from(svg.matchAll(/<path[^>]*opacity="([.0-9]+)"/g), (match) => Number(match[1])));
  const lines = [...new Set(svg.match(/stroke="#[0-9a-fA-F]{6}"/g) ?? [])].map((stroke) => parseHex(stroke.slice(8, 15)));
  return { lines, opacity: group * strongest };
};

const veil = () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'components/ui/ContourBackdrop.tsx'), 'utf8');
  const strength = source.match(/bg-background opacity-(\d+)/)?.[1];
  if (!strength) throw new Error('the quiet veil has no opacity class');
  return Number(strength) / 100;
};

const bandAlpha = (selector: string) => {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = plain.indexOf(`${selector} {`);
  const strength = plain.slice(start, plain.indexOf('}', start)).match(/--band:\s*color-mix\(in srgb, var\(--surface-page\) (\d+)%/)?.[1];
  if (!strength) throw new Error(`${selector} sets no band tone`);
  return Number(strength) / 100;
};

describe.each([
  [':root', 'light', '.bands, .band-foot'],
  ['.dark', 'dark', '.dark .bands, .dark .band-foot'],
] as const)('%s over a contour line', (selector, theme, bands) => {
  const block = tokens(selector);
  const page = hex(block, '--surface-page');

  test('the veil is 60%', () => {
    expect(veil()).toBe(0.6);
  });

  test.each(['--text-strong', '--text-body', '--text-link-hover'])('%s clears 7:1 in the hero and through the band', (name) => {
    const text = hex(block, name);
    const alpha = bandAlpha(bands);
    const { lines, opacity } = plate(theme);
    expect(lines.length).toBeGreaterThan(0);
    expect(opacity).toBeGreaterThan(0.2);
    for (const line of lines) {
      const hero = over(over(page, line, opacity), page, veil());
      expect(contrast(text, hero)).toBeGreaterThanOrEqual(7);
      expect(contrast(text, over(hero, page, alpha))).toBeGreaterThanOrEqual(7);
    }
  });

  test('small print, which sits on the band only, clears its own 4.5:1 there', () => {
    const { lines, opacity } = plate(theme);
    for (const line of lines) {
      const hero = over(over(page, line, opacity), page, veil());
      expect(contrast(hex(block, '--text-muted'), over(hero, page, bandAlpha(bands)))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
