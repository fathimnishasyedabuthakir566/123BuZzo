const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        console.log('Falling back to local simulation mode if DB unavailable...');
    }

    // Handle connection events for resilience
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Mongoose will auto-reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully.');
    });
};

module.exports = connectDB;
