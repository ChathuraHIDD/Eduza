const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4,
        message: "Each question must have exactly 4 options",
      },
      default: [],
    },
    correctOption: {
      type: String,
      enum: ["A", "B", "C", "D", ""],
      default: "",
    },
    correctOptionIndex: { type: Number, min: 0, max: 3, default: 0 },
  },
  { _id: false }
);

const outcomeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const progressAssessmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["quiz", "selfcheck"],
      required: true,
      index: true,
    },
    moduleId: { type: String, required: true, index: true },
    moduleName: { type: String, required: true, trim: true },
    moduleCode: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    questionCount: { type: Number, default: 0, min: 0 },
    questions: { type: [questionSchema], default: [] },
    learningOutcomes: { type: [outcomeSchema], default: [] },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressAssessment", progressAssessmentSchema);
