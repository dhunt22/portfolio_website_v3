// This file provides runtime configuration for Netlify
window.netlifyConfig = {
  // Allow communication with Netlify frames
  allowFrames: true,
  
  // Initialize any Netlify-specific configuration
  init: function() {
    // Add event listeners for postMessage communication
    window.addEventListener('message', function(event) {
      // Only accept messages from trusted domains
      if (event.origin === 'https://app.netlify.com') {
        try {
          // Process messages from Netlify
          console.log('Received message from Netlify:', event.data);
        } catch (e) {
          console.error('Error processing Netlify message:', e);
        }
      }
    }, false);
    
    console.log('Netlify runtime configuration initialized');
  }
};

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    if (window.netlifyConfig && typeof window.netlifyConfig.init === 'function') {
      window.netlifyConfig.init();
    }
  });
}
