const mongoose = require('mongoose');

const futureSelfMessageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FutureSelfMessage', futureSelfMessageSchema);
