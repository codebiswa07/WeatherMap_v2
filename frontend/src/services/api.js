import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
  timeout: 10000,
});

export const weatherApi = {
  getByCity:    (city)     => api.get(`/weather/city/${city}`),
  getByCoords:  (lat, lon) => api.get(`/weather/coords?lat=${lat}&lon=${lon}`),
  getForecast:  (lat, lon) => api.get(`/weather/forecast?lat=${lat}&lon=${lon}`),
  getAirQuality:(lat, lon) => api.get(`/weather/air-quality?lat=${lat}&lon=${lon}`),
  getHistory:   ()         => api.get("/weather/history"),
};

export default api;
