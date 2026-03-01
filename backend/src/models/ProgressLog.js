const mongoose = require("mongoose");

const progressLogSchema = new mongoose.Schema(
  {
    user: {
      // you are currently using String for StudyPlan.user, so keep consistent
      type: String,
      required: true,
      index: true,
    },

    // Optional: link to a study plan if you want
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      default: null,
      index: true,
    },

    moduleId: {
      // module id inside StudyPlan.modules is _id (ObjectId)
      type: String,
      default: null,
      index: true,
    },

    moduleName: {
      type: String,
      required: true,
      index: true,
    },

    progressPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // optional: how the progress was recorded
    source: {
      type: String,
      enum: ["manual", "stopwatch", "system"],
      default: "manual",
    },

    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressLog", progressLogSchema);