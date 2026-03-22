const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

const usersByEmail = new Map(); // email(lower) -> user
const usersById = new Map(); // id -> user
const gpaByUserId = new Map(); // userId -> gpa doc

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

async function createUser({ name, email, password, university = "", currentSemester = "Semester 1" }) {
  const em = String(email).toLowerCase();
  if (usersByEmail.has(em)) return null;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = {
    _id: randomUUID(),
    name: String(name || "").trim(),
    email: em,
    username: em,
    university,
    currentSemester,
    createdAt: new Date(),
    passwordHash,
  };
  usersByEmail.set(em, user);
  usersById.set(user._id, user);
  return sanitizeUser(user);
}

async function findUserByEmailWithPassword(email) {
  const em = String(email).toLowerCase();
  return usersByEmail.get(em) || null;
}

function findUserById(id) {
  return usersById.get(id) || null;
}

async function verifyPassword(userWithPassword, enteredPassword) {
  if (!userWithPassword?.passwordHash) return false;
  return bcrypt.compare(enteredPassword, userWithPassword.passwordHash);
}

function getGpaDoc(userId) {
  return gpaByUserId.get(userId) || null;
}

function upsertGpaDoc(userId, doc) {
  gpaByUserId.set(userId, doc);
  return doc;
}

module.exports = {
  sanitizeUser,
  createUser,
  findUserByEmailWithPassword,
  findUserById,
  verifyPassword,
  getGpaDoc,
  upsertGpaDoc,
};

