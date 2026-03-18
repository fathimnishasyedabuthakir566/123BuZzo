const asyncHandler = require('express-async-handler');
const Bus = require('../models/busModel');
const dijkstra = require('../utils/dijkstra');
const { buildGraphFromBuses } = require('../utils/graphBuilder');
const { mockBuses, mockStats } = require('../utils/mockData');
const mongoose = require('mongoose');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = asyncHandler(async (req, res) => {
    console.log('GET /api/buses - Fetching buses with filters:', req.query);

    // Fallback to mock data if DB is down
    if (mongoose.connection.readyState !== 1) {
        console.warn('DB disconnected! Serving mock buses...');
        return res.json({
            buses: mockBuses,
            page: 1,
            pages: 1,
            total: mockBuses.length,
            stats: mockStats
        });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const { route, status, platform, search } = req.query;
    let query = {};

    if (route && route !== 'all') {
        const separator = route.includes(' - ') ? ' - ' : '-';
        const [from, to] = route.split(separator);
        query.routeFrom = from.trim();
        query.routeTo = to.trim();
    }

    if (status && status !== 'all') {
        query.status = status.toLowerCase();
    }

    if (platform && platform !== 'all') {
        query.platformNumber = parseInt(platform);
    }

    if (search && search.trim() !== '') {
        const regex = new RegExp(search, 'i');
        query.$or = [
            { name: regex },
            { busNumber: regex },
            { routeFrom: regex },
            { routeTo: regex }
        ];
    }

    const total = await Bus.countDocuments(query);
    const buses = await Bus.find(query)
        .sort({ scheduledTime: 1 })
        .skip(skip)
        .limit(limit);

    console.log(`Found ${buses.length} buses matching query.`);

    // Fetch global stats for summary cards
    const globalStats = await Bus.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                onRoute: { $sum: { $cond: [{ $eq: ["$status", "on-route"] }, 1, 0] } },
                delayed: { $sum: { $cond: [{ $eq: ["$status", "delayed"] }, 1, 0] } },
                inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } }
            }
        }
    ]);

    console.log('Global Stats:', globalStats[0] || 'No stats found');

    res.json({
        buses,
        page,
        pages: Math.ceil(total / limit),
        total,
        stats: globalStats[0] || { total: 0, active: 0, onRoute: 0, delayed: 0, inactive: 0 }
    });
});

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
const getBusById = asyncHandler(async (req, res) => {
    // Fallback to mock data if DB is down
    if (mongoose.connection.readyState !== 1) {
        const mockBus = mockBuses.find(b => b._id === req.params.id || b.id === req.params.id);
        if (mockBus) return res.json(mockBus);
    }

    const bus = await Bus.findById(req.params.id);
    if (bus) {
        // Map intermediateStops to timings format for frontend
        const timings = (bus.intermediateStops || []).map(stop => {
            let status = 'upcoming';
            if (stop.name === bus.currentStop) status = 'current';
            // Simple logic: if order < current stop's order, it's departed
            const currentStopObj = bus.intermediateStops.find(s => s.name === bus.currentStop);
            if (currentStopObj && stop.order < currentStopObj.order) status = 'departed';

            return {
                location: stop.name,
                time: bus.scheduledTime[0] || "--:--", // Placeholder or logic for stop-specific time
                status
            };
        });

        res.json({
            ...bus._doc,
            id: bus._id,
            timings: timings.length > 0 ? timings : [
                { location: bus.routeFrom, time: bus.scheduledTime[0] || "--:--", status: 'departed' },
                { location: bus.routeTo, time: bus.scheduledTime[bus.scheduledTime.length - 1] || "--:--", status: 'upcoming' }
            ]
        });
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

const createBus = asyncHandler(async (req, res) => {
    const {
        name,
        busNumber,
        routeFrom,
        routeTo,
        scheduledTime,
        depot,
        busType,
        serviceType,
        intermediateStops,
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        capacity,
        ac
    } = req.body;

    if (!busNumber || !routeFrom || !routeTo) {
        res.status(400);
        throw new Error('Please provide bus number, source, and destination');
    }

    const busExists = await Bus.findOne({ busNumber });
    if (busExists) {
        res.status(400);
        throw new Error('Bus already exists');
    }

    const bus = await Bus.create({
        name: name || busNumber,
        busNumber,
        routeFrom,
        routeTo,
        scheduledTime: scheduledTime || [],
        depot,
        busType,
        serviceType,
        intermediateStops: intermediateStops || [],
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        capacity,
        ac
    });

    if (bus) {
        res.status(201).json(bus);
    } else {
        res.status(400);
        throw new Error('Invalid bus data');
    }
});

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private (Admin)
const updateBus = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        bus.name = req.body.name || bus.name;
        bus.busNumber = req.body.busNumber || bus.busNumber;
        bus.routeFrom = req.body.routeFrom || bus.routeFrom;
        bus.routeTo = req.body.routeTo || bus.routeTo;
        bus.scheduledTime = req.body.scheduledTime || bus.scheduledTime;
        bus.driverName = req.body.driverName || bus.driverName;
        bus.driverPhone = req.body.driverPhone || bus.driverPhone;
        bus.conductorName = req.body.conductorName || bus.conductorName;
        bus.conductorPhone = req.body.conductorPhone || bus.conductorPhone;
        bus.capacity = req.body.capacity !== undefined ? req.body.capacity : bus.capacity;
        bus.availableSeats = req.body.availableSeats !== undefined ? req.body.availableSeats : bus.availableSeats;
        bus.ac = req.body.ac !== undefined ? req.body.ac : bus.ac;
        bus.status = req.body.status || bus.status;
        bus.platformNumber = req.body.platformNumber !== undefined ? req.body.platformNumber : bus.platformNumber;
        bus.intermediateStops = req.body.intermediateStops || bus.intermediateStops;
        bus.speed = req.body.speed !== undefined ? req.body.speed : bus.speed;
        bus.crowdLevel = req.body.crowdLevel || bus.crowdLevel;
        bus.driverRating = req.body.driverRating !== undefined ? req.body.driverRating : bus.driverRating;

        const updatedBus = await bus.save();
        res.json(updatedBus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private (Admin)
const deleteBus = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
        await bus.deleteOne();
        res.json({ message: 'Bus removed' });
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

const getRoutes = asyncHandler(async (req, res) => {
    const buses = await Bus.find({}, 'routeFrom routeTo');
    const routes = new Set(buses.map(bus => `${bus.routeFrom} - ${bus.routeTo}`));
    res.json(Array.from(routes));
});

// @desc    Get shortest path between stops
// @route   GET /api/buses/shortest-path
// @access  Public
const getShortestPath = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400);
        throw new Error('Please provide from and to stops');
    }

    const graph = await buildGraphFromBuses();
    
    // Ensure both nodes exist in the graph
    if (!graph[from] || !graph[to]) {
        res.status(404);
        throw new Error('One or both stops not found in the bus network');
    }

    const result = dijkstra(graph, from, to);

    res.json({
        from,
        to,
        path: result.path,
        distance: `${result.distance.toFixed(2)} km`
    });
});

