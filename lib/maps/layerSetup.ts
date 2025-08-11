// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/layerSetup.ts
// Layer setup utilities for different map types

import maplibregl from 'maplibre-gl';
import { MapConfig } from './mapConfigurations';
import { createRiskColorScale, ZOOM_OPACITY_CONFIG, fitMapToGeoJSON } from './mapUtils';

// Define RiskAttribute locally to avoid circular imports
type RiskAttribute = 'fnl_rs_' | 'clmt_sc' | 'effcts_' | 'expsr_s';

export const setupPrisonLayers = (
  map: maplibregl.Map, 
  config: MapConfig, 
  selectedAttribute: RiskAttribute,
  onDataLoad?: (data: any[]) => void
) => {
  if (!config.geojsonPath || !config.pointsPath) return;

  // Fetch and store prison data for filtering
  fetch(config.geojsonPath)
    .then(response => response.json())
    .then(data => {
      console.log('Prison GeoJSON loaded:', {
        featureCount: data.features?.length,
        sampleFeature: data.features?.[0] ? {
          properties: {
            NAME: data.features[0].properties.NAME,
            OBJECTID: data.features[0].properties.OBJECTID,
            [selectedAttribute]: data.features[0].properties[selectedAttribute],
            // Debug: Show all property keys
            allPropertyKeys: Object.keys(data.features[0].properties)
          },
          id: data.features[0].id,
          // Debug: Show full first feature for analysis
          fullFeature: data.features[0]
        } : null
      });
      
      // Debug: Log property names from first few features
      if (data.features && data.features.length > 0) {
        console.log('First 3 features property analysis:');
        data.features.slice(0, 3).forEach((feature, index) => {
          console.log(`Feature ${index}:`, {
            properties: Object.keys(feature.properties),
            hasOBJECTID: 'OBJECTID' in feature.properties,
            hasObjectId: 'ObjectId' in feature.properties,
            hasId: 'id' in feature.properties,
            hasFID: 'FID' in feature.properties,
            NAME: feature.properties.NAME,
            featureId: feature.id
          });
        });
      }
      
      if (onDataLoad) onDataLoad(data.features || []);
    })
    .catch(error => console.error('Error loading prison data:', error));

  // Add polygon source
  map.addSource("prisons", {
    type: "geojson",
    data: config.geojsonPath,
    generateId: true
  });

  // Add points source
  map.addSource("centroids", {
    type: "geojson",
    data: config.pointsPath,
    generateId: true
  });

  const colorScale = createRiskColorScale(selectedAttribute);

  // Add fill layer for polygons
  map.addLayer({
    id: "prison-polygons",
    type: "fill",
    source: "prisons",
    paint: {
      "fill-color": colorScale,
      "fill-opacity": 0.5
    }
  });

  // Add outline layer
  map.addLayer({
    id: "prison-outlines",
    type: "line",
    source: "prisons",
    paint: {
      "line-color": "#ffffff",
      "line-width": 1
    }
  });

  // Add highlight layer for higher zoom levels
  map.addLayer({
    id: "prison-polygons-highlight",
    type: "fill",
    source: "prisons",
    paint: {
      "fill-color": colorScale,
      "fill-opacity": 0.2
    },
    minzoom: 6
  });
  
  // Add circle layer for points with zoom-based opacity
  map.addLayer({
    id: "prison-centroids",
    type: "circle",
    source: "centroids",
    paint: {
      "circle-radius": ZOOM_OPACITY_CONFIG.radius,
      "circle-color": colorScale,
      "circle-opacity": ZOOM_OPACITY_CONFIG.circle.opacity,
      "circle-stroke-width": 0.4,
      "circle-stroke-color": "#000000",
      "circle-stroke-opacity": ZOOM_OPACITY_CONFIG.circle.strokeOpacity,
    }
  });

  // Add symbol layer for enhanced visibility
  map.addLayer({
    id: "prison-symbol-layer",
    type: "symbol",
    source: "centroids",
    layout: {
      "icon-image": "circle-11",
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 0.8,
        6, 1.2
      ],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true
    },
    paint: {
      "icon-color": colorScale,
      "icon-halo-width": 0.4,
      "icon-halo-color": "#000000"
    }
  });

  console.log('Prison layers setup complete');
};

export const setupSubbasinLayers = (
  map: maplibregl.Map,
  config: MapConfig
) => {
  if (!config.geojsonPath || !config.dataLayer) return;

  // Add the subbasin GeoJSON source
  map.addSource('subbasin-source', {
    type: 'geojson',
    data: config.geojsonPath
  });
  
  // Add fill layer for subbasins
  map.addLayer({
    id: 'subbasin-fill-layer',
    type: 'fill',
    source: 'subbasin-source',
    paint: {
      'fill-color': config.dataLayer.color,
      'fill-opacity': config.dataLayer.opacity,
      'fill-outline-color': config.dataLayer.outlineColor
    }
  });
  
  // Add outline layer
  map.addLayer({
    id: 'subbasin-outline-layer',
    type: 'line',
    source: 'subbasin-source',
    paint: {
      'line-color': config.dataLayer.outlineColor || '#000000',
      'line-width': config.dataLayer.strokeWidth || 1.5
    }
  });

  // Fit map to GeoJSON bounds
  fitMapToGeoJSON(map, 'subbasin-source');
};

export const addMapControls = (map: maplibregl.Map) => {
  // Add navigation controls
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  
  // Add attribution
  map.addControl(new maplibregl.AttributionControl({
    customAttribution: 'Map data &copy; OpenStreetMap contributors'
  }));
};
