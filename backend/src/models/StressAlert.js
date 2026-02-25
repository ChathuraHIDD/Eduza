const mongoose = require('mongoose');

const stressAlertSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    stressLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StressLog',
      required: true,
    },
    severity: {
      type: String,
      enum: ['HIGH'],
      default: 'HIGH',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    suggestedActions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACKNOWLEDGED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StressAlert', stressAlertSchema);
