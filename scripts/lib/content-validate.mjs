// scripts/lib/content-validate.mjs
import { MANIFEST } from './content-manifest.mjs';

export function validatePage(name, page, config = {}) {
  const errors = [];
  const E = (msg) => errors.push(`${name}: ${msg}`);
  const spec = MANIFEST[name];
  if (!spec) { E('no manifest entry'); return errors; }

  // Duplicate top-level section headings collapse silently in the parsed `sections`
  // map (second wins, first's content lost). `order` keeps every occurrence, so flag dupes.
  const seenSections = new Set();
  for (const id of page.order || []) {
    if (seenSections.has(id)) E(`duplicate section heading "${id}" — section headings must be unique`);
    seenSections.add(id);
  }

  for (const sec of spec.sections) {
    const block = page.sections[sec.key];
    if (!block) { E(`missing section "${sec.key}"`); continue; }
    if (sec.requireBody && block.body.length === 0) E(`section "${sec.key}" has no body text`);
    if (sec.requireImage && !block.image) E(`section "${sec.key}" needs an image (![alt](src))`);
    if (sec.requireQuote && !block.quote) E(`section "${sec.key}" needs a quote (> ...)`);
    if (sec.minLinks && block.links.length < sec.minLinks)
      E(`section "${sec.key}" needs >=${sec.minLinks} link(s), has ${block.links.length}`);
    if (sec.minItems && block.items.length < sec.minItems)
      E(`section "${sec.key}" needs >=${sec.minItems} list item(s), has ${block.items.length}`);
    for (const f of sec.fields || []) {
      if (!block.fields[f] || !block.fields[f].trim()) E(`section "${sec.key}" missing field "${f}"`);
    }
    if (sec.minCards && block.children.length < sec.minCards)
      E(`section "${sec.key}" needs >=${sec.minCards} cards, has ${block.children.length}`);

    const seen = new Set();
    for (const c of block.children) {
      if (seen.has(c.id)) E(`section "${sec.key}" has duplicate card "${c.id}"`);
      seen.add(c.id);
      if (sec.cardRequireBody && c.body.length === 0) E(`section "${sec.key}" card "${c.id}" has no body text`);
      if (sec.cardRequireImage && !c.image) E(`section "${sec.key}" card "${c.id}" needs an image`);
      if (sec.cardRequireQuote && !c.quote) E(`section "${sec.key}" card "${c.id}" needs a quote`);
      if (sec.cardMinLinks && c.links.length < sec.cardMinLinks)
        E(`section "${sec.key}" card "${c.id}" needs >=${sec.cardMinLinks} link(s)`);
      for (const f of sec.cardFields || []) {
        if (!c.fields[f] || !c.fields[f].trim()) E(`section "${sec.key}" card "${c.id}" missing field "${f}"`);
      }
    }
  }

  if (name === 'portfolio') validatePortfolio(page, config.portfolio || [], E);
  if (name === 'interests') validateInterests(page, config.interests || [], E);
  if (name === 'portfolioEjPrisons') validateEjPrisons(page, E);
  return errors;
}

function validatePortfolio(page, cfg, E) {
  const cards = (page.sections.projects && page.sections.projects.children) || [];
  const byId = {};
  for (const c of cards) {
    const id = c.fields.id;
    if (!id) { E(`project card "${c.title}" missing **id:**`); continue; }
    if (byId[id]) E(`duplicate project id "${id}"`);
    byId[id] = c;
  }
  const cfgIds = new Set(cfg.map((c) => c.id));
  for (const id of Object.keys(byId)) if (!cfgIds.has(id)) E(`project "${id}" in markdown has no config entry`);
  for (const pc of cfg) {
    const card = byId[pc.id];
    if (!card) { E(`config project "${pc.id}" has no markdown card`); continue; }
    if (!card.fields.description) E(`project "${pc.id}" missing **description:**`);
    if (card.body.length === 0) E(`project "${pc.id}" has no content paragraphs`);
    const dt = pc.displayType || 'map';
    if (dt === 'image' && !card.image) E(`project "${pc.id}" displayType image but no ![image]`);
    if (dt !== 'image' && card.image) E(`project "${pc.id}" displayType ${dt} but has an image`);
    const cfgHrefs = new Set((pc.links || []).map((l) => l.href));
    const mdHrefs = new Set(card.links.map((l) => l.href));
    for (const h of mdHrefs) if (!cfgHrefs.has(h)) E(`project "${pc.id}" md link not in config: ${h}`);
    for (const h of cfgHrefs) if (!mdHrefs.has(h)) E(`project "${pc.id}" config link missing in md: ${h}`);
  }
}

function validateInterests(page, cfg, E) {
  const cards = (page.sections.interests && page.sections.interests.children) || [];
  const mdIds = cards.map((c) => c.id).join('|');
  const cfgIds = cfg.map((c) => c.id).join('|');
  if (mdIds !== cfgIds) E(`interests id/order mismatch.\n    markdown: ${mdIds}\n    config:   ${cfgIds}`);
}

function validateEjPrisons(page, E) {
  const team = page.sections.projectTeamAndMyContribution;
  if (team) {
    const find = (id) => team.children.find((c) => c.id === id);
    const research = find('research-team');
    if (!research) E('missing "Research Team" card');
    else for (const person of research.children) {
      if (person.body.length < 2) E(`research-team "${person.id}" needs 2 lines (role + org)`);
    }
    if (!find('my-role-and-contributions')) E('missing "My Role & Contributions" card');
    const impact = find('project-impact-and-recognition');
    if (!impact) E('missing "Project Impact & Recognition" card');
    else {
      if (!impact.quote) E('impact card needs a quote (> ... / > — Author)');
      if (!impact.fields.thanks) E('impact card missing **thanks:** field');
    }
  }
  const overview = page.sections.projectOverview;
  if (overview && !overview.children.find((c) => c.id === 'key-project-objectives'))
    E('Project Overview missing "Key Project Objectives" card');
}
