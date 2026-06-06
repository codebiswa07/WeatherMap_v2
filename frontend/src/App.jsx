import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/UI/Navbar";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";
import HistoryPage from "./pages/HistoryPage";
import WeatherModal from "./components/Weather/WeatherModal";

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<MapPage onSelect={setSelectedLocation} />} />
            <Route path="/search"  element={<SearchPage onSelect={setSelectedLocation} />} />
            <Route path="/history" element={<HistoryPage onSelect={setSelectedLocation} />} />
          </Routes>
        </main>
        {selectedLocation && (
          <WeatherModal location={selectedLocation} onClose={() => setSelectedLocation(null)} />
        )}
      </div>
    </BrowserRouter>
  );
}
