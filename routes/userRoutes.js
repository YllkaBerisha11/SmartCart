const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// --- SKEMAT E VALIDIMIT ---
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Emri duhet të ketë të paktën 3 karaktere!',
    'any.required': 'Emri është i detyrueshëm!'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Ju lutem jepni një adresë email të vlefshme!',
    'any.required': 'Emaili është i detyrueshëm!'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Fjalëkalimi duhet të jetë të paktën 6 karaktere!',
    'any.required': 'Fjalëkalimi është i detyrueshëm!'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Formati i emailit nuk është i saktë!'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Fjalëkalimi duhet plotësuar!'
  })
});

// --- REGISTER ---
router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Ky email është regjistruar më parë!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "✅ Regjistrimi u krye me sukses!", userId: user.id });
  } catch (err) {
    res.status(500).json({ message: "Gabim i brendshëm i serverit!" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "✅ Login i suksesshëm!", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë identifikimit!" });
  }
});

// --- GET /api/users/profile - Shiko profilin (private) ---
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PUT /api/users/profile - Përditëso profilin (private) ---
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });

    const { name, email } = req.body;
    await user.update({ name, email });
    res.json({ message: "✅ Profili u përditësua!", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE /api/users/:id - Fshi user (private) ---
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });
    await user.destroy();
    res.json({ message: "✅ Llogaria u fshi!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;