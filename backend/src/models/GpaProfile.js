const mongoose = require("mongoose");

const gpaModuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    moduleName: { type: String, default: "", trim: true },
    credits: { type: Number, enum: [1, 2, 3, 4], default: 3 },
    grade: { type: String, default: "A", trim: true },
  },
  { _id: false }
);

const gpaProfileSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, unique: true, index: true },
    selectedMode: { type: String, default: "Custom-Add your own", trim: true },
    modules: { type: [gpaModuleSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GpaProfile", gpaProfileSchema);
