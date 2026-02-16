const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/notifications
exports.createNotification = asyncHandler(async (req, res) => {
  const { studentId, channel, title, message, scheduledFor } = req.body;

  if (!channel || !title || !message) {
    res.status(400);
    throw new Error("channel, title, message are required");
  }

  const n = await Notification.create({ studentId, channel, title, message, scheduledFor });
  res.status(201).json(n);
});

// GET /api/notifications?status=PENDING
exports.getNotifications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const list = await Notification.find(filter).sort({ createdAt: -1 });
  res.json(list);
});
