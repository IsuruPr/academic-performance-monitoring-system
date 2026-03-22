const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  name: String,
  credits: Number,
  grade: String,
  points: Number,
});

const SemesterSchema = new mongoose.Schema({
  semesterName: String,
  modules: [ModuleSchema],
  semesterGPA: Number,
  totalCredits: Number,
});

const GPASchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  semesters: [SemesterSchema],
  cgpa: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GPA", GPASchema);
