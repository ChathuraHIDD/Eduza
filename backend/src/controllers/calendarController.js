const CalendarEvent = require("../models/CalendarEvent");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/calendar
exports.createEvent = asyncHandler(async (req, res) => {
  const { studentId, title, description, start, end, type, reminders } = req.body;

  if (!title || !start || !end) {
    res.status(400);
    throw new Error("title, start, end are required");
  }

  const ev = await CalendarEvent.create({
    studentId,
    title,
    description,
    start,
    end,
    type,
    reminders,
  });

  res.status(201).json(ev);
});

// GET /api/calendar?studentId=xxx
exports.getEvents = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const filter = {};
  if (studentId) filter.studentId = studentId;

  const list = await CalendarEvent.find(filter).sort({ start: 1 });
  res.json(list);
});