// @desc    Add intermediate stop to a bus
// @route   POST /api/buses/:id/add-stop
// @access  Private (Admin)
const addIntermediateStop = asyncHandler(async (req, res) => {
    const { name, lat, lng, order } = req.body;

    if (!name || lat === undefined || lng === undefined || order === undefined) {
        res.status(400);
        throw new Error('Please provide name, lat, lng, and order for the stop');
    }

    const bus = await Bus.findById(req.params.id);

    if (bus) {
        // Add the new stop
        bus.intermediateStops.push({ name, lat, lng, order });
        
        // Re-sort stops by order to ensure consistency
        bus.intermediateStops.sort((a, b) => a.order - b.order);

        await bus.save();
        res.status(201).json(bus);
    } else {
        res.status(404);
        throw new Error('Bus not found');
    }
});

// @desc    Update bus operational data (speed, crowd, seats)
// @route   PATCH /api/buses/:id/operational
// @access  Private (Driver)
const updateOperationalData = asyncHandler(async (req, res) => {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
        res.status(404);
        throw new Error('Bus not found');
    }

    const { speed, lat, lng, currentStop, nextStop, availableSeats } = req.body;

    if (speed !== undefined) bus.speed = speed;
    if (lat !== undefined && lng !== undefined) {
        bus.location = { 
            lat, 
            lng, 
            lastUpdated: new Date().toISOString() 
        };
        
        // Smart ETA Calculation (Simple distance based)
        // If we have a next stop, calculate ETA based on current speed
        if (nextStop && bus.intermediateStops) {
            const stop = bus.intermediateStops.find(s => s.name === nextStop);
            if (stop) {
                const dist = Math.sqrt(Math.pow(stop.lat - lat, 2) + Math.pow(stop.lng - lng, 2)) * 111; // Approx km
                const timeInHours = speed > 0 ? dist / speed : 0.5; // Default 30 min if stationary
                const timeInMinutes = Math.round(timeInHours * 60);
                bus.eta = timeInMinutes > 0 ? `${timeInMinutes} mins` : 'Arriving';
            }
        }
    }

    if (currentStop) bus.currentStop = currentStop;
    if (nextStop) bus.nextStop = nextStop;
    if (availableSeats !== undefined) {
        bus.availableSeats = availableSeats;
        
        // Predict crowd level based on available seats vs capacity
        const fillFactor = 1 - (availableSeats / bus.capacity);
        if (fillFactor < 0.3) bus.crowdLevel = 'low';
        else if (fillFactor < 0.7) bus.crowdLevel = 'medium';
        else if (fillFactor < 0.95) bus.crowdLevel = 'high';
        else bus.crowdLevel = 'full';
    }

    const updatedBus = await bus.save();
    res.json(updatedBus);
});

module.exports = {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    getRoutes,
    getShortestPath,
    addIntermediateStop,
    updateOperationalData
};
