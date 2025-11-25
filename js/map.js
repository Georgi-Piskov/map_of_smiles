/**
 * Map Module
 * Handles Leaflet map initialization and user location
 */

const MapModule = (function() {
    let map = null;
    let userMarker = null;
    let userPosition = null;
    let watchId = null;
    let storyMarkers = [];
    
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
        
        // Start watching user location
        startLocationWatch();
        
        // Load stories when map moves
        map.on('moveend', onMapMove);
        
        return map;
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
        
        // Still load stories for default location
        StoriesModule.loadNearby(
            CONFIG.map.defaultCenter[0],
            CONFIG.map.defaultCenter[1]
        );
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
            .addTo(map)
            .bindPopup(createPopupContent(story));
        
        storyMarkers.push({ id: story.id, marker });
        
        return marker;
    }
    
    /**
     * Create custom icon for story marker
     */
    function createStoryIcon(emotion) {
        const emoji = CONFIG.emotionIcons[emotion] || CONFIG.emotionIcons.default;
        
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            ">${emoji}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
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
        
        return `
            <div class="story-popup">
                <span class="emotion-tag">${emoji} ${story.emotion || 'story'}</span>
                <p class="story-text">${escapeHtml(story.text)}</p>
                ${date ? `<span class="story-date">${date}</span>` : ''}
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
        storyMarkers.forEach(({ marker }) => map.removeLayer(marker));
        storyMarkers = [];
    }
    
    /**
     * Check if marker already exists
     */
    function hasMarker(storyId) {
        return storyMarkers.some(m => m.id === storyId);
    }
    
    /**
     * Get current user position
     */
    function getUserPosition() {
        return userPosition;
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
        getMap
    };
})();
