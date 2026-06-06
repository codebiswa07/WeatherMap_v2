import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-icon">🌍</span>
        <span className="nav-title">WeatherMap</span>
        <span className="nav-badge">Open-Meteo</span>
      </div>
      <div className="nav-links">
        <NavLink to="/"        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Map</NavLink>
        <NavLink to="/search"  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Search</NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>History</NavLink>
      </div>
    </nav>
  );
}
