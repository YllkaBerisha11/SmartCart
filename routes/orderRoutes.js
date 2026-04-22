const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const orderSchema = Joi.object({
  total_price: Joi.number().positive().required().messages({
    "number.base": "Çmimi total duhet të jetë numër!",
    "number.positive": "Çmimi total duhet të jetë pozitiv!",
    "any.required": "Çmimi total është i detyrueshëm!",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Duhet të ketë të paktën një produkt në order!",
      "any.required": "Items janë të detyrueshëm!",
    }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required()
    .messages({
      "any.only": "Statusi duhet të jetë: pending, processing, shipped, delivered, ose cancelled!",
      "any.required": "Statusi është i detyrueshëm!",
    }),
});

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Menaxhimi i porosive
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Merr të gjitha orders (vetëm Admin)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista e të gjitha orders
 *       401:
 *         description: Nuk je i autentikuar
 *       403:
 *         description: Nuk ke leje admin
 */
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.findAll({ include: OrderItem });
    res.json(orders);
  } catch (err) {
    console.error("❌ GET ORDERS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Merr orders e përdoruesit të loguar
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Orders e përdoruesit
 *       401:
 *         description: Nuk je i autentikuar
 */
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: OrderItem,
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ GET MY ORDERS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Merr një order sipas ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order u gjet
 *       404:
 *         description: Order nuk u gjet
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: OrderItem });
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Nuk ke leje ta shohësh këtë order!" });
    }
    res.json(order);
  } catch (err) {
    console.error("❌ GET ORDER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Krijo order të ri
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - total_price
 *               - items
 *             properties:
 *               total_price:
 *                 type: number
 *                 example: 59.99
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 29.99
 *     responses:
 *       201:
 *         description: Order u krijua me sukses
 *       400:
 *         description: Të dhëna të pavlefshme
 */
router.post("/", protect, async (req, res) => {
  const { error } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user_id = req.user.id;
    const { total_price, items } = req.body;

    const order = await Order.create({ 
      user_id, 
      total_price,
      status: "pending"
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    res.status(201).json({ 
      message: "✅ Order u krijua me sukses!", 
      orderId: order.id 
    });
  } catch (err) {
    console.error("❌ ORDER ERROR:", err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Përditëso statusin e order (vetëm Admin)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order u përditësua
 *       403:
 *         description: Nuk ke leje admin
 *       404:
 *         description: Order nuk u gjet
 */
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  const { error } = updateStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    await order.update({ status: req.body.status });
    res.json({ message: "✅ Order u përditësua!", order });
  } catch (err) {
    console.error("❌ UPDATE ORDER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Fshi order (vetëm Admin)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order u fshi
 *       403:
 *         description: Nuk ke leje admin
 *       404:
 *         description: Order nuk u gjet
 */
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    await OrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();
    res.json({ message: "✅ Order u fshi!" });
  } catch (err) {
    console.error("❌ DELETE ORDER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;