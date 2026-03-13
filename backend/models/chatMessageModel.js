const mongoose = require('mongoose');

const chatMessageSchema = mongoose.Schema({
    roomId: { type: String, required: true }, // 'support_<userId>' or 'general'
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'driver', 'admin', 'support'], default: 'user' },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'system', 'alert'], default: 'text' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
