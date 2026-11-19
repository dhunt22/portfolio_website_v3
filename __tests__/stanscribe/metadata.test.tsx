import fs from 'node:fs';
import path from 'node:path';
import { metadata as stanScribe } from '@/app/(stanscribe)/layout';
import { metadata as root } from '@/app/layout';
import { legalMetadata } from '@/components/stanscribe/LegalPage';
import { FAVICONS } from '@/lib/stanscribe';

test('Stan Scribe’s pages show the app’s own icon in the tab and as the touch icon', () => {
  expect(stanScribe.icons).toEqual({
    icon: [{ url: FAVICONS.icon, type: 'image/png', sizes: '32x32' }],
    apple: [{ url: FAVICONS.apple, sizes: '180x180' }],
  });
});

test('the portfolio keeps its favicon, through metadata, so a route group can replace it', () => {
  expect(root.icons).toEqual({ icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], apple: [{ url: '/favicon.svg' }] });
  const layout = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8');
  expect(layout).not.toMatch(/<link rel="(icon|apple-touch-icon)"/);
});

test.each(['scribe', 'light'] as const)('%s legal pages name the site Stan Scribe in link previews', async (app) => {
  const metadata = await legalMetadata(app, { params: Promise.resolve({ page: 'privacy' }) });
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
