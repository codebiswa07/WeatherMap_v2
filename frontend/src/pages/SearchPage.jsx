import React, { useState } from "react";
import { weatherApi } from "../services/api";
import { getWeatherEmoji } from "../utils/weatherUtils";

export default function SearchPage({ onSelect }) {
  const [query,   setQuery]   = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const { data } = await weatherApi.getByCity(query.trim());
      setResult(data.data);
      onSelect({ lat: data.data.coord.lat, lon: data.data.coord.lon });
    } catch (err) {
      setError(err.response?.data?.message || "City not found");
    } finally { setLoading(false); }
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <h1 className="search-title">Search Weather</h1>
        <p className="search-subtitle">Enter any city to get live weather data — powered by Open-Meteo</p>
        <form onSubmit={handleSearch} className="search-form">
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. London, Tokyo, New York…"
          />
          <button className="search-btn" disabled={loading}>
            {loading ? "…" : "Search"}
          </button>
        </form>
        {error  && <p className="search-error">⚠ {error}</p>}
        {result && (
          <div className="search-result-card">
            <div className="src-header">
              <div>
                <h2>{result.name}{result.sys?.country ? `, ${result.sys.country}` : ""}</h2>
                <p>{result.weather[0].description}</p>
              </div>
              <span className="src-icon" role="img" aria-label={result.weather[0].description}>
                {getWeatherEmoji(result.weather[0].icon)}
              </span>
            </div>
            <div className="src-temp">{Math.round(result.main.temp)}°C</div>
            <div className="src-stats">
              <span>💧 {result.main.humidity}%</span>
              <span>💨 {Math.round(result.wind.speed)} m/s</span>
              <span>🌡 {Math.round(result.main.pressure)} hPa</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
