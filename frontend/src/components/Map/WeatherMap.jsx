import React, { useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  ZoomControl,
  ScaleControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet default icon paths ──────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pulseIcon = L.divIcon({
  className: "",
  html: `<div class="map-pulse-marker"><div class="pulse-ring"></div><div class="pulse-dot"></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div class="user-location-marker"><div class="user-dot"></div><div class="user-ring"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ── Base tile layers ─────────────────────────────────────────
const TILE_LAYERS = {
  dark: {
    label:       "🌑 Dark",
    url:         "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap © CARTO",
  },
  light: {
    label:       "☀️ Light",
    url:         "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap © CARTO",
  },
  voyager: {
    label:       "🗺 Voyager",
    url:         "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap © CARTO",
  },
  satellite: {
    label:       "🛰 Satellite",
    url:         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  terrain: {
    label:       "⛰ Terrain",
    url:         "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
  },
  osm: {
    label:       "🌐 OSM",
    url:         "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  watercolor: {
    label:       "🎨 Watercolor",
    url:         "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution: "© Stadia Maps © Stamen Design © OpenStreetMap",
  },
  toner: {
    label:       "🖤 Toner",
    url:         "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
    attribution: "© Stadia Maps © Stamen Design © OpenStreetMap",
  },
};

// ── Weather overlay layers (OWM public tiles, key optional for basic) ──
const WEATHER_LAYERS = [
  { id: "precipitation_new", label: "🌧 Rain",        color: "#4fc3f7" },
  { id: "clouds_new",        label: "☁️ Clouds",      color: "#b0bec5" },
  { id: "temp_new",          label: "🌡 Temperature", color: "#ef9a9a" },
  { id: "wind_new",          label: "💨 Wind",        color: "#a5d6a7" },
  { id: "pressure_new",      label: "📊 Pressure",    color: "#ce93d8" },
  { id: "snow_depth_new",    label: "❄️ Snow",        color: "#e3f2fd" },
  { id: "sea_level_pressure",label: "🌊 Sea Pressure",color: "#80deea" },
  { id: "humidity",          label: "💦 Humidity",    color: "#81d4fa" },
];

// ── Map event handlers ───────────────────────────────────────
function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function CursorTracker({ onMove }) {
  useMapEvents({
    mousemove: (e) => onMove(e.latlng),
    mouseout:  ()  => onMove(null),
  });
  return null;
}

// ── Main Component ───────────────────────────────────────────
export default function WeatherMap({ onLocationSelect }) {
  const [markers, setMarkers]               = useState([]);
  const [userLocation, setUserLocation]     = useState(null);
  const [activeLayer, setActiveLayer]       = useState("dark");
  const [activeOverlays, setActiveOverlays] = useState([]);   // multi-select
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [showControls, setShowControls]     = useState(true);
  const [showLegend, setShowLegend]         = useState(false);
  const [cursor, setCursor]                 = useState(null);
  const [geoLoading, setGeoLoading]         = useState(false);
  const [panelTab, setPanelTab]             = useState("base"); // "base" | "overlay"
  const mapRef = useRef(null);

  // ── Handlers ────────────────────────────────────────────────
  const handleMapClick = useCallback(({ lat, lng }) => {
    setMarkers([{ lat, lng, id: Date.now() }]);
    onLocationSelect({ lat, lon: lng });
  }, [onLocationSelect]);

  const toggleOverlay = useCallback((id) => {
    setActiveOverlays(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setUserLocation({ lat, lng });
        setMarkers([{ lat, lng, id: Date.now() }]);
        onLocationSelect({ lat, lon: lng });
        mapRef.current?.setView([lat, lng], 10);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  }, [onLocationSelect]);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
    setUserLocation(null);
  }, []);

  const activeOverlayMeta = WEATHER_LAYERS.filter(l => activeOverlays.includes(l.id));

  return (
    <div className="map-wrapper">

      {/* ── Floating Controls Panel ───────────────────────── */}
      <div className={`map-panel ${showControls ? "open" : "collapsed"}`}>
        <div className="panel-header">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${panelTab === "base" ? "active" : ""}`}
              onClick={() => setPanelTab("base")}
            >
              Base Map
            </button>
            <button
              className={`panel-tab ${panelTab === "overlay" ? "active" : ""}`}
              onClick={() => setPanelTab("overlay")}
            >
              Overlays {activeOverlays.length > 0 && <span className="overlay-badge">{activeOverlays.length}</span>}
            </button>
          </div>
          <button className="panel-toggle" onClick={() => setShowControls(v => !v)} title="Toggle panel">
            {showControls ? "◀" : "▶"}
          </button>
        </div>

        {showControls && (
          <div className="panel-body">
            {/* Base layer grid */}
            {panelTab === "base" && (
              <div className="tile-grid">
                {Object.entries(TILE_LAYERS).map(([key, val]) => (
                  <button
                    key={key}
                    className={`tile-btn ${activeLayer === key ? "active" : ""}`}
                    onClick={() => setActiveLayer(key)}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            )}

            {/* Overlay list */}
            {panelTab === "overlay" && (
              <>
                <div className="overlay-list">
                  {WEATHER_LAYERS.map((wl) => {
                    const on = activeOverlays.includes(wl.id);
                    return (
                      <button
                        key={wl.id}
                        className={`overlay-btn ${on ? "active" : ""}`}
                        style={on ? { "--dot": wl.color } : {}}
                        onClick={() => toggleOverlay(wl.id)}
                      >
                        <span className="overlay-dot" style={{ background: on ? wl.color : "transparent", borderColor: wl.color }} />
                        {wl.label}
                      </button>
                    );
                  })}
                </div>

                {/* Opacity slider */}
                {activeOverlays.length > 0 && (
                  <div className="opacity-row">
                    <span className="opacity-label">Opacity</span>
                    <input
                      type="range" min="0.1" max="1" step="0.05"
                      value={overlayOpacity}
                      onChange={e => setOverlayOpacity(parseFloat(e.target.value))}
                      className="opacity-slider"
                    />
                    <span className="opacity-value">{Math.round(overlayOpacity * 100)}%</span>
                  </div>
                )}

                {activeOverlays.length > 0 && (
                  <button className="clear-overlays" onClick={() => setActiveOverlays([])}>
                    Clear all overlays
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Toolbar (right side) ─────────────────────────── */}
      <div className="map-toolbar">
        <button
          className={`toolbar-btn ${geoLoading ? "loading" : ""}`}
          onClick={handleGeolocate}
          title="My location"
        >
          {geoLoading ? "⏳" : "📍"}
        </button>
        <button
          className="toolbar-btn"
          onClick={clearMarkers}
          title="Clear markers"
        >
          🗑
        </button>
        <button
          className={`toolbar-btn ${showLegend ? "active" : ""}`}
          onClick={() => setShowLegend(v => !v)}
          title="Legend"
        >
          📋
        </button>
      </div>

      {/* ── Active overlay legend ─────────────────────────── */}
      {showLegend && activeOverlayMeta.length > 0 && (
        <div className="map-legend">
          <div className="legend-title">Active Overlays</div>
          {activeOverlayMeta.map(l => (
            <div key={l.id} className="legend-row">
              <span className="legend-swatch" style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
          <div className="legend-row" style={{ marginTop: 6, borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 6 }}>
            <span className="legend-swatch" style={{ background: "var(--accent)" }} />
            <span>Selected location</span>
          </div>
        </div>
      )}

      {/* ── Coordinate display ───────────────────────────── */}
      {cursor && (
        <div className="coord-display">
          {cursor.lat.toFixed(4)}°, {cursor.lng.toFixed(4)}°
        </div>
      )}

      {/* ── Hint ─────────────────────────────────────────── */}
      <div className="map-hint">🖱 Click anywhere for weather · Scroll to zoom</div>

      {/* ── Map ──────────────────────────────────────────── */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "#0d1117" }}
        ref={mapRef}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        {/* Base tile */}
        <TileLayer
          key={activeLayer}
          url={TILE_LAYERS[activeLayer].url}
          attribution={TILE_LAYERS[activeLayer].attribution}
          maxZoom={18}
        />

        {/* Weather overlays (stacked) */}
        {activeOverlays.map(id => (
          <TileLayer
            key={id}
            url={`https://tile.openweathermap.org/map/${id}/{z}/{x}/{y}.png`}
            attribution="© OpenWeatherMap"
            opacity={overlayOpacity}
          />
        ))}

        <ClickHandler onMapClick={handleMapClick} />
        <CursorTracker onMove={setCursor} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <strong>📍 Your location</strong><br />
              <small>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
            </Popup>
          </Marker>
        )}

        {/* Click markers */}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={pulseIcon}>
            <Popup className="custom-popup">
              <strong>{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</strong><br />
              <small>Loading weather…</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Extra CSS (scoped to this component) ─────────── */}
      <style>{`
        /* Panel */
        .map-panel {
          position: absolute; top: 12px; left: 12px; z-index: 800;
          background: rgba(13,17,27,0.92);
          border: 1px solid rgba(100,140,220,0.18);
          border-radius: 10px;
          backdrop-filter: blur(12px);
          min-width: 220px;
          max-width: 260px;
          transition: all .2s;
          overflow: hidden;
        }
        .map-panel.collapsed { min-width: unset; }

        .panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px 6px;
          border-bottom: 1px solid rgba(100,140,220,0.12);
        }
        .panel-tabs { display: flex; gap: 4px; }
        .panel-tab {
          font-size: .72rem; font-weight: 600; padding: .25rem .6rem;
          border-radius: 5px; border: none;
          background: transparent; color: #8892a4; cursor: pointer;
          transition: all .15s; font-family: inherit;
          display: flex; align-items: center; gap: 4px;
        }
        .panel-tab.active { background: rgba(79,142,247,.18); color: #64b5f6; }
        .panel-tab:hover  { color: #e8edf5; }

        .overlay-badge {
          background: #4f8ef7; color: #fff;
          font-size: .62rem; border-radius: 10px;
          padding: 1px 5px; font-weight: 700; line-height: 1.4;
        }

        .panel-toggle {
          background: none; border: none; color: #8892a4;
          cursor: pointer; font-size: .8rem; padding: 2px 4px;
          transition: color .15s; line-height: 1;
        }
        .panel-toggle:hover { color: #e8edf5; }

        .panel-body { padding: 8px 10px 10px; }

        /* Tile grid */
        .tile-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
        }
        .tile-btn {
          padding: .3rem .5rem; border-radius: 6px;
          border: 1px solid rgba(100,140,220,0.15);
          background: rgba(255,255,255,0.04); color: #8892a4;
          font-size: .72rem; font-family: inherit; cursor: pointer;
          text-align: left; transition: all .15s; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .tile-btn:hover  { color: #e8edf5; border-color: #4f8ef7; }
        .tile-btn.active { background: #4f8ef7; color: #fff; border-color: #4f8ef7; }

        /* Overlay list */
        .overlay-list { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
        .overlay-btn {
          display: flex; align-items: center; gap: 8px;
          padding: .3rem .55rem; border-radius: 6px;
          border: 1px solid rgba(100,140,220,0.12);
          background: rgba(255,255,255,0.03); color: #8892a4;
          font-size: .75rem; font-family: inherit; cursor: pointer;
          text-align: left; transition: all .15s;
        }
        .overlay-btn:hover  { color: #e8edf5; background: rgba(255,255,255,0.07); }
        .overlay-btn.active { color: #e8edf5; background: rgba(255,255,255,0.08); border-color: rgba(100,140,220,0.3); }
        .overlay-dot {
          width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
          border: 1.5px solid;
          transition: background .15s;
        }

        /* Opacity */
        .opacity-row {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 0 4px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .opacity-label { font-size: .68rem; color: #5a6478; flex-shrink: 0; }
        .opacity-slider { flex: 1; accent-color: #4f8ef7; cursor: pointer; height: 3px; }
        .opacity-value  { font-size: .68rem; color: #8892a4; width: 30px; text-align: right; flex-shrink: 0; }

        .clear-overlays {
          width: 100%; margin-top: 6px;
          padding: .28rem; border-radius: 5px;
          border: 1px solid rgba(239,83,80,.3);
          background: rgba(239,83,80,.08); color: #ef5350;
          font-size: .7rem; font-family: inherit; cursor: pointer;
          transition: all .15s;
        }
        .clear-overlays:hover { background: rgba(239,83,80,.18); }

        /* Toolbar */
        .map-toolbar {
          position: absolute; top: 12px; right: 12px; z-index: 800;
          display: flex; flex-direction: column; gap: 4px;
        }
        .toolbar-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid rgba(100,140,220,0.18);
          background: rgba(13,17,27,0.92); backdrop-filter: blur(12px);
          font-size: 1rem; cursor: pointer; transition: all .15s;
          display: flex; align-items: center; justify-content: center;
        }
        .toolbar-btn:hover  { border-color: #4f8ef7; background: rgba(79,142,247,.1); }
        .toolbar-btn.active { background: rgba(79,142,247,.2); border-color: #4f8ef7; }
        .toolbar-btn.loading { animation: pulse .8s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* Legend */
        .map-legend {
          position: absolute; bottom: 70px; right: 12px; z-index: 800;
          background: rgba(13,17,27,0.92); backdrop-filter: blur(12px);
          border: 1px solid rgba(100,140,220,0.18); border-radius: 8px;
          padding: 10px 12px; min-width: 170px;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        .legend-title { font-size: .7rem; font-weight: 700; color: #5a6478; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
        .legend-row   { display: flex; align-items: center; gap: 7px; font-size: .75rem; color: #8892a4; margin-bottom: 4px; }
        .legend-swatch{ width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; opacity: .8; }

        /* Coordinate display */
        .coord-display {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          z-index: 800;
          background: rgba(13,17,27,0.88); backdrop-filter: blur(8px);
          border: 1px solid rgba(100,140,220,0.15); border-radius: 6px;
          padding: .25rem .75rem; font-family: "DM Mono", monospace;
          font-size: .72rem; color: #8892a4; pointer-events: none;
        }

        /* User location marker */
        .user-location-marker { position: relative; width: 24px; height: 24px; }
        .user-dot {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 10px; height: 10px; background: #66bb6a; border-radius: 50%;
          border: 2px solid #fff; box-shadow: 0 0 6px rgba(102,187,106,.6);
        }
        .user-ring {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 24px; height: 24px; border: 2px solid #66bb6a;
          border-radius: 50%; opacity: .5;
          animation: pulseRing 2s ease-out infinite;
        }

        /* map-hint override */
        .map-hint {
          position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);
          z-index: 800; background: rgba(17,24,39,0.85); padding: .4rem 1rem;
          border-radius: 20px; font-size: .78rem; color: #8892a4;
          border: 1px solid rgba(100,140,220,0.15); backdrop-filter: blur(8px);
          pointer-events: none; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}