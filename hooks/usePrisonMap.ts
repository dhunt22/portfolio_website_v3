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
  applyFilterToLayers,
  updateLayerPaintProperty,
  updateLayerPaintPropertiesBatch,
} from '@/lib/maps/mapUtils';
import {
  buildCombinedFilter,
  resolveActiveColumn,
  type PercentileThreshold,
  type FacilityType,
} from '@/lib/maps/filterUtils';

// Re-export pure filter utilities so consumers (ProjectMap, tests) can import
// from a single location without pulling in maplibre-gl.
export { buildCombinedFilter, resolveActiveColumn };
export type { PercentileThreshold, FacilityType };

// Define RiskAttribute locally to avoid circular imports (using new geojson column names)
type RiskAttribute = 'final_risk_score_pcntl' | 'climate_score' | 'effects_score' | 'exposure_score';

export const usePrisonMap = (
  map: React.MutableRefObject<maplibregl.Map | null>,
  projectId: string,
  selectedComponent?: string,
  componentColor?: string,
  instanceId?: string
) => {
  const [selectedAttribute, setSelectedAttribute] = useState<RiskAttribute>("final_risk_score_pcntl");
  const [percentileThreshold, setPercentileThreshold] = useState<PercentileThreshold>(0);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>(['STATE', 'FEDERAL']);
  const [allPrisonData, setAllPrisonData] = useState<PrisonFeature[]>([]);

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

  const applyCurrentFilter = (
    threshold: PercentileThreshold,
    types: FacilityType[],
    activeColumn: string
  ) => {
    if (!map.current || projectId !== 'prison-ej') return;

    const filterExpr = buildCombinedFilter(threshold, types, activeColumn);
    console.log('Applying combined filter:', JSON.stringify(filterExpr));
    applyFilterToLayers(map.current, PRISON_LAYERS, filterExpr);
  };

  const clearFilters = () => {
    if (!map.current || projectId !== 'prison-ej') return;
    console.log('Clearing all filters');
    applyFilterToLayers(map.current, PRISON_LAYERS, null);
  };

  const updatePrisonColors = (componentId?: string, compColor?: string) => {
    // NOTE: no isStyleLoaded() gate here — it is false during ANY tile/sprite
    // loading and silently swallowed clicks (the "buttons don't update the map"
    // bug). setPaintProperty is safe whenever the layer exists; the per-layer
    // getLayer() guards in mapUtils handle the not-yet-added case, and the
    // effect below queues a retry on 'idle' for that window.
    if (!map.current || projectId !== 'prison-ej') return;

    console.log(`Updating prison colors for attribute: ${selectedAttribute}, component: ${componentId}`);
    const colorScale = componentId && compColor ?
      createEnhancedColorScale(componentId, compColor) :
      createRiskColorScale(selectedAttribute);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _dynamicProperties = createDynamicPaintProperties(selectedAttribute);

    // Use batch update for better consistency
    const updates = [
      { layerId: `${layerPrefix}-polygons`, property: "fill-color", value: colorScale },
      { layerId: `${layerPrefix}-polygons-highlight`, property: "fill-color", value: colorScale },
      { layerId: `${layerPrefix}-centroids`, property: "circle-color", value: colorScale }
    ];

    if (percentileThreshold === 0) {
      console.log('Applying enhanced repaint strategy for all prisons mode');
      updateLayerPaintPropertiesBatch(map.current, updates, true);
    } else {
      console.log('Applying standard repaint strategy for filtered mode');
      updates.forEach(update => {
        updateLayerPaintProperty(map.current!, update.layerId, update.property, update.value);
      });
      map.current.triggerRepaint();
    }
  };

  // Apply filter + colors when threshold, facilityTypes, selectedAttribute, or
  // selectedComponent changes. If the prison layers are not ready yet (initial
  // style/tiles still loading, or a theme style-swap mid-flight), QUEUE the
  // apply on the map's next 'idle' instead of dropping it — a click made while
  // the map is busy must still land. The cleanup removes a stale queued apply
  // when deps change again, so only the latest state is ever applied.
  useEffect(() => {
    if (projectId !== 'prison-ej' || !map.current) return;
    const m = map.current;

    const apply = () => {
      const activeColumn = resolveActiveColumn(selectedComponent, selectedAttribute);
      applyCurrentFilter(percentileThreshold, facilityTypes, activeColumn);
      updatePrisonColors(selectedComponent, componentColor);
    };

    const layersReady = !!m.getLayer(PRISON_LAYERS[0]);
    if (layersReady) {
      apply();
      return;
    }
    const onIdle = () => apply();
    m.once('idle', onIdle);
    return () => {
      m.off('idle', onIdle);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentileThreshold, facilityTypes, selectedAttribute, allPrisonData, projectId, selectedComponent, componentColor]);

  return {
    selectedAttribute,
    setSelectedAttribute,
    percentileThreshold,
    setPercentileThreshold,
    facilityTypes,
    setFacilityTypes,
    allPrisonData,
    setAllPrisonData,
    clearFilters,
    updatePrisonColors,
    // Expose refs for style.load re-apply in ProjectMap
    percentileThresholdRef,
    facilityTypesRef,
    selectedAttributeRef,
    selectedComponentRef,
    componentColorRef,
    PRISON_LAYERS,
    resolveActiveColumn,
    buildCombinedFilter,
  };
};
