const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    category: {
      type: String,
      enum: ["SYSTEM", "CAMPUS", "CANTEEN", "LECTURER", "MATERIALS", "OTHER"],
      required: true,
    },
    target: {
      type: String,
      default: "GENERAL", // e.g., lecturerId or materialId can be stored here later
    },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: false },
    status: { type: String, enum: ["NEW", "IN_REVIEW", "RESOLVED"], default: "NEW" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
