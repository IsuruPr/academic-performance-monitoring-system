function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Grade table matching the client-side gradePoints exactly
function marksToGpa(m) {
  const mark = Number(m);
  if (mark >= 90) return 4.0;
  if (mark >= 80) return 4.0;
  if (mark >= 75) return 3.7;
  if (mark >= 70) return 3.3;
  if (mark >= 65) return 3.0;
  if (mark >= 60) return 2.7;
  if (mark >= 55) return 2.3;
  if (mark >= 45) return 2.0;
  if (mark >= 40) return 1.7;
  if (mark >= 35) return 1.3;
  if (mark >= 30) return 1.0;
  return 0.0;
}

function calculatePlan(subjects, targetGpa) {
  const tg = Number(targetGpa);
  if (Number.isNaN(tg) || tg < 0 || tg > 4) throw new Error("INVALID_TARGET_GPA");
  if (!subjects?.length) throw new Error("NO_SUBJECTS");

  // Use each subject's own CA mark as the baseline for "current standing"
  // baselineFinal = what a typical student scores in the final (55 = C+, safe pass)
  const baselineFinal = 55;

  const cleaned = subjects.map((s) => ({
    subjectId:   s.subjectId,
    subjectName: s.subjectName,
    credits:     Number(s.credits),
    difficulty:  Number(s.difficulty ?? 3),
    caMarks:     Number(s.caMarks),
    caWeight:    Number(s.caWeight ?? 0.4),
    finalWeight: Number(s.finalWeight ?? 0.6),
    caSource:    s.caSource || "estimate",
  }));

  const totalCredits = cleaned.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits <= 0) throw new Error("INVALID_CREDITS");

  // Current GPA = based on actual CA marks + assumed baseline final
  const predicted = cleaned.map((s) => {
    const predictedMark = s.caWeight * s.caMarks + s.finalWeight * baselineFinal;
    const predictedGpa  = marksToGpa(predictedMark);
    return { ...s, predictedMark, predictedGpa };
  });

  const currentGpa =
    predicted.reduce((sum, s) => sum + s.predictedGpa * s.credits, 0) / totalCredits;

  const gap = tg - currentGpa;

  // Weight priority by credits × difficulty
  const weights = predicted.map((s) => s.credits * s.difficulty);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;

  const requiredFinals = predicted.map((s, i) => {
    const share = weights[i] / wSum;

    // How much GPA increase this subject needs to contribute
    const neededGpaInc    = Math.max(0, gap) * share;
    // Convert GPA increment to mark increment (inverse of marksToGpa)
    const neededMarkInc   = (neededGpaInc / 4) * 100;
    const targetOverallMark = clamp(s.predictedMark + neededMarkInc, 0, 100);

    // Solve: targetOverall = caWeight*caMarks + finalWeight*requiredFinal
    const denom = s.finalWeight || 0.6;
    const reqFinal = (targetOverallMark - s.caWeight * s.caMarks) / denom;
    const requiredFinal = clamp(reqFinal, 0, 100);

    const impactScore = s.credits * s.difficulty * Math.max(0, requiredFinal - baselineFinal);

    return {
      subjectId:    s.subjectId,
      subjectName:  s.subjectName,
      credits:      s.credits,
      difficulty:   s.difficulty,
      caMarks:      s.caMarks,
      caWeight:     s.caWeight,
      finalWeight:  s.finalWeight,
      caSource:     s.caSource,
      requiredFinal: Number(requiredFinal.toFixed(1)),
      impactScore:   Number(impactScore.toFixed(1)),
    };
  });

  const priority = [...requiredFinals].sort((a, b) => b.impactScore - a.impactScore);

  return {
    currentGpa:    Number(currentGpa.toFixed(2)),
    targetGpa:     Number(tg.toFixed(2)),
    gap:           Number(gap.toFixed(2)),
    requiredFinals,
    priority,
  };
}

function simulateWhatIf(subjects, targetGpa, subjectId, assumedFinal) {
  const af = Number(assumedFinal);
  if (!subjectId) throw new Error("INVALID_SUBJECT_ID");
  if (Number.isNaN(af) || af < 0 || af > 100) throw new Error("INVALID_ASSUMED_FINAL");

  const baselineFinal = 55;
  const totalCredits = subjects.reduce((sum, s) => sum + Number(s.credits || 0), 0);
  if (totalCredits <= 0) throw new Error("INVALID_CREDITS");

  // Recalculate GPA with the assumed final for the selected subject
  const updated = subjects.map((s) => {
    const caW      = Number(s.caWeight ?? 0.4);
    const fW       = Number(s.finalWeight ?? 0.6);
    const finalUsed = s.subjectId === subjectId ? af : baselineFinal;
    const mark     = caW * Number(s.caMarks) + fW * finalUsed;
    const gpa      = marksToGpa(mark);
    return { ...s, predictedMark: mark, predictedGpa: gpa };
  });

  const newGpa =
    updated.reduce((sum, s) => sum + s.predictedGpa * Number(s.credits || 0), 0) / totalCredits;

  const plan = calculatePlan(subjects, targetGpa);
  return {
    ...plan,
    currentGpa: Number(newGpa.toFixed(2)),
    gap:        Number((Number(plan.targetGpa) - newGpa).toFixed(2)),
  };
}

module.exports = { calculatePlan, simulateWhatIf };