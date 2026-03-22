const express    = require("express");
const router     = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { schemas } = require("../validation/schemas");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", validate(schemas.auth.register), asyncHandler(registerUser));
router.post("/login",    validate(schemas.auth.login), asyncHandler(loginUser));
router.get("/me",        protect, asyncHandler(getMe));

module.exports = router;