const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
