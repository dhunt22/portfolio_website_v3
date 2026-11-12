import { formatLat, formatLon, placeReading, plateReading, labelReading, HOME_BASE } from '@/lib/site/reading';

test('coordinates read as degrees with a hemisphere', () => {
  expect(formatLat(38.58)).toBe('38.58° N');
  expect(formatLon(-121.49)).toBe('121.49° W');
  expect(formatLat(-33.9)).toBe('33.90° S');
  expect(formatLon(7.21)).toBe('7.21° E');
});

test('a subbasin reading names the subbasin and its B118 number', () => {
  const r = placeReading({ lat: 34.95, lon: -119.7, kind: 'subbasin', name: 'Cuyama Valley', code: '3-013' });
  expect(r.fields.map((f) => f.label)).toEqual(['Lat', 'Lon', 'Subbasin', 'B118']);
  expect(r.fields[3]).toEqual({ label: 'B118', value: '3-013', wide: true });
  expect(r.note).toBe('DWR Bulletin 118 groundwater subbasins');
});

test('a watershed reading names the HUC8 watershed', () => {
  const r = placeReading({ lat: 34.65, lon: -118.15, kind: 'watershed', name: 'Antelope-Fremont Valleys', code: '18090206' });
  expect(r.fields.map((f) => f.label)).toEqual(['Lat', 'Lon', 'Watershed', 'HUC8']);
  expect(r.note).toBe('California watersheds · USGS HUC8');
});

test('plate, label and home-base readings', () => {
  expect(plateReading('home').fields[0]).toEqual({ label: 'Plate', value: 'Big Sur, California' });
  expect(plateReading('home').note).toBe('Contours drawn by Devin Hunt');
  expect(labelReading('Tool', 'PyPEST').fields).toEqual([{ label: 'Tool', value: 'PyPEST' }]);
  expect(HOME_BASE.fields[0]).toEqual({ label: 'Home base', value: 'Sacramento, California' });
});
