// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// hooks/useMapPopup.ts
// Custom hook for map popup functionality

import { useEffect, useRef } from 'react';
import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';
import { 
  PrisonFeatureProperties,
  createPrisonPopupContent,
  createSubbasinPopupContent,
  calculatePolygonCentroid
} from '@/lib/maps/mapUtils';

// Define RiskAttribute locally to avoid circular imports
type RiskAttribute = 'fnl_rs_' | 'clmt_sc' | 'effcts_' | 'expsr_s';

export const useMapPopup = (
  map: React.MutableRefObject<maplibregl.Map | null>,
  projectId: string,
  selectedAttribute?: RiskAttribute
) => {
  const popup = useRef<maplibregl.Popup | null>(null);

  // Re-setup popup handlers when selectedAttribute changes
  useEffect(() => {
    if (map.current && selectedAttribute && projectId === 'prison-ej') {
      setupPrisonPopupHandlers();
    }
  }, [selectedAttribute]);

  const setupPrisonPopupHandlers = () => {
    if (!map.current) return;

    // Clean up existing popup and listeners
    if (popup.current) {
      popup.current.remove();
    }
    
    // Remove old event listeners
    const layers = ["prison-polygons", "prison-centroids", "prison-symbol-layer"];
    layers.forEach(layer => {
      map.current?.off("mouseenter", layer as any);
      map.current?.off("mouseleave", layer as any);
    });

    // Create new popup
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // Handler function for both polygons and points
    const handleMouseEnter = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }, isPoint: boolean) => {
      if (!map.current || !popup.current || !e.features?.[0] || !selectedAttribute) {
        console.log('Popup handler early return:', {
          mapExists: !!map.current,
          popupExists: !!popup.current,
          hasFeatures: !!e.features?.[0],
          selectedAttribute
        });
        return;
      }

      const feature = e.features[0];
      const properties = feature.properties as PrisonFeatureProperties;
      
      console.log('Creating popup for:', {
        name: properties.NAME,
        isPoint,
        selectedAttribute,
        attributeValue: properties[selectedAttribute]
      });
      
      let popupLngLat;
      if (isPoint) {
        popupLngLat = e.lngLat;
      } else {
        const centroid = calculatePolygonCentroid(feature.geometry.coordinates as number[][][]);
        popupLngLat = new maplibregl.LngLat(centroid[0], centroid[1]);
      }

      const description = createPrisonPopupContent(properties, selectedAttribute);
      popup.current.setLngLat(popupLngLat).setHTML(description).addTo(map.current);
    };

    const handleMouseLeave = () => {
      if (popup.current) popup.current.remove();
    };

    // Add event listeners
    map.current.on("mouseenter", "prison-polygons" as any, (e) => handleMouseEnter(e, false));
    map.current.on("mouseleave", "prison-polygons" as any, handleMouseLeave);
    map.current.on("mouseenter", "prison-centroids" as any, (e) => handleMouseEnter(e, true));
    map.current.on("mouseleave", "prison-centroids" as any, handleMouseLeave);
    map.current.on("mouseenter", "prison-symbol-layer" as any, (e) => handleMouseEnter(e, true));
    map.current.on("mouseleave", "prison-symbol-layer" as any, handleMouseLeave);
  };

  const setupSubbasinPopupHandlers = () => {
    if (!map.current) return;

    // Create popup
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.current.on('mouseenter', 'subbasin-fill-layer', (e) => {
      if (!map.current || !popup.current || !e.features?.[0]) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      const coordinates = e.lngLat;
      
      const description = createSubbasinPopupContent(properties);
      popup.current.setLngLat(coordinates).setHTML(description).addTo(map.current);
    });
    
    map.current.on('mouseleave', 'subbasin-fill-layer', () => {
      if (popup.current) popup.current.remove();
    });
  };

  const setupPopupHandlers = () => {
    if (projectId === 'prison-ej') {
      setupPrisonPopupHandlers();
    } else if (projectId === 'cuyama-basin' || projectId === 'yuba-recharge') {
      setupSubbasinPopupHandlers();
    }
  };

  return {
    popup,
    setupPopupHandlers,
    setupPrisonPopupHandlers,
    setupSubbasinPopupHandlers
  };
};
