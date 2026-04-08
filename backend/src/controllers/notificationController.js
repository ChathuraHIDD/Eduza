const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

const isNotificationOwner = (notification, user) => {
  if (!notification?.studentId) return false;
  return String(notification.studentId) === String(user._id);
};

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

const createNotification = asyncHandler(async (req, res) => {
  const { channel = 'IN_APP', title, message, scheduledFor, status = 'SENT' } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('title and message are required');
  }

  const notification = await Notification.create({
    studentId: req.user._id,
    channel,
    title,
    message,
    scheduledFor: scheduledFor || undefined,
    status,
    read: false,
  });
  res.status(201).json(notification);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!isNotificationOwner(notification, req.user)) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }

  notification.read = true;
  await notification.save();

  res.json(notification);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!isNotificationOwner(notification, req.user)) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.deleteOne();
  res.json({ message: 'Notification deleted' });
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ studentId: req.user._id });
  res.json({ message: 'Notifications cleared', deletedCount: result.deletedCount || 0 });
});

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
};
