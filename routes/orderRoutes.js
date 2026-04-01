const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { protect } = require("../middleware/authMiddleware");

// GET /api/orders - Shiko të gjitha orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.findAll({ include: OrderItem });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id - Shiko një order
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: OrderItem });
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders - Krijo order të ri
router.post("/", protect, async (req, res) => {
  try {
    const user_id = req.user.id; // ← merret nga JWT token
    const { total_price, items } = req.body;

    if (!total_price || !items || !items.length)
      return res.status(400).json({ message: "Të dhënat janë të pakompletuara!" });

    const order = await Order.create({ user_id, total_price });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    res.status(201).json({ message: "✅ Order u krijua me sukses!", orderId: order.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id - Përditëso statusin e order-it
router.put("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    const { status } = req.body;
    await order.update({ status });
    res.json({ message: "✅ Order u përditësua!", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/orders/:id - Fshi order
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order nuk u gjet!" });
    await OrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();
    res.json({ message: "✅ Order u fshi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;