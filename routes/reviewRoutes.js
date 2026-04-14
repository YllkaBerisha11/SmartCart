const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Review = require("../models/Review");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --- SKEMAT E VALIDIMIT ---
const reviewSchema = Joi.object({
  productId: Joi.number().integer().required().messages({
    "any.required": "Product ID është i detyrueshëm!",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating duhet të jetë mes 1 dhe 5!",
    "number.max": "Rating duhet të jetë mes 1 dhe 5!",
    "any.required": "Rating është i detyrueshëm!",
  }),
  comment: Joi.string().min(5).max(500).required().messages({
    "string.min": "Komenti duhet të ketë të paktën 5 karaktere!",
    "any.required": "Komenti është i detyrueshëm!",
  }),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(5).max(500).required(),
});

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Menaxhimi i vlerësimeve të produkteve
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Merr të gjitha reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lista e reviews
 */
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Merr reviews për një produkt specifik
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID e produktit
 *     responses:
 *       200:
 *         description: Reviews e produktit
 *       404:
 *         description: Asnjë review nuk u gjet
 */
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: Number(req.params.productId),
    }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Krijo review të re (duhet të jesh i loguar)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Produkt shumë i mirë!
 *     responses:
 *       201:
 *         description: Review u krijua
 *       400:
 *         description: Të dhëna të pavlefshme
 *       401:
 *         description: Nuk je i autentikuar
 */
router.post("/", protect, async (req, res) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const review = new Review({
      productId: req.body.productId,
      userId: req.user.id,         // ← merret nga JWT, jo nga body
      username: req.user.name,     // ← merret nga JWT
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Përditëso review (vetëm pronari)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID e review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review u përditësua
 *       403:
 *         description: Nuk ke leje
 *       404:
 *         description: Review nuk u gjet
 */
router.put("/:id", protect, async (req, res) => {
  const { error } = updateReviewSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review nuk u gjet!" });

    // Vetëm pronari ose admin mund ta përditësojë
    if (review.userId.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Nuk ke leje ta modifikosh këtë review!" });
    }

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true, runValidators: true }
    );
    res.json({ message: "✅ Review u përditësua!", review: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Fshi review (pronari ose admin)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review u fshi
 *       403:
 *         description: Nuk ke leje
 *       404:
 *         description: Review nuk u gjet
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review nuk u gjet!" });

    // Vetëm pronari ose admin mund ta fshijë
    if (review.userId.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Nuk ke leje ta fshish këtë review!" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Review u fshi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;