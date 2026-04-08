const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },

    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      default: null,
      index: true,
    },

    moduleId: {
      type: String,
      default: null,
      index: true,
    },

    moduleName: {
      type: String,
      required: true,
      index: true,
    },

    sessionType: {
      type: String,
      enum: ["learn", "revision", "assessment"],
      default: "learn",
    },

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["running", "paused", "completed"],
      default: "running",
      index: true,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    totalPausedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    plannedMinutesToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    scheduleLabel: {
      type: String,
      default: "",
    },

    scheduleType: {
      type: String,
      default: "learn",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);