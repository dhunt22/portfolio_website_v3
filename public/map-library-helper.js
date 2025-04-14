// map-library-helper.js - Assists with map library integration
// This script helps patch popular map libraries to work with our proxy

(function() {
  // Check if running in browser
  if (typeof window === 'undefined') return;

  // Wait for document to be ready
  window.addEventListener('DOMContentLoaded', function() {
    // Give the map libraries time to load
    setTimeout(patchMapLibraries, 500);
  });

  function patchMapLibraries() {
    console.log('Initializing map library patches');
    
    // Patch MapLibre if present
    if (window.maplibregl) {
      console.log('Patching MapLibre GL');
      
      // Store original protocol
      const originalProtocol = window.maplibregl.Protocol;
      
      // Override tile loading
      window.maplibregl.Protocol.prototype.transformRequest = function(url, type) {
        // If this is a tile or style request that might face CSP issues
        if ((type === 'Tile' || type === 'Style') && 
            (url.includes('openstreetmap') || url.includes('openfreemap') || 
             url.includes('maptiler') || url.includes('mapbox'))) {
          
          console.log(`MapLibre ${type} request intercepted:`, url);
          
          // Use our proxy
          if (window.mapProxyUrl) {
            return { url: window.mapProxyUrl(url) };
          }
        }
        
        // Otherwise proceed normally
        return { url: url };
      };
    }
    
    // Additional patches for other libraries could go here
    // ...
    
    console.log('Map library patches completed');
  }
})();
