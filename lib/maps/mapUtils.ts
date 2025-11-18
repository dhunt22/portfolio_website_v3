// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/mapUtils.ts
// Utility functions for map operations

import maplibregl, { MapMouseEvent, MapGeoJSONFeature } from 'maplibre-gl';

export interface PrisonFeatureProperties {
  NAME: string;
  // Updated column names from new geojson files
  final_risk_score_pcntl: number;
  climate_score: number;
  exposure_score: number;
  effects_score: number;
  // Individual component properties
  lst_avg_pcntl: number;
  percent_tree_cover_pcntl: number;
  wildfire_risk_pcntl: number;
  flood_risk_pcntl: number;
  mean_ozone_pcntl: number;
  avg_pm25_pcntl: number;
  pesticides_pcntl: number;
  trafficProx_pcntl: number;
  npl_prox_pcntl: number;
  rmp_prox_pcntl: number;
  haz_prox_pcntl: number;
  FACILIT: string | number;  // FACILITYID
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

// Risk attribute labels (using new geojson column names)
export const RISK_ATTRIBUTES = {
  "final_risk_score_pcntl": "Overall Risk Score",
  "climate_score": "Climate Risk",
  "effects_score": "Effects Risk",
  "exposure_score": "Exposure Risk"
} as const;

export type RiskAttribute = keyof typeof RISK_ATTRIBUTES;

// Individual component mappings (using new geojson column names)
export const COMPONENT_COLUMNS = {
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
  'hazwaste': 'haz_prox_pcntl'
} as const;

export function getAttributeLabel(attr: RiskAttribute): string {
  return RISK_ATTRIBUTES[attr] || "Risk Score";
}

// Get human-readable label for component indicators
export function getComponentLabel(componentId: string): string {
  const COMPONENT_LABELS: Record<string, string> = {
    'overall': 'Overall Risk Score',
    'heat': 'Heat Index',
    'canopy': 'Canopy Cover',
    'wildfire': 'Wildfire Risk',
    'flood': 'Flood Hazard',
    'ozone': 'Ozone Levels',
    'pm25': 'PM 2.5 Particulates',
    'pesticide': 'Pesticide Use',
    'traffic': 'Traffic Density',
    'superfund': 'Superfund Sites',
    'rmp': 'Risk Management Plan Facilities',
    'hazwaste': 'Hazardous Waste Sites'
  };
  return COMPONENT_LABELS[componentId] || componentId;
}

// Color scale for risk visualization
export function createRiskColorScale(attribute: RiskAttribute): any[] {
  return [
    "case",
    ["==", ["get", attribute], null], "#cccccc", // Gray for null values
    [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", attribute], 0], // Use 0 if null
      0, "#2ecc71",   // Green for low risk
      50, "#f1c40f",  // Yellow for medium risk
      100, "#e74c3c"  // Red for high risk
    ]
  ];
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Component-specific gradient color scale
export function createComponentColorScale(componentId: string, componentColor: string): any[] {
  const column = COMPONENT_COLUMNS[componentId as keyof typeof COMPONENT_COLUMNS];
  if (!column) {
    // Fallback to overall risk
    return createRiskColorScale('final_risk_score_pcntl');
  }

  // Create white to component color gradient with null value handling
  return [
    "case",
    ["==", ["get", column], null], "#cccccc", // Gray for null values
    [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", column], 0], // Use 0 if null
      0, "#ffffff",                          // White for no risk
      25, hexToRgba(componentColor, 0.25),   // Light component color for low risk
      50, hexToRgba(componentColor, 0.5),    // Medium component color for medium risk
      75, hexToRgba(componentColor, 0.75),   // Strong component color for high risk
      100, componentColor                    // Full component color for maximum risk
    ]
  ];
}

// Enhanced color scale function that uses component color when available
export function createEnhancedColorScale(componentId?: string, componentColor?: string): any[] {
  if (componentId && componentColor && componentId !== 'overall') {
    return createComponentColorScale(componentId, componentColor);
  }

  // For overall or when no component specified, use overall risk scale
  return createRiskColorScale('final_risk_score_pcntl');
}

// Create dynamic paint properties based on selected attribute
export function createDynamicPaintProperties(attribute: RiskAttribute) {
  return {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["get", attribute],
      0, ["interpolate", ["linear"], ["zoom"], 3, 3, 6, 6, 10, 9],
      50, ["interpolate", ["linear"], ["zoom"], 3, 5, 6, 9, 10, 13],
      100, ["interpolate", ["linear"], ["zoom"], 3, 7, 6, 12, 10, 16]
    ],
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["get", attribute],
      0, 1,
      50, 1.5,
      100, 2
    ],
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["get", attribute],
      0, 0.7,
      50, 0.85,
      100, 0.95
    ]
  };
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
  if (!(getPrisonId as any).hasLogged) {
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
    (getPrisonId as any).hasLogged = true;
  }
  
  console.warn('Prison feature missing all ID fields:', prison.properties.NAME);
  return prison.properties.NAME; // Last resort fallback
}

// Add static property to track logging
(getPrisonId as any).hasLogged = false;

// Popup content generators
export function createPrisonPopupContent(
  properties: PrisonFeatureProperties,
  attribute: RiskAttribute,
  componentId?: string
): string {
  // If componentId is provided, use it to get the specific indicator column and label
  let column: string;
  let label: string;
  let value: number;

  if (componentId && componentId !== 'overall') {
    column = COMPONENT_COLUMNS[componentId as keyof typeof COMPONENT_COLUMNS];
    label = getComponentLabel(componentId);
    value = properties[column] || 0;
  } else {
    // Default to the selected attribute (overall risk)
    column = attribute;
    label = getAttributeLabel(attribute);
    value = properties[attribute] || 0;
  }

  return `
    <div style="padding: 4px;">
      <strong style="font-size: 14px; color: #000000;">${properties.NAME}</strong><br/>
      <span style="font-size: 12px; color: #6b7280;">${properties.CITY}, ${properties.STATE}</span><br/>
      <div style="margin-top: 8px; font-weight: 600; font-size: 12px; color: #374151;">${label}</div>
      <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${Math.round(value)} percentile</div>
    </div>
  `;
}

export function createSubbasinPopupContent(properties: any, projectId?: string): string {
  // Handle watershed-hub project with different properties
  if (projectId === 'watershed-hub') {
    return `
      <strong style="color: #000000;">${properties.Name}</strong><br/>
      ${properties.HUC8}
    `;
  }

  // Default for other subbasin projects
  return `
    <strong style="color: #000000;">${properties.Basin_Subbasin_Name}</strong><br/>
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
        map.setFilter(layerId, filter as any);
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