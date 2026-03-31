const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// --- 1. SHTRESA E SIGURISË ---
app.use(helmet()); // Mbron Header-at

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
// Shto rrugët e tjera këtu...

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

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
    // 1. Lidhja me MySQL
    await sequelize.authenticate();
    console.log("✅ MySQL Connected!");
    await sequelize.sync({ alter: true });

    // 2. Lidhja me MongoDB
    await connectMongo();
    console.log("✅ MongoDB Connected!");

    // 3. Nisja e Serverit
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gabim fatal gjatë nisjes:", error.message);
    process.exit(1);
  }
}

startServer();