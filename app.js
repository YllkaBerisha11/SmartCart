const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json()); // Kritike: Lexon të dhënat nga PowerShell/React

// ROUTES
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("SmartCart API is running...");
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("!!! GABIM GLOBAL:", err.message);
  res.status(500).json({ message: "Diçka shkoi keq në server!" });
});

// DATABASE & SERVER
const sequelize = require("./config/db");
require("./models/User");
require("./models/Product");
require("./models/Order");
require("./models/OrderItem");

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ MySQL Tables Synced");
});

const connectMongo = require("./config/mongodb");
const PORT = process.env.PORT || 5000;

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});