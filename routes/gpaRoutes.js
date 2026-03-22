const express    = require("express");
const router     = express.Router();
const { getGPAData, saveSemester, deleteSemester, calculateGPA } = require("../controllers/gpaController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { schemas } = require("../validation/schemas");
const asyncHandler = require("../utils/asyncHandler");

router.get("/",                  protect, asyncHandler(getGPAData));
router.post("/semester",         protect, validate(schemas.gpa.saveSemester), asyncHandler(saveSemester));
router.delete("/semester/:name", protect, validate(schemas.gpa.deleteSemester), asyncHandler(deleteSemester));
router.post("/calculate",        protect, validate(schemas.gpa.calculate), asyncHandler(calculateGPA));

module.exports = router;