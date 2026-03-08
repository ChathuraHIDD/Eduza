const mongoose = require("mongoose");

const softwareSchema = new mongoose.Schema(
  {
    title: String,
    softwareName: String,
    category: String,
    type: String,
    size: String,
    version: String,
    about: String,
    windowsLink: String,
    macLink: String,
    videoEmbed: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Software", softwareSchema);