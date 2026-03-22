const express    = require("express");
const router     = express.Router();
const { predictGraduation, getStudyAdvice } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { schemas } = require("../validation/schemas");
const asyncHandler = require("../utils/asyncHandler");

router.post("/predict", protect, validate(schemas.ai.predict), asyncHandler(predictGraduation));
router.post("/advice",  protect, validate(schemas.ai.advice), asyncHandler(getStudyAdvice));

module.exports = router;