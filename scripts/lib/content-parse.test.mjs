// scripts/lib/content-parse.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePage, slugify, camelCase } from './content-parse.mjs';

test('slug/camel and & → and', () => {
  assert.equal(slugify('Project Team & My Contribution'), 'project-team-and-my-contribution');
  assert.equal(camelCase('project-team-and-my-contribution'), 'projectTeamAndMyContribution');
});

test('sections, fields, wrapped paragraphs', () => {
  const md = `# Home
## Hero
**eyebrow:** Water Resources Engineer & Explorer
**heading:** Devin Hunt

Passionate about water
challenges in California.

Second paragraph.`;
  const { title, order, sections } = parsePage(md);
  assert.equal(title, 'Home');
  assert.deepEqual(order, ['hero']);
  assert.equal(sections.hero.fields.eyebrow, 'Water Resources Engineer & Explorer');
  assert.equal(sections.hero.fields.heading, 'Devin Hunt');
  assert.deepEqual(sections.hero.body, ['Passionate about water challenges in California.', 'Second paragraph.']);
});

test('nested children by heading depth', () => {
  const { sections } = parsePage(`## Team\n### Research Team\n#### Dr. Caitlin Mothes\nPrincipal Investigator\nGeospatial Centroid`);
  const team = sections.team;
  assert.equal(team.children[0].id, 'research-team');
  const person = team.children[0].children[0];
  assert.equal(person.title, 'Dr. Caitlin Mothes');
  assert.deepEqual(person.body, ['Principal Investigator Geospatial Centroid']);
});

test('bullets, image+caption, link', () => {
  const { sections } = parsePage(`## H
- one
- two

![A headshot](/img/x.webp)
*A caption here*

[Read more](/interests#x)`);
  assert.deepEqual(sections.h.items, ['one', 'two']);
  assert.deepEqual(sections.h.image, { alt: 'A headshot', src: '/img/x.webp', caption: 'A caption here' });
  assert.deepEqual(sections.h.links, [{ label: 'Read more', href: '/interests#x' }]);
});

test('blockquote with author', () => {
  const { sections } = parsePage(`## H\n> The world is big.\n> — John Muir`);
  assert.deepEqual(sections.h.quote, { text: 'The world is big.', author: 'John Muir' });
});

test('literal unicode survives', () => {
  const { sections } = parsePage(`## H\nPrisons are EJ communities by definition — overrepresented.`);
  assert.equal(sections.h.body[0], 'Prisons are EJ communities by definition — overrepresented.');
});
