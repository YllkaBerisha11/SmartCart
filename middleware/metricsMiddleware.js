/**
 * SmartCart — Prometheus Metrics Middleware
 * Endpoint: GET /metrics
 */

const client = require("prom-client");

// ── Regjistro metrikat default (CPU, Memory, etj) ─
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ── HTTP Request Duration ──────────────────────────
const httpRequestDuration = new client.Histogram({
  name:    "http_request_duration_seconds",
  help:    "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// ── HTTP Request Counter ───────────────────────────
const httpRequestCounter = new client.Counter({
  name:    "http_requests_total",
  help:    "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// ── Active Connections ─────────────────────────────
const activeConnections = new client.Gauge({
  name:    "http_active_connections",
  help:    "Number of active HTTP connections",
  registers: [register],
});

// ── Order Counter ──────────────────────────────────
const orderCounter = new client.Counter({
  name:    "smartcart_orders_total",
  help:    "Total number of orders created",
  labelNames: ["payment_method", "status"],
  registers: [register],
});

// ── User Registration Counter ──────────────────────
const userRegistrationCounter = new client.Counter({
  name:    "smartcart_user_registrations_total",
  help:    "Total number of user registrations",
  registers: [register],
});

// ── Database Query Duration ────────────────────────
const dbQueryDuration = new client.Histogram({
  name:    "smartcart_db_query_duration_seconds",
  help:    "Duration of database queries",
  labelNames: ["operation"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// ── Middleware: regjistro çdo request ─────────────
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  activeConnections.inc();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route    = req.route?.path || req.path || "unknown";
    const labels   = {
      method:      req.method,
      route:       route,
      status_code: res.statusCode,
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestCounter.inc(labels);
    activeConnections.dec();
  });

  next();
};

// ── Route: /metrics ────────────────────────────────
const metricsRoute = async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
};

module.exports = {
  metricsMiddleware,
  metricsRoute,
  orderCounter,
  userRegistrationCounter,
  dbQueryDuration,
  register,
};