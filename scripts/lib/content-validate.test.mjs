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
  const card = (id, over = {}) => blk({ id, body: ['x'], ...over });
  const page = { order: ['hero', 'professional-expertise', 'personal-passions'], sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'],
                image: { alt: 'a', src: '/x.webp' }, links: [{ label: 'a', href: '/a' }, { label: 'b', href: '/b' }] }),
    professionalExpertise: blk({ id: 'professional-expertise', children: [card('a'), card('b'), card('c')] }),
    personalPassions: blk({ id: 'personal-passions', children: [
      card('d', { fields: { subtitle: 's' }, links: [{ label: 'r', href: '/r' }] }),
      card('e', { fields: { subtitle: 's' }, links: [{ label: 'r', href: '/r' }] }),
    ] }),
  } };
  assert.deepEqual(validatePage('home', page), []);
});

test('section requireImage + minLinks', () => {
  const page = { order: ['hero'], sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'], links: [{ label: 'a', href: '/a' }] }),
  } };
  const errs = validatePage('home', page);
  assert.ok(errs.some((e) => /section "hero" needs an image/.test(e)));
  assert.ok(errs.some((e) => /section "hero" needs >=2 link/.test(e)));
});

test('card missing required field', () => {
  const card = (id, over = {}) => blk({ id, body: ['x'], ...over });
  const page = { order: ['hero', 'professional-expertise', 'personal-passions'], sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'],
                image: { alt: 'a', src: '/x' }, links: [{ label: 'a', href: '/a' }, { label: 'b', href: '/b' }] }),
    professionalExpertise: blk({ id: 'professional-expertise', children: [card('a'), card('b'), card('c')] }),
    personalPassions: blk({ id: 'personal-passions', children: [
      card('d', { links: [{ label: 'r', href: '/r' }] }),
      card('e', { fields: { subtitle: 's' }, links: [{ label: 'r', href: '/r' }] }),
    ] }),
  } };
  assert.ok(validatePage('home', page).some((e) => /card "d" missing field "subtitle"/.test(e)));
});

test('duplicate section heading', () => {
  const page = { order: ['footer', 'footer'], sections: {
    footer: blk({ id: 'footer', body: ['x'] }),
    seo: blk({ id: 'seo', fields: { title: 't', description: 'd' } }),
  } };
  assert.ok(validatePage('site', page).some((e) => /duplicate section heading "footer"/.test(e)));
});

test('portfolio join errors', () => {
  const page = { sections: { projects: blk({ id: 'projects', children: [
    blk({ id: 'a', title: 'A', fields: { description: 'd' }, body: ['p'] }),
  ] }), intro: blk({ id: 'intro', body: ['hi'] }) } };
  const cfg = { portfolio: [{ id: 'prison-ej', displayType: 'map', links: [] }] };
  const errs = validatePage('portfolio', page, cfg);
  assert.ok(errs.some((e) => /missing \*\*id:\*\*/.test(e)));
  assert.ok(errs.some((e) => /config project "prison-ej" has no markdown card/.test(e)));
});

test('portfolio image/displayType mismatch + link href', () => {
  const card = blk({ id: 'c', title: 'C', fields: { id: 'prison-ej', description: 'd' }, body: ['p'],
                     links: [{ label: 'L', href: 'https://wrong' }] });
  const fillers = ['f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9'].map((id) => blk({ id }));
  const page = { sections: { intro: blk({ id: 'intro', body: ['hi'] }),
                             projects: blk({ id: 'projects', children: [card, ...fillers] }) } };
  const cfg = { portfolio: [{ id: 'prison-ej', displayType: 'image', links: [{ href: 'https://right' }] }] };
  const errs = validatePage('portfolio', page, cfg);
  assert.ok(errs.some((e) => /displayType image but no/.test(e)));
  assert.ok(errs.some((e) => /md link not in config: https:\/\/wrong/.test(e)));
  assert.ok(errs.some((e) => /config link missing in md: https:\/\/right/.test(e)));
});

test('duplicate card id errors', () => {
  const page = { order: ['hero', 'professional-expertise', 'personal-passions'], sections: {
    hero: blk({ id: 'hero', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'] }),
    professionalExpertise: blk({ id: 'professional-expertise', children: [blk({ id: 'dup' }), blk({ id: 'dup' }), blk({ id: 'c' })] }),
    personalPassions: blk({ id: 'personal-passions', children: [blk({ id: 'd' }), blk({ id: 'e' })] }),
  } };
  assert.ok(validatePage('home', page).some((e) => /duplicate card "dup"/.test(e)));
});

test('interests id/order mismatch errors', () => {
  const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => blk({ id }));
  const page = { sections: { interests: blk({ id: 'interests', children: cards }), gis: blk({ id: 'gis', body: ['hi'] }) } };
  const cfg = { interests: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'z' }] };
  assert.ok(validatePage('interests', page, cfg).some((e) => /interests id\/order mismatch/.test(e)));
});

test('EJ impact missing quote + thanks', () => {
  const team = blk({ id: 'project-team-and-my-contribution', children: [
    blk({ id: 'research-team', children: [blk({ id: 'p1', body: ['role', 'org'] })] }),
    blk({ id: 'my-role-and-contributions', body: ['x'] }),
    blk({ id: 'project-impact-and-recognition', body: ['x'] }),
  ] });
  const page = { order: ['header', 'environmental-risk-indicators', 'project-overview', 'project-team-and-my-contribution', 'explore-the-research'],
    sections: {
      header: blk({ id: 'header', fields: { eyebrow: 'a', heading: 'b' }, body: ['x'], links: [{ label: 'a', href: '/a' }, { label: 'b', href: '/b' }] }),
      environmentalRiskIndicators: blk({ id: 'environmental-risk-indicators' }),
      projectOverview: blk({ id: 'project-overview', body: ['x'], children: [blk({ id: 'key-project-objectives', items: ['a'] })] }),
      projectTeamAndMyContribution: team,
      exploreTheResearch: blk({ id: 'explore-the-research', body: ['x'], links: [{ label: 'a', href: '/a' }] }),
    } };
  const errs = validatePage('portfolioEjPrisons', page);
  assert.ok(errs.some((e) => /impact card needs a quote/.test(e)));
  assert.ok(errs.some((e) => /impact card missing \*\*thanks/.test(e)));
});
