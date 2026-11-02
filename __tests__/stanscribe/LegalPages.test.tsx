import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import StanScribeLayout from '@/app/(stanscribe)/layout';
import ScribeLegal, { generateStaticParams as scribeParams, generateMetadata as scribeMetadata } from '@/app/(stanscribe)/stanscribe/[page]/page';
import LightLegal, { generateStaticParams as lightParams, generateMetadata as lightMetadata } from '@/app/(stanscribe)/stanscribe-light/[page]/page';
import { APPS } from '@/lib/stanscribe';

let pathname = '/stanscribe/privacy';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const PAGES = [['privacy', 'Privacy Policy'], ['terms', 'Terms of Use'], ['acknowledgements', 'Acknowledgements']] as const;
const params = (page: string) => ({ params: Promise.resolve({ page }) });

describe.each([
  ['stanscribe', 'Stan Scribe', ScribeLegal, scribeParams, scribeMetadata, 'scribe'],
  ['stanscribe-light', 'Stan Scribe Light', LightLegal, lightParams, lightMetadata, 'light'],
] as const)('%s', (route, name, Page, staticParams, metadataFor, app) => {
  test('exports exactly the three pages every legal link points at', () => {
    const routes = staticParams().map(({ page }) => `/${route}/${page}/`).sort();
    expect(routes).toEqual(APPS[app].legal.map((l) => l.href).sort());
  });

  test.each(PAGES)('%s shows the words under the name the links use', async (page, label) => {
    const { container } = render(await Page(params(page)));
    expect(screen.getByRole('heading', { level: 1, name: label })).toBeInTheDocument();
    for (const { href } of APPS[app].legal) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  });

  test.each(PAGES)('%s keeps its URL and says which app it belongs to', async (page, label) => {
    const metadata = await metadataFor(params(page));
    expect(metadata.title).toBe(`${label} · ${name}`);
    expect(metadata.alternates?.canonical).toBe(`https://devinhunt.com/${route}/${page}/`);
  });

  test.each(PAGES)('%s holds only the words, none of the generated frame', (page) => {
    const words = fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-legal', route, `${page}.html`), 'utf8');
    expect(words).not.toMatch(/<(html|head|body|main|nav|style|script)\b/i);
    expect(words).toMatch(/^<h1>/);
  });
});

test('the Light privacy policy and the Stan Scribe one are different words', async () => {
  const scribe = render(await ScribeLegal(params('privacy')));
  const scribeWords = scribe.container.textContent;
  scribe.unmount();
  expect(render(await LightLegal(params('privacy'))).container.textContent).not.toBe(scribeWords);
});

describe('in the Stan Scribe frame', () => {
  const frame = (path: string) => {
    pathname = path;
    render(<StanScribeLayout><p>words</p></StanScribeLayout>);
    return screen.getByRole('banner');
  };

  test('a legal page has the way to Devin Hunt, and Help leads to its app\'s Help section', () => {
    const header = frame('/stanscribe/privacy');
    expect(within(header).getByRole('link', { name: 'Devin Hunt' })).toHaveAttribute('href', '/');
    expect(within(header).getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/stanscribe#help');
  });

  test('on a Light legal page Help leads to Light\'s Help section', () => {
    const header = frame('/stanscribe-light/terms');
    expect(within(header).getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/stanscribe-light#help');
  });

  test.each(['/stanscribe/privacy', '/stanscribe-light/terms'])('%s marks no header link as the current page', (at) => {
    const header = frame(at);
    expect(header.querySelector('[aria-current]')).toBeNull();
  });

  test.each([['/stanscribe', '#help'], ['/stanscribe/', '#help'], ['/stanscribe-light/', '#help']])('on %s Help stays on the page', (at, href) => {
    const header = frame(at);
    expect(within(header).getByRole('link', { name: 'Help' })).toHaveAttribute('href', href);
    expect(header.querySelector('[aria-current="page"]')).not.toBeNull();
  });
});
