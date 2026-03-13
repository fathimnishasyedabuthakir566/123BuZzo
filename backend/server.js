const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middleware/errorMiddleware');
const Bus = require('./models/busModel'); // Import Bus Model
const { calculateStops } = require('./utils/routeUtils');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define port - prioritize env variable, then default to 5001 (or 8082 if running as standalone/electron)
// We will set PORT=8082 in the Electron environment
const PORT = process.env.PORT || 5001;


// Connect to database
connectDB();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Set global.io for controllers to emit events
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend in Production/Desktop Mode
// If we are in production OR explicitly told to serve static
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    // Serve static files from the React app build directory
    // Assuming backend/server.js -> backend/ -> root/ -> dist/
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
        // Don't intercept API routes or socket.io
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
            return next();
        }
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}


// Socket.io Connection Logic
const ChatMessage = require('./models/chatMessageModel');

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a bus route room
    socket.on('join-route', (routeId) => {
        socket.join(routeId);
        console.log(`User ${socket.id} joined route: ${routeId}`);
    });

    // Start a trip (Explicit Online)
    socket.on('start-trip', async (routeId) => {
        socket.join(routeId);
        try {
            await Bus.findByIdAndUpdate(routeId, {
                status: 'on-time',
                isActive: true
            });
            console.log(`Trip started for bus: ${routeId}`);
            io.to(routeId).emit('status-update', { routeId, status: 'on-time', isActive: true });
        } catch (err) {
            console.error('Error starting trip:', err.message);
        }
    });

    // Driver sends location update
    socket.on('update-location', async (data) => {
        // data: { routeId, lat, lng }
        console.log('Location Update:', data);

        try {
            const bus = await Bus.findById(data.routeId);
            if (!bus) return;

            const { currentStop, nextStop } = calculateStops(data.lat, data.lng, bus.intermediateStops);

            // Update with stop info
            const updateData = {
                location: {
                    lat: data.lat,
                    lng: data.lng,
                    lastUpdated: new Date()
                },
                currentStop,
                nextStop,
                status: 'on-time',
                isActive: true
            };

            await Bus.findByIdAndUpdate(data.routeId, updateData);

            // Broadcast ENRICHED data to everyone (Global) and the specific route room
            const payload = {
                ...data,
                busId: data.routeId, // Ensure busId is set for frontend compatibility
                currentStop,
                nextStop,
                lastUpdated: updateData.location.lastUpdated
            };

            io.emit('receive-location', payload); // Global broadcast
            io.to(data.routeId).emit('receive-location', payload); // Room broadcast (for backward compatibility)

        } catch (err) {
            console.error('Error processing location update:', err.message);
        }
    });

    // Stop a trip (Explicit Offline)
    socket.on('stop-trip', async (routeId) => {
        try {
            await Bus.findByIdAndUpdate(routeId, {
                status: 'offline',
                isActive: false
            });
            console.log(`Trip stopped for bus: ${routeId}`);
            io.to(routeId).emit('status-update', { routeId, status: 'offline', isActive: false });
        } catch (err) {
            console.error('Error stopping trip:', err.message);
        }
    });

    // ---- Chat Support ----
    socket.on('join-chat', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined chat room: ${roomId}`);
    });

    socket.on('leave-chat', (roomId) => {
        socket.leave(roomId);
    });

    socket.on('send-chat-message', async (data) => {
        try {
            const msg = await ChatMessage.create(data);
            io.to(data.roomId).emit('chat-message', msg);
        } catch (err) {
            console.error('Chat message error:', err.message);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.roomId).emit('user-typing', { senderName: data.senderName });
    });

    // ---- Notifications ----
    socket.on('subscribe-notifications', (userId) => {
        socket.join(`notifications-${userId}`);
        console.log(`User ${socket.id} subscribed to notifications for: ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

// ---- Notification Scheduler (every 60 seconds) ----
const Notification = require('./models/notificationModel');
setInterval(async () => {
    try {
        const activeBuses = await Bus.find({ status: { $in: ['active', 'on-route'] } });
        const delayedBuses = activeBuses.filter(b => b.status === 'delayed');
        
        if (delayedBuses.length > 0) {
            delayedBuses.forEach(bus => {
                const notifPayload = {
                    type: 'delay',
                    title: `Bus ${bus.busNumber} Delayed`,
                    message: `${bus.name} on route ${bus.routeFrom} → ${bus.routeTo} is experiencing delays.`,
                    busId: bus._id,
                    routeFrom: bus.routeFrom,
                    routeTo: bus.routeTo,
                    priority: 'high'
                };
                io.emit('system-notification', notifPayload);
            });
        }
    } catch (err) {
        // Silently fail
    }
}, 60000); // Every 60 seconds

// ---- Simulated Tracking System (every 10 seconds) ----
setInterval(async () => {
    try {
        const movingBuses = await Bus.find({ 
            status: { $in: ['active', 'on-route'] }
        });

        for (const bus of movingBuses) {
            // Speed fluctuation
            const speedChange = (Math.random() - 0.5) * 10;
            const newSpeed = Math.max(30, Math.min(65, (bus.speed || 50) + speedChange));
            
            // Location drift (simulating movement)
            const newLat = (bus.location?.lat || 8.7139) + (Math.random() - 0.5) * 0.002;
            const newLng = (bus.location?.lng || 77.7567) + (Math.random() - 0.5) * 0.002;

            bus.speed = Math.round(newSpeed);
            
            // Occasionally change crowd level
            if (Math.random() > 0.9) {
                const crowds = ['low', 'medium', 'high', 'full'];
                bus.crowdLevel = crowds[Math.floor(Math.random() * crowds.length)];
            }

            bus.location = {
                lat: newLat,
                lng: newLng,
                lastUpdated: new Date()
            };

            // Calculate new stops based on movement
            const { currentStop, nextStop } = calculateStops(newLat, newLng, bus.intermediateStops);
            bus.currentStop = currentStop;
            bus.nextStop = nextStop;

            await bus.save();

            // Emit update for real-time dashboard refresh
            io.emit('receive-location', {
                busId: bus._id,
                routeId: bus._id,
                lat: newLat,
                lng: newLng,
                speed: bus.speed,
                status: bus.status,
                crowdLevel: bus.crowdLevel,
                currentStop: bus.currentStop,
                nextStop: bus.nextStop,
                lastUpdated: bus.location.lastUpdated
            });
        }
    } catch (err) {
        // Silently fail to prevent server crash
    }
}, 10000); // Every 10 seconds


// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/saved-routes', require('./routes/savedRouteRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error Handler
app.use(errorHandler);

// const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
