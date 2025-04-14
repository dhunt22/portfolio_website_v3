// map-proxy.js - Helper script for map resources
// This script handles CORS and CSP issues with map tile services

(function() {
  // Check if running in browser
  if (typeof window === 'undefined') return;

  // Original fetch API
  const originalFetch = window.fetch;

  // Override fetch to handle map tile requests
  window.fetch = async function(url, options) {
    // If this is a map tile request that might fail due to CSP
    if (typeof url === 'string' && 
        (url.includes('openstreetmap.org') || 
         url.includes('openfreemap.org') || 
         url.includes('maptiler') || 
         url.includes('mapbox'))) {
      
      // Log for debugging
      console.log('Map resource fetch intercepted:', url);
      
      try {
        // Try using original fetch first
        return await originalFetch(url, options);
      } catch (error) {
        console.warn('Map resource fetch failed, using Netlify proxy:', error);
        
        // If original fetch fails due to CSP, use our Netlify function proxy
        const proxyUrl = `/.netlify/functions/map-proxy?url=${encodeURIComponent(url)}`;
        return originalFetch(proxyUrl, options);
      }
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
  };
  
  // Add a global helper for map libraries to use
  window.mapProxyUrl = function(url) {
    return `/.netlify/functions/map-proxy?url=${encodeURIComponent(url)}`;
  };
  
  // Initialize
  console.log('Map proxy script initialized');
})();
