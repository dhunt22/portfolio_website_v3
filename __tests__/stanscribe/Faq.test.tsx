import { render, within } from '@testing-library/react';
import StanScribeLightPage from '@/app/(stanscribe)/stanscribe-light/page';
import StanScribePage from '@/app/(stanscribe)/stanscribe/page';
import { LANGUAGES } from '@/lib/stanscribe';
import { findCopyViolations } from '@/test-utils/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));
jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));

interface FaqEntity {
  '@type': string;
  name: string;
  acceptedAnswer: { '@type': string; text: string };
}

const faqOf = (page: HTMLElement) => {
  const section = page.querySelector<HTMLElement>('#questions')!;
  const items = Array.from(section.querySelectorAll('li')).map((li) => ({
    question: li.querySelector('h3')!.textContent ?? '',
    answer: li.querySelector('p')!.textContent ?? '',
    li,
  }));
  const scripts = page.querySelectorAll('script[type="application/ld+json"]');
  const data = JSON.parse(scripts[0]?.textContent ?? '{}') as { '@context'?: string; '@type'?: string; mainEntity?: FaqEntity[] };
  return { section, items, scripts, data };
};

describe.each([
  ['Stan Scribe', StanScribePage, 15, 'What is Stan Scribe?', '/stanscribe/acknowledgements/', /^The captions come from open speech models that run on/],
  ['Stan Scribe Light', StanScribeLightPage, 7, 'What is Stan Scribe Light?', '/stanscribe-light/acknowledgements/', /^The captions come from an open speech model that runs on/],
] as const)('%s', (name, Page, count, first, credits, source) => {
  const renderPage = () => render(<Page />).container;

  test('its questions are the last section but Help, with every answer open', () => {
    const page = renderPage();
    const { section, items } = faqOf(page);
    expect(within(section).getByRole('heading', { level: 2, name: 'Questions and answers' })).toBeInTheDocument();
    expect(items).toHaveLength(count);
    expect(items[0].question).toBe(first);
    expect(section.querySelector('details')).toBeNull();
    const after = Array.from(page.querySelectorAll('section')).filter((other) => section.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(after.map((other) => other.id).filter((id) => id !== 'help')).toEqual([]);
    expect(page.querySelector('#help')).not.toBeNull();
  });

  test('the structured data says exactly what the page shows', () => {
    const { items, scripts, data } = faqOf(renderPage());
    expect(scripts).toHaveLength(1);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity?.map((q) => [q['@type'], q.name, q.acceptedAnswer['@type'], q.acceptedAnswer.text])).toEqual(
      items.map(({ question, answer }) => ['Question', question, 'Answer', answer]),
    );
  });

  test('the accuracy answer keeps "they can be wrong" and credits the speech models without naming them', () => {
    const { items } = faqOf(renderPage());
    const accuracy = items.find(({ question }) => question === 'How accurate are the captions?')!;
    expect(accuracy.answer).toMatch(source);
    expect(accuracy.answer).toMatch(/they can be wrong/);
    expect(accuracy.answer).toMatch(new RegExp(`${name} is not a medical device`));
    expect(within(accuracy.li).getByRole('link', { name: 'Acknowledgements page' })).toHaveAttribute('href', credits);
  });

  test('says to ask people before starting captions', () => {
    const { items } = faqOf(renderPage());
    expect(items.find(({ question }) => question === 'Do I need to ask people before I start captions?')?.answer).toMatch(/^Yes\. Tell people the app is on\./);
  });

  test('every question and answer follows the brief, and none says how long sound is held', () => {
    const { items } = faqOf(renderPage());
    for (const { question, answer } of items) {
      expect(findCopyViolations(`${question} ${answer}`)).toEqual([]);
      expect(answer).not.toMatch(/seconds|minutes/);
    }
  });
});

test('the main page answers the three situations the owner named, then the practical questions', () => {
  const { items } = faqOf(render(<StanScribePage />).container);
  expect(items.slice(1, 4).map(({ question }) => question)).toEqual([
    'I have trouble following my family’s conversations. Will Stan Scribe help?',
    'My hearing makes it hard to stay part of a conversation. Is this for me?',
    'Can I use it at a doctor’s appointment?',
  ]);
  const doctor = items[3].answer;
  expect(doctor).toMatch(/Ask the doctor first/);
  expect(doctor).toMatch(/not to make medical decisions/);
  const languages = items.find(({ question }) => question === 'Which languages does it caption?')!;
  for (const language of LANGUAGES) expect(languages.answer).toContain(language);
});
