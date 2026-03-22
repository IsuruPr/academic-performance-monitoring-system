// ── Validation helpers ─────────────────────────────────────────────────────

function validateModulePayload({ moduleName, credits, labWeight, quizWeight, midWeight, examWeight }) {
    const errors = [];
  
    if (!moduleName || !moduleName.trim())
      errors.push("Module Name is required.");
  
    const c = parseFloat(credits);
    if (isNaN(c) || c < 1 || c > 10)
      errors.push("Credits must be between 1 and 10.");
  
    for (const [key, val] of Object.entries({ labWeight, quizWeight, midWeight, examWeight })) {
      const n = parseFloat(val);
      if (isNaN(n) || n < 0 || n > 100)
        errors.push(`${key} must be a number between 0 and 100.`);
    }
  
    const total = (parseFloat(labWeight)  || 0)
                + (parseFloat(quizWeight) || 0)
                + (parseFloat(midWeight)  || 0)
                + (parseFloat(examWeight) || 0);
  
    if (Math.round(total) !== 100)
      errors.push(`Weights must sum to 100. Current total: ${total}.`);
  
    return errors;
  }
  
  function validateMarksPayload({ labMark, quizMark, midMark, targetGrade }) {
    const errors = [];
  
    for (const [key, val] of Object.entries({ labMark, quizMark, midMark })) {
      if (val === null || val === undefined || val === "") continue;
      const n = parseFloat(val);
      if (isNaN(n) || n < 0 || n > 100)
        errors.push(`${key} must be between 0 and 100.`);
    }
  
    if (targetGrade !== undefined && targetGrade !== null && targetGrade !== "") {
      const tg = parseFloat(targetGrade);
      if (isNaN(tg) || tg < 0 || tg > 100)
        errors.push("Target Grade must be between 0 and 100.");
    }
  
    return errors;
  }
  
  module.exports = { validateModulePayload, validateMarksPayload };