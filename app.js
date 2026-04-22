require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const morgan = require("morgan");
const logger = require("./config/logger");
const { startGrpcServer } = require("./config/grpcServer");
const messageQueue = require("./config/messageQueue");

const app = express();

// --- 1. SIGURIA ---
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Keni bërë shumë kërkesa, provoni përsëri pas 15 minutash!" }
});
app.use("/api/", apiLimiter);

// --- 2. MIDDLEWARES ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

// --- 3. LOGGING ---
app.use(morgan("combined", {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// --- 4. SWAGGER DOKUMENTACION ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 5. API GATEWAY & ROUTES me Versioning v1 ---
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const statsRoutes = require("./routes/statsRoutes");

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/stats", statsRoutes);

// --- 6. SERVICE DISCOVERY ---
app.get("/api/services", (req, res) => {
  res.json({
    services: [
      { name: "Auth Service", endpoint: "/api/v1/users", status: "running", protocol: "REST" },
      { name: "Product Service", endpoint: "/api/v1/products", status: "running", protocol: "REST + gRPC" },
      { name: "Order Service", endpoint: "/api/v1/orders", status: "running", protocol: "REST + MQ" },
      { name: "Review Service", endpoint: "/api/v1/reviews", status: "running", protocol: "REST" },
      { name: "Stats Service", endpoint: "/api/v1/stats", status: "running", protocol: "REST" },
    ],
    gateway: "http://localhost:5000",
    grpc: "localhost:50051",
    messageQueue: "EventEmitter (RabbitMQ simulation)",
    docs: "http://localhost:5000/api-docs",
    version: "v1"
  });
});

// --- 7. ROOT ---
app.get("/", (req, res) => {
  res.json({
    message: "SmartCart API is running!",
    version: "v1",
    docs: "http://localhost:5000/api-docs",
    services: "http://localhost:5000/api/services"
  });
});

// --- 8. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);
  res.status(err.status || 500).json({ 
    message: err.message || "Diçka shkoi keq në server!" 
  });
});

// --- 9. DATABASE & SERVER START ---
const sequelize = require("./config/db");
const connectMongo = require("./config/mongodb");
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected!");
    await sequelize.sync({ alter: true });
    await connectMongo();
    console.log("✅ MongoDB Connected!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Service Discovery: http://localhost:${PORT}/api/services`);
    });

    // --- gRPC SERVER ---
    startGrpcServer();

    // --- MESSAGE QUEUE SUBSCRIBERS ---
    messageQueue.subscribe("order.created", (message) => {
      console.log(`🛒 [MQ] New order received:`, message);
    });

    messageQueue.subscribe("order.created", (message) => {
      console.log(`📧 [MQ] Sending confirmation email for order ID:`, message.orderId);
    });

    messageQueue.subscribe("order.created", (message) => {
      console.log(`📊 [MQ] Updating stats for order ID:`, message.orderId);
    });

  } catch (error) {
    console.error("❌ Gabim fatal:", error.message);
    process.exit(1);
  }
}

startServer();