const mongoose = require("mongoose");

const kuppiSessionPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KuppiSession",
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    remindBeforeMinutes: {
      type: Number,
      default: 120,
    },
  },
  {
    timestamps: true,
  }
);

kuppiSessionPreferenceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model(
  "KuppiSessionPreference",
  kuppiSessionPreferenceSchema
);