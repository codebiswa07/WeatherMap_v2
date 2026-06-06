const axios = require("axios");
const { openMeteo } = require("../config");
const { getOrSet } = require("../utils/cache");
const { fromCode } = require("../utils/openMeteoMapper");
const logger = require("../utils/logger");

const forecastClient  = axios.create({ baseURL: openMeteo.baseUrl });
const geocodeClient   = axios.create({ baseURL: openMeteo.geoUrl });

// Common hourly/daily variables requested from Open-Meteo
const HOURLY_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation_probability",
  "weathercode",
  "windspeed_10m",
  "winddirection_10m",
  "visibility",
  "pressure_msl",
  "cloudcover",
].join(",");

const DAILY_VARS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "weathercode",
  "precipitation_sum",
  "sunrise",
  "sunset",
  "windspeed_10m_max",
].join(",");

const CURRENT_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "weathercode",
  "windspeed_10m",
  "winddirection_10m",
  "visibility",
  "pressure_msl",
  "cloudcover",
  "precipitation",
  "is_day",
].join(",");

/**
 * Fetch full weather data (current + hourly + daily) for lat/lon.
 * Returns a normalised object close in shape to the old OWM response
 * so the controllers and frontend need minimal changes.
 */
const fetchWeather = async (lat, lon) => {
  const { data } = await forecastClient.get("/forecast", {
    params: {
      latitude:          lat,
      longitude:         lon,
      current:           CURRENT_VARS,
      hourly:            HOURLY_VARS,
      daily:             DAILY_VARS,
      timezone:          "auto",
      forecast_days:     7,
    },
  });

  const c = data.current;
  const wmo = fromCode(c.weathercode);

  // Build a normalised "current weather" object
  const normalized = {
    coord:   { lat: data.latitude, lon: data.longitude },
    weather: [{ id: c.weathercode, main: wmo.main, description: wmo.description, icon: wmo.icon }],
    main: {
      temp:       c.temperature_2m,
      feels_like: c.apparent_temperature,
      humidity:   c.relative_humidity_2m,
      pressure:   c.pressure_msl,
      temp_min:   Math.min(...data.daily.temperature_2m_min),
      temp_max:   Math.max(...data.daily.temperature_2m_max),
    },
    wind:       { speed: c.windspeed_10m, deg: c.winddirection_10m },
    clouds:     { all: c.cloudcover },
    visibility: c.visibility,
    sys: {
      sunrise: new Date(data.daily.sunrise[0]).getTime() / 1000,
      sunset:  new Date(data.daily.sunset[0]).getTime()  / 1000,
      country: data.timezone_abbreviation || "",
    },
    timezone:   data.utc_offset_seconds,
    name:       "",          // filled in by geocode reverse lookup if needed
    is_day:     c.is_day,
    _raw:       data,        // full response for forecast extraction
  };

  return normalized;
};

/**
 * Geocode a city name → { lat, lon, name, country }
 */
const geocodeCity = async (city) => {
  const { data } = await geocodeClient.get("/search", {
    params: { name: city, count: 1, language: "en", format: "json" },
  });
  if (!data.results || data.results.length === 0) {
    const err = new Error(`City not found: ${city}`);
    err.status = 404;
    throw err;
  }
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country_code?.toUpperCase() || "" };
};

const weatherService = {
  async getByCity(city) {
    return getOrSet(`city:${city.toLowerCase()}`, async () => {
      const geo = await geocodeCity(city);
      const weather = await fetchWeather(geo.lat, geo.lon);
      weather.name = geo.name;
      weather.sys.country = geo.country;
      logger.debug(`Fetched weather for city: ${city} (${geo.lat},${geo.lon})`);
      return weather;
    });
  },

  async getByCoords(lat, lon) {
    const key = `coords:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
    return getOrSet(key, async () => {
      const weather = await fetchWeather(lat, lon);
      logger.debug(`Fetched weather for coords: ${lat},${lon}`);
      return weather;
    });
  },

  async getForecast(lat, lon) {
    // Re-use the same full fetch; extract the hourly list in OWM-like format
    const key = `forecast:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
    return getOrSet(key, async () => {
      const { data } = await forecastClient.get("/forecast", {
        params: {
          latitude:      lat,
          longitude:     lon,
          hourly:        HOURLY_VARS,
          timezone:      "auto",
          forecast_days: 5,
        },
      });

      // Build list of 3-hourly entries (every 3rd hour) for chart compat
      const list = data.hourly.time
        .filter((_, i) => i % 3 === 0)
        .map((time, i) => {
          const idx = i * 3;
          const wmo = fromCode(data.hourly.weathercode[idx]);
          return {
            dt:   new Date(time).getTime() / 1000,
            main: {
              temp:       data.hourly.temperature_2m[idx],
              feels_like: data.hourly.apparent_temperature[idx],
              humidity:   data.hourly.relative_humidity_2m[idx],
              pressure:   data.hourly.pressure_msl[idx],
            },
            weather: [{ id: data.hourly.weathercode[idx], main: wmo.main, description: wmo.description, icon: wmo.icon }],
            wind:   { speed: data.hourly.windspeed_10m[idx], deg: data.hourly.winddirection_10m[idx] },
            clouds: { all: data.hourly.cloudcover[idx] },
            visibility: data.hourly.visibility[idx],
            dt_txt: time,
          };
        });

      logger.debug(`Fetched forecast for coords: ${lat},${lon}`);
      return { list, city: { coord: { lat: data.latitude, lon: data.longitude } } };
    });
  },

  /**
   * Open-Meteo doesn't have an air quality endpoint in its base API,
   * but it does offer European Air Quality via the air-quality API.
   * We use https://air-quality-api.open-meteo.com/v1/air-quality
   */
  async getAirQuality(lat, lon) {
    const key = `air:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
    return getOrSet(key, async () => {
      const { data } = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
        params: {
          latitude:  lat,
          longitude: lon,
          current:   "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone",
        },
      });

      const aqi = data.current.european_aqi;
      // Map 0-100 AQI to 1-5 scale (mirroring old OWM scale)
      const aqiLevel = aqi <= 20 ? 1 : aqi <= 40 ? 2 : aqi <= 60 ? 3 : aqi <= 80 ? 4 : 5;

      return {
        list: [{
          main: { aqi: aqiLevel },
          components: {
            pm10: data.current.pm10,
            pm2_5: data.current.pm2_5,
            co:  data.current.carbon_monoxide,
            no2: data.current.nitrogen_dioxide,
            o3:  data.current.ozone,
          },
          european_aqi: aqi,
        }],
      };
    });
  },
};

module.exports = weatherService;
