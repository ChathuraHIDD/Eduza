const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    planType: { type: String, enum: ["EXAM", "SEMESTER"], required: true },
    inputs: {
      availableHoursPerDay: { type: Number, required: true },
      modules: [
        {
          name: { type: String, required: true },
          priority: { type: Number, min: 1, max: 5, default: 3 },
          currentProgress: { type: Number, min: 0, max: 100, default: 0 },
        },
      ],
    },
    output: {
      schedule: [
        {
          day: { type: String, required: true },      // "Monday"
          blocks: [
            {
              module: { type: String, required: true },
              minutes: { type: Number, required: true },
              task: { type: String, default: "" },
            },
          ],
        },
      ],
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
