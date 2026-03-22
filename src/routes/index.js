const express = require("express");

const router = express.Router();

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function validateWeights({ labWeight, quizWeight, midWeight, examWeight }) {
  const errors = [];
  const ws = { labWeight, quizWeight, midWeight, examWeight };

  for (const [k, v] of Object.entries(ws)) {
    if (!isFiniteNumber(v)) errors.push(`${k} must be a number.`);
    else if (v < 0 || v > 100) errors.push(`${k} must be between 0 and 100.`);
  }

  if (errors.length) return { valid: false, errors };

  const total = labWeight + quizWeight + midWeight + examWeight;
  if (total !== 100) errors.push("Weightage total must be 100.");

  return { valid: errors.length === 0, errors };
}

// POST /api/module/validate
router.post("/module/validate", (req, res) => {
  const {
    moduleName,
    credits,
    labWeight,
    quizWeight,
    midWeight,
    examWeight,
  } = req.body || {};

  const errors = [];

  if (typeof moduleName !== "string" || moduleName.trim().length === 0) {
    errors.push("Module name is required.");
  }

  if (!isFiniteNumber(credits) || credits <= 0) {
    errors.push("Credits must be a positive number.");
  }

  const w = validateWeights({ labWeight, quizWeight, midWeight, examWeight });
  errors.push(...w.errors);

  res.json({ valid: errors.length === 0, errors });
});

// POST /api/marks/calculate
router.post("/marks/calculate", (req, res) => {
  const { module, marks } = req.body || {};
  const errors = [];

  const labWeight = module?.labWeight;
  const quizWeight = module?.quizWeight;
  const midWeight = module?.midWeight;
  const examWeight = module?.examWeight;

  const w = validateWeights({ labWeight, quizWeight, midWeight, examWeight });
  errors.push(...w.errors);

  const labMark = marks?.labMark ?? null;
  const quizMark = marks?.quizMark ?? null;
  const midMark = marks?.midMark ?? null;
  const targetGrade = marks?.targetGrade ?? 75;

  for (const [k, v] of Object.entries({ labMark, quizMark, midMark })) {
    if (v === null) continue;
    if (!isFiniteNumber(v)) errors.push(`${k} must be a number or null.`);
    else if (v < 0 || v > 100) errors.push(`${k} must be between 0 and 100.`);
  }

  if (!isFiniteNumber(targetGrade) || targetGrade < 0 || targetGrade > 100) {
    errors.push("targetGrade must be between 0 and 100.");
  }

  if (errors.length) return res.json({ valid: false, errors });

  const currentCA =
    ((labMark ?? 0) / 100) * labWeight +
    ((quizMark ?? 0) / 100) * quizWeight +
    ((midMark ?? 0) / 100) * midWeight;

  const examNeededRaw = (targetGrade - currentCA) / (examWeight / 100);
  const examNeeded = Math.round(examNeededRaw * 10) / 10;

  let examStatus = "possible";
  if (examNeededRaw <= 0) examStatus = "secured";
  else if (examNeededRaw > 100) examStatus = "unreachable";

  // very small helper mapping; frontend only displays the numeric value / label
  const gpaImpact = targetGrade >= 85 ? 4.0 : targetGrade >= 75 ? 3.7 : targetGrade >= 65 ? 3.3 : targetGrade >= 55 ? 3.0 : targetGrade >= 45 ? 2.7 : 2.0;

  return res.json({
    valid: true,
    errors: [],
    stats: {
      currentCA: Math.round(currentCA * 10) / 10,
      examNeeded,
      examStatus,
      gpaImpact,
    },
  });
});

module.exports = router;

