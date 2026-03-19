const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

// @desc    Get notifications for a user
// @route   GET /api/notifications/:userId
const getNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ notifications, total, unreadCount, page: parseInt(page) });
});

// @desc    Create a notification
// @route   POST /api/notifications
const createNotification = asyncHandler(async (req, res) => {
    const { userId, type, title, message, busId, routeFrom, routeTo, priority, metadata } = req.body;

    const notification = await Notification.create({
        userId, type, title, message, busId, routeFrom, routeTo, priority, metadata
    });

    // Emit via Socket.io if available
    if (global.io) {
        global.io.emit(`notification-${userId}`, notification);
    }

    res.status(201).json(notification);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }
    res.json(notification);
});

// @desc    Mark all notifications as read for a user
// @route   PUT /api/notifications/read-all/:userId
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.params.userId, isRead: false },
        { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// @desc    Seed notifications for a user (DEMO ONLY)
// @route   POST /api/notifications/seed/:userId
const seedNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const items = [
        { type: 'delay', title: 'Route 72N Delayed', message: 'Tirunelveli → Nagercoil is running 15 mins late due to traffic.', priority: 'high' },
        { type: 'bus_arrival', title: 'Bus Coming Soon', message: 'The Junction Flyer is only 2 stops away from your location.', priority: 'medium' },
        { type: 'system', title: 'Network Update', message: 'Buzzo Network has been upgraded to v2.4 with better AI-ETA.', priority: 'low' },
        { type: 'route_alert', title: 'Critical Status', message: 'Major construction on Vannarpettai bridge. All loops rerouted.', priority: 'urgent' },
        { type: 'chat', title: 'New Support Reply', message: 'Buzzo AI support has responded to your transit query.', priority: 'medium' },
    ];

    const results = await Notification.insertMany(items.map(i => ({ ...i, userId })));
    res.json({ success: true, count: results.length });
});

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, seedNotifications };
