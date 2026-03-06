const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    code: {
      type: String,
      required: [true, 'Module code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Module name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },

    // ── Academic info ─────────────────────────────────────
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    faculty: {
      type: String,
      default: '',
    },
    credits: {
      type: Number,
      required: [true, 'Credit hours are required'],
      min: 1,
      max: 10,
    },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'online', 'hybrid'],
      default: 'lecture',
    },
    level: {
      type: String,
      enum: ['100', '200', '300', '400', '500', '600'],
      default: '100',
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },

    // ── Capacity & enrollment ─────────────────────────────
    maxStudents: {
      type: Number,
      default: 150,
      min: 1,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Lecturer ──────────────────────────────────────────
    lecturerId: {
      type: String,
      required: [true, 'Lecturer ID is required'],
      index: true,
    },
    lecturerName: {
      type: String,
      required: [true, 'Lecturer name is required'],
    },
    lecturerEmail: {
      type: String,
      default: '',
    },

    // ── Curriculum ────────────────────────────────────────
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    syllabus: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },

    // ── Assessment breakdown (must sum to 100) ────────────
    assessmentStructure: {
      assignments: { type: Number, default: 20 },
      midExam:     { type: Number, default: 30 },
      finalExam:   { type: Number, default: 50 },
    },

    // ── Scheduling ────────────────────────────────────────
    schedule: {
      days:      { type: [String], default: [] }, // e.g. ['Monday', 'Wednesday']
      startTime: { type: String, default: '' },   // e.g. '09:00'
      endTime:   { type: String, default: '' },
      venue:     { type: String, default: '' },
    },

    // ── Status ────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'archived'],
      default: 'draft',
      index: true,
    },

    // ── Admin approval ───────────────────────────────────
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,   // createdAt, updatedAt
  }
);

// Text index for search
moduleSchema.index({ name: 'text', code: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Module', moduleSchema);
