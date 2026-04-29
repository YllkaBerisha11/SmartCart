/**
 * SmartCart — Health Check Routes
 * GET /health        — status i përgjithshëm
 * GET /health/detail — status i detajuar i çdo shërbimi
 */

const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { redisClient } = require("../config/redis");

// ── Helper: kontrollo MySQL ────────────────────────
const checkMySQL = async () => {
  try {
    await db.authenticate();
    return { status: "UP", message: "MySQL Connected" };
  } catch (err) {
    return { status: "DOWN", message: err.message };
  }
};

// ── Helper: kontrollo Redis ────────────────────────
const checkRedis = async () => {
  try {
    await redisClient.ping();
    return { status: "UP", message: "Redis Connected" };
  } catch (err) {
    return { status: "DOWN", message: err.message };
  }
};

// ── Helper: kontrollo RabbitMQ ─────────────────────
const checkRabbitMQ = async () => {
  try {
    const { connectRabbitMQ } = require("../config/messageQueue");
    return { status: "UP", message: "RabbitMQ Connected" };
  } catch (err) {
    return { status: "DOWN", message: err.message };
  }
};

// ── GET /health — status i shpejtë ────────────────
router.get("/", async (req, res) => {
  res.json({
    status:    "UP",
    service:   "SmartCart Backend",
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    version:   process.env.npm_package_version || "1.0.0",
  });
});

// ── GET /health/detail — status i detajuar ─────────
router.get("/detail", async (req, res) => {
  const [mysql, redis, rabbitmq] = await Promise.allSettled([
    checkMySQL(),
    checkRedis(),
    checkRabbitMQ(),
  ]);

  const services = {
    mysql:    mysql.value    || { status: "DOWN", message: mysql.reason?.message },
    redis:    redis.value    || { status: "DOWN", message: redis.reason?.message },
    rabbitmq: rabbitmq.value || { status: "DOWN", message: rabbitmq.reason?.message },
  };

  const allUp = Object.values(services).every(s => s.status === "UP");

  res.status(allUp ? 200 : 503).json({
    status:    allUp ? "UP" : "DEGRADED",
    service:   "SmartCart Backend",
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    memory:    {
      used:  `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    services,
  });
});

// ── GET /health/ready — readiness probe ───────────
router.get("/ready", async (req, res) => {
  const mysql = await checkMySQL();
  if (mysql.status === "UP") {
    res.json({ status: "READY" });
  } else {
    res.status(503).json({ status: "NOT READY", reason: mysql.message });
  }
});

// ── GET /health/live — liveness probe ────────────
router.get("/live", (req, res) => {
  res.json({ status: "ALIVE", timestamp: new Date().toISOString() });
});

module.exports = router;