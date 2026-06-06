require("dotenv").config();

module.exports = {
  port:        process.env.PORT || 5000,
  nodeEnv:     process.env.NODE_ENV || "development",
  mongoUri:    process.env.MONGO_URI || "mongodb://localhost:27017/weathermap",
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1",
    geoUrl:  process.env.OPEN_METEO_GEO_URL  || "https://geocoding-api.open-meteo.com/v1",
  },
  cacheTtl:    parseInt(process.env.CACHE_TTL, 10) || 600,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
};
