# 🗺️ The Smile Map

**Share positive moments. Discover joy around the world.**

A web application where people share anonymous, positive stories pinned to real locations on an interactive map. Spread positivity, one story at a time! 🌍✨

🌐 **Live Demo**: [https://thesmilemap.com](https://thesmilemap.com)

---

## ✨ Features

### 📍 Interactive Map
- View stories on a beautiful map powered by Leaflet + OpenStreetMap
- **MarkerCluster** groups nearby stories for cleaner viewing
- Click clusters to zoom in or see the "spiderfy" effect
- Custom emoji markers based on story emotions

### 📝 Share Your Story
- Write anonymous positive stories
- Pin them to your current location or tap anywhere on the map
- Choose from 6 emotions: 😊 Happy, ❤️ Love, 😂 Funny, 🙏 Grateful, ✨ Inspired, 😌 Peaceful
- **AI-powered moderation** ensures only positive content is published

### 📱 Mobile-First Design
- Fully responsive layout
- Touch-friendly interface
- PWA support - install as an app on your phone
- Smart install banner prompts users to add to home screen
- Works in Facebook/Messenger WebViews with browser redirect option

### 🔒 Privacy-Focused
- No accounts required
- No personal data collected
- No tracking or analytics
- Stories are completely anonymous

### 🍔 Navigation Menu
- **About** - Learn about The Smile Map
- **Privacy** - Clear privacy policy
- **How to Use** - Simple guide for new users
- **Contact** - Get in touch

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Map** | Leaflet.js 1.9.4, Leaflet.markercluster |
| **Database** | Supabase (PostgreSQL) |
| **Backend** | n8n webhooks |
| **AI Moderation** | OpenAI GPT API |
| **Hosting** | GitHub Pages |
| **Domain** | GoDaddy (thesmilemap.com) |

---

## 📁 Project Structure

```
map_of_smiles/
├── index.html          # Main HTML file with modals
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for offline support
├── CNAME               # Custom domain configuration
├── css/
│   └── style.css       # All styles (responsive, modals, markers)
├── js/
│   ├── config.js       # Configuration (API endpoints, settings)
│   ├── map.js          # Map initialization, markers, clusters, popups
│   ├── stories.js      # Story loading & submission via Supabase/n8n
│   ├── ui.js           # UI interactions, modals, PWA install banner
│   └── app.js          # Main application entry point
└── icons/              # PWA icons (multiple sizes)
```

---

## 🚀 Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Georgi-Piskov/map_of_smiles.git
cd map_of_smiles
```

### 2. Configure Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL schema (see below)
3. Copy your project URL and anon key

### 3. Configure n8n Webhook

1. Create an [n8n](https://n8n.io) workflow:
   - **Webhook Trigger** → receives story submissions
   - **OpenAI Node** → AI moderation (checks for positivity)
   - **Supabase Node** → saves approved stories
2. Copy the webhook URL

### 4. Update Configuration

Edit `js/config.js`:

```javascript
const CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
    },
    n8n: {
        webhookUrl: 'YOUR_N8N_WEBHOOK_URL'
    }
};
```

### 5. Deploy to GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select "main" branch and save
4. (Optional) Add custom domain in CNAME file

---

## 📊 Database Schema

```sql
-- Stories table
CREATE TABLE stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    text TEXT NOT NULL,
    emotion VARCHAR(50) DEFAULT 'happy',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Public read access for approved stories only
CREATE POLICY "Public can read approved stories"
ON stories FOR SELECT
USING (status = 'approved');

-- Indexes for performance
CREATE INDEX idx_stories_location ON stories(lat, lng);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
```

---

## 🤖 AI Moderation Prompt

The n8n workflow uses this prompt for content moderation:

```
You are a content moderator for "The Smile Map" - a platform for sharing 
positive, uplifting stories. Analyze the submitted story and determine 
if it should be APPROVED or REJECTED.

APPROVE if the story:
- Shares a positive experience, moment of joy, or gratitude
- Is uplifting, heartwarming, or inspiring
- Contains humor that is kind and not at anyone's expense

REJECT if the story:
- Contains negativity, complaints, or sadness
- Has profanity, hate speech, or inappropriate content
- Includes personal attacks or harmful content
- Is spam, advertising, or nonsensical

Respond with only: APPROVED or REJECTED
```

---

## 🌐 Custom Domain Setup (GoDaddy)

1. In GoDaddy DNS, add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | georgi-piskov.github.io | 600 |

2. Add `CNAME` file with: `thesmilemap.com`
3. Enable HTTPS in GitHub Pages settings

---

## 📱 PWA Features

- **Installable**: Add to home screen on iOS/Android
- **Offline Support**: Service worker caches essential files
- **App-like Experience**: Standalone display mode
- **Smart Install Banner**: Prompts users to install (dismissible)

---

## 🔧 Browser Compatibility

- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Edge
- ✅ Samsung Internet
- ⚠️ Facebook/Messenger WebView (shows redirect banner)

---

## 📄 License

MIT License - Feel free to use, modify, and distribute!

---

## 👨‍💻 Author

**Georgi Piskov**

- GitHub: [@Georgi-Piskov](https://github.com/Georgi-Piskov)

---

## 🙏 Acknowledgments

- [Leaflet.js](https://leafletjs.com/) - Amazing open-source map library
- [OpenStreetMap](https://www.openstreetmap.org/) - Free map data
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [n8n](https://n8n.io/) - Workflow automation
- [OpenAI](https://openai.com/) - AI moderation

---

**Made with ❤️ to spread smiles around the world!** 🌍😊
