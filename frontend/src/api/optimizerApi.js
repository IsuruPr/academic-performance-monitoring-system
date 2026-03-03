const API_BASE = "http://127.0.0.1:5000/api/optimizer";

/* ✅ PLAN FETCH - Semester only */
export async function fetchPlan(semesterId) {
  const url = `${API_BASE}/plan?semesterId=${encodeURIComponent(semesterId)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Plan fetch failed: ${res.status}`);
  }

  return res.json();
}

/* ✅ WHAT-IF - Semester only */
export async function fetchWhatIf({ semesterId, subjectId, assumedFinal }) {
  const res = await fetch(`${API_BASE}/whatif`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      semesterId,
      subjectId,
      assumedFinal,
    }),
  });

  if (!res.ok) {
    throw new Error(`What-if failed: ${res.status}`);
  }

  return res.json();
}

/* ✅ AI STUDY PLAN */
export async function fetchAiStudyPlan(planData) {
  const res = await fetch("http://127.0.0.1:5000/api/ai/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(planData),
  });

  if (!res.ok) {
    let errMessage = "AI Plan generation failed";
    try {
      const errorData = await res.json();
      errMessage = errorData.message || errMessage;
    } catch (e) {
      errMessage = `${errMessage}: ${res.status}`;
    }
    throw new Error(errMessage);
  }

  return res.json();
}