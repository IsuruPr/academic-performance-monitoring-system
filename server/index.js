const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Attempt to use Google DNS explicitly if Node's default resolver fails
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const coachRoutes = require("./routes/coachRoutes");
const protect = require("./middleware/auth");
const User = require("./models/User");
const GpaProfile = require("./models/GpaProfile");
const { calculatePlan, simulateWhatIf } = require("./optimizer.service.js");
const { generateStudyPlan, generateSubjectStudyPlan, chatWithAI } = require("./ai.service.js");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman) or any localhost/127.0.0.1 port
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Also allow the configured CLIENT_URL
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/coach", coachRoutes);

/* ✅ Semester list (for dropdown) */
app.get("/api/semesters", (req, res) => {
  res.json([
    { id: "y1s1", name: "Year 1 - Semester 1" },
    { id: "y1s2", name: "Year 1 - Semester 2" },
    { id: "y2s1", name: "Year 2 - Semester 1" },
    { id: "y2s2", name: "Year 2 - Semester 2" },
    { id: "y3s1", name: "Year 3 - Semester 1" },
    { id: "y3s2", name: "Year 3 - Semester 2" },
    { id: "y4s1", name: "Year 4 - Semester 1" },
    { id: "y4s2", name: "Year 4 - Semester 2" },
  ]);
});

// Template module data for fallback when profile has no CA data
const SEMESTER_TEMPLATE = {
  y1s1: [
    { code: "IT1120", name: "Introduction to Programming", credits: 4 },
    { code: "IE1030", name: "Data Communication Networks", credits: 4 },
    { code: "IT1130", name: "Mathematics for Computing", credits: 4 },
    { code: "IT1140", name: "Fundamentals of Computing", credits: 4 },
  ],
  y1s2: [
    { code: "IT1160", name: "Discrete Mathematics", credits: 4 },
    { code: "IT1170", name: "Data Structures and Algorithms", credits: 4 },
    { code: "SE1010", name: "Software Engineering", credits: 4 },
    { code: "IT1150", name: "Technical Writing", credits: 4 },
  ],
  y2s1: [
    { code: "IT2120", name: "Probability and Statistics", credits: 4 },
    { code: "SE2010", name: "Object Oriented Programming", credits: 4 },
    { code: "IT2130", name: "Operating Systems", credits: 4 },
    { code: "IT2140", name: "Database Design and Development", credits: 4 },
  ],
  y2s2: [
    { code: "IT2011", name: "AI & Machine Learning", credits: 4 },
    { code: "IT2150", name: "IT Project", credits: 4 },
    { code: "SE2020", name: "Web and Mobile Technologies", credits: 4 },
    { code: "IT2160", name: "Professional Skills", credits: 4 },
  ],
  y3s1: [
    { code: "IT3120", name: "Industry Economics & Management", credits: 4 },
    { code: "IT3130", name: "Application Development", credits: 4 },
    { code: "IT3140", name: "Database Systems", credits: 4 },
    { code: "IT3150", name: "IT Process and Infrastructure", credits: 4 },
  ],
  y3s2: [
    { code: "IT3180", name: "Cloud Technologies", credits: 4 },
    { code: "IT3200", name: "Data Analytics", credits: 4 },
    { code: "IT3160", name: "Research Methods", credits: 4 },
  ],
  y4s1: [
    { code: "IT4200", name: "Research Project I", credits: 4 },
    { code: "IT4210", name: "Information Security", credits: 4 },
    { code: "IT4150", name: "Intelligent Systems Development", credits: 4 },
  ],
  y4s2: [
    { code: "IT4300", name: "Research Project II", credits: 4 },
    { code: "IT4400", name: "Advanced Topics", credits: 4 },
  ],
};

const SEMESTER_ALIAS = {
  "sem-1": "y1s1",
  "sem-2": "y1s2",
  "sem-3": "y2s1",
  "sem-4": "y2s2",
  "sem-5": "y3s1",
  "sem-6": "y3s2",
  "sem-7": "y4s1",
  "sem-8": "y4s2",
};

