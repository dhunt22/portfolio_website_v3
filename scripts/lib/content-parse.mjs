// scripts/lib/content-parse.mjs
// Pure Markdown → page-content parser. No fs / Node-only APIs.
// A page parses to { title, order: string[], sections: Record<camelId, Block> }.
// Block = { id, title, fields, body, items, links, image?, quote?, children }.

const HEADING_RE = /^(#{1,6})\s+(.*\S)\s*$/;
const FIELD_RE   = /^\*\*([^*]+?):\*\*\s*(.*)$/;     // **key:** value
const IMAGE_RE   = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;  // ![alt](src)
const LINK_RE    = /^\[([^\]]+)\]\(([^)]+)\)\s*$/;   // [label](href)
const ITALIC_RE  = /^\*([^*].*?)\*\s*$/;             // *caption*
const BULLET_RE  = /^[-*]\s+(.*\S)\s*$/;             // - item
const QUOTE_RE   = /^>\s?(.*)$/;                     // > text
const AUTHOR_RE  = /^[—–-]\s*(.+)$/;                 // — Author (inside a blockquote)

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[''"""]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function camelCase(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function newBlock(level, id, title) {
  return { level, id, title, fields: {}, body: [], items: [], links: [], children: [] };
}

// Rebuild each block in canonical key order (deterministic emit) and drop `level`.
function clean(b) {
  const out = { id: b.id, title: b.title, fields: b.fields, body: b.body, items: b.items, links: b.links };
  if (b.image) out.image = b.image;
  if (b.quote) out.quote = b.quote;
  out.children = b.children.map(clean);
  return out;
}

export function parsePage(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const root = newBlock(1, '__root__', '');
  const stack = [root];
  let title = '';
  let para = [];
  let quote = null;
  let lastImage = null;

  const current = () => stack[stack.length - 1];
  const flushPara = () => { if (para.length) { current().body.push(para.join(' ').trim()); para = []; } };
  const flushQuote = () => {
    if (quote) {
      const q = { text: quote.text.join(' ').trim() };
      if (quote.author) q.author = quote.author;
      current().quote = q;
      quote = null;
    }
  };
  const flushSoft = () => { flushPara(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    if (line.trim() === '') { flushSoft(); lastImage = null; continue; }

    const heading = line.match(HEADING_RE);
    if (heading) {
      flushSoft(); lastImage = null;
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1) { title = text; continue; }
      while (current().level >= level) stack.pop();
      const block = newBlock(level, slugify(text), text);
      current().children.push(block);
      stack.push(block);
      continue;
    }

    const quoteLine = line.match(QUOTE_RE);
    if (quoteLine) {
      flushPara();
      const inner = quoteLine[1].trim();
      if (!quote) quote = { text: [], author: '' };
      const author = inner.match(AUTHOR_RE);
      if (author) quote.author = author[1].trim();
      else if (inner) quote.text.push(inner);
      continue;
    }
    flushQuote();

    const fieldMatch = line.match(FIELD_RE);
    if (fieldMatch) { flushPara(); current().fields[slugify(fieldMatch[1])] = fieldMatch[2].trim(); lastImage = null; continue; }

    const image = line.match(IMAGE_RE);
    if (image) { flushPara(); lastImage = { alt: image[1].trim(), src: image[2].trim() }; current().image = lastImage; continue; }

    const italic = line.match(ITALIC_RE);
    if (italic && lastImage && lastImage.caption === undefined) { lastImage.caption = italic[1].trim(); lastImage = null; continue; }

    const link = line.match(LINK_RE);
    if (link) { flushPara(); current().links.push({ label: link[1].trim(), href: link[2].trim() }); lastImage = null; continue; }

    const bullet = line.match(BULLET_RE);
    if (bullet) { flushPara(); current().items.push(bullet[1].trim()); lastImage = null; continue; }

    para.push(line.trim());
    lastImage = null;
  }
  flushSoft();

  const sections = {};
  const order = [];
  for (const sec of root.children) {
    const c = clean(sec);
    sections[camelCase(c.id)] = c;
    order.push(c.id);
  }
  return { title, order, sections };
}
