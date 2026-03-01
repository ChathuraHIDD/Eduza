const mongoose = require('mongoose');

const stressLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    selectedColors: {
      type: [String],
      required: true,
      validate: {
        validator: (colors) => Array.isArray(colors) && colors.length > 0 && colors.length <= 5,
        message: 'selectedColors must contain between 1 and 5 colors',
      },
    },
    recentActivities: {
      type: [String],
      default: [],
    },
    stressScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    stressLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StressLog', stressLogSchema);
