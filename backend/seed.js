const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bus = require('./models/busModel');

dotenv.config();

const MOCK_BUSES = [
  { name: "Nagercoil End-to-End", busNumber: "TN 72 N 1801", routeFrom: "Tirunelveli", routeTo: "Nagercoil", scheduledTime: ["05:40", "06:00"], platformNumber: 1, busType: "Mofussil", serviceType: "1to1", depot: "Ranithottam", capacity: 45, status: 'active', ac: false },
  { name: "Nagercoil AC", busNumber: "TN 72 N 2205", routeFrom: "Tirunelveli", routeTo: "Nagercoil", scheduledTime: ["09:00", "11:00"], platformNumber: 1, busType: "AC", serviceType: "EAC", depot: "Ranithottam", capacity: 40, status: 'on-route', ac: true },
  { name: "Kanyakumari Deluxe", busNumber: "TN 72 N 1555", routeFrom: "Tirunelveli", routeTo: "Kanyakumari", scheduledTime: ["06:00", "08:30"], platformNumber: 1, busType: "Deluxe", serviceType: "Express", depot: "Kanyakumari", capacity: 55, status: 'delayed', ac: false },
  { name: "Tiruchendur BPR", busNumber: "TN 72 N 1680", routeFrom: "Tirunelveli", routeTo: "Tiruchendur", scheduledTime: ["05:30", "06:30"], platformNumber: 2, busType: "Mofussil", serviceType: "BPR", depot: "Tiruchendur", capacity: 45, status: 'inactive', ac: false },
  { name: "Tuticorin End-to-End", busNumber: "TN 72 N 1950", routeFrom: "Tirunelveli", routeTo: "Thoothukudi", scheduledTime: ["05:00", "05:15"], platformNumber: 3, busType: "Mofussil", serviceType: "1to1", depot: "Thoothukudi City", capacity: 45, status: 'on-route', ac: false }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        await Bus.deleteMany();
        console.log('Cleared existing buses');
        
        await Bus.insertMany(MOCK_BUSES);
        console.log('Seeded mock buses successfully!');
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
