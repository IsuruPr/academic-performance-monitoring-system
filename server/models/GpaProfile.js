const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    credits: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      trim: true,
      default: "",
    },
    difficulty: {
      type: Number,
      default: 0,
    },
    caMarks: {
      type: Number,
      default: 0,
    },
    caWeight: {
      type: Number,
      default: 0,
    },
    finalWeight: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const semesterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    modules: {
      type: [moduleSchema],
      default: [],
    },
    semesterCredits: {
      type: Number,
      default: 0,
    },
    semesterGpa: {
      type: Number,
      default: 0,
    },
    targetGpa: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const habitSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    moduleName: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Revision",
    },
    targetMinutes: {
      type: Number,
      default: 30,
    },
    preferredTime: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    moduleName: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "Exam",
    },
  },
  { _id: false },
);

const assessmentPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    weight: {
      type: Number,
      default: 0,
    },
    mark: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const caAssessmentRecordSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    mark: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const caMarkRecordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    moduleName: { type: String, default: "" },
    semesterKey: { type: String, default: "" },
    targetOverallMark: { type: Number, default: 80 },
    assessments: { type: [caAssessmentRecordSchema], default: [] },
    currentScore: { type: Number, default: 0 },
    predictedGrade: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const whatIfPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    moduleName: {
      type: String,
      default: "",
    },
    targetOverallMark: {
      type: Number,
      default: 80,
    },
    assessments: {
      type: [assessmentPlanSchema],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const gpaProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    faculty: {
      type: String,
      default: "Faculty of Computing",
    },
    program: {
      type: String,
      default: "BSc (Hons) in Information Technology - Information Technology",
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    wgpa: {
      type: Number,
      default: 0,
    },
    semesters: {
      type: [semesterSchema],
      default: [],
    },
    supportTools: {
      habits: {
        type: [habitSchema],
        default: [],
      },
      events: {
        type: [eventSchema],
        default: [],
      },
      whatIfPlans: {
        type: [whatIfPlanSchema],
        default: [],
      },
      caRecords: {
        type: [caMarkRecordSchema],
        default: [],
      },
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GpaProfile", gpaProfileSchema);