/** Build subjects array from a GpaProfile semester's modules, falling back to template data */
function buildSubjectsFromProfile(semester, semesterIdLower, profile) {
  const caRecords = profile?.supportTools?.caRecords || [];
  const whatIfPlans = profile?.supportTools?.whatIfPlans || [];

  const extractCaDetails = (moduleCode, moduleName) => {
    const label1 = moduleCode ? `${moduleCode} - ${moduleName}` : moduleName;

    // ── Priority 1: dedicated CA records table (saved from WhatIfPage) ──
    const caRecord = caRecords.find(r =>
      r.moduleName === label1 || r.moduleName === moduleName || r.moduleName === moduleCode
    );

    if (caRecord && caRecord.assessments?.length > 0) {
      const finalRegex = /final/i;
      const finalAss = caRecord.assessments.find(a => finalRegex.test(a.name));
      const caAss    = caRecord.assessments.filter(a => !finalRegex.test(a.name));

      let fwPercent = finalAss ? Number(finalAss.weight) : 0;
      let totalCaWeightPercent = 0, totalCaScore = 0;

      caAss.forEach(a => {
        const w = Number(a.weight) || 0;
        const m = a.completed ? Number(a.mark) || 0 : 0;
        totalCaWeightPercent += w;
        totalCaScore += w * m;
      });

      const caMarks = totalCaWeightPercent > 0 ? totalCaScore / totalCaWeightPercent : 50;
      const sumWeight = totalCaWeightPercent + fwPercent;
      const caWeight  = sumWeight > 0 ? totalCaWeightPercent / sumWeight : 0.4;
      const finalWeight = sumWeight > 0 ? fwPercent / sumWeight : 0.6;

      return {
        caMarks:     Number(caMarks.toFixed(1)),
        caWeight:    Number(caWeight.toFixed(2)),
        finalWeight: Number(finalWeight.toFixed(2)),
      };
    }

    // ── Priority 2: whatIfPlans (legacy fallback) ──
    const plan = whatIfPlans.find(p =>
      p.moduleName === label1 || p.moduleName === moduleName || p.moduleName === moduleCode
    );

    let caMarks = 50, caWeight = 0.4, finalWeight = 0.6;

    if (plan && plan.assessments?.length > 0) {
      const finalRegex = /final/i;
      const finalAssessment = plan.assessments.find(a => finalRegex.test(a.name));
      const caAssessments   = plan.assessments.filter(a => !finalRegex.test(a.name));

      let fwPercent = finalAssessment ? Number(finalAssessment.weight) : 0;
      let totalCaWeightPercent = 0, totalCaScore = 0;

      caAssessments.forEach(a => {
        const w = Number(a.weight) || 0;
        const m = Number(a.mark) || 0;
        totalCaWeightPercent += w;
        totalCaScore += w * m;
      });

      if (totalCaWeightPercent > 0) caMarks = totalCaScore / totalCaWeightPercent;

      const sumWeight = totalCaWeightPercent + fwPercent;
      if (sumWeight > 0) {
        caWeight    = totalCaWeightPercent / sumWeight;
        finalWeight = fwPercent / sumWeight;
      }
      if (!finalAssessment && totalCaWeightPercent > 0 && totalCaWeightPercent < 100) {
        finalWeight = (100 - totalCaWeightPercent) / 100;
        caWeight    = totalCaWeightPercent / 100;
      }
    }

    return { caMarks, caWeight, finalWeight };
  };

  const profileModules = (semester?.modules || []).filter(
    m => m.code && m.name && (m.credits > 0)
  );

  if (profileModules.length > 0) {
    return profileModules.map(m => {
      const { caMarks, caWeight, finalWeight } = extractCaDetails(m.code, m.name);
      const label = m.code ? `${m.code} - ${m.name}` : m.name;
      const hasRecord = (profile?.supportTools?.caRecords || []).some(r =>
        r.moduleName === label || r.moduleName === m.name || r.moduleName === m.code
      );
      // If no CA record and no whatIfPlan, fall back to the module's own caMarks field
      const finalCaMarks = (hasRecord || caMarks !== 50)
        ? caMarks
        : (Number(m.caMarks) > 0 ? Number(m.caMarks) : caMarks);
      return {
        subjectId:   m.code,
        subjectName: m.name,
        credits:     m.credits,
        difficulty:  m.difficulty || 3,
        caMarks:     Number(finalCaMarks.toFixed(1)),
        caWeight:    Number(caWeight.toFixed(2)),
        finalWeight: Number(finalWeight.toFixed(2)),
        caSource:    hasRecord ? "db" : (Number(m.caMarks) > 0 ? "profile" : "estimate"),
      };
    });
  }

  // Fallback: use template data with sensible CA defaults
  const aliasKey = SEMESTER_ALIAS[semesterIdLower];
  const templateModules = SEMESTER_TEMPLATE[semesterIdLower] || SEMESTER_TEMPLATE[aliasKey] || [];
  return templateModules.map(m => {
    const { caMarks, caWeight, finalWeight } = extractCaDetails(m.code, m.name);
    const label = m.code ? `${m.code} - ${m.name}` : m.name;
    const hasRecord = (profile?.supportTools?.caRecords || []).some(r =>
      r.moduleName === label || r.moduleName === m.name || r.moduleName === m.code
    );
    return {
      subjectId: m.code,
      subjectName: m.name,
      credits: m.credits,
      difficulty: 3,
      caMarks: Number(caMarks.toFixed(1)),
      caWeight: Number(caWeight.toFixed(2)),
      finalWeight: Number(finalWeight.toFixed(2)),
      caSource: hasRecord ? "db" : "estimate",
    };
  });
}

