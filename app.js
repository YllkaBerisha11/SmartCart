require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const morgan = require("morgan");
const logger = require("./config/logger");
const { startGrpcServer } = require("./config/grpcServer");
const messageQueue = require("./config/messageQueue");

const app = express();

// --- 1. SIGURIA ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // lejon imazhet nga frontend
}));

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

// --- 3. STATIC FILES — imazhet e produkteve ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 4. LOGGING ---
app.use(morgan("combined", {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// --- 5. SWAGGER ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 6. ROUTES ---
const userRoutes    = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const reviewRoutes  = require("./routes/reviewRoutes");
const statsRoutes   = require("./routes/statsRoutes");

app.use("/api/v1/users",    userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders",   orderRoutes);
app.use("/api/v1/reviews",  reviewRoutes);
app.use("/api/v1/stats",    statsRoutes);

// --- 7. SERVICE DISCOVERY ---
app.get("/api/services", (req, res) => {
  res.json({
    services: [
      { name: "Auth Service",    endpoint: "/api/v1/users",    status: "running", protocol: "REST" },
      { name: "Product Service", endpoint: "/api/v1/products", status: "running", protocol: "REST + gRPC" },
      { name: "Order Service",   endpoint: "/api/v1/orders",   status: "running", protocol: "REST + MQ" },
      { name: "Review Service",  endpoint: "/api/v1/reviews",  status: "running", protocol: "REST" },
      { name: "Stats Service",   endpoint: "/api/v1/stats",    status: "running", protocol: "REST" },
    ],
    gateway: "http://localhost:5000",
    grpc: "localhost:50051",
    messageQueue: "EventEmitter (RabbitMQ simulation)",
    docs: "http://localhost:5000/api-docs",
    version: "v1"
  });
});

app.get("/", (req, res) => {
  res.json({ message: "SmartCart API is running!", version: "v1" });
});

// --- 8. ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl}`);
  res.status(err.status || 500).json({ message: err.message || "Diçka shkoi keq!" });
});

// --- 9. START ---
const sequelize    = require("./config/db");
const connectMongo = require("./config/mongodb");
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected!");
    await sequelize.sync({ alter: true }); // shton payment_method + image_url automatikisht
    await connectMongo();
    console.log("✅ MongoDB Connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`📚 Docs:   http://localhost:${PORT}/api-docs`);
      console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads`);
    });
    startGrpcServer();
    messageQueue.subscribe("order.created",  m => console.log("🛒 [MQ] Order:", m.orderId));
    messageQueue.subscribe("order.exchange", m => console.log("⇄ [MQ] Exchange request:", m.orderId));
    messageQueue.subscribe("order.return",   m => console.log("↩ [MQ] Return request:", m.orderId));
  } catch (error) {
    console.error("❌ Fatal:", error.message);
    process.exit(1);
  }
}

startServer();