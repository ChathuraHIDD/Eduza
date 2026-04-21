const mongoose = require("mongoose");

const progressAssessmentAttemptSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgressAssessment",
      required: true,
      index: true,
    },
    quizId: { type: String, required: true, index: true },
    moduleId: { type: String, default: "", index: true },
    moduleCode: { type: String, default: "" },
    moduleName: { type: String, required: true },
    assessmentType: {
      type: String,
      enum: ["quiz", "selfcheck"],
      required: true,
      index: true,
    },
    attemptNumber: { type: Number, required: true, min: 1 },
    score100: { type: Number, required: true, min: 0, max: 100 },
    correctCount: { type: Number, default: 0, min: 0 },
    wrongCount: { type: Number, default: 0, min: 0 },
    totalQuestions: { type: Number, default: 0, min: 0 },
    confidenceLevel: { type: Number, min: 1, max: 5, default: null },
    reflection: { type: String, default: "" },
    checkedOutcomes: { type: Number, default: 0, min: 0 },
    totalOutcomes: { type: Number, default: 0, min: 0 },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProgressAssessmentAttempt",
  progressAssessmentAttemptSchema
);
