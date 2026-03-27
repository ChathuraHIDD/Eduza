const mongoose = require("mongoose");

const kuppiSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    moduleCode: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    conductorName: {
      type: String,
      required: true,
      trim: true,
    },
    conductorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    semester: {
      type: String,
      required: true,
      enum: ["Semester 1", "Semester 2"],
    },
    day: {
      type: String,
      required: true,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    date: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    yearNumber: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    timeRange: {
      type: String,
      default: "",
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    sessionType: {
      type: String,
      enum: ["today", "upcoming"],
      default: "upcoming",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
          trim: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KuppiSession", kuppiSessionSchema);