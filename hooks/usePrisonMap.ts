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
  updateLayerPaintPropertiesBatch,
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

    console.log(`Updating prison colors for attribute: ${selectedAttribute}, showAll: ${showAllPrisons}`);
    const colorScale = createRiskColorScale(selectedAttribute);
    
    // Use batch update for better consistency
    const updates = [
      { layerId: "prison-polygons", property: "fill-color", value: colorScale },
      { layerId: "prison-centroids", property: "circle-color", value: colorScale },
      { layerId: "prison-symbol-layer", property: "icon-color", value: colorScale }
    ];
    
    if (showAllPrisons) {
      // When showing all prisons, use enhanced repaint strategy
      console.log('Applying enhanced repaint strategy for all prisons mode');
      updateLayerPaintPropertiesBatch(map.current, updates, true);
      
      // Additional aggressive repaint for stubborn all-prisons mode
      setTimeout(() => {
        if (map.current && map.current.isStyleLoaded()) {
          try {
            // Force style recalculation by briefly toggling a benign property
            const currentOpacity = map.current.getPaintProperty('prison-polygons', 'fill-opacity');
            map.current.setPaintProperty('prison-polygons', 'fill-opacity', currentOpacity);
            map.current.triggerRepaint();
          } catch (error) {
            console.warn('Additional repaint strategy failed:', error);
          }
        }
      }, 10); // Small delay to ensure all updates are processed
    } else {
      // Filtered mode - standard update with single repaint
      console.log('Applying standard repaint strategy for filtered mode');
      updates.forEach(update => {
        updateLayerPaintProperty(map.current!, update.layerId, update.property, update.value);
      });
      map.current.triggerRepaint();
    }
  };

  // Apply filter when showAllPrisons or selectedAttribute changes
  useEffect(() => {
    if (allPrisonData.length > 0 && projectId === 'prison-ej') {
      applyTopNFilter(showAllPrisons);
      // Ensure colors are updated after filter changes
      setTimeout(() => {
        updatePrisonColors();
      }, 50); // Small delay to ensure filter is fully applied
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
