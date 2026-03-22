const express     = require("express");
const router      = express.Router();
const { validateModulePayload, validateMarksPayload } = require("./validation");
const { calculateCAMark, calculateExamNeeded, gradeToGPA, gpaLabel } = require("./calculations");

// POST /api/module/validate
router.post("/module/validate", (req, res) => {
  const errors = validateModulePayload(req.body);
  if (errors.length > 0) return res.status(400).json({ valid: false, errors });
  res.json({ valid: true, errors: [] });
});

// POST /api/marks/calculate
router.post("/marks/calculate", (req, res) => {
  const { module: mod, marks } = req.body;

  if (!mod || !marks)
    return res.status(400).json({ valid: false, errors: ["Request must include 'module' and 'marks'."] });

  const errors = validateMarksPayload(marks);
  if (errors.length > 0) return res.status(400).json({ valid: false, errors });

  const targetGrade = parseFloat(marks.targetGrade) || 75;
  const currentCA   = calculateCAMark(mod, marks);
  const examNeeded  = calculateExamNeeded(targetGrade, currentCA, mod.examWeight);
  const examStatus  = examNeeded > 100 ? "unreachable" : examNeeded <= 0 ? "secured" : "achievable";
  const gpa         = gradeToGPA(targetGrade);

  res.json({
    valid: true,
    errors: [],
    stats: { currentCA, examNeeded, examStatus, gpaImpact: gpa, gpaLabel: gpaLabel(gpa) },
  });
});

module.exports = router;