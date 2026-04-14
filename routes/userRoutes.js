const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// --- SKEMAT E VALIDIMIT ---
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "Emri duhet të ketë të paktën 3 karaktere!",
    "string.max": "Emri nuk mund të kalojë 50 karaktere!",
    "any.required": "Emri është i detyrueshëm!",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Ju lutem jepni një adresë email të vlefshme!",
    "any.required": "Emaili është i detyrueshëm!",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Fjalëkalimi duhet të jetë të paktën 6 karaktere!",
    "any.required": "Fjalëkalimi është i detyrueshëm!",
  }),
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Formati i emailit nuk është i saktë!",
    "any.required": "Emaili është i detyrueshëm!",
  }),
  password: Joi.string().required().messages({
    "any.required": "Fjalëkalimi duhet plotësuar!",
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
});

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Autentikimi dhe menaxhimi i përdoruesve
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Regjistro përdorues të ri
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yllka Berisha
 *               email:
 *                 type: string
 *                 example: yllka@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Regjistrimi u krye me sukses
 *       400:
 *         description: Të dhëna të pavlefshme ose email ekziston
 *       500:
 *         description: Gabim i serverit
 */
router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Ky email është regjistruar më parë!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      message: "✅ Regjistrimi u krye me sukses!",
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Gabim i brendshëm i serverit!" });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Identifikohu dhe merr JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: yllka@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login i suksesshëm, kthehet JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Email ose fjalëkalim i gabuar
 *       500:
 *         description: Gabim i serverit
 */
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Email ose fjalëkalim i gabuar!" });

    // ✅ SHTOHET role në JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,       // ← KRITIKE për authorizeRoles()
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "✅ Login i suksesshëm!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë identifikimit!" });
  }
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Shiko profilin e përdoruesit të loguar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Të dhënat e profilit
 *       401:
 *         description: Nuk je i autentikuar
 *       404:
 *         description: Përdoruesi nuk u gjet
 */
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Përditëso profilin e përdoruesit të loguar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profili u përditësua
 *       400:
 *         description: Të dhëna të pavlefshme
 *       401:
 *         description: Nuk je i autentikuar
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet!" });

    const { name, email } = req.body;
    await user.update({ name, email });

    res.json({
      message: "✅ Profili u përditësua!",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Merr të gjithë përdoruesit (vetëm Admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista e përdoruesve
 *       403:
 *         description: Nuk ke leje admin
 */
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Fshi një përdorues (vetëm Admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID e përdoruesit
 *     responses:
 *       200:
 *         description: Llogaria u fshi
 *       403:
 *         description: Nuk ke leje admin
 *       404:
 *         description: Përdoruesi nuk u gjet
 */
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
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