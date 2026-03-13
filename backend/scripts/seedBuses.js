const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Bus = require('../models/busModel');

dotenv.config({ path: path.join(__dirname, '../.env') });

const routes = [
    { from: 'Tirunelveli', to: 'Kanyakumari', distance: 85 },
    { from: 'Tirunelveli', to: 'Madurai', distance: 160 },
    { from: 'Tirunelveli', to: 'Nagercoil', distance: 70 },
    { from: 'Tirunelveli', to: 'Coimbatore', distance: 350 },
    { from: 'Tirunelveli', to: 'Chennai', distance: 620 },
    { from: 'Tirunelveli', to: 'Thoothukudi', distance: 55 },
    { from: 'Tirunelveli', to: 'Tenkasi', distance: 55 },
    { from: 'Tirunelveli', to: 'Rameshwaram', distance: 230 }
];

const statuses = ['active', 'on-route', 'delayed', 'inactive'];
const crowdLevels = ['low', 'medium', 'high', 'full'];

const routeConfig = {
    'Tirunelveli-Kanyakumari': {
        stops: [
            { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, order: 1 },
            { name: 'Nanguneri', lat: 8.4897, lng: 77.6617, order: 2 },
            { name: 'Valliyur', lat: 8.3847, lng: 77.6167, order: 3 },
            { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385, order: 4 }
        ]
    },
    'Tirunelveli-Madurai': {
        stops: [
            { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, order: 1 },
            { name: 'Kovilpatti', lat: 9.1760, lng: 77.8643, order: 2 },
            { name: 'Satur', lat: 9.3517, lng: 77.9234, order: 3 },
            { name: 'Madurai', lat: 9.9252, lng: 78.1198, order: 4 }
        ]
    },
    'Tirunelveli-Tenkasi': {
        stops: [
            { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, order: 1 },
            { name: 'Alangulam', lat: 8.8711, lng: 77.5029, order: 2 },
            { name: 'Pavoorchatram', lat: 8.9075, lng: 77.3683, order: 3 },
            { name: 'Tenkasi', lat: 8.9591, lng: 77.3115, order: 4 }
        ]
    },
    'Tirunelveli-Thoothukudi': {
        stops: [
            { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, order: 1 },
            { name: 'Vagaikulam', lat: 8.7246, lng: 77.9392, order: 2 },
            { name: 'Thoothukudi', lat: 8.8049, lng: 78.1460, order: 3 }
        ]
    }
};

const seedBuses = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing buses
        await Bus.deleteMany({});
        console.log('Cleared existing buses.');

        const buses = [];

        routes.forEach((route, rIndex) => {
            const routeKey = `${route.from}-${route.to}`;
            const config = routeConfig[routeKey] || { stops: [
                { name: route.from, lat: 8.7139, lng: 77.7567, order: 1 },
                { name: route.to, lat: 9.0, lng: 78.0, order: 2 }
            ]};

            statuses.forEach((status, sIndex) => {
                const count = 1; 
                for (let i = 0; i < count; i++) {
                    const busNumber = `TN-${72 + rIndex}-B-${1000 + (sIndex * 10) + i}`;
                    const hour = (6 + (sIndex * 3) + i) % 24;
                    const departureTime = `${hour.toString().padStart(2, '0')}:00`;
                    
                    buses.push({
                        name: `STS ${route.to} Express`,
                        busNumber,
                        routeFrom: route.from,
                        routeTo: route.to,
                        status,
                        scheduledTime: [departureTime],
                        speed: (status === 'active' || status === 'on-route') ? Math.floor(Math.random() * 40) + 40 : 0,
                        crowdLevel: crowdLevels[Math.floor(Math.random() * crowdLevels.length)],
                        availableSeats: Math.floor(Math.random() * 30),
                        capacity: 50,
                        driverName: `Driver ${String.fromCharCode(65 + (rIndex + sIndex) % 26)}`,
                        driverPhone: `9876543${rIndex}${sIndex}${i}`.slice(0, 10),
                        driverRating: 4.0 + Math.random(),
                        platformNumber: (rIndex % 10) + 1,
                        isActive: status === 'active' || status === 'on-route',
                        location: {
                            lat: config.stops[0].lat,
                            lng: config.stops[0].lng,
                            lastUpdated: new Date().toISOString()
                        },
                        intermediateStops: config.stops,
                        currentStop: config.stops[0].name,
                        nextStop: config.stops[1]?.name || 'Unknown',
                        estimatedArrivalTime: `${Math.floor(Math.random() * 45) + 5} mins`,
                        busType: rIndex % 3 === 0 ? 'Express' : (rIndex % 3 === 1 ? 'Deluxe' : 'AC'),
                        serviceType: 'Ordinary',
                        depot: 'Tirunelveli',
                        ac: rIndex % 3 === 2
                    });
                }
            });
        });

        await Bus.insertMany(buses);
        console.log(`Successfully seeded ${buses.length} buses with realistic data.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedBuses();
