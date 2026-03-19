const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, seedNotifications } = require('../controllers/notificationController');

router.get('/:userId', getNotifications);
router.post('/', createNotification);
router.post('/seed/:userId', seedNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all/:userId', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
