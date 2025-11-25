/**
 * Map Module
 * Handles Leaflet map initialization and user location
 */

const MapModule = (function() {
    let map = null;
    let userMarker = null;
    let userPosition = null;
    let selectedPosition = null;  // Position selected by clicking on map
    let selectionMarker = null;   // Marker for selected position
    let watchId = null;
    let storyMarkers = [];
    let markerClusterGroup = null;  // Cluster group for story markers
    
    /**
     * Initialize the Leaflet map
     */
    function init() {
        // Create map
        map = L.map('map', {
            center: CONFIG.map.defaultCenter,
            zoom: CONFIG.map.defaultZoom,
            minZoom: CONFIG.map.minZoom,
            maxZoom: CONFIG.map.maxZoom,
            zoomControl: true
        });
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer(CONFIG.map.tileLayer, {
            attribution: CONFIG.map.attribution
        }).addTo(map);
        
        // Move zoom control to bottom left on mobile
        if (window.innerWidth < 768) {
            map.zoomControl.setPosition('bottomleft');
        }
        
        // Initialize marker cluster group
        markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 18
        });
        map.addLayer(markerClusterGroup);
        
        // Click on map to select location for story (with delay to allow popup to open first)
        map.on('click', function(e) {
            // Longer delay to let marker click events and popup open first
            setTimeout(() => {
                // Don't trigger if a popup is open or was recently opened
                if (document.querySelector('.leaflet-popup') || map._popup) {
                    return;
                }
                onMapClick(e);
            }, 300);
        });
        
        // Start watching user location
        startLocationWatch();
        
        // Load stories when map moves
        map.on('moveend', onMapMove);
        
        return map;
    }
    
    /**
     * Handle click on map - select location for new story
     */
    function onMapClick(e) {
        // Ignore clicks on markers or popups
        if (e.originalEvent && e.originalEvent.target) {
            const target = e.originalEvent.target;
            // Check if click was on a marker, popup, or cluster
            if (target.closest('.story-marker-pin') || 
                target.closest('.leaflet-popup') || 
                target.closest('.marker-cluster') ||
                target.closest('.leaflet-marker-icon')) {
                return;
            }
        }
        
        const { lat, lng } = e.latlng;
        
        // Set selected position
        selectedPosition = { lat, lng };
        
        // Remove previous selection marker
        if (selectionMarker) {
            map.removeLayer(selectionMarker);
        }
        
        // Add selection marker
        selectionMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'selection-marker',
                html: `<div style="
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #FFB347, #FF9F1C);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    box-shadow: 0 4px 15px rgba(255, 159, 28, 0.5);
                    border: 3px solid white;
                    animation: pulse-selection 1.5s infinite;
                ">📍</div>`,
                iconSize: [50, 50],
                iconAnchor: [25, 25]
            })
        }).addTo(map);
        
        // Show prompt to add story
        UI.showLocationSelected(lat, lng);
    }
    
    /**
     * Clear selected position
     */
    function clearSelection() {
        selectedPosition = null;
        if (selectionMarker) {
            map.removeLayer(selectionMarker);
            selectionMarker = null;
        }
    }
    
    /**
     * Start watching user's location
     */
    function startLocationWatch() {
        if (!navigator.geolocation) {
            UI.showStatus('Location not supported by your browser', 'error');
            return;
        }
        
        UI.showStatus('Getting your location...');
        
        // Get initial position
        navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            { enableHighAccuracy: true, timeout: 10000 }
        );
        
        // Watch for position changes
        watchId = navigator.geolocation.watchPosition(
            onLocationSuccess,
            onLocationError,
            { enableHighAccuracy: true, maximumAge: 30000 }
        );
    }
    
    /**
     * Handle successful location update
     */
    function onLocationSuccess(position) {
        const { latitude, longitude, accuracy } = position.coords;
        userPosition = { lat: latitude, lng: longitude, accuracy };
        
        // Update or create user marker
        if (userMarker) {
            userMarker.setLatLng([latitude, longitude]);
        } else {
            userMarker = L.circleMarker([latitude, longitude], {
                radius: 10,
                fillColor: '#4A90D9',
                fillOpacity: 1,
                color: '#FFFFFF',
                weight: 3
            }).addTo(map);
            
            // Add accuracy circle
            L.circle([latitude, longitude], {
                radius: accuracy,
                fillColor: '#4A90D9',
                fillOpacity: 0.1,
                color: '#4A90D9',
                weight: 1
            }).addTo(map);
            
            // Center map on user
            map.setView([latitude, longitude], CONFIG.map.defaultZoom);
        }
        
        UI.hideStatus();
        
        // Load nearby stories
        StoriesModule.loadNearby(latitude, longitude);
    }
    
    /**
     * Handle location error
     */
    function onLocationError(error) {
        let message = 'Unable to get location';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Please enable location access';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location unavailable';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out';
                break;
        }
        
        UI.showStatus(message, 'error');
        
        // Show WebView banner if location failed (likely in-app browser)
        showOpenInBrowserBanner();
        
        // Still load stories for default location
        StoriesModule.loadNearby(
            CONFIG.map.defaultCenter[0],
            CONFIG.map.defaultCenter[1]
        );
    }
    
    /**
     * Show banner to open in real browser when location fails
     */
    function showOpenInBrowserBanner() {
        const banner = document.getElementById('webview-banner');
        if (!banner) return;
        
        // Check if dismissed recently
        const dismissedTime = localStorage.getItem('webviewDismissed');
        if (dismissedTime) {
            const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
            if (hoursSinceDismissed < 1) {
                return;
            }
        }
        
        banner.classList.remove('hidden');
    }
    
    /**
     * Handle map movement (load stories in new area)
     */
    function onMapMove() {
        const center = map.getCenter();
        StoriesModule.loadNearby(center.lat, center.lng);
    }
    
    /**
     * Add a story marker to the map
     */
    function addStoryMarker(story) {
        const icon = createStoryIcon(story.emotion);
        
        const marker = L.marker([story.lat, story.lng], { icon })
            .bindPopup(createPopupContent(story), {
                closeOnClick: false,
                autoClose: false,
                maxWidth: 280,
                minWidth: 200
            });
        
        // Add to cluster group instead of directly to map
        markerClusterGroup.addLayer(marker);
        
        storyMarkers.push({ id: story.id, marker });
        
        return marker;
    }
    
    /**
     * Create custom icon for story marker with pointer/tail
     */
    function createStoryIcon(emotion) {
        const emoji = CONFIG.emotionIcons[emotion] || CONFIG.emotionIcons.default;
        
        return L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="story-marker-pin">
                <div class="marker-bubble">${emoji}</div>
                <div class="marker-tail"></div>
            </div>`,
            iconSize: [44, 56],
            iconAnchor: [22, 56],
            popupAnchor: [0, -56]
        });
    }
    
    /**
     * Create popup HTML content for a story
     */
    function createPopupContent(story) {
        const emoji = CONFIG.emotionIcons[story.emotion] || CONFIG.emotionIcons.default;
        const date = story.created_at 
            ? new Date(story.created_at).toLocaleDateString('bg-BG')
            : '';
        
        // Google Street View URL
        const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${story.lat},${story.lng}`;
        
        return `
            <div class="story-popup">
                <span class="emotion-tag">${emoji} ${story.emotion || 'story'}</span>
                <p class="story-text">${escapeHtml(story.text)}</p>
                ${date ? `<span class="story-date">${date}</span>` : ''}
                <a href="${streetViewUrl}" target="_blank" class="street-view-btn">
                    📍 View Location
                </a>
            </div>
        `;
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Clear all story markers
     */
    function clearMarkers() {
        markerClusterGroup.clearLayers();
        storyMarkers = [];
    }
    
    /**
     * Check if marker already exists
     */
    function hasMarker(storyId) {
        return storyMarkers.some(m => m.id === storyId);
    }
    
    /**
     * Get current user position or selected position
     */
    function getUserPosition() {
        // Prefer selected position if available
        return selectedPosition || userPosition;
    }
    
    /**
     * Get actual user GPS position only
     */
    function getMyPosition() {
        return userPosition;
    }
    
    /**
     * Get selected position (from map click)
     */
    function getSelectedPosition() {
        return selectedPosition;
    }
    
    /**
     * Get map instance
     */
    function getMap() {
        return map;
    }
    
    // Public API
    return {
        init,
        addStoryMarker,
        clearMarkers,
        hasMarker,
        getUserPosition,
        getMyPosition,
        getSelectedPosition,
        clearSelection,
        getMap
    };
})();
