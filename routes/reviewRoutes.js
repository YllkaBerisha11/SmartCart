const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET /api/reviews - Shiko të gjitha reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/product/:productId - Shiko reviews për një produkt
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: Number(req.params.productId)
    }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Krijo review të re
router.post("/", async (req, res) => {
  const { productId, userId, username, rating, comment } = req.body;
  if (!productId || !userId || !username || !rating || !comment) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme!" });
  }
  try {
    const review = new Review({ productId, userId, username, rating, comment });
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reviews/:id - Përditëso review
router.put("/:id", async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating dhe komenti janë të detyrueshëm!" });
    }
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Review nuk u gjet!" });
    res.json({ message: "✅ Review u përditësua!", review: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id - Fshi review
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Review nuk u gjet!" });
    res.json({ message: "✅ Review u fshi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;