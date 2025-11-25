/**
 * Configuration for Map of Smiles
 * Contains all API endpoints and settings
 */

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://iwgjhbtsjkhomvvlysln.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z2poYnRzamtob212dmx5c2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjY0MjgsImV4cCI6MjA3NTQ0MjQyOH0.PJxCqGConjxbwNPgIBBHegey9CDt9DrI1qLD95ALTW0',
        tableName: 'stories'
    },
    
    // n8n Webhook for story submission
    n8n: {
        submitWebhook: 'https://n8n.simeontsvetanovn8nworkflows.site/webhook/3899e9f9-a15a-40f2-894c-6d1324a26398'
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
        emotions: ['happy', 'love', 'funny', 'grateful', 'inspired', 'peaceful', 'nostalgic']
    },
    
    // Emotion Icons
    emotionIcons: {
        happy: '😊',
        love: '❤️',
        funny: '😂',
        grateful: '🙏',
        inspired: '✨',
        peaceful: '😌',
        nostalgic: '🥹',
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
