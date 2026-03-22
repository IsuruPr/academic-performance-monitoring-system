// ── GPA helpers (frontend-only — used for live preview before saving) ─────

export function gradeToGPA(pct) {
  if (pct >= 90) return 4.0; if (pct >= 80) return 3.7;
  if (pct >= 75) return 3.3; if (pct >= 70) return 3.0;
  if (pct >= 65) return 2.7; if (pct >= 60) return 2.3;
  if (pct >= 55) return 2.0; if (pct >= 50) return 1.7;
  return 0.0;
}

export function gpaLabel(gpa) {
  if (gpa >= 3.7) return "First Class";
  if (gpa >= 3.3) return "Upper Second";
  if (gpa >= 3.0) return "Lower Second";
  if (gpa >= 2.0) return "Pass";
  return "Below Pass";
}