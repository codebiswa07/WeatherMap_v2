import React from "react";
import WeatherMap from "../components/Map/WeatherMap";

export default function MapPage({ onSelect }) {
  return (
    <div className="map-page">
      <WeatherMap onLocationSelect={onSelect} />
    </div>
  );
}
