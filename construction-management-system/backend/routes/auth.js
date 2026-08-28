const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

// Register
router.post("/register", asyncRoute(async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const { password } = req.body;
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (username.length > 50 || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Use a username up to 50 characters and a password between 8 and 128 characters" });
  }

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "Username already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  return res.status(201).json({ message: "User registered" });
}));

// Login
router.post("/login", asyncRoute(async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const { password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "Invalid username or password" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid username or password" });

  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "Authentication is not configured" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token, user: { id: user._id, username: user.username } });
}));

module.exports = router;
