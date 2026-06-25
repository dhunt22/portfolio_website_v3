// __tests__/buildCombinedFilter.test.ts
// Unit tests for the MapLibre filter expression builder.
// Imports from the pure filterUtils module to avoid the maplibre-gl browser bootstrap.

import { buildCombinedFilter } from '@/lib/maps/filterUtils';
import type { PercentileThreshold, FacilityType } from '@/lib/maps/filterUtils';

describe('buildCombinedFilter', () => {
  it('returns a combined all-clause when threshold > 0 and one facility type', () => {
    const result = buildCombinedFilter(95, ['STATE'] as FacilityType[], 'heat_index_pcntl');
    expect(result).toEqual([
      'all',
      ['>=', ['get', 'heat_index_pcntl'], 95],
      ['==', ['get', 'TYPE'], 'STATE'],
    ]);
  });

  it('returns only a >= clause when threshold > 0 and both facility types', () => {
    const result = buildCombinedFilter(75, ['STATE', 'FEDERAL'] as FacilityType[], 'lst_avg_pcntl');
    expect(result).toEqual(['>=', ['get', 'lst_avg_pcntl'], 75]);
  });

  it('returns only a type clause when threshold is 0 and one facility type', () => {
    const result = buildCombinedFilter(0, ['FEDERAL'] as FacilityType[], 'final_risk_score_pcntl');
    expect(result).toEqual(['==', ['get', 'TYPE'], 'FEDERAL']);
  });

  it('returns null (no filter) when threshold is 0 and both facility types selected', () => {
    const result = buildCombinedFilter(0 as PercentileThreshold, ['STATE', 'FEDERAL'] as FacilityType[], 'final_risk_score_pcntl');
    expect(result).toBeNull();
  });

  it('uses the provided activeColumn, not a hardcoded attribute', () => {
    const result = buildCombinedFilter(50, ['STATE', 'FEDERAL'] as FacilityType[], 'heat_index_pcntl');
    // Should reference heat_index_pcntl, not final_risk_score_pcntl
    expect(result).toEqual(['>=', ['get', 'heat_index_pcntl'], 50]);
  });

  it('combined form matches expected shape for heat_index_pcntl, threshold=95, types=[STATE]', () => {
    // Exact shape mandated by the review spec
    expect(
      buildCombinedFilter(95, ['STATE'] as FacilityType[], 'heat_index_pcntl')
    ).toEqual([
      'all',
      ['>=', ['get', 'heat_index_pcntl'], 95],
      ['==', ['get', 'TYPE'], 'STATE'],
    ]);
  });
});
