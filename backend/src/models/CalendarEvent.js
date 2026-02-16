const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
