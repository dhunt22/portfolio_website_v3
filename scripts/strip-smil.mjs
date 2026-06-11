import fs from 'node:fs';
const p = 'public/images/american_river_contour_bwn.svg';
let s = fs.readFileSync(p, 'utf8');
const before = s.length;
// Strip defs block (contains gradient/SMIL definitions)
s = s.replace(/<defs>[\s\S]*?<\/defs>/, '<defs/>');
// Strip the glow-traces group (uses removed gradient refs; was only rendered by the old defs)
s = s.replace(/<g class="glow-traces"[\s\S]*?<\/g>/, '');
fs.writeFileSync(p, s);
console.log(`stripped ${(before - s.length)} bytes from ${p}`);
