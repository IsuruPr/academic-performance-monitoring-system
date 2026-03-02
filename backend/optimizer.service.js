function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Simple marks->GPA proxy (later replace with your uni grade rules)
function marksToGpa(m) {
  const g = (Number(m) / 100) * 4;
  return clamp(g, 0, 4);
}

export function calculatePlan(subjects, targetGpa) {
  const tg = Number(targetGpa);
  if (Number.isNaN(tg) || tg < 0 || tg > 4) throw new Error("INVALID_TARGET_GPA");
  if (!subjects?.length) throw new Error("NO_SUBJECTS");

  const baselineFinal = 50;

  const cleaned = subjects.map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    credits: Number(s.credits),
    difficulty: Number(s.difficulty ?? 3),
    caMarks: Number(s.caMarks),
    caWeight: Number(s.caWeight ?? 0.4),
    finalWeight: Number(s.finalWeight ?? 0.6),
  }));

  const totalCredits = cleaned.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits <= 0) throw new Error("INVALID_CREDITS");

  const predicted = cleaned.map((s) => {
    const predictedMark = s.caWeight * s.caMarks + s.finalWeight * baselineFinal;
    const predictedGpa = marksToGpa(predictedMark);
    return { ...s, predictedMark, predictedGpa };
  });

  const currentGpa =
    predicted.reduce((sum, s) => sum + s.predictedGpa * s.credits, 0) / totalCredits;

  const gap = tg - currentGpa;

  const weights = predicted.map((s) => s.credits * s.difficulty);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;

  const requiredFinals = predicted.map((s, i) => {
    const share = weights[i] / wSum;

    const neededGpaInc = Math.max(0, gap) * share;
    const neededMarkInc = (neededGpaInc / 4) * 100;

    const targetOverallMark = clamp(s.predictedMark + neededMarkInc, 0, 100);

    const denom = s.finalWeight || 0.6;
    const reqFinal = (targetOverallMark - s.caWeight * s.caMarks) / denom;
    const requiredFinal = clamp(reqFinal, 0, 100);

    const impactScore = s.credits * s.difficulty * Math.max(0, requiredFinal - baselineFinal);

    return {
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      credits: s.credits,
      difficulty: s.difficulty,
      caMarks: s.caMarks,
      requiredFinal: Number(requiredFinal.toFixed(1)),
      impactScore: Number(impactScore.toFixed(1)),
    };
  });

  const priority = [...requiredFinals].sort((a, b) => b.impactScore - a.impactScore);

  return {
    currentGpa: Number(currentGpa.toFixed(2)),
    targetGpa: Number(tg.toFixed(2)),
    gap: Number(gap.toFixed(2)),
    requiredFinals,
    priority
  };
}

export function simulateWhatIf(subjects, targetGpa, subjectId, assumedFinal) {
  const af = Number(assumedFinal);
  if (!subjectId) throw new Error("INVALID_SUBJECT_ID");
  if (Number.isNaN(af) || af < 0 || af > 100) throw new Error("INVALID_ASSUMED_FINAL");

  const baselineFinal = 50;
  const totalCredits = subjects.reduce((sum, s) => sum + Number(s.credits || 0), 0);
  if (totalCredits <= 0) throw new Error("INVALID_CREDITS");

  const updated = subjects.map((s) => {
    const caW = Number(s.caWeight ?? 0.4);
    const fW = Number(s.finalWeight ?? 0.6);
    const finalUsed = s.subjectId === subjectId ? af : baselineFinal;
    const mark = caW * Number(s.caMarks) + fW * finalUsed;
    const gpa = marksToGpa(mark);
    return { ...s, predictedMark: mark, predictedGpa: gpa };
  });

  const newGpa =
    updated.reduce((sum, s) => sum + s.predictedGpa * Number(s.credits || 0), 0) / totalCredits;

  const plan = calculatePlan(subjects, targetGpa);
  return {
    ...plan,
    currentGpa: Number(newGpa.toFixed(2)),
    gap: Number((Number(plan.targetGpa) - newGpa).toFixed(2))
  };
}