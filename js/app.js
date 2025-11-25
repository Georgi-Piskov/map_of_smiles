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
        
        console.log('✅ Map of Smiles ready!');
    }
    
    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
