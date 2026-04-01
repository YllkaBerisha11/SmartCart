const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// --- 1. SHTRESA E SIGURISË ---
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Keni bërë shumë kërkesa, provoni përsëri pas 15 minutash!" }
});
app.use("/api/", apiLimiter);

// --- 2. MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- 3. ROUTES ---
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("SmartCart API is running securely...");
});

// --- 4. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("!!! GABIM:", err.message);
  res.status(500).json({ message: "Diçka shkoi keq në server!" });
});

// --- 5. DATABASE & SERVER START ---
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
    });
  } catch (error) {
    console.error("❌ Gabim fatal gjatë nisjes:", error.message);
    process.exit(1);
  }
}

startServer();