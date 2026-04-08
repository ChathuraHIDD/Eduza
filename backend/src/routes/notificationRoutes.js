const express = require('express');
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(createNotification).delete(clearAllNotifications);
router.route('/:id/read').patch(markNotificationRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;
