const API_BASE = "http://127.0.0.1:5000/api/optimizer";

/** Returns auth headers if a token exists in localStorage */
function authHeaders() {
  const token = localStorage.getItem("gpa_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ✅ PLAN FETCH - Semester only */
export async function fetchPlan(semesterId, targetGpa) {
  let url = `${API_BASE}/plan?semesterId=${encodeURIComponent(semesterId)}`;
  if (targetGpa) url += `&targetGpa=${encodeURIComponent(targetGpa)}`;

  const res = await fetch(url, {
    headers: { ...authHeaders() },
  });

  if (!res.ok) {
    let msg = `Plan fetch failed: ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch (_) { /* ignore */ }
    throw new Error(msg);
  }

  return res.json();
}

/* ✅ WHAT-IF - Semester only */
export async function fetchWhatIf({ semesterId, subjectId, assumedFinal, targetGpa }) {
  const res = await fetch(`${API_BASE}/whatif`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      semesterId,
      subjectId,
      assumedFinal,
      targetGpa,
    }),
  });

  if (!res.ok) {
    let msg = `What-if failed: ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch (_) { /* ignore */ }
    throw new Error(msg);
  }

  return res.json();
}

/* ✅ AI STUDY PLAN */
export async function fetchAiStudyPlan(planData) {
  const res = await fetch("http://127.0.0.1:5000/api/ai/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(planData),
  });

  if (!res.ok) {
    let errMessage = "AI Plan generation failed";
    try {
      const errorData = await res.json();
      errMessage = errorData.message || errMessage;
    } catch (_) {
      errMessage = `${errMessage}: ${res.status}`;
    }
    throw new Error(errMessage);
  }

  return res.json();
}

/* ✅ AI SUBJECT STUDY PLAN - per subject */
export async function fetchAiSubjectPlan(subjectData) {
  const res = await fetch("http://127.0.0.1:5000/api/ai/subject-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(subjectData),
  });

  if (!res.ok) {
    let errMessage = "Subject plan generation failed";
    try {
      const errorData = await res.json();
      errMessage = errorData.message || errMessage;
    } catch (_) {
      errMessage = `${errMessage}: ${res.status}`;
    }
    throw new Error(errMessage);
  }

  return res.json();
}