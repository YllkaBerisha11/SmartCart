const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");

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

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  console.log("--- TEST: Kërkesë e re u pranua ---");
  console.log("Body:", req.body);

  try {
    // 1. Validimi me Joi (Muri i parë)
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log("❌ Joi bllokoi kërkesën:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // 2. Kontrollo DB (Muri i dytë)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("❌ MySQL bllokoi emailin:", email);
      return res.status(400).json({ message: "Ky email është regjistruar më parë!" });
    }

    // 3. Enkriptimi
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Krijimi
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    console.log("✅ User u krijua me sukses!");
    res.status(201).json({ 
      message: "Regjistrimi u krye me sukses!", 
      userId: user.id 
    });

  } catch (err) {
    console.error("!!! GABIM TEKNIK:", err.message);
    res.status(500).json({ message: "Gabim i brendshëm i serverit!" });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || "sekreti_yt", 
      { expiresIn: "1d" }
    );

    res.json({ message: "Login i suksesshëm!", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë identifikimit!" });
  }
});

module.exports = router;