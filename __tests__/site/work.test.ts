import { formatYears, highlightEntries, projectEntries, toolEntries } from '@/lib/site/work';
import { findCopyViolations } from '@/test-utils/stanscribe';

const field = (entry: { reading: { fields: { label: string; value: string }[] } }, label: string) =>
  entry.reading.fields.find((f) => f.label === label)?.value;

test('years read as words', () => {
  expect(formatYears('2023-Present')).toBe('2023 to present');
  expect(formatYears('2022-2023')).toBe('2022 to 2023');
  expect(formatYears('2024')).toBe('2024');
  expect(formatYears(undefined)).toBe('');
});

test('every project has a glyph, a summary and a reading', () => {
  const entries = projectEntries();
  expect(entries.map((e) => e.id)).toEqual([
    'prison-ej', 'cuyama-basin', 'yuba-recharge', 'seasonal-population', 'harvest-water',
    'modesto-infiltration', 'antelope-wells', 'watershed-hub', 'sanitary-district',
  ]);
  for (const e of entries) {
    expect(e.glyph.parts.length).toBeGreaterThan(0);
    expect(e.summary.length).toBeGreaterThan(20);
    expect(e.reading.fields.length).toBeGreaterThan(0);
  }
});

test('places read from Bulletin 118 or the HUC8 watersheds', () => {
  const byId = Object.fromEntries(projectEntries().map((e) => [e.id, e]));
  expect(field(byId['cuyama-basin'], 'Subbasin')).toBe('Cuyama Valley');
  expect(field(byId['cuyama-basin'], 'B118')).toBe('3-013');
  expect(field(byId['yuba-recharge'], 'Subbasin')).toBe('North Yuba and South Yuba');
  expect(field(byId['yuba-recharge'], 'B118')).toBe('5-021.60, 5-021.61');
  expect(field(byId['antelope-wells'], 'Watershed')).toBe('Antelope-Fremont Valleys');
  expect(field(byId['harvest-water'], 'Watershed')).toBe('Upper Cosumnes');
  expect(byId['prison-ej'].href).toBe('/portfolio/environmental-justice-prisons');
  expect(byId['prison-ej'].meta).toBe('United States · 2022 to 2023');
});

test('the tools', () => {
  const tools = toolEntries();
  expect(tools.map((t) => t.name)).toEqual(['AIIWFM', 'ZBudget Dashboards', 'IWFM workflow suite', 'PyPEST', 'Stan Scribe']);
  const zbudget = tools[1];
  expect(zbudget.soon).toBe(true);
  expect(zbudget.href).toBeUndefined();
  expect(zbudget.summary).toBe('A fast, powerful IWFM model diagnostic and results viewing dashboard with interactive map and charts. Streamlining model review and report generation.');
  const stan = tools[4];
  expect(stan.href).toBe('/stanscribe');
  expect(findCopyViolations([stan.summary, ...stan.content].join(' '))).toEqual([]);
});

test('the five home highlights, in order, with where each one goes', () => {
  expect(highlightEntries().map((h) => [h.name, h.href])).toEqual([
    ['Environmental Justice For Prisons', '/portfolio/environmental-justice-prisons'],
    ['Yuba Subbasins Recharge Analysis', '/portfolio#yuba-recharge'],
    ['AIIWFM', '/portfolio#aiiwfm'],
    ['ZBudget Dashboards', undefined],
    ['Stan Scribe', '/stanscribe'],
  ]);
});
