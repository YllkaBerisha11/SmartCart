require("dotenv").config();
const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const path        = require("path");
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const morgan      = require("morgan");
const logger      = require("./config/logger");

// ── MONITORING ────────────────────────────────────
const { metricsMiddleware, metricsRoute } = require("./middleware/metricsMiddleware");
const statusMonitor = require("express-status-monitor");

const app = express();

// --- 1. SECURITY ---
app.use((req, res, next) => { res.setHeader("X-API-Gateway", "SmartCart-Express-Gateway-v1"); next(); });
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// --- 2. MIDDLEWARES ---
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── MONITORING MIDDLEWARES ────────────────────────
app.use(statusMonitor({
  title: "SmartCart Monitor",
  path:  "/status",
  spans: [
    { interval: 1,  retention: 60 },
    { interval: 5,  retention: 60 },
    { interval: 15, retention: 60 },
  ],
  chartVisibility: {
    cpu: true, mem: true, load: true,
    responseTime: true, rps: true, statusCodes: true,
  },
  healthChecks: [
    { protocol: "http", host: "localhost", path: "/health/live",  port: process.env.PORT || 5000 },
    { protocol: "http", host: "localhost", path: "/health/ready", port: process.env.PORT || 5000 },
  ],
}));
app.use(metricsMiddleware);

// --- 3. SWAGGER ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 4. ROUTES ---
app.use("/api/v1/users",    require("./routes/userRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));
app.use("/api/v1/orders",   require("./routes/orderRoutes"));
app.use("/api/v1/reviews",  require("./routes/reviewRoutes"));
app.use("/api/v1/stats",    require("./routes/statsRoutes"));

// --- 5. HEALTH & METRICS ---
app.use("/health", require("./routes/healthRoutes"));
app.get("/metrics", metricsRoute);

// --- 6. STATUS ---
app.get("/api/services", (req, res) => res.json({
  status:    "Healthy",
  version:   "v1.0.0",
  timestamp: new Date().toISOString(),
  monitor:   `http://localhost:${process.env.PORT || 5000}/status`,
  metrics:   `http://localhost:${process.env.PORT || 5000}/metrics`,
  health:    `http://localhost:${process.env.PORT || 5000}/health/detail`,
}));
app.get("/", (req, res) => res.json({ message: "SmartCart API running!", status: "Ready" }));

// --- 7. ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message}`);
  res.status(err.status || 500).json({ message: err.message || "Dicka shkoi keq!" });
});

module.exports = app;

// --- 8. START ---
if (require.main === module) {
  const Consul         = require("consul");
  const CircuitBreaker = require("opossum");
  const { startGrpcServer } = require("./config/grpcServer");
  const messageQueue   = require("./config/messageQueue");
  const sequelize      = require("./config/db");
  const connectMongo   = require("./config/mongodb");

  const consul    = new Consul();
  const serviceId = "smartcart-api-" + Math.random().toString(36).substr(2, 9);

  const dummyServiceCall = async () => new Promise(r => setTimeout(() => r("OK"), 100));
  const breaker = new CircuitBreaker(dummyServiceCall, { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 10000 });
  breaker.fallback(() => ({ status: "Fallback" }));

  async function startServer() {
    try {
      await sequelize.authenticate(); console.log("MySQL Connected!");
      await sequelize.sync();
      await connectMongo();           console.log("MongoDB Connected!");

      try {
        const { connectRedis } = require("./config/redis");
        await connectRedis();         console.log("Redis Connected!");
      } catch { console.log("Redis skip..."); }

      await messageQueue.connectRabbitMQ(); console.log("RabbitMQ Connected!");

      try {
        await consul.agent.service.register({
          name: "smartcart-api", id: serviceId,
          address: "localhost", port: process.env.PORT || 5000,
          check: { http: `http://localhost:${process.env.PORT || 5000}/health/live`, interval: "10s", timeout: "5s" }
        });
        console.log("Consul Registered!");
      } catch { console.log("Consul skip..."); }

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Metrics:        http://localhost:${PORT}/metrics`);
        console.log(`Health:         http://localhost:${PORT}/health/detail`);
        console.log(`Status Monitor: http://localhost:${PORT}/status`);
        console.log(`Swagger:        http://localhost:${PORT}/api-docs`);
      });

      startGrpcServer();
    } catch (error) {
      console.error("Server start error:", error.message);
      process.exit(1);
    }
  }

  startServer();
}