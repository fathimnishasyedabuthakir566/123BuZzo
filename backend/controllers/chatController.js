const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/chatMessageModel');

// @desc    Get chat messages for a room
// @route   GET /api/chat/:roomId
const getChatMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    // Return in chronological order
    res.json(messages.reverse());
});

// @desc    Send a chat message
// @route   POST /api/chat
const sendMessage = asyncHandler(async (req, res) => {
    const { roomId, senderId, senderName, senderRole, message, messageType } = req.body;

    const chatMessage = await ChatMessage.create({
        roomId, senderId, senderName, senderRole, message, messageType
    });

    // Broadcast via Socket.io
    if (global.io) {
        global.io.to(roomId).emit('chat-message', chatMessage);
    }

    res.status(201).json(chatMessage);
});

// @desc    Get active support rooms (for admin)
// @route   GET /api/chat/rooms/active
const getActiveRooms = asyncHandler(async (req, res) => {
    const rooms = await ChatMessage.aggregate([
        { $group: { 
            _id: '$roomId', 
            lastMessage: { $last: '$message' },
            lastSender: { $last: '$senderName' },
            lastTime: { $last: '$createdAt' },
            messageCount: { $sum: 1 },
            unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }},
        { $sort: { lastTime: -1 } }
    ]);
    res.json(rooms);
});

module.exports = { getChatMessages, sendMessage, getActiveRooms };
