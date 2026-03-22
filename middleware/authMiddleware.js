const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");
const mem = require("../storage/memory");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const dbReady = mongoose.connection?.readyState === 1;
    req.user = dbReady
      ? await User.findById(decoded.id).select("-password")
      : mem.sanitizeUser(mem.findUserById(decoded.id));

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Token failed" });
  }
};

module.exports = { protect };
