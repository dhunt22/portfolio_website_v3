// scripts/lib/content-validate.mjs
import { MANIFEST } from './content-manifest.mjs';

export function validatePage(name, page, config = {}) {
  const errors = [];
  const E = (msg) => errors.push(`${name}: ${msg}`);
  const spec = MANIFEST[name];
  if (!spec) { E('no manifest entry'); return errors; }

  for (const sec of spec.sections) {
    const block = page.sections[sec.key];
    if (!block) { E(`missing section "${sec.key}"`); continue; }
    if (sec.requireBody && block.body.length === 0) E(`section "${sec.key}" has no body text`);
    for (const f of sec.fields || []) {
      if (!block.fields[f] || !block.fields[f].trim()) E(`section "${sec.key}" missing field "${f}"`);
    }
    if (sec.minCards && block.children.length < sec.minCards)
      E(`section "${sec.key}" needs >=${sec.minCards} cards, has ${block.children.length}`);
    const seen = new Set();
    for (const c of block.children) {
      if (seen.has(c.id)) E(`section "${sec.key}" has duplicate card "${c.id}"`);
      seen.add(c.id);
    }
  }

  if (name === 'portfolio') validatePortfolio(page, config.portfolio || [], E);
  if (name === 'interests') validateInterests(page, config.interests || [], E);
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
