import { gradePoints } from "../data/template";

const round = (value) => Number.parseFloat(value.toFixed(2));

export const getDegreeClassification = (wgpa, cgpa) => {
  if (wgpa >= 3.7) {
    return "First Class Honours";
  }
  if (wgpa >= 3.3) {
    return "Second Class Honours Upper Division";
  }
  if (wgpa >= 3.0) {
    return "Second Class Honours Lower Division";
  }
  if (wgpa >= 2.0) {
    return "Pass";
  }
  if (cgpa > 0 || wgpa > 0) {
    return "Fail";
  }
  return "Complete your grades";
};

export const getClassTone = (classification) => {
  if (classification.includes("First")) {
    return "success";
  }
  if (classification.includes("Upper")) {
    return "info";
  }
  if (classification.includes("Lower") || classification === "Pass") {
    return "warning";
  }
  if (classification === "Complete your grades") {
    return "neutral";
  }
  return "danger";
};

export const calculateTargetCgpa = (currentCredits, currentCgpa, remainingCredits, futureGrade) => {
  const currentPoints = currentCredits * currentCgpa;
  const futurePoints = remainingCredits * (gradePoints[futureGrade] ?? 0);
  const totalCredits = currentCredits + remainingCredits;

  if (totalCredits <= 0) {
    return 0;
  }

  return round((currentPoints + futurePoints) / totalCredits);
};

export const calculateTargetGap = (currentValue, targetValue) => round(targetValue - currentValue);

export const buildAcademicWarnings = (metrics) => {
  const warnings = [];
  const completedSemesters = metrics.semesters.filter((semester) => semester.semesterCredits > 0);
  const lowSemesters = completedSemesters.filter((semester) => semester.semesterGpa < 2);
  const missingGradeCount = metrics.semesters.reduce(
    (total, semester) =>
      total +
      semester.modules.filter((module) => Number(module.credits) > 0 && !module.grade).length,
    0,
  );

  if (metrics.cgpa > 0 && metrics.cgpa < 2.0) {
    warnings.push({
      title: "Critical CGPA warning",
      detail: "Your current CGPA is below 2.00. Immediate grade recovery is needed to stay above pass level.",
      tone: "danger",
    });
  }

  if (lowSemesters.length > 0) {
    warnings.push({
      title: "Low semester GPA detected",
      detail: `${lowSemesters.length} semester(s) are below 2.00 GPA. Review those modules first and plan repeat/improvement options.`,
      tone: "warning",
    });
  }

  if (missingGradeCount > 0) {
    warnings.push({
      title: "Incomplete academic data",
      detail: `${missingGradeCount} module(s) still have credits but no selected grade. Forecasting accuracy will stay low until they are filled.`,
      tone: "neutral",
    });
  }

  if (completedSemesters.length >= 2) {
    const recent = completedSemesters.slice(-2);
    if (recent[1].semesterGpa < recent[0].semesterGpa) {
      warnings.push({
        title: "Recent semester decline",
        detail: `Your latest semester GPA dropped from ${recent[0].semesterGpa.toFixed(2)} to ${recent[1].semesterGpa.toFixed(2)}. Reduce weak modules early in the next semester.`,
        tone: "warning",
      });
    }
  }

  if (warnings.length === 0) {
    warnings.push({
      title: "No major academic warning",
      detail: "Current results do not show a critical risk pattern. Keep saving grades and reviewing forecasts.",
      tone: "success",
    });
  }

  return warnings;
};
