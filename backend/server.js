import express from "express";
import cors from "cors";
import { mockEnrollments, mockTargets } from "./mockData.js";
import { calculatePlan, simulateWhatIf } from "./optimizer.service.js";

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`));