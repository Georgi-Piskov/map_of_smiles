# 🗺️ Map of Smiles

A web application that shows positive, anonymous stories pinned to real locations on a map.

## ✨ Features

- 📍 View stories on an interactive map (Leaflet + OpenStreetMap)
- 📝 Share anonymous stories at your current location
- 😊 Tag stories with emotions (happy, love, funny, grateful, inspired, peaceful)
- 📱 Mobile-first, PWA-ready design
- 🔒 Privacy-focused: no accounts, no tracking

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Map**: Leaflet.js + OpenStreetMap
- **Database**: Supabase (PostgreSQL)
- **Backend**: n8n webhooks (for story submission)
- **Moderation**: OpenAI API
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
map_of_smiles/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── css/
│   └── style.css       # All styles
├── js/
│   ├── config.js       # Configuration (API keys, settings)
│   ├── map.js          # Map initialization & markers
│   ├── stories.js      # Story loading & submission
│   ├── ui.js           # UI interactions
│   └── app.js          # Main application entry
└── icons/              # PWA icons
```

## 🚀 Setup

### 1. Configure Supabase

1. Create a Supabase project
2. Create the `stories` table (see SQL below)
3. Add your Supabase URL and anon key to `js/config.js`

### 2. Configure n8n Webhook

1. Create an n8n workflow with a webhook trigger
2. Add OpenAI moderation
3. Connect to Supabase
4. Add webhook URL to `js/config.js`

### 3. Deploy

Push to GitHub and enable GitHub Pages.

## 📊 Supabase Table Schema

```sql
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

-- Allow public read access for approved stories
CREATE POLICY "Public can read approved stories"
ON stories FOR SELECT
USING (status = 'approved');

-- Create index for geo queries
CREATE INDEX idx_stories_location ON stories(lat, lng);
CREATE INDEX idx_stories_status ON stories(status);
```

## 🔐 Environment Variables

In `js/config.js`, replace:
- `YOUR_SUPABASE_URL` → Your Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` → Your Supabase anon/public key
- `YOUR_N8N_WEBHOOK_URL` → Your n8n webhook endpoint

## 📄 License

MIT
HumanMap - A web app showing positive, anonymous stories pinned on a map
