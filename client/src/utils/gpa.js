import { gradePoints, yearWeights } from "../data/template";

const round = (value) => Number.parseFloat(value.toFixed(2));

export const calculateMetrics = (semesters) => {
  let totalGradePoints = 0;
  let totalCredits = 0;
  const yearlyGradePoints = new Map();
  const yearlyCredits = new Map();

  const computedSemesters = semesters.map((semester) => {
    let semesterCredits = 0;
    let semesterGradePoints = 0;

    semester.modules.forEach((module) => {
      const credits = Number(module.credits) || 0;
      const point = gradePoints[module.grade] ?? null;

      if (credits > 0 && point !== null) {
        semesterCredits += credits;
        semesterGradePoints += credits * point;
      }
    });

    totalCredits += semesterCredits;
    totalGradePoints += semesterGradePoints;
    yearlyGradePoints.set(semester.year, (yearlyGradePoints.get(semester.year) ?? 0) + semesterGradePoints);
    yearlyCredits.set(semester.year, (yearlyCredits.get(semester.year) ?? 0) + semesterCredits);

    return {
      ...semester,
      semesterCredits,
      semesterGpa: semesterCredits > 0 ? round(semesterGradePoints / semesterCredits) : 0,
    };
  });

  let wgpa = 0;

  Object.entries(yearWeights).forEach(([yearKey, weight]) => {
    const year = Number(yearKey);
    const credits = yearlyCredits.get(year) ?? 0;
    const gradePointsForYear = yearlyGradePoints.get(year) ?? 0;
    const yearGpa = credits > 0 ? gradePointsForYear / credits : 0;
    wgpa += yearGpa * (weight / 100);
  });

  return {
    semesters: computedSemesters,
    totalCredits,
    cgpa: totalCredits > 0 ? round(totalGradePoints / totalCredits) : 0,
    wgpa: round(wgpa),
  };
};
