const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    type: { type: String, enum: ["ASSIGNMENT", "EXAM", "PROJECT", "STUDY", "OTHER"], default: "OTHER" },
    reminders: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      minutesBefore: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
