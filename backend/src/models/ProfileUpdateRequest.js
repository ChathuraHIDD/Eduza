const mongoose = require("mongoose");

const profileUpdateRequestSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lecturerName: {
      type: String,
      required: true,
    },
    lecturerEmail: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      enum: ["Profile Update", "Extra Class", "Module Upload", "Content Update"],
      default: "Profile Update",
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileUpdateRequest", profileUpdateRequestSchema);
