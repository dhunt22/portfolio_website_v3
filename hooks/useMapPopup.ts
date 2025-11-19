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

// Define RiskAttribute locally to avoid circular imports (using new geojson column names)
type RiskAttribute = 'final_risk_score_pcntl' | 'climate_score' | 'effects_score' | 'exposure_score';

export const useMapPopup = (
  map: React.MutableRefObject<maplibregl.Map | null>,
  projectId: string,
  selectedAttribute?: RiskAttribute,
  selectedComponent?: string,
  instanceId?: string
) => {
  const popup = useRef<maplibregl.Popup | null>(null);
  const clickPopup = useRef<maplibregl.Popup | null>(null);

  // Setup popup handlers when map is ready and re-setup when selectedAttribute or selectedComponent changes
  useEffect(() => {
    if (map.current && projectId === 'prison-ej') {
      // Always setup handlers, even if selectedAttribute is undefined initially
      // The handlers will use the current selectedAttribute and selectedComponent values
      setupPrisonPopupHandlers();
    }
  }, [selectedAttribute, selectedComponent]);

  const setupPrisonPopupHandlers = () => {
    if (!map.current) return;

    console.log('Setting up prison popup handlers...', { instanceId, projectId });

    // Clean up existing popups and listeners
    if (popup.current && popup.current.isOpen()) {
      popup.current.remove();
    }

    if (clickPopup.current && clickPopup.current.isOpen()) {
      clickPopup.current.remove();
      clickPopup.current = null;
    }

    // Define layer names with instance ID prefix if provided
    const layerPrefix = instanceId ? `prison-${instanceId}` : 'prison';
    const layers = [`${layerPrefix}-polygons`, `${layerPrefix}-centroids`, `${layerPrefix}-symbol-layer`];

    console.log('Looking for layers:', layers);

    // Check if layers exist
    layers.forEach(layer => {
      const exists = map.current?.getLayer(layer);
      console.log(`Layer ${layer} exists:`, !!exists);
    });

    // Remove old event listeners - be more thorough
    layers.forEach(layer => {
      try {
        // Remove all event types
        map.current?.off("mousemove", layer as any);
        map.current?.off("mouseenter", layer as any);
        map.current?.off("mouseleave", layer as any);
        map.current?.off("click", layer as any);
      } catch (e) {
        // Ignore errors if layer doesn't exist yet
      }
    });

    // Create hover popup (reusable) - no anchor specified allows automatic positioning
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 5
    });

    // Handler for mousemove (best practice for overlapping features)
    const handleMouseMove = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      if (!map.current || !popup.current || !e.features?.[0]) return;

      const feature = e.features[0];
      const properties = feature.properties as PrisonFeatureProperties;
      const attributeToShow = selectedAttribute || 'final_risk_score_pcntl';

      // Get coordinates - handle both points and polygons
      let coordinates: [number, number];
      if (feature.geometry.type === 'Point') {
        coordinates = (feature.geometry.coordinates as number[]).slice() as [number, number];
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const centroid = calculatePolygonCentroid(feature.geometry.coordinates as number[][][]);
        coordinates = centroid;
      } else {
        return; // Skip unsupported geometry types
      }

      // Handle world wrapping for zoomed out maps
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const description = createPrisonPopupContent(properties, attributeToShow, selectedComponent);

      // Update popup position and content
      popup.current.setLngLat(coordinates).setHTML(description).addTo(map.current);
    };

    const handleMouseLeave = () => {
      // Only remove hover popup, not click popup
      if (popup.current && popup.current.isOpen()) {
        popup.current.remove();
      }
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    };

    const handleClick = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      if (!map.current || !e.features?.[0]) return;

      const feature = e.features[0];
      const properties = feature.properties as PrisonFeatureProperties;
      const attributeToShow = selectedAttribute || 'final_risk_score_pcntl';

      console.log('Feature clicked:', {
        name: properties.NAME,
        component: selectedComponent,
        attribute: attributeToShow,
        value: properties[attributeToShow]
      });

      // Remove any existing click popup before creating new one
      if (clickPopup.current && clickPopup.current.isOpen()) {
        clickPopup.current.remove();
      }

      // Also remove hover popup when click happens
      if (popup.current && popup.current.isOpen()) {
        popup.current.remove();
      }

      // Get coordinates - handle both points and polygons
      let coordinates: [number, number];
      if (feature.geometry.type === 'Point') {
        coordinates = (feature.geometry.coordinates as number[]).slice() as [number, number];
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const centroid = calculatePolygonCentroid(feature.geometry.coordinates as number[][][]);
        coordinates = centroid;
      } else {
        return; // Skip unsupported geometry types
      }

      // Handle world wrapping for zoomed out maps
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Create new click popup with close button - no anchor specified allows automatic positioning
      clickPopup.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'custom-popup',
        offset: 5,
        maxWidth: '300px'
      });

      const description = createPrisonPopupContent(properties, attributeToShow, selectedComponent);
      clickPopup.current.setLngLat(coordinates).setHTML(description).addTo(map.current);

      // When popup is closed, clear the reference
      clickPopup.current.on('close', () => {
        clickPopup.current = null;
      });
    };

    // Add event listeners using best practices
    layers.forEach(layer => {
      // Use mouseenter for cursor changes
      map.current!.on("mouseenter", layer as any, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      // Use mousemove for popup updates (handles overlapping features better)
      map.current!.on("mousemove", layer as any, handleMouseMove);

      // Use mouseleave for cleanup
      map.current!.on("mouseleave", layer as any, handleMouseLeave);

      // Use click for persistent popups
      map.current!.on("click", layer as any, handleClick);
    });
  };

  const setupSubbasinPopupHandlers = () => {
    if (!map.current) return;

    console.log('Setting up subbasin popup handlers...', { projectId });

    // Clean up existing popups and listeners
    if (popup.current && popup.current.isOpen()) {
      popup.current.remove();
    }

    if (clickPopup.current && clickPopup.current.isOpen()) {
      clickPopup.current.remove();
      clickPopup.current = null;
    }

    // Create hover popup with automatic positioning
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 5
    });

    // Handler for mousemove (best practice for overlapping features)
    const handleMouseMove = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      if (!map.current || !popup.current || !e.features?.[0]) return;

      const feature = e.features[0];
      const properties = feature.properties;

      // Get coordinates from mouse position
      const coordinates = [e.lngLat.lng, e.lngLat.lat] as [number, number];

      // Handle world wrapping
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const description = createSubbasinPopupContent(properties, projectId);
      popup.current.setLngLat(coordinates).setHTML(description).addTo(map.current);
    };

    const handleMouseLeave = () => {
      // Only remove hover popup, not click popup
      if (popup.current && popup.current.isOpen()) {
        popup.current.remove();
      }
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    };

    const handleClick = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      if (!map.current || !e.features?.[0]) return;

      const feature = e.features[0];
      const properties = feature.properties;

      console.log('Subbasin feature clicked:', {
        projectId,
        properties
      });

      // Remove any existing click popup before creating new one
      if (clickPopup.current && clickPopup.current.isOpen()) {
        clickPopup.current.remove();
      }

      // Also remove hover popup when click happens
      if (popup.current && popup.current.isOpen()) {
        popup.current.remove();
      }

      // Get coordinates from mouse position
      const coordinates = [e.lngLat.lng, e.lngLat.lat] as [number, number];

      // Handle world wrapping
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Create new click popup with close button
      clickPopup.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'custom-popup',
        offset: 5,
        maxWidth: '300px'
      });

      const description = createSubbasinPopupContent(properties, projectId);
      clickPopup.current.setLngLat(coordinates).setHTML(description).addTo(map.current);

      // When popup is closed, clear the reference
      clickPopup.current.on('close', () => {
        clickPopup.current = null;
      });
    };

    // Use mouseenter for cursor changes
    map.current.on('mouseenter', 'subbasin-fill-layer', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    // Use mousemove for popup updates (better for overlapping features)
    map.current.on('mousemove', 'subbasin-fill-layer', handleMouseMove);

    // Use mouseleave for cleanup
    map.current.on('mouseleave', 'subbasin-fill-layer', handleMouseLeave);

    // Use click for persistent popups
    map.current.on('click', 'subbasin-fill-layer', handleClick);
  };

  const setupPopupHandlers = () => {
    if (projectId === 'prison-ej') {
      setupPrisonPopupHandlers();
    } else if (projectId === 'cuyama-basin' || projectId === 'yuba-recharge' || projectId === 'watershed-hub') {
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
