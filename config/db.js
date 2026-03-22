const mongoose = require("mongoose");

const connectDB = async () => {
  const primary = process.env.MONGODB_URI;
  const fallback = process.env.MONGODB_FALLBACK_URI || "mongodb://127.0.0.1:27017/historical";

  const tryConnect = async (uri, label) => {
    if (!uri) return null;
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected (${label}): ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB Error (${label}):`, error.message);
      return null;
    }
  };

  const conn = (await tryConnect(primary, "primary")) || (await tryConnect(fallback, "fallback"));

  if (!conn) {
    console.warn("MongoDB not connected. API will run but DB features will fail.");
  }
};

module.exports = connectDB;
