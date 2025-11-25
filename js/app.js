/**
 * Map of Smiles - Main Application
 * A web app showing positive, anonymous stories pinned on a map
 */

(function() {
    'use strict';
    
    /**
     * Initialize the application
     */
    function init() {
        console.log('🗺️ Map of Smiles initializing...');
        
        // Initialize UI first
        UI.init();
        
        // Initialize map
        MapModule.init();
        
        // Register service worker for PWA
        registerServiceWorker();
        
        console.log('✅ Map of Smiles ready!');
    }
    
    /**
     * Register Service Worker for PWA functionality
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registered:', registration.scope);
                    })
                    .catch((error) => {
                        console.log('❌ Service Worker registration failed:', error);
                    });
            });
        }
    }
    
    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
