require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const mongoose = require('mongoose');
const streamRoutes = require('./routes/streams');

const app = express();
app.use(express.json());

// Routes
app.use('/', streamRoutes);

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recommendation_db';

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Stream Service: Connected to MongoDB');
    } catch (err) {
        console.error('Stream Service: MongoDB connection error:', err);
        process.exit(1);
    }
})();



const PORT = process.env.STREAM_SERVICE_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Stream Service running on port ${PORT}`);
});
