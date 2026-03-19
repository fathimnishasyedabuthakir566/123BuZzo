const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const { errorHandler } = require('./middleware/errorMiddleware');
const Bus = require('./models/busModel'); // Import Bus Model
const { calculateStops, calculateSmartETA, getDistance } = require('./utils/routeUtils');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define port - prioritize env variable, then default to 5001 (or 8082 if running as standalone/electron)
// We will set PORT=8082 in the Electron environment
const PORT = Number(process.env.PORT) || 5002;

// Graceful handling for port conflicts – try next port if in use
const startServer = (port) => {
  const serverInstance = server.listen(port);
  
  serverInstance.once('listening', () => {
    console.log(`Server running on port ${port}`);
  });

  serverInstance.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}`);
      // Close the handle to allow re-listening on a different port safely
      server.close(() => {
          setTimeout(() => startServer(port + 1), 100);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};




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
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});
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

            // AI-ETA Calculation
            let smartEta = bus.eta;
            if (bus.locationTo) {
                const distToDest = getDistance(data.lat, data.lng, bus.locationTo.lat, bus.locationTo.lng);
                smartEta = calculateSmartETA(distToDest, bus.speed || data.speed || 40);
            }

            // Update with stop info
            const updateData = {
                location: {
                    lat: data.lat,
                    lng: data.lng,
                    lastUpdated: new Date()
                },
                currentStop,
                nextStop,
                eta: smartEta,
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

            // AI-ETA: Calculate distance to final destination
            if (bus.locationTo) {
                const distToDest = getDistance(newLat, newLng, bus.locationTo.lat, bus.locationTo.lng);
                bus.eta = calculateSmartETA(distToDest, bus.speed);
            }

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

// ============================================================
//  DEV SEED ROUTE — clears + re-inserts 50 buses (5 platforms)
//  POST /api/seed-buses   (localhost only, no auth needed)
// ============================================================
app.post('/api/seed-buses', async (req, res) => {
    // Only allow from localhost
    const ip = req.ip || req.connection.remoteAddress || '';
    if (!ip.includes('127.0.0.1') && !ip.includes('::1') && !ip.includes('localhost')) {
        return res.status(403).json({ message: 'Forbidden: localhost only' });
    }

    try {
        function stops(...names) {
            const coords = {
                Tirunelveli: { lat: 8.7139, lng: 77.7567 }, Nagercoil: { lat: 8.1833, lng: 77.4119 },
                Kanyakumari: { lat: 8.0883, lng: 77.5385 }, Nanguneri: { lat: 8.4897, lng: 77.6617 },
                Valliyur: { lat: 8.3847, lng: 77.6167 }, Madurai: { lat: 9.9252, lng: 78.1198 },
                Kovilpatti: { lat: 9.1760, lng: 77.8643 }, Virudhunagar: { lat: 9.5810, lng: 77.9622 },
                Thoothukudi: { lat: 8.8049, lng: 78.1460 }, Vagaikulam: { lat: 8.7246, lng: 77.9392 },
                Tiruchendur: { lat: 8.4965, lng: 78.1270 }, Srivaikuntam: { lat: 8.6296, lng: 77.9148 },
                Tenkasi: { lat: 8.9591, lng: 77.3115 }, Alangulam: { lat: 8.8711, lng: 77.5029 },
                Pavoorchatram: { lat: 8.9075, lng: 77.3683 }, Chennai: { lat: 13.0827, lng: 80.2707 },
                Trichy: { lat: 10.7905, lng: 78.7047 }, Coimbatore: { lat: 11.0168, lng: 76.9558 },
                Palakkad: { lat: 10.7867, lng: 76.6548 }, Courtallam: { lat: 8.9368, lng: 77.2714 },
                Kollam: { lat: 8.8932, lng: 76.6141 }, Trivandrum: { lat: 8.5241, lng: 76.9366 },
                Rajapalayam: { lat: 9.4530, lng: 77.5575 }, Sankarankovil: { lat: 9.1691, lng: 77.5444 },
                Sivakasi: { lat: 9.4536, lng: 77.8004 }, Salem: { lat: 11.6643, lng: 78.1460 },
                Ooty: { lat: 11.4102, lng: 76.6950 }, Rameshwaram: { lat: 9.2882, lng: 79.3129 },
                Kumbakonam: { lat: 10.9634, lng: 79.3788 },
            };
            return names.map((name, i) => ({
                name, order: i + 1,
                lat: (coords[name] || { lat: 8.7 + i * 0.1, lng: 77.7 + i * 0.1 }).lat,
                lng: (coords[name] || { lat: 8.7 + i * 0.1, lng: 77.7 + i * 0.1 }).lng,
            }));
        }
        const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const rndInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
        const crowds = ['low', 'medium', 'high', 'full'];
        const drivers = ['Kumar', 'Rajan', 'Selvam', 'Murugan', 'Arjun', 'Durai', 'Senthil', 'Vijay', 'Anand', 'Karthik'];

        const RAW = [
            // ---- Platform 1: Nagercoil & Kanyakumari (10) ----
            { name:'Nagercoil Direct',        busNumber:'TN72P1-1001', routeFrom:'Tirunelveli', routeTo:'Nagercoil',   scheduledTime:['05:40','08:20'], platformNumber:1, busType:'Mofussil',    serviceType:'Ordinary', depot:'Ranithottam',       capacity:45, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil') },
            { name:'Nagercoil AC Express',     busNumber:'TN72P1-1002', routeFrom:'Tirunelveli', routeTo:'Nagercoil',   scheduledTime:['09:00','12:00'], platformNumber:1, busType:'AC',         serviceType:'EAC',     depot:'Ranithottam',       capacity:40, ac:true,  status:'on-route',  intermediateStops:stops('Tirunelveli','Nanguneri','Nagercoil') },
            { name:'Kanyakumari Deluxe',       busNumber:'TN72P1-1003', routeFrom:'Tirunelveli', routeTo:'Kanyakumari', scheduledTime:['06:00','09:30'], platformNumber:1, busType:'Deluxe',     serviceType:'Express', depot:'Kanyakumari',       capacity:55, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil','Kanyakumari') },
            { name:'Kanyakumari BPR',          busNumber:'TN72P1-1004', routeFrom:'Tirunelveli', routeTo:'Kanyakumari', scheduledTime:['07:30','11:00'], platformNumber:1, busType:'Express',    serviceType:'BPR',     depot:'Kanyakumari',       capacity:50, ac:false, status:'delayed',   intermediateStops:stops('Tirunelveli','Valliyur','Kanyakumari') },
            { name:'Nagercoil Night Express',  busNumber:'TN72P1-1005', routeFrom:'Tirunelveli', routeTo:'Nagercoil',   scheduledTime:['21:00','23:30'], platformNumber:1, busType:'Express',    serviceType:'Special', depot:'Ranithottam',       capacity:50, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Nanguneri','Nagercoil') },
            { name:'Trivandrum Via Nagercoil', busNumber:'TN72P1-1006', routeFrom:'Tirunelveli', routeTo:'Trivandrum',  scheduledTime:['08:00','14:00'], platformNumber:1, busType:'Deluxe',     serviceType:'Express', depot:'Ranithottam',       capacity:50, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Nagercoil','Kollam','Trivandrum') },
            { name:'Kollam Express',           busNumber:'TN72P1-1007', routeFrom:'Tirunelveli', routeTo:'Kollam',      scheduledTime:['10:30','15:30'], platformNumber:1, busType:'Mofussil',  serviceType:'Ordinary',depot:'Ranithottam',       capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Nagercoil','Kollam') },
            { name:'Nagercoil Ultra Deluxe',   busNumber:'TN72P1-1008', routeFrom:'Tirunelveli', routeTo:'Nagercoil',   scheduledTime:['13:00','15:30'], platformNumber:1, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Ranithottam',       capacity:36, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Nanguneri','Nagercoil') },
            { name:'Kanyakumari SFS',          busNumber:'TN72P1-1009', routeFrom:'Tirunelveli', routeTo:'Kanyakumari', scheduledTime:['14:00','17:30'], platformNumber:1, busType:'SFS',        serviceType:'Special', depot:'Kanyakumari',       capacity:42, ac:true,  status:'delayed',   intermediateStops:stops('Tirunelveli','Valliyur','Kanyakumari') },
            { name:'Nagercoil Town Bus',       busNumber:'TN72P1-1010', routeFrom:'Tirunelveli', routeTo:'Nagercoil',   scheduledTime:['17:30','20:00'], platformNumber:1, busType:'Town Bus',   serviceType:'Ordinary',depot:'Ranithottam',       capacity:60, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil') },
            // ---- Platform 2: Tiruchendur & Thoothukudi (10) ----
            { name:'Tiruchendur BPR',          busNumber:'TN72P2-2001', routeFrom:'Tirunelveli', routeTo:'Tiruchendur', scheduledTime:['05:30','07:00'], platformNumber:2, busType:'Mofussil',  serviceType:'BPR',     depot:'Thoothukudi City',  capacity:45, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Srivaikuntam','Tiruchendur') },
            { name:'Tiruchendur Temple Exp',   busNumber:'TN72P2-2002', routeFrom:'Tirunelveli', routeTo:'Tiruchendur', scheduledTime:['08:00','09:30'], platformNumber:2, busType:'Express',   serviceType:'Express', depot:'Thoothukudi City',  capacity:50, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Srivaikuntam','Tiruchendur') },
            { name:'Thoothukudi Direct',       busNumber:'TN72P2-2003', routeFrom:'Tirunelveli', routeTo:'Thoothukudi', scheduledTime:['05:00','06:00'], platformNumber:2, busType:'Mofussil',  serviceType:'Ordinary',depot:'Thoothukudi City',  capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Vagaikulam','Thoothukudi') },
            { name:'Thoothukudi AC Seater',    busNumber:'TN72P2-2004', routeFrom:'Tirunelveli', routeTo:'Thoothukudi', scheduledTime:['10:00','11:15'], platformNumber:2, busType:'AC',        serviceType:'EAC',     depot:'Thoothukudi City',  capacity:40, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Vagaikulam','Thoothukudi') },
            { name:'Thoothukudi Ultra Deluxe', busNumber:'TN72P2-2005', routeFrom:'Tirunelveli', routeTo:'Thoothukudi', scheduledTime:['14:30','15:45'], platformNumber:2, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Thoothukudi City',  capacity:36, ac:true,  status:'delayed',   intermediateStops:stops('Tirunelveli','Thoothukudi') },
            { name:'Tiruchendur Night Svc',    busNumber:'TN72P2-2006', routeFrom:'Tirunelveli', routeTo:'Tiruchendur', scheduledTime:['20:00','21:30'], platformNumber:2, busType:'Mofussil',  serviceType:'Ordinary',depot:'Thoothukudi City',  capacity:45, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Srivaikuntam','Tiruchendur') },
            { name:'Srivaikuntam Local',       busNumber:'TN72P2-2007', routeFrom:'Tirunelveli', routeTo:'Srivaikuntam',scheduledTime:['07:00','08:00'], platformNumber:2, busType:'Town Bus',  serviceType:'Ordinary',depot:'Thoothukudi City',  capacity:60, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Srivaikuntam') },
            { name:'Thoothukudi Port Exp',     busNumber:'TN72P2-2008', routeFrom:'Tirunelveli', routeTo:'Thoothukudi', scheduledTime:['06:30','07:45'], platformNumber:2, busType:'Express',   serviceType:'Special', depot:'Thoothukudi City',  capacity:50, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Vagaikulam','Thoothukudi') },
            { name:'Tiruchendur Deluxe',       busNumber:'TN72P2-2009', routeFrom:'Tirunelveli', routeTo:'Tiruchendur', scheduledTime:['12:00','13:30'], platformNumber:2, busType:'Deluxe',    serviceType:'Express', depot:'Thoothukudi City',  capacity:55, ac:false, status:'delayed',   intermediateStops:stops('Tirunelveli','Srivaikuntam','Tiruchendur') },
            { name:'Thoothukudi SFS',          busNumber:'TN72P2-2010', routeFrom:'Tirunelveli', routeTo:'Thoothukudi', scheduledTime:['18:00','19:15'], platformNumber:2, busType:'SFS',       serviceType:'Special', depot:'Thoothukudi City',  capacity:42, ac:true,  status:'inactive',  intermediateStops:stops('Tirunelveli','Thoothukudi') },
            // ---- Platform 3: Madurai & Virudhunagar (10) ----
            { name:'Madurai Non-Stop',         busNumber:'TN72P3-3001', routeFrom:'Tirunelveli', routeTo:'Madurai',      scheduledTime:['05:30','08:00'], platformNumber:3, busType:'Express',    serviceType:'Express', depot:'Madurai Central',   capacity:50, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Kovilpatti','Virudhunagar','Madurai') },
            { name:'Madurai AC Super',         busNumber:'TN72P3-3002', routeFrom:'Tirunelveli', routeTo:'Madurai',      scheduledTime:['09:00','12:00'], platformNumber:3, busType:'AC',         serviceType:'EAC',     depot:'Madurai Central',   capacity:40, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Kovilpatti','Madurai') },
            { name:'Virudhunagar Ordinary',    busNumber:'TN72P3-3003', routeFrom:'Tirunelveli', routeTo:'Virudhunagar', scheduledTime:['06:45','09:00'], platformNumber:3, busType:'Mofussil',   serviceType:'Ordinary',depot:'Madurai Central',   capacity:45, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Kovilpatti','Virudhunagar') },
            { name:'Rajapalayam Fast',         busNumber:'TN72P3-3004', routeFrom:'Tirunelveli', routeTo:'Rajapalayam',  scheduledTime:['07:30','09:30'], platformNumber:3, busType:'Express',    serviceType:'BPR',     depot:'Madurai Central',   capacity:50, ac:false, status:'delayed',   intermediateStops:stops('Tirunelveli','Sankarankovil','Rajapalayam') },
            { name:'Sivakasi Express',         busNumber:'TN72P3-3005', routeFrom:'Tirunelveli', routeTo:'Sivakasi',     scheduledTime:['08:15','11:00'], platformNumber:3, busType:'Mofussil',   serviceType:'Ordinary',depot:'Madurai Central',   capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Sankarankovil','Sivakasi') },
            { name:'Madurai Ultra Deluxe',     busNumber:'TN72P3-3006', routeFrom:'Tirunelveli', routeTo:'Madurai',      scheduledTime:['12:00','15:00'], platformNumber:3, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Madurai Central',   capacity:36, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Kovilpatti','Madurai') },
            { name:'Sankarankovil Local',      busNumber:'TN72P3-3007', routeFrom:'Tirunelveli', routeTo:'Sankarankovil',scheduledTime:['10:00','12:00'], platformNumber:3, busType:'Town Bus',   serviceType:'Ordinary',depot:'Madurai Central',   capacity:60, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Sankarankovil') },
            { name:'Kovilpatti Mofussil',      busNumber:'TN72P3-3008', routeFrom:'Tirunelveli', routeTo:'Kovilpatti',   scheduledTime:['13:30','15:30'], platformNumber:3, busType:'Mofussil',   serviceType:'Ordinary',depot:'Madurai Central',   capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Kovilpatti') },
            { name:'Madurai Night Rider',      busNumber:'TN72P3-3009', routeFrom:'Tirunelveli', routeTo:'Madurai',      scheduledTime:['22:00','01:00'], platformNumber:3, busType:'Deluxe',     serviceType:'Special', depot:'Madurai Central',   capacity:55, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Kovilpatti','Virudhunagar','Madurai') },
            { name:'Virudhunagar SFS',         busNumber:'TN72P3-3010', routeFrom:'Tirunelveli', routeTo:'Virudhunagar', scheduledTime:['16:00','18:30'], platformNumber:3, busType:'SFS',        serviceType:'Special', depot:'Madurai Central',   capacity:42, ac:true,  status:'delayed',   intermediateStops:stops('Tirunelveli','Kovilpatti','Virudhunagar') },
            // ---- Platform 4: Tenkasi, Courtallam & Coimbatore (10) ----
            { name:'Tenkasi Ordinary',         busNumber:'TN72P4-4001', routeFrom:'Tirunelveli', routeTo:'Tenkasi',      scheduledTime:['06:00','08:00'], platformNumber:4, busType:'Mofussil',  serviceType:'Ordinary',depot:'Ranithottam',       capacity:45, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Alangulam','Pavoorchatram','Tenkasi') },
            { name:'Courtallam Express',       busNumber:'TN72P4-4002', routeFrom:'Tirunelveli', routeTo:'Courtallam',   scheduledTime:['07:00','09:00'], platformNumber:4, busType:'Express',   serviceType:'Special', depot:'Ranithottam',       capacity:50, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Tenkasi','Courtallam') },
            { name:'Coimbatore Via Tenkasi',   busNumber:'TN72P4-4003', routeFrom:'Tirunelveli', routeTo:'Coimbatore',   scheduledTime:['08:00','14:00'], platformNumber:4, busType:'Deluxe',    serviceType:'Express', depot:'Ranithottam',       capacity:55, ac:false, status:'delayed',   intermediateStops:stops('Tirunelveli','Tenkasi','Coimbatore') },
            { name:'Ooty Hill Queen',          busNumber:'TN72P4-4004', routeFrom:'Tirunelveli', routeTo:'Ooty',         scheduledTime:['09:30','17:00'], platformNumber:4, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Ranithottam',       capacity:36, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Tenkasi','Coimbatore','Ooty') },
            { name:'Tenkasi BPR',              busNumber:'TN72P4-4005', routeFrom:'Tirunelveli', routeTo:'Tenkasi',      scheduledTime:['11:00','13:00'], platformNumber:4, busType:'Mofussil',  serviceType:'BPR',     depot:'Ranithottam',       capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Alangulam','Tenkasi') },
            { name:'Alangulam Local',          busNumber:'TN72P4-4006', routeFrom:'Tirunelveli', routeTo:'Alangulam',    scheduledTime:['10:00','11:30'], platformNumber:4, busType:'Town Bus',  serviceType:'Ordinary',depot:'Ranithottam',       capacity:60, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Alangulam') },
            { name:'Courtallam Season Spl',    busNumber:'TN72P4-4007', routeFrom:'Tirunelveli', routeTo:'Courtallam',   scheduledTime:['14:00','16:00'], platformNumber:4, busType:'Express',   serviceType:'Special', depot:'Ranithottam',       capacity:50, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Tenkasi','Courtallam') },
            { name:'Coimbatore AC Star',       busNumber:'TN72P4-4008', routeFrom:'Tirunelveli', routeTo:'Coimbatore',   scheduledTime:['18:00','00:00'], platformNumber:4, busType:'AC',        serviceType:'EAC',     depot:'Ranithottam',       capacity:40, ac:true,  status:'delayed',   intermediateStops:stops('Tirunelveli','Tenkasi','Palakkad','Coimbatore') },
            { name:'Pavoorchatram Ordinary',   busNumber:'TN72P4-4009', routeFrom:'Tirunelveli', routeTo:'Pavoorchatram',scheduledTime:['16:30','18:00'], platformNumber:4, busType:'Mofussil',  serviceType:'Ordinary',depot:'Ranithottam',       capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Alangulam','Pavoorchatram') },
            { name:'Tenkasi Night Rider',      busNumber:'TN72P4-4010', routeFrom:'Tirunelveli', routeTo:'Tenkasi',      scheduledTime:['21:30','23:30'], platformNumber:4, busType:'Mofussil',  serviceType:'Ordinary',depot:'Ranithottam',       capacity:45, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Alangulam','Pavoorchatram','Tenkasi') },
            // ---- Platform 5: Chennai, Trichy, Salem (10) ----
            { name:'Chennai Super Express',    busNumber:'TN72P5-5001', routeFrom:'Tirunelveli', routeTo:'Chennai',      scheduledTime:['18:00','06:00'], platformNumber:5, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Chennai CMBT',      capacity:36, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Madurai','Trichy','Chennai') },
            { name:'Chennai AC Sleeper',       busNumber:'TN72P5-5002', routeFrom:'Tirunelveli', routeTo:'Chennai',      scheduledTime:['20:00','08:00'], platformNumber:5, busType:'AC',         serviceType:'EAC',     depot:'Chennai CMBT',      capacity:40, ac:true,  status:'on-route',  intermediateStops:stops('Tirunelveli','Madurai','Trichy','Kumbakonam','Chennai') },
            { name:'Trichy Express',           busNumber:'TN72P5-5003', routeFrom:'Tirunelveli', routeTo:'Trichy',       scheduledTime:['06:00','12:30'], platformNumber:5, busType:'Express',    serviceType:'Express', depot:'Chennai CMBT',      capacity:50, ac:false, status:'active',    intermediateStops:stops('Tirunelveli','Madurai','Trichy') },
            { name:'Salem Via Madurai',        busNumber:'TN72P5-5004', routeFrom:'Tirunelveli', routeTo:'Salem',        scheduledTime:['07:30','15:00'], platformNumber:5, busType:'Deluxe',     serviceType:'Express', depot:'Chennai CMBT',      capacity:55, ac:false, status:'delayed',   intermediateStops:stops('Tirunelveli','Madurai','Trichy','Salem') },
            { name:'Rameshwaram Pilgrim',      busNumber:'TN72P5-5005', routeFrom:'Tirunelveli', routeTo:'Rameshwaram',  scheduledTime:['05:00','12:00'], platformNumber:5, busType:'Express',    serviceType:'Special', depot:'Madurai Central',   capacity:50, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Kovilpatti','Madurai','Rameshwaram') },
            { name:'Chennai Night King',       busNumber:'TN72P5-5006', routeFrom:'Tirunelveli', routeTo:'Chennai',      scheduledTime:['21:30','09:00'], platformNumber:5, busType:'SFS',        serviceType:'Special', depot:'Chennai CMBT',      capacity:42, ac:true,  status:'inactive',  intermediateStops:stops('Tirunelveli','Madurai','Trichy','Chennai') },
            { name:'Trichy Deluxe Night',      busNumber:'TN72P5-5007', routeFrom:'Tirunelveli', routeTo:'Trichy',       scheduledTime:['22:00','04:30'], platformNumber:5, busType:'Deluxe',     serviceType:'Express', depot:'Chennai CMBT',      capacity:55, ac:false, status:'inactive',  intermediateStops:stops('Tirunelveli','Madurai','Trichy') },
            { name:'Kumbakonam Pilgrim',       busNumber:'TN72P5-5008', routeFrom:'Tirunelveli', routeTo:'Kumbakonam',   scheduledTime:['08:00','16:00'], platformNumber:5, busType:'Mofussil',   serviceType:'Ordinary',depot:'Chennai CMBT',      capacity:45, ac:false, status:'on-route',  intermediateStops:stops('Tirunelveli','Madurai','Trichy','Kumbakonam') },
            { name:'Chennai Premium AC',       busNumber:'TN72P5-5009', routeFrom:'Tirunelveli', routeTo:'Chennai',      scheduledTime:['17:00','05:00'], platformNumber:5, busType:'AC',         serviceType:'EAC',     depot:'Chennai CMBT',      capacity:40, ac:true,  status:'delayed',   intermediateStops:stops('Tirunelveli','Madurai','Trichy','Chennai') },
            { name:'Salem Night Express',      busNumber:'TN72P5-5010', routeFrom:'Tirunelveli', routeTo:'Salem',        scheduledTime:['20:30','04:30'], platformNumber:5, busType:'Ultra Deluxe',serviceType:'1to1', depot:'Chennai CMBT',      capacity:36, ac:true,  status:'active',    intermediateStops:stops('Tirunelveli','Madurai','Salem') },
        ];

        const allBuses = RAW.map(bus => ({
            ...bus,
            crowdLevel: rnd(crowds),
            availableSeats: rndInt(0, bus.capacity - 5),
            speed: (bus.status === 'active' || bus.status === 'on-route') ? rndInt(40, 80) : 0,
            isActive: bus.status === 'active' || bus.status === 'on-route',
            driverName: `Driver ${rnd(drivers)}`,
            driverPhone: `9${rndInt(600000000, 999999999)}`,
            driverRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
            estimatedArrivalTime: `${rndInt(3, 45)} mins`,
            location: {
                lat: bus.intermediateStops[0].lat + (Math.random() - 0.5) * 0.05,
                lng: bus.intermediateStops[0].lng + (Math.random() - 0.5) * 0.05,
                lastUpdated: new Date(),
            },
            currentStop: bus.intermediateStops[0].name,
            nextStop: bus.intermediateStops[1]?.name || bus.routeTo,
        }));

        await Bus.deleteMany({});
        await Bus.insertMany(allBuses);

        const summary = {};
        allBuses.forEach(b => {
            summary[`platform_${b.platformNumber}`] = (summary[`platform_${b.platformNumber}`] || 0) + 1;
        });

        console.log(`✅ Seeded ${allBuses.length} buses via API`);
        res.json({ success: true, total: allBuses.length, platforms: summary });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Error Handler
app.use(errorHandler);

// const PORT = process.env.PORT || 5000;


startServer(PORT);
