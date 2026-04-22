const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";

const signToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

// ── REGISTER ─────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, university, degreeProgram, password, confirmPassword } = req.body;

    if (!name || !email || !university || !degreeProgram || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const emailLower = email.toLowerCase();
    
    // Check if user already exists (only by email now)
    const existingUser = await User.findOne({ email: emailLower });
    
    if (existingUser) {
      return res.status(409).json({ message: "Student account already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email: emailLower,
      university,
      degreeProgram,
      password: passwordHash
    });

    console.log(`[MongoDB DB] Registered: ${emailLower}`);

    return res.status(201).json({
      token: signToken(newUser._id),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, university: newUser.university, degreeProgram: newUser.degreeProgram },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Registration failed." });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const emailLower = email.toLowerCase();
    const dbUser = await User.findOne({ email: emailLower });

    if (!dbUser) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    console.log(`[MongoDB DB] Login: ${emailLower}`);
    return res.json({
      token: signToken(dbUser._id),
      user: { id: dbUser._id, name: dbUser.name, email: dbUser.email, university: dbUser.university, degreeProgram: dbUser.degreeProgram },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed." });
  }
});

// ── ME ────────────────────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const dbUser = await User.findById(req.userId).select("-password");
    if (!dbUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      university: dbUser.university,
      degreeProgram: dbUser.degreeProgram,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load user details." });
  }
});

module.exports = router;
