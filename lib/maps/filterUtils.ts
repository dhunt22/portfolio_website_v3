// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/filterUtils.ts
// Pure (no-maplibre) filter expression builder for usePrisonMap.
// Kept separate so jest unit tests can import it without triggering the
// maplibre-gl browser bootstrap (window.URL.createObjectURL).

// Individual component → percentile column mapping (kept in sync with mapUtils COMPONENT_COLUMNS)
export const COMPONENT_FILTER_COLUMNS: Record<string, string> = {
  'overall': 'final_risk_score_pcntl',
  'heat': 'lst_avg_pcntl',
  'canopy': 'percent_tree_cover_pcntl',
  'wildfire': 'wildfire_risk_pcntl',
  'flood': 'flood_risk_pcntl',
  'ozone': 'mean_ozone_pcntl',
  'pm25': 'avg_pm25_pcntl',
  'pesticide': 'pesticides_pcntl',
  'traffic': 'trafficProx_pcntl',
  'superfund': 'npl_prox_pcntl',
  'rmp': 'rmp_prox_pcntl',
  'hazwaste': 'haz_prox_pcntl',
};

export type PercentileThreshold = 0 | 50 | 75 | 95;
export type FacilityType = 'STATE' | 'FEDERAL';

/** Resolve the percentile data column for the active indicator.
 *  When a component is selected (e.g. 'heat') use its individual pcntl column;
 *  otherwise fall back to the RiskAttribute column. */
export function resolveActiveColumn(
  selectedComponent: string | undefined,
  selectedAttribute: string
): string {
  if (selectedComponent && selectedComponent !== 'overall') {
    const col = COMPONENT_FILTER_COLUMNS[selectedComponent];
    if (col) return col;
  }
  return selectedAttribute;
}

/**
 * Build the combined setFilter expression using direct MapLibre expressions.
 *   ['all', threshold_clause, type_clause]
 *
 * threshold = 0  → no threshold clause (null filter = show all, including nulls)
 * types = both   → no type clause
 *
 * The percentile clause is a simple `['>=', ['get', attr], threshold]`.
 * MapLibre drops features where the property is null/non-numeric, matching
 * the semantics of the old JS-filter approach.
 */
export function buildCombinedFilter(
  threshold: PercentileThreshold,
  types: FacilityType[],
  activeColumn: string
): any[] | null {
  const clauses: any[] = [];

  // Percentile filter: direct expression against the active indicator column
  if (threshold > 0) {
    clauses.push(['>=', ['get', activeColumn], threshold]);
  }
  // threshold === 0 → "All" → no clause (nulls included)

  // Facility type filter
  if (types.length === 1) {
    clauses.push(['==', ['get', 'TYPE'], types[0]]);
  }
  // If both selected, no clause needed (show all types)

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return ['all', ...clauses];
}
