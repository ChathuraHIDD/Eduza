const mongoose = require('mongoose');

const relaxationSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    activityType: {
      type: String,
      enum: ['BREATHING', 'PUZZLE', 'POMODORO', 'MEDITATION'],
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RelaxationSession', relaxationSessionSchema);
