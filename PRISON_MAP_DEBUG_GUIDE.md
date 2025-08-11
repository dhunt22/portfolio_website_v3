# Prison Map Filtering Debug Guide

## Issue Summary
The prison map filtering for "Top 10 Highest Risk" was failing with the error:
```
layers.prison-polygons.filter[2]: invalid value
```

## Root Cause
The MapLibre GL filter expression was receiving mixed data types (strings and numbers) for the OBJECTID field, which caused the filter comparison to fail.

## Fixes Applied

### 1. **Enhanced Type Safety** (`lib/maps/mapUtils.ts`)
- Updated `PrisonFeatureProperties` interface to accept `OBJECTID: string | number`
- Updated `PrisonFeature` interface to accept `id?: string | number`
- Added proper type coercion in filter creation

### 2. **Fixed Filter Expression** (`createTopNFilter`)
```typescript
// OLD (problematic):
['in', ['get', 'OBJECTID'], ['literal', topPrisonIds]]

// NEW (fixed):
[
  "in", 
  ["to-string", ["get", "OBJECTID"]], 
  ["literal", stringIds]
]
```

### 3. **Improved ID Extraction** (`getPrisonId`)
- Added fallback logic for extracting prison IDs
- Consistent string conversion for all IDs
- Better error handling for missing IDs

### 4. **Enhanced Debugging** 
- Added comprehensive console logging
- Enhanced error messages with specific error details
- Visual error state in the component

## Debug Console Messages
When the filtering works correctly, you should see:

1. **Map Initialization:**
```
Initializing map for project: prison-ej
Setting up prison layers...
```

2. **Data Loading:**
```
Prison GeoJSON loaded: {featureCount: XXX, sampleFeature: {...}}
Prison data loaded for filtering: XXX features
Prison layers setup complete
```

3. **Filter Application:**
```
Applying top 10 filter for attribute: fnl_rs_
Sorted top 10 prisons by fnl_rs_: [{name: "...", risk: XX, objectId: "..."}]
Top prison IDs for filter: ["1", "2", "3", ...]
Creating filter with IDs: ["1", "2", "3", ...]
Applying filter to layer prison-polygons: ["in", ["to-string", ["get", "OBJECTID"]], ["literal", ["1", "2", "3", ...]]]
```

## Testing Steps

1. **Open the Portfolio Page**
   - Navigate to the Environmental Justice for Prisons project
   - Check browser console for initialization messages

2. **Test Filter Controls**
   - Click the filter button (second icon in top-right)
   - Select "Top 10 Highest Risk"
   - Observe console logs and map changes

3. **Test Attribute Changes**
   - Click the category button (first icon in top-right)
   - Switch between different risk categories
   - Verify colors update and filtering persists

4. **Expected Behavior**
   - Map should show only 10 facilities when filter is applied
   - Facilities should be visually distinct (colored by risk level)
   - Console should show debug messages without errors
   - Map should respond to zoom and pan normally

## Troubleshooting

### If filtering still doesn't work:
1. Check if GeoJSON data is loading properly
2. Verify OBJECTID field exists in the data
3. Check network tab for data loading issues

### If console shows data structure errors:
1. Look for the "Prison GeoJSON loaded" message
2. Check the `sampleFeature` structure
3. Verify the OBJECTID format in your data

### Common Issues:
- **Data not loading**: Check GeoJSON file paths in `mapConfigurations.ts`
- **Filter not applying**: Check OBJECTID field name in your GeoJSON
- **Visual glitches**: Clear browser cache and reload

## Performance Notes
- Filtering is now more efficient with proper type handling
- Debugging can be disabled by removing console.log statements
- Error boundary prevents crashes and shows helpful error messages

The refactored code should now handle the filtering correctly while providing much better debugging information.
