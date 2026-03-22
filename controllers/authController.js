const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const mem = require("../storage/memory");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const registerUser = async (req, res) => {
  const { name, email, password, university, currentSemester } = req.validated.body;
  const username = String(email).toLowerCase();

  const dbReady = mongoose.connection?.readyState === 1;
  let user;

  if (dbReady) {
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(400).json({ message: "User exists" });

    user = await User.create({
      name,
      email,
      username,
      password,
      university,
      currentSemester,
    });
  } else {
    user = await mem.createUser({ name, email, password, university, currentSemester });
    if (!user) return res.status(400).json({ message: "User exists" });
  }

  res.status(201).json({
    token: generateToken(user._id),
    user,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.validated.body;

  const dbReady = mongoose.connection?.readyState === 1;
  const user = dbReady
    ? await User.findOne({ email: String(email).toLowerCase() }).select("+password")
    : await mem.findUserByEmailWithPassword(email);

  const ok = dbReady ? (user && (await user.matchPassword(password))) : (await mem.verifyPassword(user, password));

  if (!user || !ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: generateToken(user._id),
    user: dbReady ? user : mem.sanitizeUser(user),
  });
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
