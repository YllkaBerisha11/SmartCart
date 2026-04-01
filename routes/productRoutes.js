const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Shiko të gjitha produktet
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id - Shiko një produkt
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - Krijo produkt të ri
router.post("/", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Emri dhe çmimi janë të detyrueshëm!" });
    const product = await Product.create({ name, price, description });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id - Përditëso produkt
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });
    const { name, price, description } = req.body;
    await product.update({ name, price, description });
    res.json({ message: "✅ Produkti u përditësua!", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id - Fshi produkt
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Produkti nuk u gjet!" });
    await product.destroy();
    res.json({ message: "✅ Produkti u fshi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;