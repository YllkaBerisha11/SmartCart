const express  = require("express");
const router   = express.Router();
const Joi      = require("joi");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const NodeCache = require("node-cache");
const Product  = require("../models/Product");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const cache = new NodeCache({ stdTTL: 300 });

// ── MULTER ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/products";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `product_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg","image/jpg","image/png","image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── SCHEMAS ─────────────────────────────────────
const productSchema = Joi.object({
  name:        Joi.string().min(2).max(100).required(),
  price:       Joi.number().positive().required(),
  description: Joi.string().max(500).optional().allow(""),
  category:    Joi.string().optional().allow(""),
  stock:       Joi.number().integer().min(0).optional(),
});

const updateProductSchema = Joi.object({
  name:        Joi.string().min(2).max(100).optional(),
  price:       Joi.number().positive().optional(),
  description: Joi.string().max(500).optional().allow(""),
  category:    Joi.string().optional().allow(""),
  stock:       Joi.number().integer().min(0).optional(),
});

// ── GET ALL ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: "cache", ...cached });

    const { Op } = require("sequelize");
    const where = {};
    if (search)   where.name     = { [Op.like]: `%${search}%` };
    if (category) where.category = category;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where, limit: parseInt(limit), offset, order: [["created_at","DESC"]]
    });

    const result = {
      data: rows,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    };
    cache.set(cacheKey, result);
    res.json({ source: "database", ...result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET BY ID ────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const cached = cache.get(`product_${req.params.id}`);
    if (cached) return res.json({ source: "cache", data: cached });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });

    cache.set(`product_${req.params.id}`, product);
    res.json({ source: "database", data: product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── CREATE ───────────────────────────────────────
router.post("/", protect, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const image_url = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`
      : null;
    const product = await Product.create({ ...req.body, image_url });
    cache.flushAll();
    res.status(201).json({ message: "✅ Produkti u krijua!", data: product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── UPDATE ───────────────────────────────────────
router.put("/:id", protect, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  const { error } = updateProductSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });

    const updateData = { ...req.body };
    if (req.file) {
      if (product.image_url) {
        const old = path.join("uploads/products", path.basename(product.image_url));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      updateData.image_url = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    }

    await product.update(updateData);
    cache.flushAll();
    res.json({ message: "✅ Produkti u përditësua!", data: product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE ───────────────────────────────────────
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });

    if (product.image_url) {
      const old = path.join("uploads/products", path.basename(product.image_url));
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    await product.destroy();
    cache.flushAll();
    res.json({ message: "✅ Produkti u fshi!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ✅ Eksporto edhe cache-in që orderRoutes ta pastrojë
module.exports = router;
module.exports.cache = cache;