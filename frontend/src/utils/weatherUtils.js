// WMO weather code → emoji icon (matches backend openMeteoMapper.js)
const WMO_ICONS = {
  0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️",
  45: "🌫", 48: "🌫",
  51: "🌦", 53: "🌦", 55: "🌧",
  61: "🌧", 63: "🌧", 65: "🌧",
  71: "🌨", 73: "❄️", 75: "❄️", 77: "🌨",
  80: "🌦", 81: "🌧", 82: "⛈",
  85: "🌨", 86: "❄️",
  95: "⛈", 96: "⛈", 99: "⛈",
};

/**
 * Returns an emoji for a given WMO weather code.
 * The `icon` field from the API is already the emoji string,
 * but this helper provides a fallback lookup from the raw code.
 */
export const getWeatherEmoji = (codeOrEmoji) => {
  // If it's already an emoji string (non-numeric), return as-is
  if (typeof codeOrEmoji === "string" && isNaN(Number(codeOrEmoji))) return codeOrEmoji;
  return WMO_ICONS[Number(codeOrEmoji)] || "🌡";
};

export const getWindDirection = (deg) => {
  if (deg === undefined || deg === null) return "";
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
};

export const formatTemp = (t) => `${Math.round(t)}°C`;

export const getAQILabel = (aqi) => {
  const labels = { 1:"Good", 2:"Fair", 3:"Moderate", 4:"Poor", 5:"Very Poor" };
  return labels[aqi] || "Unknown";
};

export const getAQIColor = (aqi) => {
  const colors = { 1:"#00e400", 2:"#ffff00", 3:"#ff7e00", 4:"#ff0000", 5:"#8f3f97" };
  return colors[aqi] || "#ccc";
};

export const getBgGradient = (weatherMain) => {
  const gradients = {
    Clear:        "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    Clouds:       "linear-gradient(135deg, #2c3e50, #3d5a6b, #4a6d7c)",
    Rain:         "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    Drizzle:      "linear-gradient(135deg, #1c3a4a, #2d5a6e, #3a7a8a)",
    Thunderstorm: "linear-gradient(135deg, #0d0d0d, #1a0533, #2d1b69)",
    Snow:         "linear-gradient(135deg, #e8f4f8, #c8dde8, #a8ccd8)",
    Mist:         "linear-gradient(135deg, #2c3e50, #485563, #586571)",
  };
  return gradients[weatherMain] || gradients.Clear;
};
