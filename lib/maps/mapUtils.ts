// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/mapUtils.ts
// Utility functions for map operations

import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';

export interface PrisonFeatureProperties {
  NAME: string;
  CITY: string;
  STATE: string;
  fnl_rs_: number;
  clmt_sc: number;
  expsr_s: number;
  effcts_: number;
  OBJECTID: string | number;
  [key: string]: any;
}

export interface PrisonFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: PrisonFeatureProperties;
  id?: string | number;
}

// Risk attribute labels
export const RISK_ATTRIBUTES = {
  "fnl_rs_": "Overall Risk Score",
  "clmt_sc": "Climate Risk",
  "effcts_": "Effects Risk",
  "expsr_s": "Exposure Risk"
} as const;

export type RiskAttribute = keyof typeof RISK_ATTRIBUTES;

export function getAttributeLabel(attr: RiskAttribute): string {
  return RISK_ATTRIBUTES[attr] || "Risk Score";
}

// Color scale for risk visualization
export function createRiskColorScale(attribute: RiskAttribute): any[] {
  return [
    "interpolate",
    ["linear"],
    ["get", attribute],
    0, "#2ecc71",   // Green for low risk
    50, "#f1c40f",  // Yellow for medium risk
    100, "#e74c3c"  // Red for high risk
  ];
}

// Fixed filter utilities with proper type handling
export function createTopNFilter(topPrisonIds: (string | number)[], idField: string = 'OBJECTID'): any[] {
  // Ensure all IDs are strings for consistency
  const stringIds = topPrisonIds.map(id => String(id));
  console.log('Creating filter with IDs:', stringIds, 'using field:', idField);
  
  return [
    "in", 
    ["to-string", ["get", idField]], 
    ["literal", stringIds]
  ];
}

// Determine the correct ID field to use for filtering
export function determineIdField(features: PrisonFeature[]): string {
  if (!features || features.length === 0) return 'OBJECTID';
  
  const sampleFeature = features[0];
  const possibleFields = ['OBJECTID', 'objectid', 'ObjectId', 'id', 'ID', 'FID', 'fid'];
  
  for (const field of possibleFields) {
    if (field in sampleFeature.properties && 
        sampleFeature.properties[field] !== null && 
        sampleFeature.properties[field] !== undefined && 
        sampleFeature.properties[field] !== '') {
      console.log('Determined ID field:', field);
      return field;
    }
  }
  
  console.warn('No valid ID field found, falling back to OBJECTID');
  return 'OBJECTID';
}

export function sortPrisonsByRisk(prisons: PrisonFeature[], attribute: RiskAttribute, count: number): PrisonFeature[] {
  const sorted = [...prisons]
    .filter(prison => {
      const riskValue = prison.properties[attribute];
      return riskValue !== null && riskValue !== undefined && !isNaN(Number(riskValue));
    })
    .sort((a, b) => (b.properties[attribute] || 0) - (a.properties[attribute] || 0))
    .slice(0, count);
  
  console.log(`Sorted top ${count} prisons by ${attribute}:`, sorted.map(p => ({
    name: p.properties.NAME,
    risk: p.properties[attribute],
    objectId: p.properties.OBJECTID
  })));
  
  return sorted;
}

// Get prison ID with fallback logic
export function getPrisonId(prison: PrisonFeature): string | number {
  // Try multiple possible ID field names (reduced logging)
  const possibleIds = [
    prison.properties.OBJECTID,
    prison.properties.objectid,
    prison.properties.ObjectId,
    prison.properties.id,
    prison.properties.ID,
    prison.properties.FID,
    prison.properties.fid,
    prison.id
  ];
  
  for (const id of possibleIds) {
    if (id !== null && id !== undefined && id !== '') {
      return id;
    }
  }
  
  // Only log once for first failure to reduce console noise
  if (!getPrisonId.hasLogged) {
    console.log('Prison feature structure for debugging:', {
      properties: Object.keys(prison.properties),
      sampleName: prison.properties.NAME,
      featureId: prison.id,
      hasOBJECTID: 'OBJECTID' in prison.properties,
      firstFeatureValues: {
        OBJECTID: prison.properties.OBJECTID,
        objectid: prison.properties.objectid,
        id: prison.properties.id,
        FID: prison.properties.FID
      }
    });
    getPrisonId.hasLogged = true;
  }
  
  console.warn('Prison feature missing all ID fields:', prison.properties.NAME);
  return prison.properties.NAME; // Last resort fallback
}

