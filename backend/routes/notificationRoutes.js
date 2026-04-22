const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/', protect, clearNotifications);

module.exports = router;
