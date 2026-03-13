const asyncHandler = require('express-async-handler');
const SavedRoute = require('../models/savedRouteModel');

// @desc    Get saved routes for a user
// @route   GET /api/saved-routes/:userId
const getSavedRoutes = asyncHandler(async (req, res) => {
    const routes = await SavedRoute.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(routes);
});

// @desc    Create a saved route
// @route   POST /api/saved-routes
const createSavedRoute = asyncHandler(async (req, res) => {
    const { userId, name, fromStop, toStop, fromLat, fromLng, toLat, toLng, notifyOnApproach, notifyRadius } = req.body;

    const route = await SavedRoute.create({
        userId, name, fromStop, toStop, fromLat, fromLng, toLat, toLng, notifyOnApproach, notifyRadius
    });

    res.status(201).json(route);
});

// @desc    Update a saved route
// @route   PUT /api/saved-routes/:id
const updateSavedRoute = asyncHandler(async (req, res) => {
    const route = await SavedRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) {
        res.status(404);
        throw new Error('Route not found');
    }
    res.json(route);
});

// @desc    Delete a saved route
// @route   DELETE /api/saved-routes/:id
const deleteSavedRoute = asyncHandler(async (req, res) => {
    await SavedRoute.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = { getSavedRoutes, createSavedRoute, updateSavedRoute, deleteSavedRoute };
