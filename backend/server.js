import express from "express";
import cors from "cors";
import { mockEnrollments, mockTargets } from "./mockData.js";
import { calculatePlan, simulateWhatIf } from "./optimizer.service.js";
import { generateStudyPlan } from "./ai.service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Academic GPS Mock API running ✅"));

/* ✅ Semester list (for dropdown) */
app.get("/api/semesters", (req, res) => {
  res.json([
    { id: "Y1S1", name: "Year 1 - Semester 1" },
    { id: "Y1S2", name: "Year 1 - Semester 2" },
    { id: "Y2S1", name: "Year 2 - Semester 1" },
    { id: "Y2S2", name: "Year 2 - Semester 2" },
  ]);
});

/* ✅ GET /api/optimizer/plan?semesterId=Y2S1 */
app.get("/api/optimizer/plan", (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  // ✅ mock logged-in user (later: take from auth token/session)
  const studentId = "S123";

  const subjects = mockEnrollments.filter(
    (x) => x.studentId === studentId && x.semesterId === semesterId
  );
  const target = mockTargets.find(
    (x) => x.studentId === studentId && x.semesterId === semesterId
  );

  if (!subjects.length) return res.status(404).json({ message: "No subjects found (mock)" });
  if (!target) return res.status(404).json({ message: "No target GPA found (mock)" });

  return res.json(calculatePlan(subjects, target.targetGpa));
});

/* ✅ POST /api/optimizer/whatif  body: { semesterId, subjectId, assumedFinal } */
app.post("/api/optimizer/whatif", (req, res) => {
  const { semesterId, subjectId, assumedFinal } = req.body;

  if (!semesterId || !subjectId) {
    return res.status(400).json({ message: "semesterId and subjectId required" });
  }

  const studentId = "S123"; // mock logged-in user

  const subjects = mockEnrollments.filter(
    (x) => x.studentId === studentId && x.semesterId === semesterId
  );
  const target = mockTargets.find(
    (x) => x.studentId === studentId && x.semesterId === semesterId
  );

  if (!subjects.length) return res.status(404).json({ message: "No subjects found (mock)" });
  if (!target) return res.status(404).json({ message: "No target GPA found (mock)" });

  return res.json(simulateWhatIf(subjects, target.targetGpa, subjectId, assumedFinal));
});

/* ✅ POST /api/ai/study-plan  body: { currentGpa, targetGpa, gap, priority } */
app.post("/api/ai/study-plan", async (req, res) => {
  try {
    const planData = req.body;

    // Basic verification
    if (!planData || !planData.priority || !planData.priority.length) {
      return res.status(400).json({ message: "Invalid plan data provided for AI generation." });
    }

    const aiPlanMarkdown = await generateStudyPlan(planData);

    return res.json({ markdown: aiPlanMarkdown });
  } catch (error) {
    console.error("AI Route Error:", error);
    return res.status(500).json({ message: error.message || "Failed to generate AI study plan." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`));