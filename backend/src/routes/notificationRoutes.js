const express = require('express');
const {
  getNotifications,
  createNotification,
  markNotificationRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(createNotification);
router.route('/:id/read').patch(markNotificationRead);

module.exports = router;
