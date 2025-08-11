// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// hooks/usePrisonMap.ts
// Custom hook for prison map functionality

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { 
  PrisonFeature,
  createRiskColorScale,
  createTopNFilter,
  sortPrisonsByRisk,
  applyFilterToLayers,
  updateLayerPaintProperty,
  getPrisonId,
  determineIdField
} from '@/lib/maps/mapUtils';

// Define RiskAttribute locally to avoid circular imports
type RiskAttribute = 'fnl_rs_' | 'clmt_sc' | 'effcts_' | 'expsr_s';

export const usePrisonMap = (map: React.MutableRefObject<maplibregl.Map | null>, projectId: string) => {
  const [selectedAttribute, setSelectedAttribute] = useState<RiskAttribute>("fnl_rs_");
  const [showAllPrisons, setShowAllPrisons] = useState<boolean>(true);
  const [allPrisonData, setAllPrisonData] = useState<PrisonFeature[]>([]);
  const [idField, setIdField] = useState<string>('OBJECTID');

  const PRISON_LAYERS = ['prison-polygons', 'prison-outlines', 'prison-polygons-highlight', 'prison-centroids', 'prison-symbol-layer'];

  // Update ID field when data changes
  useEffect(() => {
    if (allPrisonData.length > 0) {
      const detectedField = determineIdField(allPrisonData);
      setIdField(detectedField);
    }
  }, [allPrisonData]);

  const applyTopNFilter = (showAll: boolean) => {
    if (!map.current || !allPrisonData.length || projectId !== 'prison-ej') {
      console.log('Cannot apply filter:', { mapExists: !!map.current, dataLength: allPrisonData.length, projectId });
      return;
    }
    
    if (showAll) {
      console.log('Showing all prisons');
      applyFilterToLayers(map.current, PRISON_LAYERS, null);
    } else {
      console.log(`Applying top 10 filter for attribute: ${selectedAttribute}`);
      console.log('All prison data sample:', allPrisonData.slice(0, 3).map(p => ({
        name: p.properties.NAME,
        objectId: p.properties.OBJECTID,
        featureId: p.id,
        riskValue: p.properties[selectedAttribute],
        idFieldValue: p.properties[idField]
      })));
      
      const sortedPrisons = sortPrisonsByRisk(allPrisonData, selectedAttribute, 10);
      const topPrisonIds = sortedPrisons.map(prison => getPrisonId(prison));
      
      console.log('Top prison IDs for filter:', topPrisonIds);
      
      const filterExpression = createTopNFilter(topPrisonIds, idField);
      
      applyFilterToLayers(map.current, PRISON_LAYERS, filterExpression);
    }
  };
  
  const clearFilters = () => {
    if (!map.current || projectId !== 'prison-ej') return;
    console.log('Clearing all filters');
    applyFilterToLayers(map.current, PRISON_LAYERS, null);
  };

  const updatePrisonColors = () => {
    if (!map.current || !map.current.isStyleLoaded() || projectId !== 'prison-ej') return;

    console.log(`Updating prison colors for attribute: ${selectedAttribute}`);
    const colorScale = createRiskColorScale(selectedAttribute);
    
    updateLayerPaintProperty(map.current, "prison-polygons", "fill-color", colorScale);
    updateLayerPaintProperty(map.current, "prison-centroids", "circle-color", colorScale);
    updateLayerPaintProperty(map.current, "prison-symbol-layer", "icon-color", colorScale);
  };

  // Apply filter when showAllPrisons or selectedAttribute changes
  useEffect(() => {
    if (allPrisonData.length > 0 && projectId === 'prison-ej') {
      applyTopNFilter(showAllPrisons);
    }
  }, [showAllPrisons, selectedAttribute, allPrisonData, projectId]);

  return {
    selectedAttribute,
    setSelectedAttribute,
    showAllPrisons,
    setShowAllPrisons,
    allPrisonData,
    setAllPrisonData,
    applyTopNFilter,
    clearFilters,
    updatePrisonColors
  };
};
