const mongoose = require("mongoose");

const kuppiConductorApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mainSubject: {
      type: String,
      required: true,
      trim: true,
    },
    moduleLikeToDo: {
      type: String,
      required: true,
      trim: true,
    },
    currentStudyYear: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    currentSemester: {
      type: String,
      required: true,
      enum: ["Semester 1", "Semester 2"],
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: String,
      required: true,
      trim: true,
    },
    topicStrength: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "KuppiConductorApplication",
  kuppiConductorApplicationSchema
);