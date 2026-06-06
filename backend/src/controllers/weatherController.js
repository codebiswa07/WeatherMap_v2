const weatherService = require("../services/weatherService");
const SearchHistory  = require("../models/SearchHistory");
const logger         = require("../utils/logger");

const handleErr = (res, err) => {
  logger.error(err.message);
  const status  = err.status || err.response?.status || 500;
  const message = err.message || err.response?.data?.reason || "Internal server error";
  res.status(status).json({ success: false, message });
};

exports.getByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const data = await weatherService.getByCity(city);
    await SearchHistory.create({
      query:     city,
      lat:       data.coord.lat,
      lon:       data.coord.lon,
      city:      data.name,
      country:   data.sys.country,
      ipAddress: req.ip,
    });
    res.json({ success: true, data });
  } catch (err) { handleErr(res, err); }
};

exports.getByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "lat and lon required" });
    const data = await weatherService.getByCoords(lat, lon);
    res.json({ success: true, data });
  } catch (err) { handleErr(res, err); }
};

exports.getForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "lat and lon required" });
    const data = await weatherService.getForecast(lat, lon);
    res.json({ success: true, data });
  } catch (err) { handleErr(res, err); }
};

exports.getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "lat and lon required" });
    const data = await weatherService.getAirQuality(lat, lon);
    res.json({ success: true, data });
  } catch (err) { handleErr(res, err); }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (err) { handleErr(res, err); }
};
