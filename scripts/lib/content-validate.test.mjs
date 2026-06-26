// scripts/lib/content-validate.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePage } from './content-validate.mjs';

const blk = (over = {}) => ({ id: 'x', title: 'X', fields: {}, body: [], items: [], links: [], children: [], ...over });

test('missing section + empty body', () => {
  const errs = validatePage('home', { sections: {} });
  assert.ok(errs.some((e) => /missing section "hero"/.test(e)));
});

test('home valid → no errors', () => {
  const page = { sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'] }),
    professionalExpertise: blk({ id: 'professional-expertise', children: [blk({ id: 'a' }), blk({ id: 'b' }), blk({ id: 'c' })] }),
    personalPassions: blk({ id: 'personal-passions', children: [blk({ id: 'd' }), blk({ id: 'e' })] }),
  } };
  assert.deepEqual(validatePage('home', page), []);
});

test('duplicate card id errors', () => {
  const page = { sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'] }),
    professionalExpertise: blk({ id: 'professional-expertise', children: [blk({ id: 'dup' }), blk({ id: 'dup' }), blk({ id: 'c' })] }),
    personalPassions: blk({ id: 'personal-passions', children: [blk({ id: 'd' }), blk({ id: 'e' })] }),
  } };
  assert.ok(validatePage('home', page).some((e) => /duplicate card "dup"/.test(e)));
});

test('portfolio join errors', () => {
  const page = { sections: { projects: blk({ id: 'projects', children: [
    blk({ id: 'a', title: 'A', fields: { description: 'd' }, body: ['p'] }), // no **id:**
  ] }) , intro: blk({ id: 'intro', body: ['hi'] }) } };
  const cfg = { portfolio: [{ id: 'prison-ej', displayType: 'map', links: [] }] };
  const errs = validatePage('portfolio', page, cfg);
  assert.ok(errs.some((e) => /missing \*\*id:\*\*/.test(e)));
  assert.ok(errs.some((e) => /config project "prison-ej" has no markdown card/.test(e)));
});

test('portfolio image/displayType mismatch + link href', () => {
  const card = blk({ id: 'c', title: 'C', fields: { id: 'prison-ej', description: 'd' }, body: ['p'],
                     links: [{ label: 'L', href: 'https://wrong' }] });
  const page = { sections: { intro: blk({ id: 'intro', body: ['hi'] }),
                             projects: blk({ id: 'projects', children: [card,
                               blk({ id: 'f2' }), blk({ id: 'f3' }), blk({ id: 'f4' }), blk({ id: 'f5' }),
                               blk({ id: 'f6' }), blk({ id: 'f7' }), blk({ id: 'f8' }), blk({ id: 'f9' })] }) } };
  const cfg = { portfolio: [{ id: 'prison-ej', displayType: 'image', links: [{ href: 'https://right' }] }] };
  const errs = validatePage('portfolio', page, cfg);
  assert.ok(errs.some((e) => /displayType image but no/.test(e)));
  assert.ok(errs.some((e) => /md link not in config: https:\/\/wrong/.test(e)));
  assert.ok(errs.some((e) => /config link missing in md: https:\/\/right/.test(e)));
});

test('interests id/order mismatch errors', () => {
  const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => blk({ id }));
  const page = { sections: { interests: blk({ id: 'interests', children: cards }), gis: blk({ id: 'gis', body: ['hi'] }) } };
  const cfg = { interests: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'z' }] };
  assert.ok(validatePage('interests', page, cfg).some((e) => /interests id\/order mismatch/.test(e)));
});
