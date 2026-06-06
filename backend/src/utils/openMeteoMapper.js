const WMO_CODES = {
  0:  { description: "Clear sky",                icon: "☀️",  main: "Clear" },
  1:  { description: "Mainly clear",             icon: "🌤",  main: "Clear" },
  2:  { description: "Partly cloudy",            icon: "⛅",  main: "Clouds" },
  3:  { description: "Overcast",                 icon: "☁️",  main: "Clouds" },
  45: { description: "Foggy",                    icon: "🌫",  main: "Mist" },
  48: { description: "Icy fog",                  icon: "🌫",  main: "Mist" },
  51: { description: "Light drizzle",            icon: "🌦",  main: "Drizzle" },
  53: { description: "Moderate drizzle",         icon: "🌦",  main: "Drizzle" },
  55: { description: "Dense drizzle",            icon: "🌧",  main: "Drizzle" },
  61: { description: "Slight rain",              icon: "🌧",  main: "Rain" },
  63: { description: "Moderate rain",            icon: "🌧",  main: "Rain" },
  65: { description: "Heavy rain",               icon: "🌧",  main: "Rain" },
  71: { description: "Slight snowfall",          icon: "🌨",  main: "Snow" },
  73: { description: "Moderate snowfall",        icon: "❄️",  main: "Snow" },
  75: { description: "Heavy snowfall",           icon: "❄️",  main: "Snow" },
  77: { description: "Snow grains",              icon: "🌨",  main: "Snow" },
  80: { description: "Slight rain showers",      icon: "🌦",  main: "Rain" },
  81: { description: "Moderate rain showers",    icon: "🌧",  main: "Rain" },
  82: { description: "Violent rain showers",     icon: "⛈",  main: "Rain" },
  85: { description: "Slight snow showers",      icon: "🌨",  main: "Snow" },
  86: { description: "Heavy snow showers",       icon: "❄️",  main: "Snow" },
  95: { description: "Thunderstorm",             icon: "⛈",  main: "Thunderstorm" },
  96: { description: "Thunderstorm with hail",   icon: "⛈",  main: "Thunderstorm" },
  99: { description: "Thunderstorm, heavy hail", icon: "⛈",  main: "Thunderstorm" },
};

const fromCode = (code) =>
  WMO_CODES[code] || { description: "Unknown", icon: "🌡", main: "Clear" };

module.exports = { WMO_CODES, fromCode };
