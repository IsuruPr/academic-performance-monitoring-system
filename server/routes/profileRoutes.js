const express = require("express");
const GpaProfile = require("../models/GpaProfile");
const protect = require("../middleware/auth");

const router = express.Router();

/* GET /api/profile - Get or create profile */
router.get("/", protect, async (req, res) => {
  try {
    let profile = await GpaProfile.findOne({ user: req.userId });

    if (!profile) {
      profile = await GpaProfile.create({ user: req.userId });
    }

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not load GPA profile." });
  }
});

/* PUT /api/profile - Full profile update */
router.put("/", protect, async (req, res) => {
  try {
    const { faculty, program, semesters, totalCredits, cgpa, wgpa, supportTools } = req.body;

    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      {
        faculty,
        program,
        semesters,
        totalCredits,
        cgpa,
        wgpa,
        supportTools,
        lastCalculatedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not save GPA profile." });
  }
});

/* PUT /api/profile/semesters - Save semester data */
router.put("/semesters", protect, async (req, res) => {
  try {
    const { semesters, totalCredits, cgpa, wgpa } = req.body;

    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      { semesters, totalCredits, cgpa, wgpa, lastCalculatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not save semester data." });
  }
});

/* PUT /api/profile/whatif - Save whatif plans */
router.put("/whatif", protect, async (req, res) => {
  try {
    const { whatIfPlans } = req.body;

    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      { "supportTools.whatIfPlans": whatIfPlans },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not save what-if plans." });
  }
});

/* PUT /api/profile/habits - Save habits */
router.put("/habits", protect, async (req, res) => {
  try {
    const { habits } = req.body;

    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      { "supportTools.habits": habits },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not save habits." });
  }
});

/* PUT /api/profile/events - Save events */
router.put("/events", protect, async (req, res) => {
  try {
    const { events } = req.body;

    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      { "supportTools.events": events },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Could not save events." });
  }
});

/* GET /api/profile/ca-marks - Get all CA mark records */
router.get("/ca-marks", protect, async (req, res) => {
  try {
    const profile = await GpaProfile.findOne({ user: req.userId });
    return res.json(profile?.supportTools?.caRecords || []);
  } catch (error) {
    return res.status(500).json({ message: "Could not load CA records." });
  }
});

/* PUT /api/profile/ca-marks - Upsert a single CA record by id */
router.put("/ca-marks", protect, async (req, res) => {
  try {
    const record = req.body; // { id, moduleName, semesterKey, targetOverallMark, assessments, currentScore, predictedGrade }
    if (!record?.id) return res.status(400).json({ message: "record.id is required" });

    record.updatedAt = new Date();

    // Upsert: replace existing record with same id, or push new one
    let profile = await GpaProfile.findOne({ user: req.userId });
    if (!profile) profile = await GpaProfile.create({ user: req.userId });

    const existing = profile.supportTools.caRecords.findIndex(r => r.id === record.id);
    if (existing >= 0) {
      profile.supportTools.caRecords[existing] = record;
    } else {
      profile.supportTools.caRecords.push(record);
    }

    await profile.save();
    return res.json(profile.supportTools.caRecords);
  } catch (error) {
    return res.status(500).json({ message: "Could not save CA record." });
  }
});

/* DELETE /api/profile/ca-marks/:id - Delete a CA record */
router.delete("/ca-marks/:id", protect, async (req, res) => {
  try {
    const profile = await GpaProfile.findOneAndUpdate(
      { user: req.userId },
      { $pull: { "supportTools.caRecords": { id: req.params.id } } },
      { new: true },
    );
    return res.json(profile?.supportTools?.caRecords || []);
  } catch (error) {
    return res.status(500).json({ message: "Could not delete CA record." });
  }
});

module.exports = router;
