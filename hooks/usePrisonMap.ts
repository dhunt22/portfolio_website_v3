// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// hooks/usePrisonMap.ts
// Custom hook for prison map functionality

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  PrisonFeature,
  createRiskColorScale,
  createEnhancedColorScale,
  createDynamicPaintProperties,
  createTopNFilter,
  sortPrisonsByRisk,
  filterPrisonsByPercentile,
  applyFilterToLayers,
  updateLayerPaintProperty,
  updateLayerPaintPropertiesBatch,
  getPrisonId,
  determineIdField
} from '@/lib/maps/mapUtils';

// Define RiskAttribute locally to avoid circular imports (using new geojson column names)
type RiskAttribute = 'final_risk_score_pcntl' | 'climate_score' | 'effects_score' | 'exposure_score';

export type PercentileThreshold = 0 | 50 | 75 | 95;
export type FacilityType = 'STATE' | 'FEDERAL';

export const usePrisonMap = (
  map: React.MutableRefObject<maplibregl.Map | null>,
  projectId: string,
  selectedComponent?: string,
  componentColor?: string,
  instanceId?: string
) => {
  const [selectedAttribute, setSelectedAttribute] = useState<RiskAttribute>("final_risk_score_pcntl");
  // Legacy: showAllPrisons = (percentileThreshold === 0)
  const [percentileThreshold, setPercentileThreshold] = useState<PercentileThreshold>(0);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>(['STATE', 'FEDERAL']);
  const [allPrisonData, setAllPrisonData] = useState<PrisonFeature[]>([]);
  const [idField, setIdField] = useState<string>('FACILIT');

  // Derived compat shim so ProjectMap's existing showAllPrisons consumers keep working
  const showAllPrisons = percentileThreshold === 0;
  const setShowAllPrisons = (show: boolean) => setPercentileThreshold(show ? 0 : 95);

  // Create unique layer names for this instance
  const layerPrefix = instanceId ? `prison-${instanceId}` : 'prison';
  const PRISON_LAYERS = [`${layerPrefix}-polygons`, `${layerPrefix}-outlines`, `${layerPrefix}-polygons-highlight`, `${layerPrefix}-centroids`];

  // Keep refs so the style.load handler can re-apply current state after basemap swap
  const percentileThresholdRef = useRef<PercentileThreshold>(0);
  const facilityTypesRef = useRef<FacilityType[]>(['STATE', 'FEDERAL']);
  const selectedAttributeRef = useRef<RiskAttribute>('final_risk_score_pcntl');
  const selectedComponentRef = useRef<string | undefined>(selectedComponent);
  const componentColorRef = useRef<string | undefined>(componentColor);

  // Keep refs in sync with state
  useEffect(() => { percentileThresholdRef.current = percentileThreshold; }, [percentileThreshold]);
  useEffect(() => { facilityTypesRef.current = facilityTypes; }, [facilityTypes]);
  useEffect(() => { selectedAttributeRef.current = selectedAttribute; }, [selectedAttribute]);
  useEffect(() => { selectedComponentRef.current = selectedComponent; }, [selectedComponent]);
  useEffect(() => { componentColorRef.current = componentColor; }, [componentColor]);

  // Update ID field when data changes
  useEffect(() => {
    if (allPrisonData.length > 0) {
      const detectedField = determineIdField(allPrisonData);
      setIdField(detectedField);
    }
  }, [allPrisonData]);

  /**
   * Build the combined setFilter expression:
   *   ['all', threshold_clause, type_clause]
   *
   * threshold = 0  → no threshold clause (null filter = show all)
   * types = both   → no type clause
   */
  const buildCombinedFilter = (
    threshold: PercentileThreshold,
    types: FacilityType[],
    attribute: RiskAttribute,
    currentIdField: string,
    prisons: PrisonFeature[]
  ): any[] | null => {
    const clauses: any[] = [];

    // Percentile filter: filter to IDs that meet the threshold
    if (threshold > 0) {
      const filtered = filterPrisonsByPercentile(prisons, attribute, threshold);
      const topPrisonIds = filtered.map(prison => getPrisonId(prison));
      if (topPrisonIds.length > 0) {
        clauses.push(createTopNFilter(topPrisonIds, currentIdField));
      } else {
        // No prisons meet threshold — show nothing
        clauses.push(['==', ['literal', ''], ['literal', 'NOMATCH']]);
      }
    }

    // Facility type filter
    if (types.length === 1) {
      // Only one type selected — use in expression
      clauses.push(['==', ['get', 'TYPE'], types[0]]);
    }
    // If both selected, no clause needed (show all types)

    if (clauses.length === 0) return null;
    if (clauses.length === 1) return clauses[0];
    return ['all', ...clauses];
  };

  const applyCurrentFilter = (
    threshold: PercentileThreshold,
    types: FacilityType[],
    attribute: RiskAttribute,
    currentIdField: string,
    prisons: PrisonFeature[]
  ) => {
    if (!map.current || projectId !== 'prison-ej') return;

    const filterExpr = buildCombinedFilter(threshold, types, attribute, currentIdField, prisons);
    console.log('Applying combined filter:', JSON.stringify(filterExpr));
    applyFilterToLayers(map.current, PRISON_LAYERS, filterExpr);
  };

  // Legacy helper kept for MapControls compatibility
  const applyTopNFilter = (showAll: boolean) => {
    const threshold = showAll ? 0 : 95;
    applyCurrentFilter(threshold, facilityTypes, selectedAttribute, idField, allPrisonData);
  };

  const clearFilters = () => {
    if (!map.current || projectId !== 'prison-ej') return;
    console.log('Clearing all filters');
    applyFilterToLayers(map.current, PRISON_LAYERS, null);
  };

  const updatePrisonColors = (componentId?: string, compColor?: string) => {
    if (!map.current || !map.current.isStyleLoaded() || projectId !== 'prison-ej') return;

    console.log(`Updating prison colors for attribute: ${selectedAttribute}, component: ${componentId}`);
    const colorScale = componentId && compColor ?
      createEnhancedColorScale(componentId, compColor) :
      createRiskColorScale(selectedAttribute);
    const dynamicProperties = createDynamicPaintProperties(selectedAttribute);

    // Use batch update for better consistency
    const updates = [
      { layerId: `${layerPrefix}-polygons`, property: "fill-color", value: colorScale },
      { layerId: `${layerPrefix}-polygons-highlight`, property: "fill-color", value: colorScale },
      { layerId: `${layerPrefix}-centroids`, property: "circle-color", value: colorScale }
    ];

    if (showAllPrisons) {
      console.log('Applying enhanced repaint strategy for all prisons mode');
      updateLayerPaintPropertiesBatch(map.current, updates, true);

      setTimeout(() => {
        if (map.current && map.current.isStyleLoaded()) {
          try {
            const currentOpacity = map.current.getPaintProperty(`${layerPrefix}-polygons`, 'fill-opacity');
            map.current.setPaintProperty(`${layerPrefix}-polygons`, 'fill-opacity', currentOpacity);
            map.current.triggerRepaint();
          } catch (error) {
            console.warn('Additional repaint strategy failed:', error);
          }
        }
      }, 10);
    } else {
      console.log('Applying standard repaint strategy for filtered mode');
      updates.forEach(update => {
        updateLayerPaintProperty(map.current!, update.layerId, update.property, update.value);
      });
      map.current.triggerRepaint();
    }
  };

  // Apply filter when threshold, facilityTypes, selectedAttribute, or data changes
  useEffect(() => {
    if (allPrisonData.length > 0 && projectId === 'prison-ej') {
      applyCurrentFilter(percentileThreshold, facilityTypes, selectedAttribute, idField, allPrisonData);
      setTimeout(() => {
        updatePrisonColors(selectedComponent, componentColor);
      }, 50);
    }
  }, [percentileThreshold, facilityTypes, selectedAttribute, allPrisonData, projectId, selectedComponent, componentColor, idField]);

  return {
    selectedAttribute,
    setSelectedAttribute,
    showAllPrisons,
    setShowAllPrisons,
    percentileThreshold,
    setPercentileThreshold,
    facilityTypes,
    setFacilityTypes,
    allPrisonData,
    setAllPrisonData,
    applyTopNFilter,
    clearFilters,
    updatePrisonColors,
    // Expose refs for style.load re-apply in ProjectMap
    percentileThresholdRef,
    facilityTypesRef,
    selectedAttributeRef,
    selectedComponentRef,
    componentColorRef,
    buildCombinedFilter,
    PRISON_LAYERS,
    idField,
  };
};
