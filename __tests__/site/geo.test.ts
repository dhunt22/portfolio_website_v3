import { featureAt, fitTo, pathData, project, unproject } from '@/lib/site/geo';
import { huc8Features } from '@/lib/site/geodata';

test('project and unproject are inverses', () => {
  const [lon, lat] = unproject(project([-121.49, 38.58]));
  expect(lon).toBeCloseTo(-121.49, 6);
  expect(lat).toBeCloseTo(38.58, 6);
});

test('featureAt finds the HUC8 watershed under a point', () => {
  const huc = huc8Features();
  expect(huc).toHaveLength(140);
  expect(featureAt(huc, -121.49, 38.58)?.properties).toMatchObject({ Name: 'Lower Sacramento', HUC8: '18020163' });
  expect(featureAt(huc, -119.7, 34.95)?.properties).toMatchObject({ Name: 'Cuyama', HUC8: '18060007' });
  expect(featureAt(huc, -130, 38)).toBeUndefined();
});

test('fitTo centres a shape inside the box with its padding', () => {
  const fit = fitTo([[0, 0], [10, 5]], 72, 72, 6);
  expect(fit([0, 0])).toEqual([6, 21]);
  expect(fit([10, 5])).toEqual([66, 51]);
});

test('pathData rounds and drops repeated points', () => {
  const d = pathData([[[[0, 0], [0.01, 0], [1, 0], [1, 1]]]], ([x, y]) => [x * 10, y * 10], 0);
  expect(d).toBe('M0,0L10,0L10,10Z');
});
