const GPA = require("../models/GPA");
const mongoose = require("mongoose");
const mem = require("../storage/memory");

const GRADE_POINTS = {
  "A+":4,"A":4,"A-":3.7,
  "B+":3.3,"B":3,"B-":2.7,
  "C+":2.3,"C":2,"C-":1.7,
  "D":1,"F":0
};

const calcGPA = (modules) => {
  let total = 0, credits = 0;

  modules.forEach(m => {
    total += m.points * m.credits;
    credits += m.credits;
  });

  return credits ? +(total / credits).toFixed(2) : 0;
};

const calculateGPA = async (req, res) => {
  const { modules } = req.validated.body;

  const enriched = modules.map(m => ({
    ...m,
    credits: +m.credits,
    points: GRADE_POINTS[m.grade] || 0,
  }));

  const gpa = calcGPA(enriched);
  const totalCredits = enriched.reduce((a, b) => a + b.credits, 0);

  res.json({ gpa, totalCredits });
};

const saveSemester = async (req, res) => {
  const { semesterName, modules } = req.validated.body;

  const enriched = modules.map(m => ({
    ...m,
    credits: +m.credits,
    points: GRADE_POINTS[m.grade] || 0,
  }));

  const dbReady = mongoose.connection?.readyState === 1;
  const userId = req.user.id || req.user._id;
  const semesterGPA = calcGPA(enriched);

  if (dbReady) {
    let data = await GPA.findOne({ user: userId });
    if (!data) data = new GPA({ user: userId });

    data.semesters = data.semesters.filter((s) => s.semesterName !== semesterName);
    data.semesters.push({
      semesterName,
      modules: enriched,
      semesterGPA,
      totalCredits: enriched.reduce((a, b) => a + b.credits, 0),
    });

    const all = data.semesters.flatMap((s) => s.modules);
    data.cgpa = calcGPA(all);
    data.updatedAt = new Date();

    await data.save();
    return res.json({ success: true, data });
  }

  const existing = mem.getGpaDoc(userId) || { user: userId, semesters: [], cgpa: 0, updatedAt: new Date() };
  existing.semesters = existing.semesters.filter((s) => s.semesterName !== semesterName);
  existing.semesters.push({
    semesterName,
    modules: enriched,
    semesterGPA,
    totalCredits: enriched.reduce((a, b) => a + b.credits, 0),
  });
  const all = existing.semesters.flatMap((s) => s.modules);
  existing.cgpa = calcGPA(all);
  existing.updatedAt = new Date();
  mem.upsertGpaDoc(userId, existing);
  return res.json({ success: true, data: existing });
};

const getGPAData = async (req, res) => {
  const dbReady = mongoose.connection?.readyState === 1;
  const userId = req.user.id || req.user._id;
  const data = dbReady ? await GPA.findOne({ user: userId }) : mem.getGpaDoc(userId);
  res.json(data || {});
};

const deleteSemester = async (req, res) => {
  if (!req.user?.id && !req.user?._id) return res.status(401).json({ message: "Not authorized" });
  const dbReady = mongoose.connection?.readyState === 1;
  const userId = req.user.id || req.user._id;

  if (dbReady) {
    const data = await GPA.findOne({ user: userId });
    if (!data) return res.status(404).json({ message: "No GPA data" });

    data.semesters = data.semesters.filter((s) => s.semesterName !== req.params.name);
    const all = data.semesters.flatMap((s) => s.modules);
    data.cgpa = calcGPA(all);
    data.updatedAt = new Date();
    await data.save();
    return res.json({ success: true });
  }

  const data = mem.getGpaDoc(userId);
  if (!data) return res.status(404).json({ message: "No GPA data" });
  data.semesters = data.semesters.filter((s) => s.semesterName !== req.params.name);
  const all = data.semesters.flatMap((s) => s.modules);
  data.cgpa = calcGPA(all);
  data.updatedAt = new Date();
  mem.upsertGpaDoc(userId, data);
  return res.json({ success: true });
};

module.exports = { calculateGPA, saveSemester, getGPAData, deleteSemester };
