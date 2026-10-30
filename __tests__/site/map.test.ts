import { resumeMap } from '@/lib/site/map';

test('the résumé map: every watershed, the located projects and home', () => {
  const { basins, pins, viewBox } = resumeMap();
  expect(basins).toHaveLength(140);
  expect(pins.map((p) => p.id)).toEqual(['cuyama-basin', 'yuba-recharge', 'harvest-water', 'antelope-wells', 'home']);
  expect(pins.find((p) => p.id === 'home')).toMatchObject({ home: true, label: 'Sacramento' });
  const worked = basins.filter((b) => b.worked).map((b) => b.name).sort();
  expect(worked).toEqual(['Antelope-Fremont Valleys', 'Cuyama', 'Honcut Headwaters-Lower Feather', 'Upper Cosumnes']);
  expect(viewBox).toHaveLength(4);
});
