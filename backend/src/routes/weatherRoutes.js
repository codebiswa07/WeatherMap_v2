const router = require("express").Router();
const ctrl   = require("../controllers/weatherController");

router.get("/city/:city",   ctrl.getByCity);
router.get("/coords",       ctrl.getByCoords);
router.get("/forecast",     ctrl.getForecast);
router.get("/air-quality",  ctrl.getAirQuality);
router.get("/history",      ctrl.getHistory);

module.exports = router;