/* ✅ GET /api/optimizer/plan?semesterId=y2s1&targetGpa=3.5 */
app.get("/api/optimizer/plan", protect, async (req, res) => {
  try {
    const { semesterId, targetGpa } = req.query;

    if (!semesterId) {
      return res.status(400).json({ message: "semesterId is required" });
    }

    const semesterIdLower = semesterId.toLowerCase();
    const aliasId = SEMESTER_ALIAS[semesterIdLower];

    let profile = await GpaProfile.findOne({ user: req.userId });
    if (!profile) {
      profile = await GpaProfile.create({ user: req.userId });
    }

    // Case-insensitive semester lookup with legacy alias support
    const semester = profile.semesters.find(
      (s) => s.key?.toLowerCase() === semesterIdLower || s.key?.toLowerCase() === aliasId
    );

    const subjects = buildSubjectsFromProfile(semester, semesterIdLower, profile);

    if (!subjects.length) {
      return res.status(404).json({ message: `No module data found for semester ${semesterId}` });
    }

    const resolvedTargetGpa = (targetGpa !== undefined && !isNaN(parseFloat(targetGpa)))
      ? parseFloat(targetGpa)
      : (semester?.targetGpa || 3.0);

    return res.json(calculatePlan(subjects, resolvedTargetGpa));
  } catch (error) {
    console.error("Optimizer Plan Error:", error);
    return res.status(500).json({ message: "Failed to calculate plan." });
  }
});

/* ✅ POST /api/optimizer/whatif  body: { semesterId, subjectId, assumedFinal, targetGpa? } */
app.post("/api/optimizer/whatif", protect, async (req, res) => {
  try {
    const { semesterId, subjectId, assumedFinal, targetGpa } = req.body;

    if (!semesterId || !subjectId) {
      return res.status(400).json({ message: "semesterId and subjectId required" });
    }

    const semesterIdLower = semesterId.toLowerCase();
    const aliasId = SEMESTER_ALIAS[semesterIdLower];

    let profile = await GpaProfile.findOne({ user: req.userId });
    if (!profile) {
      profile = await GpaProfile.create({ user: req.userId });
    }

    // Case-insensitive semester lookup with legacy alias support
    const semester = profile.semesters.find(
      (s) => s.key?.toLowerCase() === semesterIdLower || s.key?.toLowerCase() === aliasId
    );

    const subjects = buildSubjectsFromProfile(semester, semesterIdLower, profile);

    if (!subjects.length) {
      return res.status(404).json({ message: `No module data found for semester ${semesterId}` });
    }

    const resolvedTargetGpa = (targetGpa !== undefined && !isNaN(parseFloat(targetGpa)))
      ? parseFloat(targetGpa)
      : (semester?.targetGpa || 3.0);

    return res.json(simulateWhatIf(subjects, resolvedTargetGpa, subjectId, assumedFinal));
  } catch (error) {
    console.error("WhatIf Error:", error);
    return res.status(500).json({ message: "Failed to simulate what-if plan." });
  }
});

/* ✅ POST /api/ai/study-plan  body: { currentGpa, targetGpa, gap, priority } */
app.post("/api/ai/study-plan", async (req, res) => {
  try {
    const planData = req.body;
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

/* ✅ POST /api/ai/subject-plan  body: { subjectName, credits, difficulty, caMarks, caSource, requiredFinal, caWeight, finalWeight, currentGpa, targetGpa } */
app.post("/api/ai/subject-plan", async (req, res) => {
  try {
    const subjectData = req.body;
    if (!subjectData?.subjectName) {
      return res.status(400).json({ message: "subjectName is required." });
    }
    const markdown = await generateSubjectStudyPlan(subjectData);
    return res.json({ markdown });
  } catch (error) {
    console.error("AI Subject Plan Error:", error);
    return res.status(500).json({ message: error.message || "Failed to generate subject study plan." });
  }
});

/* ✅ POST /api/ai/chat  body: { messages: [{role, content}], language: 'english'|'sinhala'|'auto' } */
app.post("/api/ai/chat", protect, async (req, res) => {
  try {
    const { messages, language = 'auto' } = req.body;
    if (!messages || !messages.length) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const user = await User.findById(req.userId);
    const profile = await GpaProfile.findOne({ user: req.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userContext = {
      user: {
        name: user.name,
        email: user.email,
        university: user.university,
        degreeProgram: user.degreeProgram,
      },
      profile: profile || {},
    };

    const reply = await chatWithAI(messages, userContext, language);
    return res.json({ reply });
  } catch (error) {
    console.error("Chat Route Error:", error);
    return res.status(500).json({ message: error.message || "Chat AI failed." });
  }
});

// 404 Catch-All Middleware
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Export app for testing; only start server when run directly
if (require.main === module) {
  connectDatabase()
    .then(() => {
      console.log("✅ MongoDB connected — full database mode active.");
      app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("❌ Database connection failed:", error.message);
      process.exit(1);
    });
}

module.exports = app;
