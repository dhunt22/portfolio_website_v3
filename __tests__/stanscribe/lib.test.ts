/** @jest-environment node */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { APP_ICONS, APP_STORE_BADGE, BOTH_APPS_SHARE, FAVICONS, LANGUAGES, LIGHT_NOT_SURE, LIGHT_SUMMARY, RELEASED, SHOTS, SITE_NAME, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { findCopyViolations } from '@/test-utils/stanscribe';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('lib/stanscribe', () => {
  test.each(Object.entries(SHOTS))('%s exists at its stated size', async (_key, shot) => {
    const file = join(PUBLIC, shot.src);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([shot.width, shot.height]);
  });

  test('the themes picture says what it shows: five themes, two of them paintings', () => {
    expect(SHOTS.themes.src).toBe('/images/stanscribe/stan-scribe-painted-themes.webp');
    expect(SHOTS.themes.alt).toBe(
      "Five iPhones showing Stan Scribe's live captions in five themes, two of them paintings. Each shows the same conversation, Alex, Rosa and a third speaker planning dinner on Saturday.",
    );
  });

  test('no alt text describes a theme that does not ship', () => {
    // Forest, Mallards, Birches, Windmill and Seashell wait on their artists' permission.
    for (const shot of Object.values(SHOTS)) expect(shot.alt).not.toMatch(/forest|mallard|duck|birch|windmill|seashell/i);
  });

  test('alt text and file names follow the brief', () => {
    for (const shot of Object.values(SHOTS)) {
      expect(shot.alt.length).toBeGreaterThan(20);
      expect(findCopyViolations(`${shot.alt} ${shot.src}`)).toEqual([]);
    }
    expect(findCopyViolations(`${SOCIAL_IMAGE.alt} ${SOCIAL_IMAGE.url}`)).toEqual([]);
  });

  test('the social card is on Stan Scribe’s own address, with a version so previews fetch the redrawn card', () => {
    expect(SOCIAL_IMAGE.url).toBe('https://stanscribe.devinhunt.com/images/stanscribe/stan-scribe-social.jpg?v=2');
  });

  test('the social card is 1200×630', async () => {
    const file = join(PUBLIC, new URL(SOCIAL_IMAGE.url).pathname);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  test('link previews name the site Stan Scribe, and the card’s alt text says what it shows', () => {
    expect(SITE_NAME).toBe('Stan Scribe');
    expect(SOCIAL_IMAGE.alt).toBe('The name Stan Scribe and its tagline beside three iPhones showing live captions in color.');
  });

  test.each([
    [APP_ICONS.scribe.src, 512],
    [APP_ICONS.light.src, 512],
    [FAVICONS.apple, 180],
    [FAVICONS.icon, 32],
  ])('%s is a square icon of %i pixels', async (src, size) => {
    const meta = await sharp(join(PUBLIC, src)).metadata();
    expect([meta.width, meta.height]).toEqual([size, size]);
  });

  test('the shared lines are short and follow the brief', () => {
    expect(BOTH_APPS_SHARE).toBe('Both caption offline, with speaker colors and names, in 25 languages. Neither has in-app purchases.');
    expect(LIGHT_NOT_SURE).toBe('Start with Light.');
    expect(LIGHT_SUMMARY).toBe('The same live captions and speaker colors as Stan Scribe, made simpler: one speech model, a black or a white page, and a smaller download.');
    expect(findCopyViolations(`${BOTH_APPS_SHARE} ${LIGHT_NOT_SURE} ${LIGHT_SUMMARY}`)).toEqual([]);
  });

  test('25 caption languages', () => {
    expect(LANGUAGES).toHaveLength(25);
  });

  test('a released build has the App Store badge to show', () => {
    if (RELEASED) expect(existsSync(join(PUBLIC, APP_STORE_BADGE.src))).toBe(true);
  });
});

describe('findCopyViolations', () => {
  test.each(['Built on Whisper.', 'Only $4.99.', 'Fast transcription.', 'Leave a tip.', 'Monthly subscription.', 'Thanks — Devin'])(
    'flags %p',
    (text) => expect(findCopyViolations(text)).not.toEqual([]),
  );

  test('allows the copy’s own denials and the FAQ question', () => {
    expect(findCopyViolations('Pay once. No subscription. Is there a subscription? No.')).toEqual([]);
  });
});
