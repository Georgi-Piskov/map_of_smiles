/**
 * Stories Module
 * Handles loading and submitting stories via Supabase and n8n
 */

const StoriesModule = (function() {
    let loadedStoryIds = new Set();
    let isLoading = false;
    
    /**
     * Load stories near a location (direct from Supabase)
     */
    async function loadNearby(lat, lng, radius = CONFIG.stories.loadRadius) {
        if (isLoading) return;
        
        // Check if Supabase is configured
        if (CONFIG.supabase.url === 'YOUR_SUPABASE_URL') {
            console.warn('Supabase not configured. Add your credentials to config.js');
            return;
        }
        
        isLoading = true;
        
        try {
            // Calculate bounding box for simple geo query
            // 1 degree ≈ 111km at equator
            const deltaLat = radius / 111000;
            const deltaLng = radius / (111000 * Math.cos(lat * Math.PI / 180));
            
            const minLat = lat - deltaLat;
            const maxLat = lat + deltaLat;
            const minLng = lng - deltaLng;
            const maxLng = lng + deltaLng;
            
            // Build Supabase REST API URL with filters
            const url = new URL(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.tableName}`);
            url.searchParams.append('select', '*');
            url.searchParams.append('status', 'eq.approved');
            url.searchParams.append('lat', `gte.${minLat}`);
            url.searchParams.append('lat', `lte.${maxLat}`);
            url.searchParams.append('lng', `gte.${minLng}`);
            url.searchParams.append('lng', `lte.${maxLng}`);
            url.searchParams.append('order', 'created_at.desc');
            url.searchParams.append('limit', '100');
            
            const response = await fetch(url, {
                headers: {
                    'apikey': CONFIG.supabase.anonKey,
                    'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const stories = await response.json();
            
            // Add markers for new stories
            stories.forEach(story => {
                if (!loadedStoryIds.has(story.id) && !MapModule.hasMarker(story.id)) {
                    MapModule.addStoryMarker(story);
                    loadedStoryIds.add(story.id);
                }
            });
            
            console.log(`Loaded ${stories.length} stories`);
            
        } catch (error) {
            console.error('Error loading stories:', error);
        } finally {
            isLoading = false;
        }
    }
    
    /**
     * Submit a new story via n8n webhook
     */
    async function submit(text, emotion) {
        // Check if n8n is configured
        if (CONFIG.n8n.submitWebhook === 'YOUR_N8N_WEBHOOK_URL') {
            UI.showToast('Backend not configured', 'error');
            console.error('n8n webhook not configured. Add your webhook URL to config.js');
            return { success: false, message: 'Backend not configured' };
        }
        
        const position = MapModule.getUserPosition();
        
        if (!position) {
            UI.showToast('Location required to share a story', 'error');
            return { success: false, message: 'Location not available' };
        }
        
        const storyData = {
            lat: position.lat,
            lng: position.lng,
            text: text.trim(),
            emotion: emotion
        };
        
        try {
            const response = await fetch(CONFIG.n8n.submitWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(storyData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.ok) {
                // Optimistically add marker locally
                const tempStory = {
                    id: 'temp-' + Date.now(),
                    ...storyData,
                    created_at: new Date().toISOString(),
                    status: 'approved'
                };
                MapModule.addStoryMarker(tempStory);
                
                return { success: true, message: 'Story shared!' };
            } else {
                return { 
                    success: false, 
                    message: result.message || 'Could not share story' 
                };
            }
            
        } catch (error) {
            console.error('Error submitting story:', error);
            return { success: false, message: 'Network error. Try again.' };
        }
    }
    
    /**
     * Clear loaded stories cache
     */
    function clearCache() {
        loadedStoryIds.clear();
        MapModule.clearMarkers();
    }
    
    // Public API
    return {
        loadNearby,
        submit,
        clearCache
    };
})();
