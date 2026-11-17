import { render, screen, within } from '@testing-library/react';
import StanScribePage, { metadata } from '@/app/(stanscribe)/stanscribe/page';
import { APPS, legalLinks } from '@/lib/stanscribe';
import { findCopyViolations, findTypeViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

// The backdrop fetches SVG and GSAP needs matchMedia; neither matters to the page's content.
jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribePage />).container;

test('support email and both apps’ legal links (App Store Connect Support URL)', () => {
  const page = renderPage();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of [...legalLinks('scribe'), ...legalLinks('light')]) {
    expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
});

test('the accuracy and consent lines are visible, not tucked away', () => {
  renderPage();
  // The accuracy answer is a row that starts open.
  expect(screen.getByText(/they can be wrong/i).closest('details')!.open).toBe(true);
  // The consent line is a row's label, which shows whether the row is open or not.
  const consent = screen.getByRole('heading', { level: 3, name: 'Ask before you caption people' });
  expect(consent.closest('summary')).not.toBeNull();
});

test('seven sections under the hero, in the listing’s order', () => {
  renderPage();
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
    'How it works',
    'Built for my grandpa Stan',
    'Features',
    'Privacy',
    'Which one is for you?',
    'Questions and answers',
    'Help',
  ]);
});

test('the hero is the listing’s header: icon, name, tagline, four facts and the two downloads', () => {
  const page = renderPage();
  const hero = page.querySelector('section')!;
  expect(within(hero).getByRole('heading', { level: 1, name: 'Stan Scribe' })).toBeInTheDocument();
  expect(within(hero).getByText('Live captions for every voice.')).toBeInTheDocument();
  expect(within(hero).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
    'Live captions',
    'A color and a name for each speaker',
    'Works offline',
    'No account needed',
  ]);
  expect(hero.querySelectorAll('li span[aria-hidden="true"] svg')).toHaveLength(4);
  expect(within(hero).getAllByText('Coming soon to the App Store')).toHaveLength(2);
  expect(within(hero).getByRole('link', { name: /public beta/i })).toHaveAttribute('href', APPS.scribe.betaUrl);
  // No intro paragraph and no row of jump links.
  expect(hero.textContent).not.toMatch(/Put your iPhone on the table/);
  expect(hero.querySelector('nav')).toBeNull();
  // The hero sits above the card, so the picture that hangs into the next band is not painted over.
  expect(hero.className).toMatch(/\brelative\b/);
  expect(hero.className).toMatch(/\bz-10\b/);
});

test('the hang length is set once, on the card, and the picture and the band under it both read it', () => {
  const bands = renderPage().querySelector<HTMLElement>('.bands')!;
  expect(bands.style.getPropertyValue('--hang')).not.toBe('');
  const [hero, next] = Array.from(bands.querySelectorAll(':scope > section'));
  expect(hero.querySelector('img')!.getAttribute('style')).toMatch(/margin-bottom:\s*calc\(-1 \* var\(--hang\)\)/);
  expect(next.className).toContain('pt-[calc(var(--hang)_+_3rem)]');
});

test('the four facts go to one row only from xl, where the row fits without breaking a label', () => {
  // The row needs about 1007px. At lg (1024px) the column is 944px, so every label broke in two up to 1086px.
  const facts = renderPage().querySelector('section ul')!;
  expect(facts.className).toMatch(/\bsm:grid-cols-2\b/);
  expect(facts.className).toMatch(/\bxl:flex\b/);
  expect(facts.className).not.toMatch(/\blg:/);
});