// Add static property to track logging
(getPrisonId as any).hasLogged = false;

// Popup content generators
export function createPrisonPopupContent(properties: PrisonFeatureProperties, attribute: RiskAttribute): string {
  return `
    <strong>${properties.NAME}</strong><br/>
    ${properties.CITY}, ${properties.STATE}<br/>
    ${getAttributeLabel(attribute)}: ${Math.round(properties[attribute] || 0)}
  `;
}

export function createSubbasinPopupContent(properties: any): string {
  return `
    <strong>${properties.Basin_Subbasin_Name}</strong><br/>
    Basin Code: ${properties.Basin_Subbasin_Number}<br/>
    Area (acres): ${properties.Area_Acres}
  `;
}

// Geometry utilities
export function calculatePolygonCentroid(coordinates: number[][][]): [number, number] {
  const bounds = new maplibregl.LngLatBounds();
  coordinates[0].forEach((coord) => {
    bounds.extend(coord as [number, number]);
  });
  return [bounds.getCenter().lng, bounds.getCenter().lat];
}

// Layer management utilities
export function applyFilterToLayers(map: maplibregl.Map, layerIds: string[], filter: any[] | null): void {
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      try {
        console.log(`Applying filter to layer ${layerId}:`, filter);
        map.setFilter(layerId, filter);
      } catch (error) {
        console.error(`Error applying filter to layer ${layerId}:`, error);
      }
    }
  });
}

// Enhanced layer update function that ensures immediate visual updates
export function updateLayerPaintPropertiesBatch(
  map: maplibregl.Map, 
  updates: Array<{layerId: string; property: string; value: any}>,
  forceRepaint: boolean = true
): void {
  // Apply all paint property updates first
  updates.forEach(update => {
    updateLayerPaintProperty(map, update.layerId, update.property, update.value);
  });
  
  if (forceRepaint) {
    // Force immediate repaint with multiple strategies
    map.triggerRepaint();
    
    // Additional repaint strategies for stubborn cases
    setTimeout(() => {
      if (map.isStyleLoaded()) {
        map.triggerRepaint();
      }
    }, 0);
    
    requestAnimationFrame(() => {
      if (map.isStyleLoaded()) {
        map.triggerRepaint();
      }
    });
  }
}

export function updateLayerPaintProperty(map: maplibregl.Map, layerId: string, property: string, value: any): void {
  if (map.getLayer(layerId)) {
    try {
      console.log(`Updating ${layerId} ${property}`);
      map.setPaintProperty(layerId, property, value);
      
      // Verify the property was actually set
      const updatedValue = map.getPaintProperty(layerId, property);
      if (JSON.stringify(updatedValue) !== JSON.stringify(value)) {
        console.warn(`Paint property update may have failed for ${layerId}:`, {
          expected: value,
          actual: updatedValue
        });
      }
    } catch (error) {
      console.error(`Error updating paint property for layer ${layerId}:`, error);
    }
  } else {
    console.warn(`Layer ${layerId} not found when trying to update ${property}`);
  }
}

// Map bounds utilities
export function fitMapToGeoJSON(map: maplibregl.Map, sourceId: string, padding: number = 50): void {
  map.once('idle', () => {
    try {
      const bounds = new maplibregl.LngLatBounds();
      const source = map.getSource(sourceId);
      
      if (source && source.type === 'geojson') {
        const data = (source as any).getData?.() || (source as any)._data;
        if (data?.features?.length > 0) {
          data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
                bounds.extend(coord);
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach((polygon: any) => {
                polygon[0].forEach((coord: [number, number]) => {
                  bounds.extend(coord);
                });
              });
            }
          });
          map.fitBounds(bounds, { padding });
        }
      }
    } catch (error) {
      console.error('Error fitting to bounds:', error);
    }
  });
}

// Zoom-based opacity configurations
export const ZOOM_OPACITY_CONFIG = {
  circle: {
    opacity: [
      "interpolate",
      ["linear"],
      ["zoom"],
      10, 1.0,
      12, 0.6,
      13, 0.3,
      14, 0
    ],
    strokeOpacity: [
      "interpolate", 
      ["linear"],
      ["zoom"],
      10, 1.0,
      12, 0.6,
      13, 0.3,
      14, 0
    ]
  },
  radius: [
    "interpolate",
    ["linear"],
    ["zoom"],
    3, 4,
    10, 8,
    14, 12
  ]
};