const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    items: [
      {
        topic: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
