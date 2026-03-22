// UI-only mode: use local dummy logic, no backend/database needed.
const USE_MOCK_API = true;
const API_BASE = "";

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function validateWeights({ labWeight, quizWeight, midWeight, examWeight }) {
  const errors = [];
  const all = { labWeight, quizWeight, midWeight, examWeight };

  for (const [key, value] of Object.entries(all)) {
    if (!isFiniteNumber(value)) errors.push(`${key} must be a number.`);
    else if (value < 0 || value > 100) errors.push(`${key} must be between 0 and 100.`);
  }

  if (errors.length === 0 && labWeight + quizWeight + midWeight + examWeight !== 100) {
    errors.push("Weightage total must be 100.");
  }
  return errors;
}

function gpaFromTarget(targetGrade) {
  if (targetGrade >= 90) return 4.0;
  if (targetGrade >= 80) return 3.7;
  if (targetGrade >= 75) return 3.3;
  if (targetGrade >= 70) return 3.0;
  if (targetGrade >= 65) return 2.7;
  if (targetGrade >= 60) return 2.3;
  if (targetGrade >= 55) return 2.0;
  if (targetGrade >= 50) return 1.7;
  return 0.0;
}

function mockValidateModule(payload) {
  const { moduleName, credits, labWeight, quizWeight, midWeight, examWeight } = payload || {};
  const errors = [];

  if (typeof moduleName !== "string" || moduleName.trim().length === 0) {
    errors.push("Module name is required.");
  }
  if (!isFiniteNumber(credits) || credits <= 0) {
    errors.push("Credits must be a positive number.");
  }
  errors.push(...validateWeights({ labWeight, quizWeight, midWeight, examWeight }));
  return { valid: errors.length === 0, errors };
}

function mockCalculateMarks(module, marks) {
  const errors = validateWeights(module || {});
  const labMark = marks?.labMark ?? null;
  const quizMark = marks?.quizMark ?? null;
  const midMark = marks?.midMark ?? null;
  const targetGrade = marks?.targetGrade ?? 75;

  for (const [key, value] of Object.entries({ labMark, quizMark, midMark })) {
    if (value === null) continue;
    if (!isFiniteNumber(value) || value < 0 || value > 100) {
      errors.push(`${key} must be between 0 and 100.`);
    }
  }
  if (!isFiniteNumber(targetGrade) || targetGrade < 0 || targetGrade > 100) {
    errors.push("targetGrade must be between 0 and 100.");
  }
  if (errors.length) return { valid: false, errors };

  const currentCA =
    ((labMark ?? 0) / 100) * module.labWeight +
    ((quizMark ?? 0) / 100) * module.quizWeight +
    ((midMark ?? 0) / 100) * module.midWeight;
  const examNeededRaw = (targetGrade - currentCA) / (module.examWeight / 100);
  const examNeeded = Math.round(examNeededRaw * 10) / 10;
  const examStatus = examNeededRaw <= 0 ? "secured" : examNeededRaw > 100 ? "unreachable" : "possible";

  return {
    valid: true,
    errors: [],
    stats: {
      currentCA: Math.round(currentCA * 10) / 10,
      examNeeded,
      examStatus,
      gpaImpact: gpaFromTarget(targetGrade),
    },
  };
}

// POST /api/module/validate
export async function validateModule(payload) {
  if (USE_MOCK_API) return mockValidateModule(payload);
  const res = await fetch(`${API_BASE}/api/module/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// POST /api/marks/calculate
export async function calculateMarks(module, marks) {
  if (USE_MOCK_API) return mockCalculateMarks(module, marks);
  const res = await fetch(`${API_BASE}/api/marks/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module, marks }),
  });
  return res.json();
}