const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin", "coordinator", "guardian"],
      default: "student",
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    office: {
      type: String,
      default: "",
      trim: true,
    },
    hours: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    assignedStudentEmails: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);