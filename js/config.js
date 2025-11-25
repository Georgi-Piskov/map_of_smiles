/**
 * Configuration for Map of Smiles
 * Contains all API endpoints and settings
 */

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'YOUR_SUPABASE_URL',           // e.g., https://xxxxx.supabase.co
        anonKey: 'YOUR_SUPABASE_ANON_KEY',  // Public anon key (safe to expose)
        tableName: 'stories'
    },
    
    // n8n Webhook for story submission
    n8n: {
        submitWebhook: 'YOUR_N8N_WEBHOOK_URL'  // e.g., https://your-n8n.com/webhook/submit-story
    },
    
    // Map Settings
    map: {
        defaultCenter: [42.6977, 23.3219],  // Sofia, Bulgaria
        defaultZoom: 13,
        minZoom: 3,
        maxZoom: 18,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    
    // Story Settings
    stories: {
        maxLength: 500,
        defaultRadius: 5000,  // meters
        loadRadius: 10000,    // meters - area to load stories from
        emotions: ['happy', 'love', 'funny', 'grateful', 'inspired', 'peaceful']
    },
    
    // Emotion Icons
    emotionIcons: {
        happy: '😊',
        love: '❤️',
        funny: '😂',
        grateful: '🙏',
        inspired: '✨',
        peaceful: '😌',
        default: '💫'
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.supabase);
Object.freeze(CONFIG.n8n);
Object.freeze(CONFIG.map);
Object.freeze(CONFIG.stories);
Object.freeze(CONFIG.emotionIcons);
