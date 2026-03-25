const express = require('express');
const {
  getNotifications,
  createNotification,
  markNotificationRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.route('/').get(getNotifications).post(createNotification);
router.route('/:id/read').patch(markNotificationRead);

module.exports = router;
