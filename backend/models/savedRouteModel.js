const mongoose = require('mongoose');

const savedRouteSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g., "Home → Terminal"
    fromStop: { type: String, required: true },
    toStop: { type: String, required: true },
    fromLat: Number,
    fromLng: Number,
    toLat: Number,
    toLng: Number,
    notifyOnApproach: { type: Boolean, default: true },
    notifyRadius: { type: Number, default: 500 }, // meters
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

savedRouteSchema.index({ userId: 1 });

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
