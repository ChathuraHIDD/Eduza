const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    defaultDailyHours: {
      type: Number,
      default: 3,
    },
    weekendDailyHours: {
      type: Number,
      default: 4,
    },
    blackoutDates: [Date],
    dailyOverrides: [
      {
        date: Date,
        hours: Number,
      },
    ],
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    sessionLengthMinutes: {
      type: Number,
      default: 60,
    },
    maxDailySessions: Number,
    fatigueSensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    includeBufferDays: {
      type: Number,
      default: 1,
    },
    preferredFocusBlocks: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'exam', 'semester'],
      required: true,
    },
    expectedGrade: String,
    dueDate: Date,
    remainingDays: Number,
    totalTopics: Number,
    estimatedHours: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    notes: String,
  },
  { _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    scheduledDate: {
      type: Date,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    moduleType: {
      type: String,
      enum: ['assignment', 'exam', 'semester'],
      required: true,
    },
    focusType: {
      type: String,
      enum: ['learn', 'revision', 'assessment', 'buffer'],
      default: 'learn',
    },
    intensity: {
      type: String,
      enum: ['light', 'standard', 'deep'],
      default: 'standard',
    },
    strategy: String,
    recommendations: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'skipped'],
      default: 'scheduled',
    },
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    totalStudyHours: Number,
    totalDays: Number,
    capacityHours: Number,
    requiredHours: Number,
    workloadLabel: String,
    riskAlerts: {
      type: [String],
      default: [],
    },
    moduleBreakdown: [
      {
        moduleName: String,
        hoursAssigned: Number,
      },
    ],
  },
  { _id: false }
);

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
    scopeType: {
      type: String,
      enum: ['assignment', 'exam', 'semester'],
      required: true,
    },
    targetGrade: String,
    startDate: Date,
    targetDate: Date,
    timezone: {
      type: String,
      default: 'UTC',
    },
    availability: availabilitySchema,
    preferences: preferencesSchema,
    modules: [moduleSchema],
    sessions: [sessionSchema],
    summary: summarySchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
