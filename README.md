# 🌍 WeatherMap — MERN Stack (Open-Meteo Edition)

Interactive world map weather app powered by **Open-Meteo** (free, no API key!) & Leaflet.

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. No API key needed! Open-Meteo is completely free.
#    Just make sure MongoDB is running.

# 3. Start both servers
npm run dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

## Why Open-Meteo?

| Feature              | Open-Meteo     | OpenWeatherMap (free tier) |
|----------------------|---------------|---------------------------|
| API key required     | ❌ No          | ✅ Yes                    |
| Rate limits          | Generous       | 60 calls/min              |
| Forecast resolution  | Hourly, 7 days | 3-hourly, 5 days           |
| Air quality          | ✅ Included    | Separate key needed        |
| Historical data      | ✅ Included    | Paid only                  |
| Commercial use       | Free (CC BY 4.0) | Limited on free plan     |

## Data Sources

| Data                | API Endpoint |
|---------------------|-------------|
| Current weather     | `https://api.open-meteo.com/v1/forecast` (current variables) |
| Hourly forecast     | `https://api.open-meteo.com/v1/forecast` (hourly variables) |
| Daily summary       | `https://api.open-meteo.com/v1/forecast` (daily variables) |
| City geocoding      | `https://geocoding-api.open-meteo.com/v1/search` |
| Air quality         | `https://air-quality-api.open-meteo.com/v1/air-quality` |

## Weather Icons

Weather conditions use **WMO weather codes** mapped to emoji icons
(see `backend/src/utils/openMeteoMapper.js`). No image CDN dependency.

## Features
- 🗺  Interactive world map (zoom, pan, click for weather)
- 🌡  Real-time weather by clicking anywhere on the map
- 🛰  Satellite, terrain & dark map tiles
- 🌧  Weather overlay layers (rain, cloud, temp, wind)
- 📈  48-hour forecast chart (hourly resolution)
- 🔍  City search with geocoding via Open-Meteo
- 📜  Search history (stored in MongoDB)
- ⚡  Server-side caching (10 min TTL)
- 📱  Fully responsive
- 🆓  **Zero API keys needed**

## Project Structure
```
weathermap-app/
├── backend/
│   └── src/
│       ├── config/             # DB & env config
│       ├── controllers/        # Route handlers
│       ├── middlewares/        # Error handler
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express routers
│       ├── services/           # Open-Meteo API calls + cache
│       └── utils/
│           ├── logger.js
│           ├── cache.js
│           └── openMeteoMapper.js  # WMO code → description + emoji
└── frontend/
    └── src/
        ├── components/
        │   ├── Map/            # Leaflet world map
        │   ├── Weather/        # Modal, forecast chart
        │   └── UI/             # Navbar
        ├── hooks/              # React Query hooks
        ├── pages/              # Map, Search, History
        ├── services/           # Axios API client
        ├── styles/             # Global CSS
        └── utils/
            └── weatherUtils.js # Emoji icons, formatters
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/weather/city/:city | Weather by city name (geocoded) |
| GET | /api/weather/coords?lat=&lon= | Weather by coordinates |
| GET | /api/weather/forecast?lat=&lon= | 5-day hourly forecast |
| GET | /api/weather/air-quality?lat=&lon= | European AQI |
| GET | /api/weather/history | Last 20 searches |
| GET | /api/health | Health check |
#
