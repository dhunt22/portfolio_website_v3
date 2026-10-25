import { render, screen, within } from '@testing-library/react';
import { SiteChrome } from '@/components/site/SiteChrome';

jest.mock('next/navigation', () => ({ usePathname: () => '/portfolio/environmental-justice-prisons' }));

test('the frame is strip, header, main and footer inside .site', () => {
  const { container } = render(<SiteChrome><p>content</p></SiteChrome>);
  const site = container.querySelector('.site')!;
  const order = Array.from(site.querySelectorAll('[data-testid="readout"], header, main, footer')).map((el) => el.tagName);
  expect(order).toEqual(['DIV', 'HEADER', 'MAIN', 'FOOTER']);
  expect(site.querySelector('main')).toHaveAttribute('id', 'main');
});

test('the header names the site, three pages and one action', () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'Devin Hunt' })).toHaveAttribute('href', '/');
  const nav = within(header).getByRole('navigation', { name: 'Main' });
  expect(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Portfolio', '/portfolio'],
    ['Résumé', '/resume'],
    ['Outdoors', '/interests'],
  ]);
  expect(within(nav).getByRole('link', { name: 'Portfolio' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Résumé' })).not.toHaveAttribute('aria-current');
  expect(within(header).getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:contact@devinhunt.com');
});

test('the footer is one quiet line', () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  const footer = screen.getByRole('contentinfo');
  expect(footer).toHaveTextContent('Devin Hunt · Sacramento, California');
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dhunt22');
  expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/devinthunt');
  expect(within(footer).getByRole('link', { name: 'contact@devinhunt.com' })).toHaveAttribute('href', 'mailto:contact@devinhunt.com');
});

test('the theme toggle focuses with the 2px offset outline', async () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  const toggle = await screen.findByRole('button', { name: /switch to/i });
  expect(toggle).toHaveClass('focus-visible:outline-offset-[3px]');
});

test('below 640px the header wraps and the links take their own row', () => {
  render(<SiteChrome><p>content</p></SiteChrome>);
  expect(screen.getByRole('banner')).toHaveClass('flex-wrap');
  expect(screen.getByRole('navigation', { name: 'Main' })).toHaveClass('order-last', 'w-full');
});
