const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    channel: { type: String, enum: ["EMAIL", "SMS", "IN_APP"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    scheduledFor: { type: Date, required: false },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
