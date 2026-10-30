/** @jest-environment node */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { APP_STORE_BADGE, LANGUAGES, RELEASED, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { findCopyViolations } from '@/test-utils/stanscribe';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('lib/stanscribe', () => {
  test.each(Object.entries(SHOTS))('%s exists at its stated size', async (_key, shot) => {
    const file = join(PUBLIC, shot.src);
    expect(existsSync(file)).toBe(true);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([shot.width, shot.height]);
  });

  test('alt text and file names follow the brief', () => {
    for (const shot of Object.values(SHOTS)) {
      expect(shot.alt.length).toBeGreaterThan(20);
      expect(findCopyViolations(`${shot.alt} ${shot.src}`)).toEqual([]);
    }
    expect(findCopyViolations(`${SOCIAL_IMAGE.alt} ${SOCIAL_IMAGE.url}`)).toEqual([]);
  });

  test('the social card is 1200×630', async () => {
    const file = join(PUBLIC, new URL(SOCIAL_IMAGE.url).pathname);
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  test('25 caption languages', () => {
    expect(LANGUAGES).toHaveLength(25);
  });

  test('a released build has the App Store badge to show', () => {
    if (RELEASED) expect(existsSync(join(PUBLIC, APP_STORE_BADGE.src))).toBe(true);
  });
});

describe('findCopyViolations', () => {
  test.each(['Built on Whisper.', 'Only $4.99.', 'Fast transcription.', 'Leave a tip.', 'Monthly subscription.'])(
    'flags %p',
    (text) => expect(findCopyViolations(text)).not.toEqual([]),
  );

  test('allows the copy’s own denials and the FAQ question', () => {
    expect(findCopyViolations('Pay once. No subscription. Is there a subscription? No.')).toEqual([]);
  });
});
