import { render } from '@testing-library/react';
import { LegalPage } from '@/components/stanscribe/LegalPage';
import { legalParts } from '@/lib/stanscribe-legal';

// The parts stand in for a synced file, so the layout can be checked for words that open without a title.
jest.mock('@/lib/stanscribe-legal', () => ({ legalParts: jest.fn() }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

const renderWith = async (parts: { head: string; body: string }) => {
  jest.mocked(legalParts).mockReturnValue(parts);
  return render(await LegalPage({ app: 'scribe', params: Promise.resolve({ page: 'privacy' }) })).container;
};

test('words that open without a title are the card alone, with the hero’s room above them', async () => {
  const page = await renderWith({ head: '', body: '<p>Words with no title.</p><h2>Using the app</h2>' });
  const sections = page.querySelectorAll('section');
  expect(sections).toHaveLength(1);
  expect(sections[0].className).toMatch(/\bpt-8\b/);
  expect(sections[0].className).toMatch(/\bmd:pt-12\b/);
  expect(sections[0].textContent).toMatch(/^Words with no title\.Using the app/);
});

test('with a title, the title is the hero and the card holds the rest in a plain block', async () => {
  const page = await renderWith({ head: '<h1>Terms of Use</h1><p>Effective today</p>', body: '<h2>Using the app</h2><p>Be kind.</p>' });
  const [hero, card, ...rest] = Array.from(page.querySelectorAll('section'));
  expect(rest).toHaveLength(0);
  expect(hero.textContent).toBe('Terms of UseEffective today');
  // The card's words have no heading of their own, so they are not an <article>.
  expect(card.querySelector('article')).toBeNull();
  expect(card.textContent).toMatch(/^Using the appBe kind\./);
});
