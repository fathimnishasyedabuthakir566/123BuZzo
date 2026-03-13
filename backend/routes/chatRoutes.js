const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage, getActiveRooms } = require('../controllers/chatController');

router.get('/rooms/active', getActiveRooms);
router.get('/:roomId', getChatMessages);
router.post('/', sendMessage);

module.exports = router;
