const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['bus_arrival', 'delay', 'platform_change', 'proximity', 'system', 'route_alert', 'chat'],
        default: 'system'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    routeFrom: String,
    routeTo: String,
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
