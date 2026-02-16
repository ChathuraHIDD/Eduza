const CalendarEvent = require('../models/CalendarEvent');
const asyncHandler = require('../middleware/asyncHandler');

const getEvents = asyncHandler(async (req, res) => {
  const events = await CalendarEvent.find();
  res.json(events);
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.create(req.body);
  res.status(201).json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await CalendarEvent.findByIdAndDelete(id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json({ message: 'Event removed' });
});

module.exports = {
  getEvents,
  createEvent,
  deleteEvent,
};
