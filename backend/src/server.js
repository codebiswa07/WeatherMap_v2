const express     = require("express");
const helmet      = require("helmet");
const compression = require("compression");
const cors        = require("cors");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");

const { port, corsOrigins } = require("./config");
const connectDB      = require("./config/db");
const weatherRoutes  = require("./routes/weatherRoutes");
const errorHandler   = require("./middlewares/errorHandler");
const logger         = require("./utils/logger");

const app = express();

// ── Security & Utilities ────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

// ── Rate Limiting ───────────────────────────────────────────
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests" }));

// ── Routes ──────────────────────────────────────────────────
app.use("/api/weather", weatherRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(port, () => logger.info(`🌍 Server running on http://localhost:${port}`));
});