test('how it works: four steps ending on your saved conversations, beside the caption demo', () => {
  const page = renderPage();
  const how = page.querySelector<HTMLElement>('#how-it-works')!;
  expect(within(how).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Tap Start.', 'Follow along.', 'Tap Stop.', 'View conversations.']);
  expect(how.textContent).toMatch(/They never start on their own\./);
  expect(how.textContent).toMatch(/No audio is kept\./);
  expect(how.textContent).toMatch(/Find any conversation later by date, by person or by any word\./);
  expect(how.querySelector('ol')!.children).toHaveLength(4);
  expect(how.querySelector('figure [data-demo-bar]')).not.toBeNull();
});

test('presents both apps, with the comparison at #light', () => {
  const page = renderPage();
  const light = page.querySelector<HTMLElement>('#light')!;
  expect(within(light).getByRole('heading', { level: 2, name: 'Which one is for you?' })).toBeInTheDocument();
  expect(within(light).getByRole('table')).toBeInTheDocument();
  expect(light.textContent).toMatch(/Both caption offline, with speaker colors and names, in 25 languages\. Neither has in-app purchases\./);
  expect(light.textContent).toMatch(/Not sure\? Start with Light\./);
});

test('images have alt text and headings are in order', () => {
  const page = renderPage();
  // The hero and the five screens.
  expect(page.querySelectorAll('img').length).toBeGreaterThanOrEqual(6);
  for (const img of Array.from(page.querySelectorAll('img:not([alt=""])'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  for (const img of Array.from(page.querySelectorAll('img[alt=""]'))) expect(img.closest('a[aria-label]')).not.toBeNull();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('the story is three short paragraphs, with the rest one click away', () => {
  const page = renderPage();
  const story = page.querySelector<HTMLElement>('#story')!;
  const more = story.querySelector('details')!;
  expect(more.open).toBe(false);
  expect(more.querySelector('summary')!.textContent).toMatch(/Read the whole story/);
  const always = Array.from(story.querySelectorAll('p')).filter((p) => !more.contains(p)).map((p) => p.textContent);
  expect(always).toEqual([
    'My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.',
    'With live captions he could keep up and answer, instead of pretending he had heard. The app my parents tried charged a monthly fee and needed the internet for its best captions, so I built this one. Stan uses it every day at dinner.',
    'Devin',
  ]);
  const rest = more.textContent ?? '';
  expect(rest).toMatch(/I used AI to help me build it\./);
  expect(rest).toMatch(/Stan Scribe Light is free\. The full Stan Scribe is a one-time purchase, with no subscription\./);
  expect(rest).toMatch(/Stan took it to a doctor’s appointment too/);
  expect(rest).toMatch(/a live translation app/);
  expect(page.querySelector('#behind-the-app')).toBeNull();
});

test('features: six rows with icons, five screens with labels, and why the themes are there', () => {
  const page = renderPage();
  const features = page.querySelector<HTMLElement>('#features')!;
  expect(within(features).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
    'Speakers in color',
    'Voices it knows',
    'Big text, clear buttons',
    'Keeps listening',
    'Conversations you keep',
    'Choose how it looks',
  ]);
  expect(features.textContent).toMatch(/23 themes I curated, or make your own from your photos\./);
  expect(features.textContent).toMatch(/Something you use every day should not look clinical\./);
  // The five screens are the only pictures here. The five-phone picture of painted themes showed four that do not ship.
  expect(features.querySelectorAll('img')).toHaveLength(5);
  const screens = features.querySelector('ul[data-screens]')!;
  expect(Array.from(screens.querySelectorAll('li')).map((li) => li.querySelector('p')!.textContent)).toEqual([
    'Speakers in color',
    'Text as big as you need',
    'Saved as text',
    'Find any conversation',
    '25 languages',
  ]);
  expect(screens.querySelectorAll('img')).toHaveLength(5);
  // A grid, not a sideways scroller.
  expect(screens.className).not.toMatch(/overflow-x/);
});

test('every count of themes on the page is 23, the number that ships', () => {
  // The features row, the comparison table, the FAQ answer and the FAQ's structured data.
  const counts = Array.from((renderPage().textContent ?? '').matchAll(/(\d+) (?:color )?themes/g), (match) => match[1]);
  expect(counts).toEqual(['23', '23', '23', '23']);
});

test('privacy: five rows in the tour’s style, each label visible and each opening to its words', () => {
  const page = renderPage();
  const privacy = page.querySelector<HTMLElement>('#privacy')!;
  const rows = Array.from(privacy.querySelectorAll('details'));
  expect(rows.map((row) => row.querySelector('summary h3')!.textContent)).toEqual([
    'Everything stays on your iPhone or iPad',
    'No account. No ads. No tracking.',
    'No audio is saved',
    'Your words leave only when you send them',
    'Ask before you caption people',
  ]);
  for (const row of rows) {
    expect(row.open).toBe(false);
    expect(row.querySelector('summary span[aria-hidden="true"] svg')).not.toBeNull();
  }
  expect(rows[0].textContent).toMatch(/captions work in airplane mode\./);
  expect(rows[1].textContent).toMatch(/The app never connects to the internet\./);
  expect(rows[2].textContent).toMatch(/keeps none of the sound/);
  expect(rows[3].textContent).toMatch(/share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud\./);
  expect(rows[4].textContent).toMatch(/Set up someone’s voice only with their permission\./);
  expect(within(privacy).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/stanscribe/privacy/');
});

test('one type scale: no mono, tracked caps or italics', () => {
  expect(findTypeViolations(renderPage())).toEqual([]);
});

test('every in-page link has a target, and the anchors other pages link still exist', () => {
  const page = renderPage();
  for (const a of Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))) expect(page.querySelector(a.getAttribute('href')!)).not.toBeNull();
  for (const id of ['how-it-works', 'story', 'features', 'privacy', 'light', 'questions', 'help']) expect(page.querySelector(`#${id}`)).not.toBeNull();
});

test('words follow the brief, metadata included, and previews name the site Stan Scribe', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.title).toBe('Stan Scribe: live captions for every voice');
  expect(metadata.alternates?.canonical).toBe('https://stanscribe.devinhunt.com/');
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
